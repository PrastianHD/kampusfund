// src/wagmi.js
import { createConfig, http } from 'wagmi';
import { sepolia } from 'wagmi/chains'; // Ganti ke 'localhost' jika tes lokal

export const config = createConfig({
  chains: [sepolia],
  transports: {
    [sepolia.id]: http(),
  },
});