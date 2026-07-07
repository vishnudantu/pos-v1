import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export default function Select({ label, error, options, className = '', ...props }: SelectProps) {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-[11px] uppercase tracking-wider font-semibold text-content-secondary mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          className={`
            w-full appearance-none bg-surface-card border rounded-nethra-sm px-3.5 py-2.5 pr-10 text-sm text-content-DEFAULT
            outline-none transition-all duration-200
            focus:border-nethra-teal/50 focus:ring-2 focus:ring-nethra-teal/20
            ${error ? 'border-nethra-red/60' : 'border-border-DEFAULT hover:border-border-strong'}
          `}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-content-tertiary">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
      </div>
      {error && <p className="mt-1 text-xs text-nethra-red">{error}</p>}
    </div>
  );
}
