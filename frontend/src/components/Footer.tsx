import React from 'react';

export interface FooterProps {
  appName?: string;
  poweredBy?: string;
  className?: string;
}

export const Footer: React.FC<FooterProps> = React.memo(({
  appName = 'PharmaPilot AI Engine',
  poweredBy = 'POWERED BY LANGGRAPH & GROQ',
  className = '',
}) => {
  return (
    <footer className={`py-2 bg-slate-50 border-t border-slate-200/80 text-center shrink-0 ${className}`}>
      <p className="text-[10px] uppercase tracking-widest font-semibold text-slate-400">
        {appName} <span className="mx-1">•</span> <span className="text-slate-500 font-mono">{poweredBy}</span>
      </p>
    </footer>
  );
});

Footer.displayName = 'Footer';
