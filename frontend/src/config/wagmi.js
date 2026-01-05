import { http, createConfig } from 'wagmi'
import { base } from 'wagmi/chains'
import { getDefaultConfig } from 'connectkit'

export const config = createConfig(
  getDefaultConfig({
    // Jaringan yang didukung
    chains: [base],
    transports: {
      [base.id]: http(),
    },

    // Required info
    walletConnectProjectId: 'e2d1fcf12021d969d60caa4ee701f6fe', // Bisa didapat gratis di cloud.walletconnect.com
    appName: 'KampusFund',
  }),
)