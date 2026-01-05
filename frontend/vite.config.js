// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  
  // Resolve alias dikosongkan karena Solana sudah dihapus
  resolve: {
    alias: {}
  },

  build: {
    rollupOptions: {
      // Membersihkan log dari peringatan anotasi komentar yang tidak perlu
      onwarn(warning, warn) {
        if (warning.message.includes('/*#__PURE__*/')) return;
        warn(warning);
      },

      // Optimasi pembagian file (Code Splitting) agar loading website lebih cepat
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Memisahkan library Web3 (Wagmi, Viem) ke file tersendiri
            if (id.includes('wagmi') || id.includes('viem') || id.includes('@tanstack')) {
              return 'vendor-web3';
            }
            return 'vendor';
          }
        },
      },
    },
    
    // Menaikkan limit peringatan ukuran file ke 1000kB (1MB)
    // Sangat berguna untuk dApps yang menggunakan banyak library kriptografi
    chunkSizeWarningLimit: 1000,
  }
})