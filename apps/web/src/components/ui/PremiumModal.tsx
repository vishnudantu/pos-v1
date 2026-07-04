import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface PremiumModalProps { open: boolean; onClose: () => void; title: string; children: ReactNode; maxWidth?: number; }

export default function PremiumModal({ open, onClose, title, children, maxWidth = 520 }: PremiumModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-0 sm:p-4" style={{ background: 'rgba(6,11,24,0.88)' }} onClick={e => e.target === e.currentTarget && onClose()}>
          <motion.div initial={{ opacity: 0, y: '100%', scale: 1 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: '100%', scale: 1 }} transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }} className="w-full sm:rounded-2xl rounded-t-2xl bg-surface-elevated border border-border p-4 sm:p-6 max-h-[92vh] overflow-y-auto" style={{ maxWidth: `min(${maxWidth}px, 100%)` }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base sm:text-lg font-bold font-display text-content">{title}</h3>
              <button onClick={onClose} className="w-8 h-8 rounded-lg bg-white/[0.06] border border-white/10 flex items-center justify-center text-content-secondary hover:text-content transition-colors"><X size={16} /></button>
            </div>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
