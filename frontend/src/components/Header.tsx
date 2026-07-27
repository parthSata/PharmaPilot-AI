import React from 'react';
import { Pill, Activity } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 shadow-2xs">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
          <Pill className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            PharmaPilot AI <span className="text-xs font-normal text-slate-400">| Enterprise QMS Complaint Engine</span>
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-600">
          <Activity className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
          <span>System Status: <strong className="text-slate-800 font-bold">Operational</strong></span>
        </div>
      </div>
    </header>
  );
};
