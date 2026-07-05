import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiUrl = env.VITE_API_URL || '';

  return {
    plugins: [react()],
    optimizeDeps: { exclude: ['lucide-react'] },
    server: {
      port: 5173,
      proxy: apiUrl ? undefined : {
        '/api': { target: 'http://localhost:3001', changeOrigin: true },
      },
    },
    preview: {
      host: '0.0.0.0',
      port: 4173,
      allowedHosts: ['thoughtfirst.in', 'www.thoughtfirst.in', 'localhost', '127.0.0.1'],
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
    },
    define: {
      'import.meta.env.VITE_API_URL': JSON.stringify(apiUrl),
    },
  };
});
