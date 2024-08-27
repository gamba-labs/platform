import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { GambaUi } from 'gamba-react-ui-v2'
import { useGambaProvider, useTransactionError } from 'gamba-react-v2'
import React, { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { Modal } from './components/Modal'
import { useToast } from './hooks/useToast'
import { useUserStore } from './hooks/useUserStore'
import Dashboard from './sections/Dashboard/Dashboard'
import Game from './sections/Game/Game'
import Header from './sections/Header'
import RecentPlays from './sections/RecentPlays/RecentPlays'
import Toasts from './sections/Toasts'
import { MainWrapper, TosInner, TosWrapper } from './styles'
import { PLATFORM_CREATOR_ADDRESS, TOS_HTML } from './constants'
import { getReferalAddressFromHash } from './@referal'
import { useWallet } from '@solana/wallet-adapter-react'
import { fetchReferal, getRefererPda } from './@referal/program'
import { PublicKey } from '@solana/web3.js'
import { AnchorProvider } from '@coral-xyz/anchor'

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
      toast({ title: '❌ Transaction error', description: error.error?.errorMessage ?? error.message })
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

function useReferal() {
  const wallet = useWallet()
  const anchor = useGambaProvider()

  useEffect(() => {
    const pda = getRefererPda(PLATFORM_CREATOR_ADDRESS, wallet.publicKey ?? PublicKey.default)
    fetchReferal(anchor.anchorProvider, pda)
      .then((referer) => {
        if (referer)
          window.sessionStorage.setItem('referalAddressOnChain', referer.toString())
      })
      .catch((err) => {
        console.error('Referal', err)
      })
  }, [anchor, wallet.publicKey])

  useEffect(() => {
    const checkReferal = () => {
      const address = getReferalAddressFromHash()
      if (address) {
        history.replaceState({}, document.title, '.')
        window.sessionStorage.setItem('referalAddress', address.toString())
      }
    }
    checkReferal()
    addEventListener('hashchange', checkReferal)
    return () => {
      removeEventListener('hashchange', checkReferal)
    }
  }, [])
}

export default function App() {
  const newcomer = useUserStore((state) => state.newcomer)
  const set = useUserStore((state) => state.set)

  useReferal()

  return (
    <>
      {newcomer && (
        <Modal>
          <h1>Welcome</h1>
          <TosWrapper>
            <TosInner dangerouslySetInnerHTML={{ __html: TOS_HTML }} />
          </TosWrapper>
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
      <MainWrapper>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/:gameId" element={<Game />} />
        </Routes>
        <h2 style={{ textAlign: 'center' }}>Recent Plays</h2>
        <RecentPlays />
      </MainWrapper>
    </>
  )
}
