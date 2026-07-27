import React from 'react';
import { FileText, Check } from 'lucide-react';
import type { ChatMessage } from '../../types';
import { RiskAssessmentCard } from './RiskAssessmentCard';

interface AssistantMessageProps {
  message: ChatMessage;
}

export const AssistantMessage: React.FC<AssistantMessageProps> = React.memo(({ message }) => {
  const isUser = message.sender === 'user';

  return (
    <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
      <div className="flex items-start gap-2.5 max-w-[90%]">
        {!isUser && (
          <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 border border-blue-200">
            <Check className="w-3.5 h-3.5" />
          </div>
        )}

        {message.fileAttachment ? (
          <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center gap-3 shadow-2xs">
            <div className="w-9 h-9 rounded-lg bg-rose-50 border border-rose-100 text-rose-500 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="pr-3">
              <p className="text-xs font-semibold text-slate-800 line-clamp-1">{message.fileAttachment.name}</p>
              <p className="text-[10px] text-slate-400 font-medium">{message.fileAttachment.type || 'PDF Document'}</p>
            </div>
          </div>
        ) : (
          <div
            className={`rounded-xl px-4 py-3 text-xs leading-relaxed shadow-2xs ${
              isUser
                ? 'bg-blue-600 text-white rounded-tr-none font-medium'
                : 'bg-white text-slate-800 rounded-tl-none border border-slate-200'
            }`}
          >
            {message.text && <p className="whitespace-pre-line">{message.text}</p>}
            {message.riskAssessment && <RiskAssessmentCard assessment={message.riskAssessment} />}
          </div>
        )}
      </div>
      <span className="text-[10px] text-slate-400 mt-1 px-1">{message.timestamp}</span>
    </div>
  );
});

AssistantMessage.displayName = 'AssistantMessage';
