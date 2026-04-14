import { useState, InputHTMLAttributes, ReactNode } from 'react';
import { motion } from 'framer-motion';

interface M3TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
  icon?: ReactNode;
  trailingIcon?: ReactNode;
  variant?: 'filled' | 'outlined';
}

export default function M3TextField({
  label,
  error,
  helperText,
  icon,
  trailingIcon,
  variant = 'filled',
  className = '',
  ...props
}: M3TextFieldProps) {
  const [focused, setFocused] = useState(false);
  const hasValue = props.value?.toString().length || 0;
  const isFloating = focused || hasValue > 0;

  return (
    <div className={`w-full ${className}`}>
      <div
        className={`
          relative flex items-center rounded-t-xl rounded-b-md
          transition-all duration-200 h-14 px-4
          ${variant === 'filled' 
            ? 'bg-surface-100 hover:bg-surface-200' 
            : 'bg-transparent border border-outline'
          }
          ${error ? 'border-error' : focused ? 'border-primary border-b-2' : ''}
        `}
      >
        {icon && <span className="material-icons text-onSurfaceVariant mr-3">{icon}</span>}
        
        <div className="flex-1 relative">
          <input
            {...props}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className="w-full h-full bg-transparent outline-none text-onSurface body-large placeholder-transparent"
          />
          <label
            className={`
              absolute left-0 transition-all duration-200 pointer-events-none
              ${isFloating ? '-top-2 label-small text-primary' : 'top-3 body-large text-onSurfaceVariant'}
              ${error ? 'text-error' : ''}
            `}
          >
            {label}
          </label>
        </div>

        {trailingIcon && (
          <span className="material-icons text-onSurfaceVariant ml-3 cursor-pointer">
            {trailingIcon}
          </span>
        )}
      </div>
      
      {(error || helperText) && (
        <p className={`label-small mt-1 px-4 ${error ? 'text-error' : 'text-onSurfaceVariant'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
}
