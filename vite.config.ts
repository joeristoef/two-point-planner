import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    // Ensure all assets in public/assets/ are copied to dist/assets/
    copyPublicDir: true,
  },
})
