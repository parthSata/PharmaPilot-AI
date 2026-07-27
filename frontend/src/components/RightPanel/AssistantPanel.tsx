import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Loader2, Paperclip } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store';
import { addMessage, setIsTyping, setExtractionProgress } from '../../store/chatSlice';
import { updateComplaint, setLastUpdatedField } from '../../store/complaintSlice';
import { FileUploadArea } from './FileUploadArea';
import { RiskAssessmentCard } from './RiskAssessmentCard';
import type { ChatMessage, RiskAssessment } from '../../types';

export const AssistantPanel: React.FC = () => {
  const dispatch = useAppDispatch();
  const { messages, isTyping, extractionProgress } = useAppSelector((state) => state.chat);
  const complaintState = useAppSelector((state) => state.complaint);
  const [inputText, setInputText] = useState('');
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, extractionProgress]);

  // Handle user sending text message
  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    dispatch(addMessage(userMessage));
    if (!textToSend) setInputText('');
    dispatch(setIsTyping(true));

    // Simulate AI parsing after prompt
    setTimeout(() => {
      processAiPromptResponse(text);
    }, 1200);
  };

  const processAiPromptResponse = (promptText: string) => {
    const textLower = promptText.toLowerCase();

    // Check if user is issuing a partial update edit (e.g. "Sorry batch number is BMX24602 and quantity is 48 capsules.")
    const isEditMode =
      textLower.includes('sorry') ||
      textLower.includes('update') ||
      textLower.includes('batch number is') ||
      textLower.includes('quantity is');

    if (isEditMode && complaintState.isFilled) {
      // Partial updates only
      let updatedBatch = complaintState.batchNumber;
      let updatedQty = complaintState.affectedQuantity;
      let lastUpdated = '';

      // Match batch number
      const batchMatch = promptText.match(/batch\s*(?:number)?\s*(?:is|=|:)?\s*([A-Z0-9]+)/i);
      if (batchMatch && batchMatch[1]) {
        updatedBatch = batchMatch[1];
        lastUpdated = 'batchNumber';
      }

      // Match quantity
      const qtyMatch = promptText.match(/quantity\s*(?:is|=|:)?\s*(\d+(?:\s*(?:capsules|tablets|bottles|vials|units|kg))?)/i);
      if (qtyMatch && qtyMatch[1]) {
        updatedQty = qtyMatch[1];
        lastUpdated = 'affectedQuantity';
      }

      dispatch(
        updateComplaint({
          batchNumber: updatedBatch,
          affectedQuantity: updatedQty,
        })
      );
      dispatch(setLastUpdatedField(lastUpdated));

      dispatch(setIsTyping(false));
      dispatch(
        addMessage({
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          text: `Updated complaint details per your correction:\n• Batch Number updated to: ${updatedBatch}\n• Affected Quantity updated to: ${updatedQty}\n\nAll other complaint details remain unchanged.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        })
      );
      return;
    }

    // Default Full Complaint Intake Response
    let customerName = 'Apollo Pharmacy';
    let productName = 'Amoxicillin Capsules';
    let productStrength = '500mg';
    let complaintSource = 'Customer Care Portal';
    let batchNumber = 'AMX-90821';
    let manufacturingDate = '2025-11-10';
    let expiryDate = '2027-11-10';
    let affectedQuantity = '150 capsules';
    let category = 'Physical Appearance / Discoloration';
    let description = promptText;
    let severity = 'Major';
    let priority = 'High';

    if (textLower.includes('apollo pharmacy')) {
      customerName = 'Apollo Pharmacy';
    }
    if (textLower.includes('amoxicillin')) {
      productName = 'Amoxicillin Capsules';
      productStrength = '500mg';
    }

    const newRiskAssessment: RiskAssessment = {
      severity: 'Major',
      riskLevel: 'Level 2 (Quarantine & Review)',
      nextAction: 'Initiate CAPA Investigation & Quarantine Batch',
      reason: 'Physical defect (discoloration) reported at retail/pharmacy level for active antibiotic lot.',
      confidenceScore: 94,
    };

    dispatch(
      updateComplaint({
        customerName,
        complaintSource,
        productName,
        productStrength,
        batchNumber,
        manufacturingDate,
        expiryDate,
        affectedQuantity,
        complaintCategory: category,
        complaintDescription: description,
        initialSeverity: severity,
        priority,
      })
    );

    dispatch(setIsTyping(false));
    dispatch(
      addMessage({
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: `Extracted complaint information for ${customerName} regarding ${productName} ${productStrength}. Form fields on the left panel have been populated automatically.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        riskAssessment: newRiskAssessment,
      })
    );
  };

  // Handle PDF / Document Upload
  const handleFileUpload = (file: File) => {
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

      // Auto populate form
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

      const documentRisk: RiskAssessment = {
        severity: 'Critical',
        riskLevel: 'Level 1 (Immediate Recall Evaluation)',
        nextAction: 'Issue Immediate Hold Order & Request Retention Samples',
        reason: 'Sedimentation in liquid formulation may indicate active ingredient precipitation or chemical instability.',
        confidenceScore: 98,
      };

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
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Panel Header */}
      <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span className="text-xl">🤖</span> PharmaPilot AI Assistant
            </h2>
            <span className="text-[10px] font-bold tracking-wide uppercase px-2 py-0.5 rounded bg-blue-600 text-white">
              BETA
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">AI Complaint Intake & Risk Evaluation Assistant</p>
        </div>
      </div>

      {/* Main Body Scrollable */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {/* Drag & Drop Upload Section */}
        <FileUploadArea
          onFileUpload={handleFileUpload}
          isProcessing={extractionProgress.isProcessing}
        />

        {/* Animated Extraction Progress Bar */}
        {extractionProgress.isProcessing && (
          <div className="bg-slate-50 rounded-xl p-3.5 border border-blue-100 space-y-2 animate-pulse-subtle">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <span className="flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 text-blue-600 animate-spin" />
                {extractionProgress.stageText}
              </span>
              <span className="text-blue-600 font-mono">{extractionProgress.progress}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-blue-600 h-full transition-all duration-500 rounded-full"
                style={{ width: `${extractionProgress.progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Chat Thread */}
        <div className="space-y-4 pt-2">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.sender === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div className="flex items-start gap-2.5 max-w-[90%]">
                {msg.sender === 'assistant' && (
                  <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 shadow-2xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`rounded-xl px-4 py-3 text-xs leading-relaxed shadow-2xs ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-none font-medium'
                      : 'bg-slate-100/90 text-slate-800 rounded-tl-none border border-slate-200/60'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>
                  {msg.riskAssessment && (
                    <RiskAssessmentCard assessment={msg.riskAssessment} />
                  )}
                </div>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.timestamp}</span>
            </div>
          ))}

          {/* Typing Animation */}
          {isTyping && (
            <div className="flex items-center gap-2 max-w-[80%]">
              <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-2xs">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-slate-100 rounded-xl px-4 py-3 border border-slate-200 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>
      </div>

      {/* Bottom Chat Input Box */}
      <div className="p-4 border-t border-slate-100 bg-white sticky bottom-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="relative flex items-center bg-slate-50 rounded-xl border border-slate-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all duration-200"
        >
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".pdf,.docx,.txt,.eml"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileUpload(e.target.files[0]);
              }
            }}
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Upload Document"
            className="p-3 text-slate-400 hover:text-blue-600 transition-colors"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Describe a customer complaint or type corrections..."
            className="w-full bg-transparent text-xs py-3.5 pr-2 focus:outline-none text-slate-800 placeholder:text-slate-400 font-medium"
          />

          <div className="flex items-center gap-1.5 pr-2">
            <button
              type="submit"
              disabled={!inputText.trim()}
              className={`p-2.5 rounded-lg transition-all duration-200 ${
                inputText.trim()
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-2xs cursor-pointer active:scale-[0.95]'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
