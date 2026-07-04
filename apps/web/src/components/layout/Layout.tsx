import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import Header from './Header';
import AIAssistant from '../ai/AIAssistant';
import { Sparkles, Mic } from 'lucide-react';
import { useAuth } from '../../lib/auth';

interface LayoutProps {
  children: React.ReactNode;
  activePage: string;
  onNavigate: (page: string) => void;
}

export default function Layout({ children, activePage, onNavigate }: LayoutProps) {
  const { activePolitician, user } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true); // always collapsed by default
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const isSuperAdmin = user?.role === 'super_admin';

  const primaryColor = activePolitician?.color_primary || '#00d4aa';
  const secondaryColor = activePolitician?.color_secondary || '#1e88e5';

  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setMobileOpen(false);
        // keep collapsed unless user explicitly expanded
      } else {
        setSidebarCollapsed(true);
      }
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  function handleNavigate(page: string) {
    onNavigate(page);
    if (isMobile) setMobileOpen(false);
  }

  const sidebarWidth = isMobile ? 0 : (sidebarCollapsed ? 72 : 260);

  return (
    <div className="min-h-screen flex relative bg-surface overflow-x-hidden">
      {isMobile && mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
      )}

      <AnimatePresence>
        {isMobile && mobileOpen && (
          <Sidebar active={activePage} onNavigate={handleNavigate} collapsed={false} mobile onCloseMobile={() => setMobileOpen(false)} />
        )}
      </AnimatePresence>

      {!isMobile && (
        <div style={{ width: sidebarWidth, flexShrink: 0, transition: 'width 0.25s ease' }}>
          <Sidebar active={activePage} onNavigate={handleNavigate} collapsed={sidebarCollapsed} />
        </div>
      )}

      <div className="flex-1 flex flex-col min-h-screen transition-all duration-300 relative z-10" style={{ marginLeft: isMobile ? 0 : sidebarWidth }}>
        <Header
          title={activePage}
          sidebarCollapsed={isMobile ? false : sidebarCollapsed}
          onToggleSidebar={() => isMobile ? setMobileOpen(o => !o) : setSidebarCollapsed(c => !c)}
          isMobile={isMobile}
          mobileMenuOpen={mobileOpen}
          onNavigate={handleNavigate}
        />

        <main className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 md:p-6 pb-28 sm:pb-24">
          <div className="max-w-[1600px] mx-auto w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={activePage}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <motion.div className="floating-orb teal" style={{ width: 340, height: 340, top: -120, right: -100, opacity: 0.22 }} animate={{ y: [0, -18, 0], x: [0, 12, 0] }} transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }} />
        <motion.div className="floating-orb blue" style={{ width: 300, height: 300, bottom: -100, left: -80, opacity: 0.18 }} animate={{ y: [0, 14, 0], x: [0, -10, 0] }} transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }} />
      </div>

      <AnimatePresence>
        {aiOpen && <AIAssistant onClose={() => setAiOpen(false)} />}
      </AnimatePresence>

      {!aiOpen && !isSuperAdmin && (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 items-end">
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleNavigate('quick-capture')}
            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg backdrop-blur-sm"
            style={{ background: 'rgba(13,22,40,0.9)', border: `1px solid ${secondaryColor}40`, color: secondaryColor, boxShadow: `0 4px 16px ${secondaryColor}25` }}
            title="Quick Capture"
          >
            <Mic size={18} strokeWidth={2} />
          </motion.button>
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setAiOpen(true)}
            className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
            style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`, boxShadow: `0 6px 24px ${primaryColor}40, 0 3px 12px rgba(0,0,0,0.4)` }}
            title="Open NETHRA AI"
          >
            <Sparkles size={20} color="#060b18" strokeWidth={2.5} />
          </motion.button>
        </div>
      )}
    </div>
  );
}
