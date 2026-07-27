import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}

export const Card: React.FC<CardProps> = React.memo(({
  children,
  header,
  footer,
  className = '',
  bodyClassName = 'p-6',
}) => {
  return (
    <div className={`h-full flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden ${className}`}>
      {header && (
        <div className="p-5 border-b border-slate-100 bg-white sticky top-0 z-10 flex items-center justify-between">
          {header}
        </div>
      )}
      <div className={`flex-1 overflow-y-auto ${bodyClassName}`}>
        {children}
      </div>
      {footer && (
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3 sticky bottom-0">
          {footer}
        </div>
      )}
    </div>
  );
});

Card.displayName = 'Card';
