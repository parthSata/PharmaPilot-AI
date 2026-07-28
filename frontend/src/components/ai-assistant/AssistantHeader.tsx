import React from 'react';
import { Badge } from '../ui/Badge';

export const AssistantHeader: React.FC = React.memo(() => {
  return (
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
  );
});

AssistantHeader.displayName = 'AssistantHeader';
