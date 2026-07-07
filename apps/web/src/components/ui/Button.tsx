import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

const variantClasses = {
  primary: 'bg-gradient-to-r from-nethra-teal to-nethra-blue text-surface-DEFAULT border-transparent hover:opacity-90 shadow-nethra',
  secondary: 'bg-surface-card border-border-DEFAULT text-content-DEFAULT hover:border-border-strong hover:bg-surface-card-hover',
  ghost: 'bg-transparent border-transparent text-content-secondary hover:text-content-DEFAULT hover:bg-surface-card-hover',
  danger: 'bg-nethra-red/10 border-nethra-red/30 text-nethra-red hover:bg-nethra-red/20',
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-6 py-3 text-sm',
};

export default function Button({ variant = 'secondary', size = 'md', loading, children, className = '', disabled, ...props }: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2 font-semibold rounded-nethra-sm border
        transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
      {...props}
    >
      {loading && <Loader2 size={16} className="animate-spin" />}
      {children}
    </button>
  );
}
