import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { addMessage, setIsTyping, setExtractionProgress } from '../store/chatSlice';
import { updateComplaint, setLastUpdatedField } from '../store/complaintSlice';
import { AiService } from '../services/aiService';

export const useAiAssistant = () => {
  const dispatch = useAppDispatch();
  const { messages, isTyping, extractionProgress } = useAppSelector((state) => state.chat);
  const complaintState = useAppSelector((state) => state.complaint);

  const sendMessage = useCallback(
    (text: string) => {
      if (!text.trim()) return;

      const userMessage = {
        id: Date.now().toString(),
        sender: 'user' as const,
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      dispatch(addMessage(userMessage));
      dispatch(setIsTyping(true));

      setTimeout(() => {
        const { updates, lastUpdatedField, isEditMode } = AiService.parseComplaintPrompt(
          text,
          complaintState
        );

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
      }, 1200);
    },
    [dispatch, complaintState]
  );

  const uploadFile = useCallback(
    (file: File) => {
      // Add user message with file attachment card matching reference UI
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
          progress: 15,
          stage: 'uploading',
          stageText: `Uploading ${file.name}...`,
        })
      );

      setTimeout(() => {
        dispatch(
          setExtractionProgress({
            progress: 45,
            stage: 'extracting',
            stageText: 'Extracting text and structure from document...',
          })
        );
      }, 1000);

      setTimeout(() => {
        dispatch(
          setExtractionProgress({
            progress: 80,
            stage: 'analyzing',
            stageText: 'Analyzing pharmaceutical complaint context...',
          })
        );
      }, 2200);

      setTimeout(() => {
        dispatch(
          setExtractionProgress({
            progress: 100,
            stage: 'autofilling',
            stageText: 'Auto filling complaint form...',
          })
        );

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
            text: `Successfully parsed document **${file.name}**. Complaint form fields auto-populated and risk classification generated.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            riskAssessment: documentRisk,
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
        }, 800);
      }, 3400);
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
