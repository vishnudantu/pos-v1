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
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      rollupOptions: {
        output: {
          manualChunks: {
            'mantine-core': ['@mantine/core'],
            'framer-motion': ['framer-motion'],
            'nivo-charts': ['@nivo/core', '@nivo/line', '@nivo/bar', '@nivo/pie'],
          },
        },
      },
    },
    define: {
      'import.meta.env.VITE_API_URL': JSON.stringify(apiUrl),
    },
  };
});
