import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// `base` doit correspondre au chemin GitHub Pages : une erreur ici casse aussi
// les URLs déjà encodées dans les QR codes imprimés (specs/01, specs/15).
export default defineConfig({
  base: '/halloween-delaf-2026/',
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: false,
  },
})
