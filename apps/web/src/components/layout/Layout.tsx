import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import Header from './Header';
import AIAssistant from '../ai/AIAssistant';
import { Sparkles, Mic } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { tokens } from '../../lib/design/tokens';

interface LayoutProps {
  children: React.ReactNode;
  activePage: string;
  onNavigate: (page: string) => void;
}

export default function Layout({ children, activePage, onNavigate }: LayoutProps) {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const isSuperAdmin = user?.role === 'super_admin';

  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) setMobileOpen(false);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  function handleNavigate(page: string) {
    onNavigate(page);
    if (isMobile) setMobileOpen(false);
  }

  const sidebarWidth = isMobile ? 0 : (collapsed ? 72 : 260);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: tokens.colors.background, position: 'relative' }}>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isMobile && mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 35 }}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {(isMobile && mobileOpen) || !isMobile ? (
          <Sidebar
            active={activePage}
            onNavigate={handleNavigate}
            collapsed={collapsed}
            onCollapseChange={setCollapsed}
            mobile={isMobile && mobileOpen}
            onCloseMobile={() => setMobileOpen(false)}
          />
        ) : null}
      </AnimatePresence>

      {/* Main area */}
      <div style={{
        flex: 1,
        marginLeft: sidebarWidth,
        transition: 'margin-left 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        position: 'relative',
        zIndex: 10,
      }}>
        <Header activePage={activePage} onMenuToggle={() => isMobile ? setMobileOpen(o => !o) : setCollapsed(c => !c)} />

        <main style={{ flex: 1, overflowY: 'auto', padding: 24, position: 'relative' }}>
          <div style={{ maxWidth: 1600, margin: '0 auto' }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activePage}
                initial={{ opacity: 0, y: 16, filter: 'blur(8px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -12, filter: 'blur(6px)' }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Ambient background */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        <div className="orb pulse-glow" style={{ width: 500, height: 500, top: -200, right: -150, background: 'radial-gradient(circle, rgba(34,211,238,0.15), transparent 70%)' }} />
        <div className="orb pulse-glow" style={{ width: 400, height: 400, bottom: -150, left: -100, background: 'radial-gradient(circle, rgba(16,185,129,0.12), transparent 70%)', animationDelay: '2s' }} />
      </div>

      {/* Floating AI buttons */}
      <AnimatePresence>
        {aiOpen && <AIAssistant onClose={() => setAiOpen(false)} />}
      </AnimatePresence>

      {!aiOpen && !isSuperAdmin && (
        <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 50, display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-end' }}>
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleNavigate('quick-capture')}
            style={{
              width: 42, height: 42, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: tokens.colors.surface, border: `1px solid ${tokens.colors.border}`, color: tokens.colors.accent,
              cursor: 'pointer', boxShadow: tokens.shadow.md,
            }}
          >
            <Mic size={18} strokeWidth={2} />
          </motion.button>
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setAiOpen(true)}
            style={{
              width: 52, height: 52, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: `linear-gradient(135deg, ${tokens.colors.accent}, ${tokens.colors.success})`,
              color: '#000', cursor: 'pointer', boxShadow: `0 8px 32px rgba(34,211,238,0.25)`,
            }}
          >
            <Sparkles size={22} strokeWidth={2.5} />
          </motion.button>
        </div>
      )}
    </div>
  );
}
