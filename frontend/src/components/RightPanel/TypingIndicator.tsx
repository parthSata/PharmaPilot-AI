import React from 'react';
import { Bot } from 'lucide-react';

export const TypingIndicator: React.FC = React.memo(() => {
  return (
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
  );
});

TypingIndicator.displayName = 'TypingIndicator';
