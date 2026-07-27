import React from 'react';

interface FormInputGroupProps {
  label: string;
  value: string;
  placeholder?: string;
  isTextArea?: boolean;
  type?: string;
  isHighlight?: boolean;
  unit?: string;
  sectionNumber?: string;
}

export const FormInputGroup: React.FC<FormInputGroupProps> = ({
  label,
  value,
  placeholder = 'Waiting for AI...',
  isTextArea = false,
  type = 'text',
  isHighlight = false,
  unit,
}) => {
  const hasValue = Boolean(value && value.trim().length > 0);

  return (
    <div className="flex flex-col gap-1.5 transition-all duration-300">
      <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center justify-between">
        <span>{label}</span>
        {hasValue && (
          <span className="text-[10px] lowercase font-mono bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-200/60">
            auto-filled
          </span>
        )}
      </label>

      <div className="relative flex items-center">
        {isTextArea ? (
          <textarea
            disabled
            rows={3}
            value={value}
            placeholder={placeholder}
            className={`w-full rounded-lg border px-3.5 py-2.5 text-sm transition-all duration-300 resize-none font-medium ${
              hasValue
                ? 'border-blue-200 bg-blue-50/20 text-slate-800 shadow-xs'
                : 'border-slate-200 bg-slate-50/70 text-slate-400 italic'
            } ${isHighlight ? 'ring-2 ring-blue-500/40 border-blue-500' : ''}`}
          />
        ) : (
          <input
            type={type}
            disabled
            value={value}
            placeholder={placeholder}
            className={`w-full rounded-lg border px-3.5 py-2.5 text-sm transition-all duration-300 font-medium ${
              hasValue
                ? 'border-blue-200 bg-blue-50/20 text-slate-800 shadow-xs'
                : 'border-slate-200 bg-slate-50/70 text-slate-400 italic'
            } ${isHighlight ? 'ring-2 ring-blue-500/40 border-blue-500' : ''} ${
              unit ? 'pr-12' : ''
            }`}
          />
        )}

        {unit && (
          <span className="absolute right-3 text-xs font-semibold text-slate-400 pointer-events-none uppercase">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
};
