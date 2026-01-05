import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { WagmiProvider } from 'wagmi' // Gunakan wagmi standar, bukan @privy-io/wagmi
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { config } from './config/wagmi.js'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {/* Sekarang App langsung di bawah WagmiProvider */}
        <App />
      </QueryClientProvider>
    </WagmiProvider>
  </StrictMode>,
)