import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import '@solana/wallet-adapter-react-ui/styles.css'
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets'
import { Gamba } from 'gamba/react'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { App } from './App'

import './styles.css'

const root = ReactDOM.createRoot(document.getElementById('root')!)

function Root() {
  const wallets = React.useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ],
    [],
  )

  return (
    <BrowserRouter>
      <ConnectionProvider
        endpoint={import.meta.env.GAMBA_SOLANA_RPC}
        config={{ wsEndpoint: import.meta.env.GAMBA_SOLANA_RPC_WS, commitment: 'processed' }}
      >
        <WalletProvider autoConnect wallets={wallets}>
          <WalletModalProvider>
            <Gamba creator={import.meta.env.GAMBA_CREATOR_ADDRESS}>
              <App />
            </Gamba>
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </BrowserRouter>
  )
}

root.render(<Root />)
