import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    postcss: {
      plugins: [tailwindcss, autoprefixer],
    },
  },
  server: {
    host: true,
    port: 4173,
    strictPort: true,
    allowedHosts: [
      'localhost',
      'thoughtfirst.in',
      'www.thoughtfirst.in',
      'api.thoughtfirst.in'
    ]
  },
  preview: {
    host: true,
    port: 4173,
    strictPort: true,
    allowedHosts: [
      'localhost',
      'thoughtfirst.in',
      'www.thoughtfirst.in',
      'api.thoughtfirst.in'
    ]
  }
})
