import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { useTransactionError } from 'gamba-react-v2'
import React from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { Modal } from './components/Modal'
import { StyledSection } from './components/Slider'
import { useToast } from './hooks/useToast'
import Dashboard from './sections/Dashboard/Dashboard'
import Game from './sections/Game/Game'
import Header from './sections/Header'
import RecentPlays from './sections/RecentPlays/RecentPlays'
import Toasts from './sections/Toasts'
import { useUserStore } from './hooks/useUserStore'
import { GambaUi } from 'gamba-react-ui-v2'

function ScrollToTop() {
  const { pathname } = useLocation()
  React.useEffect(() => window.scrollTo(0, 0), [pathname])
  return null
}

function ErrorHandler() {
  const walletModal = useWalletModal()
  const toast = useToast()
  const [error, setError] = React.useState<Error>()

  useTransactionError(
    (error) => {
      if (error.message === 'NOT_CONNECTED') {
        walletModal.setVisible(true)
        return
      }
      toast({ title: '❌ Transaction error', description: error?.error?.errorMessage ?? error.message })
    },
  )

  return (
    <>
      {error && (
        <Modal onClose={() => setError(undefined)}>
          <h1>Error occured</h1>
          <p>{error.message}</p>
        </Modal>
      )}
    </>
  )
}

export default function App() {
  const newcomer = useUserStore((state) => state.newcomer)
  const set = useUserStore((state) => state.set)
  return (
    <>
      {newcomer && (
        <Modal>
          <h1>Welcome</h1>
          <div style={{ position: 'relative' }}>
            <div style={{ maxHeight: '400px', padding: '10px', overflow: 'auto', position: 'relative' }}>
              <p><b>1. Age Requirement:</b> Must be at least 18 years old.</p>
              <p><b>2. Legal Compliance:</b> Follow local laws responsibly.</p>
              <p><b>3. Risk Acknowledgement:</b> Games involve risk; no guaranteed winnings.</p>
              <p><b>4. No Warranty:</b> Games provided "as is"; operate randomly.</p>
              <p><b>5. Limitation of Liability:</b> We're not liable for damages.</p>
              <p><b>6. Licensing Disclaimer:</b> Not a licensed casino; for simulation only.</p>
              <p><b>7. Fair Play:</b> Games are conducted fairly and transparently.</p>
              <p><b>8. Data Privacy:</b> Your privacy is important to us.</p>
              <p><b>9. Responsible Gaming:</b> Play responsibly; seek help if needed.</p>
            </div>
            <div style={{ background: 'linear-gradient(180deg, transparent, #15151f)', height: '50px', pointerEvents: 'none', width: '100%', position: 'absolute', bottom: '0px', left: '0px' }}></div>
          </div>
          <p>
            By playing on our platform, you confirm your compliance.
          </p>
          <GambaUi.Button main onClick={() => set({ newcomer: false })}>
            Acknowledge
          </GambaUi.Button>
        </Modal>
      )}
      <ScrollToTop />
      <ErrorHandler />
      <Header />
      <Toasts />
      <StyledSection>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/:gameId" element={<Game />} />
        </Routes>
        <h2 style={{ textAlign: 'center' }}>Recent Plays</h2>
        <RecentPlays />
      </StyledSection>
    </>
  )
}
