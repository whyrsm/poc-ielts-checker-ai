import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 1234,
    proxy: {
      '/api': {
        target: 'http://18.138.70.184:3000',
        changeOrigin: true
      }
    }
  }
})
