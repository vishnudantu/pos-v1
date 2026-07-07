import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helper?: string;
}

export default function Textarea({ label, error, helper, className = '', ...props }: TextareaProps) {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-[11px] uppercase tracking-wider font-semibold text-content-secondary mb-1.5">
          {label}
        </label>
      )}
      <textarea
        className={`
          w-full bg-surface-card border rounded-nethra-sm px-3.5 py-2.5 text-sm text-content-DEFAULT
          placeholder:text-content-tertiary outline-none transition-all duration-200 min-h-[100px] resize-y
          focus:border-nethra-teal/50 focus:ring-2 focus:ring-nethra-teal/20
          ${error ? 'border-nethra-red/60' : 'border-border-DEFAULT hover:border-border-strong'}
        `}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-nethra-red">{error}</p>}
      {helper && !error && <p className="mt-1 text-xs text-content-tertiary">{helper}</p>}
    </div>
  );
}
