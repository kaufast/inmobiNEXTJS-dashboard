import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from 'url';
import { defineConfig } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  // Root is now the current directory (client)
  root: __dirname,
  
  plugins: [
    react(),
    // Temporarily disable theme plugin to fix build issues
    // themePlugin(),
  ],
  
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@shared": path.resolve(__dirname, "..", "..", "shared"),
      "@assets": path.resolve(__dirname, "..", "..", "attached_assets"),
    },
  },
  
  build: {
    outDir: process.env.VERCEL ? path.resolve(__dirname, "dist") : path.resolve(__dirname, "dist"),
    emptyOutDir: true,
    sourcemap: process.env.NODE_ENV !== 'production',
    chunkSizeWarningLimit: 1000,
    minify: process.env.NODE_ENV === 'production' ? 'terser' : false,
    ...(process.env.NODE_ENV === 'production' && {
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
      },
    }),
    rollupOptions: {
      // Force Rollup to use JS implementation on Linux
      external: process.env.VERCEL ? ['@rollup/rollup-linux-x64-gnu'] : [],
      output: {
        manualChunks: (id) => {
          // Vendor chunks
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            if (id.includes('@radix-ui')) {
              return 'radix-ui';
            }
            if (id.includes('lucide-react')) {
              return 'icons';
            }
            if (id.includes('@tanstack/react-query')) {
              return 'react-query';
            }
            if (id.includes('date-fns') || id.includes('zod')) {
              return 'utils';
            }
            return 'vendor';
          }
          
          // UI components chunk
          if (id.includes('/components/ui/')) {
            return 'ui-components';
          }
          
          // Dashboard pages
          if (id.includes('/pages/') || id.includes('/routes/')) {
            return 'pages';
          }
        },
        // Optimize chunk names and hashing
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop().replace('.tsx', '').replace('.ts', '') : 'chunk';
          return `assets/[name]-[hash].js`;
        },
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
  },
  
  // Dashboard runs on port 3001
  server: {
    port: 3001,
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
  
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@tanstack/react-query',
      'wouter',
      'react-i18next',
      'i18next',
      'lucide-react',
      'date-fns',
      'zod',
      'react-hook-form',
      '@hookform/resolvers'
    ],
  },
});