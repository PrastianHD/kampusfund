// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Mengarahkan import Solana ke modul kosong agar build tidak error
      '@solana-program/system': 'identity-obj-proxy', 
      // Atau jika cara di atas gagal, arahkan ke path yang tidak ada:
      '@solana-program/system': 'src/empty-module.js' 
    }
  },
  build: {
    rollupOptions: {
      // Memaksa Rollup menganggap modul ini eksternal dan abaikan errornya
      external: ['@solana-program/system'],
    }
  }
})