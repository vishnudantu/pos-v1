import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Card } from './ModuleLayout';

export default function AnimatedCard({ children, className = '', delay = 0, hover = true, onClick }: { children: ReactNode; className?: string; delay?: number; hover?: boolean; onClick?: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay, ease: [0.4, 0, 0.2, 1] }}>
      <Card className={className} hover={hover} onClick={onClick}>{children}</Card>
    </motion.div>
  );
}
