import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { createWriteStream } from 'fs'
import { cp } from 'fs/promises'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'ensure-assets-copy',
      apply: 'build',
      async closeBundle() {
        try {
          const src = path.resolve(__dirname, 'public/assets')
          const dst = path.resolve(__dirname, 'dist/assets')
          await cp(src, dst, { recursive: true, force: true })
          console.log('✓ Assets ensured in dist folder')
        } catch (e) {
          console.error('⚠ Asset copy warning:', (e as Error).message)
        }
      }
    }
  ],
  base: '/',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    copyPublicDir: true,
  },
})
