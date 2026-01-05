// frontend/src/main.jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { PrivyProvider } from '@privy-io/react-auth';
import { WagmiProvider } from '@privy-io/wagmi'; // Pastikan pakai @privy-io
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from './config/wagmi.js';

// 1. TAMBAHKAN IMPORT INI
import { sepolia } from 'wagmi/chains'; 

const queryClient = new QueryClient();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PrivyProvider
      appId="cmi8pryyy00fal70d8nrr0e3i" 
      config={{
        // 2. TAMBAHKAN KONFIGURASI CHAIN INI (WAJIB)
        defaultChain: sepolia,
        supportedChains: [sepolia],
        
        loginMethods: ['email', 'wallet', 'google'],
        appearance: {
          theme: 'light',
          accentColor: '#676FFF',
        },
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
        },
      }}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={config}>
          <App />
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  </StrictMode>,
)