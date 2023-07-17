import { Gamba } from 'gamba/react'
import { GambaUi } from 'gamba/react-ui'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from 'styled-components'
import { App } from './App'
import { GlobalStyle, theme } from './styles'

const root = ReactDOM.createRoot(document.getElementById('root')!)

root.render(
  <BrowserRouter>
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Gamba
        connection={{
          endpoint: import.meta.env.GAMBA_SOLANA_RPC,
          config: { wsEndpoint: import.meta.env.GAMBA_SOLANA_RPC_WS },
        }}
      >
        <GambaUi>
          <App />
        </GambaUi>
      </Gamba>
    </ThemeProvider>
  </BrowserRouter>,
)
