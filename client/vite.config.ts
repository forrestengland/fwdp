import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    // This forces Vite to resolve these libraries to your root node_modules instance
    dedupe: ['react', 'react-dom', 'react-router-dom'],
  },  
  server: {
    proxy: {
      '/api': {
	target: 'http://localhost:3000',
	changeOrigin: true,
	secure: false
      }
    }
  }
})
