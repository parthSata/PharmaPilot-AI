import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'blue' | 'emerald' | 'amber' | 'red' | 'gray';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = React.memo(({
  children,
  variant = 'blue',
  size = 'sm',
  icon,
  className = '',
}) => {
  const baseStyles = 'inline-flex items-center gap-1 font-semibold rounded-full border transition-colors';

  const variantStyles = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200/60',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    gray: 'bg-slate-100 text-slate-600 border-slate-200',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  };

  return (
    <span className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}>
      {icon}
      <span>{children}</span>
    </span>
  );
});

Badge.displayName = 'Badge';
