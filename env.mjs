import react from '@vitejs/plugin-react';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Make React available globally
// if (typeof window !== 'undefined') {
//   window.React = React;
// }

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    strictPort: true,
    host: true,
    hmr: {
      overlay: true,
      timeout: 5000,
    },
    watch: {
      usePolling: true,
      interval: 1000,
    },
    middlewareMode: false,
  },
  define: {
    'process.env': process.env,
    'global': {},
    'window.React': 'React',
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
    exclude: ['@replit/vite-plugin-shadcn-theme-json'],
  },
}); 