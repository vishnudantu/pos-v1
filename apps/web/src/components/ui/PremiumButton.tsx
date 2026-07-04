import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface PremiumButtonProps { children: ReactNode; variant?: 'primary' | 'ghost' | 'danger'; size?: 'sm' | 'md' | 'lg'; loading?: boolean; disabled?: boolean; className?: string; onClick?: () => void; icon?: ReactNode; fullWidth?: boolean; }

export default function PremiumButton({ children, variant = 'primary', size = 'md', loading, disabled, className = '', onClick, icon, fullWidth }: PremiumButtonProps) {
  const base = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 10, fontWeight: 700, cursor: disabled || loading ? 'not-allowed' : 'pointer', width: fullWidth ? '100%' : undefined, opacity: disabled || loading ? 0.55 : 1 } as React.CSSProperties;
  const sizes = { sm: { padding: '8px 12px', fontSize: 12, minHeight: 36 }, md: { padding: '11px 18px', fontSize: 14, minHeight: 44 }, lg: { padding: '14px 24px', fontSize: 15, minHeight: 50 } } as Record<string, React.CSSProperties>;
  const variants = { primary: { background: 'linear-gradient(135deg,var(--nethra-teal),var(--nethra-blue))', border: 'none', color: '#060b18' }, ghost: { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#f0f4ff' }, danger: { background: 'rgba(255,85,85,0.12)', border: '1px solid rgba(255,85,85,0.25)', color: '#ff7777' } } as Record<string, React.CSSProperties>;
  return (
    <motion.button onClick={onClick} disabled={disabled || loading} className={`nethra-focus-ring ${className}`} style={{ ...base, ...sizes[size], ...variants[variant] }} whileHover={!(disabled || loading) ? { y: -1 } : undefined} whileTap={!(disabled || loading) ? { scale: 0.98 } : undefined}>
      {loading ? <Loader2 size={16} className="animate-spin" /> : icon}{children}
    </motion.button>
  );
}
