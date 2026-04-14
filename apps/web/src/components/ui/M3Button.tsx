import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface M3ButtonProps {
  variant?: 'filled' | 'tonal' | 'outlined' | 'text';
  size?: 'small' | 'medium' | 'large';
  icon?: ReactNode;
  trailingIcon?: ReactNode;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  children: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

export default function M3Button({
  variant = 'filled',
  size = 'medium',
  icon,
  trailingIcon,
  loading = false,
  disabled = false,
  fullWidth = false,
  children,
  onClick,
  type = 'button',
  className = '',
}: M3ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200 active:scale-95';
  const variantStyles = {
    filled: 'bg-primary text-white hover:bg-primary-700 shadow-1 hover:shadow-2',
    tonal: 'bg-primary-100 text-primary-700 hover:bg-primary-200',
    outlined: 'bg-transparent border border-outline text-primary hover:bg-primary-50',
    text: 'bg-transparent text-primary hover:bg-primary-50',
  };
  const sizeStyles = {
    small: 'px-4 h-8 label-medium',
    medium: 'px-6 h-10 label-large',
    large: 'px-8 h-12 title-small',
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${fullWidth ? 'w-full' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      transition={{ duration: 0.2 }}
    >
      {loading ? (
        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        icon
      )}
      <span>{children}</span>
      {trailingIcon}
    </motion.button>
  );
}
