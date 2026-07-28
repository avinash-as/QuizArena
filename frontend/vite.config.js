import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  server: {
    proxy: {
      '/api':       { target: 'http://localhost:5000', changeOrigin: true },
      '/socket.io': { target: 'http://localhost:5000', ws: true },
    },
  },

  build: {
    // Split vendor chunks for faster load
    rollupOptions: {
      output: {
        manualChunks: {
          vendor:   ['react', 'react-dom', 'react-router-dom'],
          ui:       ['framer-motion', 'react-icons'],
          charts:   ['recharts'],
          socket:   ['socket.io-client'],
        },
      },
    },
    // Compress assets
    minify: 'terser',
    target: 'es2020',
    // Show warning if chunk > 500kb
    chunkSizeWarningLimit: 500,
  },

  // Optimize deps for faster dev startup
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'axios', 'framer-motion'],
  },
})
