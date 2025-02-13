import { 
    createConfig, 
    http, 
    cookieStorage,
    createStorage
  } from 'wagmi'
  import { avalancheFuji } from 'wagmi/chains'
  
  export function getConfig() {
    return createConfig({
      chains: [avalancheFuji],
      ssr: true,
      storage: createStorage({
        storage: cookieStorage,
      }),
      transports: {
        [avalancheFuji.id]: http(),
      },
    })
  }