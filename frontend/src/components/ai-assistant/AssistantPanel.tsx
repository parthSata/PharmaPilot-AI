import React, { useState } from 'react';
import { useAiAssistant } from '../../hooks';
import {
  AssistantHeader,
  AssistantChat,
  ExtractionProgress,
  AssistantInput,
  UploadSection,
  useChatScroll,
} from './index';

export const AssistantPanel: React.FC = React.memo(() => {
  const { messages, isTyping, extractionProgress, sendMessage, uploadFile } = useAiAssistant();
  const [inputText, setInputText] = useState('');
  const chatBottomRef = useChatScroll([messages, isTyping, extractionProgress]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sendMessage(inputText);
    setInputText('');
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* 1. Header */}
      <AssistantHeader />

      {/* 2. Main Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        <UploadSection onFileUpload={uploadFile} isProcessing={extractionProgress.isProcessing} />

        <ExtractionProgress progress={extractionProgress} />

        <AssistantChat
          messages={messages}
          isTyping={isTyping}
          chatBottomRef={chatBottomRef}
        />
      </div>

      {/* 3. Input Footer */}
      <AssistantInput
        inputText={inputText}
        setInputText={setInputText}
        onSubmit={handleFormSubmit}
        onFileUpload={uploadFile}
      />
    </div>
  );
});

AssistantPanel.displayName = 'AssistantPanel';
