// frontend/src/config/wagmi.js
import { http, createConfig } from 'wagmi'
import { base } from 'wagmi/chains'
import { injected, coinbaseWallet } from 'wagmi/connectors'

export const config = createConfig({
  // Menentukan jaringan utama: Base Mainnet
  chains: [base],
  
  // Menggunakan connector standar (tanpa ConnectKit/Privy)
  connectors: [
    injected(), // Untuk MetaMask, Rabby, atau Browser Wallet lainnya
    coinbaseWallet({ 
      appName: 'KampusFund',
      preference: 'smartWalletOnly' // Opsional: mengutamakan Smart Wallet
    }),
  ],
  
  // Pengaturan pengiriman data ke blockchain
  transports: {
    [base.id]: http(),
  },
})