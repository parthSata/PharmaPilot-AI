import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Loader2, Paperclip, FileText, Check } from 'lucide-react';
import { useAiAssistant } from '../../hooks';
import { FileUploadArea, RiskAssessmentCard, Badge } from '../index';

export const AssistantPanel: React.FC = React.memo(() => {
  const { messages, isTyping, extractionProgress, sendMessage, uploadFile } = useAiAssistant();
  const [inputText, setInputText] = useState('');
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, extractionProgress]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sendMessage(inputText);
    setInputText('');
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Panel Header */}
      <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span className="text-xl" role="img" aria-label="robot">🤖</span> PharmaPilot AI Assistant
            </h2>
            <Badge variant="blue" size="sm">BETA</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">AI Complaint Intake & Risk Evaluation Assistant</p>
        </div>
      </div>

      {/* Main Body Scrollable */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        <FileUploadArea onFileUpload={uploadFile} isProcessing={extractionProgress.isProcessing} />

        {/* Animated Extraction Progress Bar */}
        {extractionProgress.isProcessing && (
          <div className="bg-slate-50 rounded-xl p-3.5 border border-blue-100 space-y-2 animate-pulse-subtle" role="progressbar" aria-valuenow={extractionProgress.progress}>
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
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-start gap-2.5 max-w-[90%]">
                {msg.sender === 'assistant' ? (
                  <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 border border-blue-200">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                ) : null}

                {/* Render File Attachment Card if attached */}
                {msg.fileAttachment ? (
                  <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center gap-3 shadow-2xs">
                    <div className="w-9 h-9 rounded-lg bg-rose-50 border border-rose-100 text-rose-500 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="pr-3">
                      <p className="text-xs font-semibold text-slate-800 line-clamp-1">{msg.fileAttachment.name}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{msg.fileAttachment.type || 'PDF Document'}</p>
                    </div>
                  </div>
                ) : (
                  <div
                    className={`rounded-xl px-4 py-3 text-xs leading-relaxed shadow-2xs ${
                      msg.sender === 'user'
                        ? 'bg-blue-600 text-white rounded-tr-none font-medium'
                        : 'bg-white text-slate-800 rounded-tl-none border border-slate-200'
                    }`}
                  >
                    {msg.text && <p className="whitespace-pre-line">{msg.text}</p>}
                    {msg.riskAssessment && <RiskAssessmentCard assessment={msg.riskAssessment} />}
                  </div>
                )}
              </div>
              <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.timestamp}</span>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-center gap-2 max-w-[80%]">
              <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-2xs">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-slate-100 rounded-xl px-4 py-3 border border-slate-200 flex items-center gap-1.5" aria-label="AI is typing">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>
      </div>

      {/* Bottom Chat Form */}
      <div className="p-4 border-t border-slate-100 bg-white sticky bottom-0">
        <form
          onSubmit={handleFormSubmit}
          className="relative flex items-center bg-slate-50 rounded-xl border border-slate-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all duration-200"
        >
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".pdf,.docx,.txt,.eml"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                uploadFile(e.target.files[0]);
              }
            }}
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Upload Document"
            aria-label="Upload document"
            className="p-3 text-slate-400 hover:text-blue-600 transition-colors"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Describe a customer complaint or type corrections..."
            aria-label="Describe a customer complaint"
            className="w-full bg-transparent text-xs py-3.5 pr-2 focus:outline-none text-slate-800 placeholder:text-slate-400 font-medium"
          />

          <div className="flex items-center gap-1.5 pr-2">
            <button
              type="submit"
              disabled={!inputText.trim()}
              aria-label="Send message"
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
});

AssistantPanel.displayName = 'AssistantPanel';
