import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface NavItem {
  id: string;
  label: string;
  icon: ReactNode;
  badge?: number;
}

interface M3NavigationRailProps {
  items: NavItem[];
  activeId: string;
  onNavigate: (id: string) => void;
}

export default function M3NavigationRail({ items, activeId, onNavigate }: M3NavigationRailProps) {
  return (
    <aside className="fixed left-0 top-0 h-full z-40 bg-surface-container border-r border-outline/10 w-72 hidden md:flex flex-col">
      <div className="h-20 flex items-center gap-3 px-4 border-b border-outline/10">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center"><span className="material-icons text-white">bolt</span></div>
        <div><h1 className="title-medium text-onSurface">NETHRA</h1><p className="label-small text-onSurfaceVariant">Political Intelligence</p></div>
      </div>
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {items.map((item) => {
          const isActive = activeId === item.id;
          return (
            <motion.button key={item.id} onClick={() => onNavigate(item.id)} className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl transition-colors duration-200 ${isActive ? 'bg-primary-100 text-primary' : 'text-onSurfaceVariant hover:bg-surface-100'}`} whileTap={{ scale: 0.95 }}>
              <div className={`w-12 h-8 rounded-full flex items-center justify-center ${isActive ? 'bg-primary-200' : ''}`}>{item.icon}</div>
              <div className="flex-1 flex items-center justify-between">
                <span className="label-large">{item.label}</span>
                {item.badge && <span className="label-small bg-error text-white px-2 py-0.5 rounded-full">{item.badge}</span>}
              </div>
            </motion.button>
          );
        })}
      </nav>
    </aside>
  );
}
