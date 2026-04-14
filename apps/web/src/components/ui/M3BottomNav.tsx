import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface NavItem {
  id: string;
  label: string;
  icon: ReactNode;
}

interface M3BottomNavProps {
  items: NavItem[];
  activeId: string;
  onNavigate: (id: string) => void;
}

export default function M3BottomNav({ items, activeId, onNavigate }: M3BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 h-20 bg-surface-container border-t border-outline/20 flex items-center justify-around px-2 safe-area-bottom z-50">
      {items.map((item) => {
        const isActive = activeId === item.id;
        return (
          <motion.button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className="flex flex-col items-center justify-center gap-1 w-20 h-16 rounded-xl transition-colors duration-200"
            whileTap={{ scale: 0.9 }}
          >
            <div className={`w-16 h-8 rounded-full flex items-center justify-center transition-colors duration-200 ${isActive ? 'bg-primary-100 text-primary' : 'text-onSurfaceVariant'}`}>
              {item.icon}
            </div>
            <span className={`text-xs font-medium transition-colors duration-200 ${isActive ? 'text-primary' : 'text-onSurfaceVariant'}`}>{item.label}</span>
          </motion.button>
        );
      })}
    </nav>
  );
}
