import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';

interface NavItem {
  id: string;
  label: string;
  icon: ReactNode;
  badge?: number;
}

interface M3DrawerProps {
  open: boolean;
  onClose: () => void;
  items: NavItem[];
  activeId: string;
  onNavigate: (id: string) => void;
}

export default function M3Drawer({ open, onClose, items, activeId, onNavigate }: M3DrawerProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/50 z-50 md:hidden" />
          <motion.aside initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed left-0 top-0 h-full w-72 bg-surface z-50 shadow-5 md:hidden">
            <div className="h-20 flex items-center justify-between px-4 border-b border-outline/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center"><span className="material-icons text-white">bolt</span></div>
                <div><h1 className="title-medium text-onSurface">NETHRA</h1><p className="label-small text-onSurfaceVariant">Navigation</p></div>
              </div>
              <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-surface-100"><span className="material-icons text-onSurfaceVariant">close</span></button>
            </div>
            <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
              {items.map((item) => {
                const isActive = activeId === item.id;
                return (
                  <motion.button key={item.id} onClick={() => { onNavigate(item.id); onClose(); }} className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl transition-colors duration-200 ${isActive ? 'bg-primary-100 text-primary' : 'text-onSurfaceVariant hover:bg-surface-100'}`} whileTap={{ scale: 0.95 }}>
                    <div className={`w-12 h-8 rounded-full flex items-center justify-center ${isActive ? 'bg-primary-200' : ''}`}>{item.icon}</div>
                    <div className="flex-1 flex items-center justify-between">
                      <span className="label-large">{item.label}</span>
                      {item.badge && <span className="label-small bg-error text-white px-2 py-0.5 rounded-full">{item.badge}</span>}
                    </div>
                  </motion.button>
                );
              })}
            </nav>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
