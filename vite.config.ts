import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',
  publicDir: 'public',
  build: {
    // Ensure all assets in public/assets/ are copied to dist/assets/
    copyPublicDir: true,
    outDir: 'dist',
  },
})
