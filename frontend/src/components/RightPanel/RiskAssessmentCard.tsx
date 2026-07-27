import React from 'react';
import type { RiskAssessment } from '../../types';
import { ArrowRight, ShieldCheck } from 'lucide-react';

interface RiskAssessmentCardProps {
  assessment: RiskAssessment;
}

export const RiskAssessmentCard: React.FC<RiskAssessmentCardProps> = ({ assessment }) => {
  const getBadgeStyle = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
      case 'high':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'major':
      case 'medium':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'minor':
      case 'low':
      default:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  return (
    <div className="mt-3 bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-3 transition-all duration-300">
      {/* Title Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-800 tracking-tight">AI Risk Assessment</h3>
            <p className="text-[10px] text-slate-400">Automated QMS Triage & Severity Evaluation</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2 py-1 rounded-md">
          <span className="text-[10px] text-slate-500 font-medium">Confidence:</span>
          <span className="text-[11px] font-bold text-blue-600">{assessment.confidenceScore}%</span>
        </div>
      </div>

      {/* Grid Fields */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        {/* Severity */}
        <div className="bg-slate-50/70 rounded-lg p-2.5 border border-slate-100 flex flex-col gap-1">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Severity</span>
          <div>
            <span className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full border ${getBadgeStyle(assessment.severity)}`}>
              {assessment.severity}
            </span>
          </div>
        </div>

        {/* Risk Level */}
        <div className="bg-slate-50/70 rounded-lg p-2.5 border border-slate-100 flex flex-col gap-1">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Risk Level</span>
          <span className="font-semibold text-slate-800">{assessment.riskLevel}</span>
        </div>
      </div>

      {/* Next Action */}
      <div className="bg-blue-50/40 rounded-lg p-2.5 border border-blue-100 flex flex-col gap-1">
        <div className="flex items-center gap-1 text-[10px] font-bold text-blue-700 uppercase tracking-wider">
          <ArrowRight className="w-3 h-3 text-blue-600" />
          Recommended Next Action
        </div>
        <p className="text-xs font-medium text-slate-800">{assessment.nextAction}</p>
      </div>

      {/* Reason */}
      <div className="text-xs text-slate-600 bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
        <span className="font-semibold text-slate-700">Reasoning: </span>
        {assessment.reason}
      </div>
    </div>
  );
};
