import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3354,
    proxy: {
      '/api': {
        target: 'http://localhost:3454',
        changeOrigin: true
      },
      '/uploads': {
        target: 'http://localhost:3454',
        changeOrigin: true
      }
    }
  }
})
