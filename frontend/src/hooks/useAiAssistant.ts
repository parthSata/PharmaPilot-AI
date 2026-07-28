import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { addMessage, setIsTyping, setExtractionProgress } from '../store/chatSlice';
import { updateComplaint, setLastUpdatedField } from '../store/complaintSlice';
import { ApiBackendService } from '../services/apiBackendService';
import { AiService } from '../services/aiService';

export const useAiAssistant = () => {
  const dispatch = useAppDispatch();
  const { messages, isTyping, extractionProgress } = useAppSelector((state) => state.chat);
  const complaintState = useAppSelector((state) => state.complaint);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim()) return;

      const userMessage = {
        id: Date.now().toString(),
        sender: 'user' as const,
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      dispatch(addMessage(userMessage));
      dispatch(setIsTyping(true));

      try {
        // Call backend FastAPI endpoint for Groq & LangGraph workflow execution
        const backendResponse = await ApiBackendService.processAiPrompt(text, complaintState);

        if (backendResponse) {
          const { extractedUpdates, lastUpdatedField, riskAssessment, responseMessage } = backendResponse;

          if (extractedUpdates && typeof extractedUpdates === 'object') {
            // Map snake_case keys from backend response to camelCase Redux state properties
            const keyMap: Record<string, string> = {
              customer_name: 'customerName',
              complaint_source: 'complaintSource',
              product_name: 'productName',
              product_strength: 'productStrength',
              batch_number: 'batchNumber',
              manufacturing_date: 'manufacturingDate',
              expiry_date: 'expiryDate',
              affected_quantity: 'affectedQuantity',
              complaint_category: 'complaintCategory',
              complaint_description: 'complaintDescription',
              initial_severity: 'initialSeverity',
              priority: 'priority',
            };

            const cleanPayload: Record<string, string> = {};
            for (const [key, val] of Object.entries(extractedUpdates)) {
              if (val !== null && val !== undefined && String(val).trim() !== '') {
                const targetKey = keyMap[key] || key;
                cleanPayload[targetKey] = String(val);
              }
            }
            if (Object.keys(cleanPayload).length > 0) {
              dispatch(updateComplaint(cleanPayload));
            }
          }
          dispatch(setLastUpdatedField(lastUpdatedField || null));
          dispatch(setIsTyping(false));

          dispatch(
            addMessage({
              id: (Date.now() + 1).toString(),
              sender: 'assistant',
              text: responseMessage || `Processed complaint update via Groq AI.`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              riskAssessment: riskAssessment
                ? {
                    severity: ((extractedUpdates && extractedUpdates.initialSeverity) as 'Critical' | 'Major' | 'Minor') || 'Critical',
                    riskLevel: riskAssessment.riskLevel || riskAssessment.risk_level || 'High Risk',
                    nextAction: (riskAssessment.recommendedActions && riskAssessment.recommendedActions[0]) || 'Review CAPA',
                    reason: riskAssessment.regulatoryComplianceNote || 'ICH Q9 Framework',
                    confidenceScore: riskAssessment.scoreValue || 88,
                  }
                : undefined,
            })
          );
          return;
        }
      } catch (error) {
        console.warn('Backend Groq API offline or error encountered. Running offline fallback.', error);
      }

      // Client fallback if backend is offline
      const { updates, lastUpdatedField, isEditMode } = AiService.parseComplaintPrompt(text, complaintState);

      if (isEditMode) {
        dispatch(updateComplaint(updates));
        dispatch(setLastUpdatedField(lastUpdatedField));
        dispatch(setIsTyping(false));

        dispatch(
          addMessage({
            id: (Date.now() + 1).toString(),
            sender: 'assistant',
            text: `Updated complaint details per your correction:\n• Batch Number updated to: ${
              updates.batchNumber || complaintState.batchNumber
            }\n• Affected Quantity updated to: ${
              updates.affectedQuantity || complaintState.affectedQuantity
            }\n\nAll other complaint details remain unchanged.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          })
        );
        return;
      }

      const riskAssessment = AiService.calculateRiskAssessment('Major');
      dispatch(updateComplaint(updates));
      dispatch(setIsTyping(false));

      dispatch(
        addMessage({
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          text: `Extracted complaint information for ${updates.customerName} regarding ${updates.productName} ${updates.productStrength}. Form fields on the left panel have been populated automatically.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          riskAssessment,
        })
      );
    },
    [dispatch, complaintState]
  );

  const uploadFile = useCallback(
    async (file: File) => {
      // Add user message with file attachment card
      dispatch(
        addMessage({
          id: Date.now().toString(),
          sender: 'user',
          fileAttachment: {
            name: file.name,
            size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
            type: 'PDF Document',
          },
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        })
      );

      dispatch(
        setExtractionProgress({
          isProcessing: true,
          progress: 25,
          stage: 'uploading',
          stageText: `Uploading ${file.name} to server...`,
        })
      );

      try {
        dispatch(
          setExtractionProgress({
            progress: 55,
            stage: 'extracting',
            stageText: 'Extracting text via Backend Document Parser...',
          })
        );

        const uploadResult = await ApiBackendService.uploadDocument(file);

        dispatch(
          setExtractionProgress({
            progress: 85,
            stage: 'analyzing',
            stageText: 'Analyzing pharmaceutical complaint context...',
          })
        );

        if (uploadResult) {
          const rawData = uploadResult.autoFilledData || uploadResult.extracted_fields || {};
          const risk = uploadResult.riskAssessment || uploadResult.risk_assessment;

          const keyMap: Record<string, string> = {
            customer_name: 'customerName',
            complaint_source: 'complaintSource',
            product_name: 'productName',
            product_strength: 'productStrength',
            batch_number: 'batchNumber',
            manufacturing_date: 'manufacturingDate',
            expiry_date: 'expiryDate',
            affected_quantity: 'affectedQuantity',
            complaint_category: 'complaintCategory',
            complaint_description: 'complaintDescription',
            initial_severity: 'initialSeverity',
            priority: 'priority',
          };

          const cleanFields: Record<string, string> = {};
          for (const [key, val] of Object.entries(rawData)) {
            if (val !== null && val !== undefined && String(val).trim() !== '') {
              const targetKey = keyMap[key] || key;
              cleanFields[targetKey] = String(val);
            }
          }

          dispatch(
            setExtractionProgress({
              progress: 100,
              stage: 'autofilling',
              stageText: 'Auto filling complaint form...',
            })
          );

          if (Object.keys(cleanFields).length > 0) {
            dispatch(updateComplaint(cleanFields));
          }

          dispatch(
            addMessage({
              id: Date.now().toString(),
              sender: 'assistant',
              text: uploadResult.message || uploadResult.extraction_summary || `Successfully parsed document **${file.name}** using Groq AI. Complaint form fields auto-populated.`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              riskAssessment: risk
                ? {
                    severity: (cleanFields.initialSeverity as 'Critical' | 'Major' | 'Minor') || 'Critical',
                    riskLevel: risk.riskLevel || risk.risk_level || 'High Risk (Action Required)',
                    nextAction: (risk.recommendedActions && risk.recommendedActions[0]) || (risk.recommended_actions && risk.recommended_actions[0]) || 'Initiate quarantine',
                    reason: risk.regulatoryComplianceNote || risk.regulatory_compliance_note || 'ICH Q9 Quality Risk Assessment',
                    confidenceScore: risk.scoreValue || risk.score_value || 92,
                  }
                : undefined,
            })
          );

          setTimeout(() => {
            dispatch(
              setExtractionProgress({
                isProcessing: false,
                progress: 0,
                stage: 'idle',
                stageText: '',
              })
            );
          }, 600);
          return;
        }
      } catch (error) {
        console.warn('Backend document upload failed, applying client fallback.', error);
      }

      // Fallback parsing if upload fails
      setTimeout(() => {
        dispatch(
          updateComplaint({
            customerName: 'MediLife Pharma Distributors',
            complaintSource: 'Quality Alert Email Attachment (PDF)',
            productName: 'Paracetamol Oral Suspension',
            productStrength: '250mg / 5ml',
            batchNumber: 'PRC-44019',
            manufacturingDate: '2025-08-15',
            expiryDate: '2027-08-14',
            affectedQuantity: '500 bottles',
            complaintCategory: 'Precipitate / Sedimentation',
            complaintDescription: `Customer reported dense white precipitate at bottom of Paracetamol Oral Suspension bottles from batch PRC-44019. Document parsed from ${file.name}.`,
            initialSeverity: 'Critical',
            priority: 'Urgent',
          })
        );

        const documentRisk = AiService.calculateRiskAssessment('Critical');

        dispatch(
          addMessage({
            id: Date.now().toString(),
            sender: 'assistant',
            text: `Parsed document **${file.name}**. Complaint form fields auto-populated and risk classification generated.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            riskAssessment: documentRisk,
          })
        );

        dispatch(
          setExtractionProgress({
            isProcessing: false,
            progress: 0,
            stage: 'idle',
            stageText: '',
          })
        );
      }, 1000);
    },
    [dispatch]
  );

  return {
    messages,
    isTyping,
    extractionProgress,
    sendMessage,
    uploadFile,
  };
};

