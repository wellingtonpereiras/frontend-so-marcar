import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Bundle analyzer - descomente para analisar
    // visualizer({ open: true, filename: 'dist/stats.html' }),
  ],
  
  server: {
    port: 5173,
    strictPort: true,
  },
  
  build: {
    // Otimizações de produção
    target: 'es2015',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log em produção
        drop_debugger: true,
      },
    },
    
    // Code splitting otimizado
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor splitting
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'query-vendor': ['@tanstack/react-query'],
          'ui-vendor': ['lucide-react', 'react-hot-toast'],
          'chart-vendor': ['recharts'],
          'socket-vendor': ['socket.io-client'],
        },
      },
    },
    
    // Aumentar limite de aviso de chunk size
    chunkSizeWarningLimit: 1000,
  },
  
  // Otimizações de dependências
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
    ],
  },
})
