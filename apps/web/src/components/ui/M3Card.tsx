import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface M3CardProps {
  variant?: 'elevated' | 'filled' | 'outlined';
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  padding?: 'none' | 'small' | 'medium' | 'large';
}

export default function M3Card({
  variant = 'elevated',
  children,
  className = '',
  onClick,
  padding = 'medium',
}: M3CardProps) {
  const variantStyles = {
    elevated: 'bg-white shadow-1 hover:shadow-2',
    filled: 'bg-surface-100 shadow-0',
    outlined: 'bg-white border border-outline/30 shadow-0',
  };
  const paddingStyles = {
    none: 'p-0',
    small: 'p-2',
    medium: 'p-4',
    large: 'p-6',
  };

  return (
    <motion.div
      onClick={onClick}
      className={`rounded-2xl transition-all duration-200 ${variantStyles[variant]} ${paddingStyles[padding]} ${onClick ? 'cursor-pointer active:scale-[0.98]' : ''} ${className}`}
      whileHover={onClick ? { y: -2 } : {}}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}
