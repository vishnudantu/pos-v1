import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface M3ChipProps {
  label: string;
  icon?: ReactNode;
  selected?: boolean;
  onClick?: () => void;
  variant?: 'filled' | 'outlined' | 'flat';
  className?: string;
}

export default function M3Chip({
  label,
  icon,
  selected = false,
  onClick,
  variant = 'filled',
  className = '',
}: M3ChipProps) {
  const variantStyles = {
    filled: selected ? 'bg-primary text-white border-primary' : 'bg-surface-200 text-onSurface hover:bg-surface-300',
    outlined: 'bg-transparent border border-outline text-onSurfaceVariant hover:bg-surface-100',
    flat: selected ? 'bg-primary-100 text-primary-700' : 'bg-transparent text-onSurfaceVariant hover:bg-surface-100',
  };

  return (
    <motion.button
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-4 h-8 rounded-full label-medium transition-all duration-200 ${variantStyles[variant]} ${onClick ? 'cursor-pointer active:scale-95' : ''} ${className}`}
      whileTap={onClick ? { scale: 0.95 } : {}}
    >
      {icon}
      <span>{label}</span>
    </motion.button>
  );
}
