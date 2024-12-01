import { 
    createConfig, 
    http, 
    cookieStorage,
    createStorage
  } from 'wagmi'
  import { baseSepolia } from 'wagmi/chains'
  
  export function getConfig() {
    return createConfig({
      chains: [baseSepolia],
      ssr: true,
      storage: createStorage({
        storage: cookieStorage,
      }),
      transports: {
        [baseSepolia.id]: http(),
      },
    })
  }