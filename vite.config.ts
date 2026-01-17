import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { cp } from 'fs/promises'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'ensure-assets-copy',
      apply: 'build',
      async closeBundle() {
        try {
          const src = `${__dirname}/public/assets`
          const dst = `${__dirname}/dist/assets`
          await cp(src, dst, { recursive: true, force: true })
          console.log('✓ Assets copied to dist:', dst)
        } catch (e) {
          console.error('✗ Assets copy error:', (e as Error).message)
          process.exit(1)
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
