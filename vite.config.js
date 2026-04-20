import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { version } from './package.json'

export default defineConfig({
  plugins: [react()],
  base: '/music-theory-game/',
  define: {
    APP_VERSION: JSON.stringify(version),
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
