import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Box } from '@mantine/core';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAuth } from '../../lib/auth';

// ══ RESPONSIVE HOOK (inline per Development Bible) ══
import { useState as _useStateW, useEffect as _useEffectW } from 'react';
function useW() {
  const [_w, _setW] = _useStateW(typeof window !== 'undefined' ? window.innerWidth : 1440);
  _useEffectW(() => { const _fn = () => _setW(window.innerWidth); window.addEventListener('resize', _fn); return () => window.removeEventListener('resize', _fn); }, []);
  return _w;
}
const isMob = (_w: number) => _w < 640;
// ════════════════════════════════════════════════════════════

export default function Layout() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const w = useW();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(isMob(w));
  const [currentPage, setCurrentPage] = useState('dashboard');

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    // Extract page from route
    const page = location.pathname.replace('/', '') || 'dashboard';
    setCurrentPage(page);
  }, [location]);

  useEffect(() => {
    // Auto-collapse on mobile
    setSidebarCollapsed(isMob(w));
  }, [w]);

  const handleNavigate = (page: string) => {
    navigate(`/${page}`);
    setCurrentPage(page);
    // On mobile, close sidebar after navigation
    if (isMob(w)) {
      setSidebarCollapsed(true);
    }
  };

  if (loading) {
    return (
      <Box style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #060b18 0%, #0a1120 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          style={{
            width: 48,
            height: 48,
            border: '3px solid rgba(0,212,170,0.3)',
            borderTopColor: '#00d4aa',
            borderRadius: '50%',
          }}
        />
      </Box>
    );
  }

  return (
    <Box style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #060b18 0%, #0a1120 100%)' }}>
      {/* Sidebar */}
      <Sidebar
        active={currentPage}
        onNavigate={handleNavigate}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Header */}
      <Header
        onMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        sidebarCollapsed={sidebarCollapsed}
      />

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        style={{
          marginLeft: sidebarCollapsed ? 80 : 280,
          paddingTop: 64,
          minHeight: '100vh',
          transition: 'margin-left 0.3s ease',
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </Box>
  );
}
