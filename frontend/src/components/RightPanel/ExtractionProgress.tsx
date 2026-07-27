import React from 'react';
import { Loader2 } from 'lucide-react';
import type { ExtractionProgress as ExtractionProgressType } from '../../types';

interface ExtractionProgressProps {
  progress: ExtractionProgressType;
}

export const ExtractionProgress: React.FC<ExtractionProgressProps> = React.memo(({ progress }) => {
  if (!progress.isProcessing) return null;

  return (
    <div className="bg-slate-50 rounded-xl p-3.5 border border-blue-100 space-y-2 animate-pulse-subtle" role="progressbar" aria-valuenow={progress.progress}>
      <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
        <span className="flex items-center gap-2">
          <Loader2 className="w-3.5 h-3.5 text-blue-600 animate-spin" />
          {progress.stageText}
        </span>
        <span className="text-blue-600 font-mono">{progress.progress}%</span>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
        <div
          className="bg-blue-600 h-full transition-all duration-500 rounded-full"
          style={{ width: `${progress.progress}%` }}
        />
      </div>
    </div>
  );
});

ExtractionProgress.displayName = 'ExtractionProgress';
