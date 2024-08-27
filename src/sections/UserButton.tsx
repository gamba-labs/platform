import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { useWalletAddress } from 'gamba-react-v2'
import { GambaUi } from 'gamba-react-ui-v2'
import React from 'react'
import styled from 'styled-components'
import { Modal } from '../components/Modal'
import { truncateString } from '../utils'
import { PLATFORM_REFERRAL_FEE } from '../constants'
import { useToast } from '../hooks/useToast'

const ModalButtons = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;

  & > button {
    border: none;
    width: 100%;
    border-radius: 10px;
    padding: 10px;
    background: #ffffffdf;
    transition: background .2s ease;
    color: black;
    cursor: pointer;
    &:hover {
      background: white;
    }
  }
`

function ConnectedButton() {
  const [modal, setModal] = React.useState(false)
  const wallet = useWallet()
  const address = useWalletAddress()
  const toast = useToast()
  const walletModal = useWalletModal()

  const copyInvite = () => {
    if (!wallet.publicKey) {
      return walletModal.setVisible(true)
    }

    const referralLink = location.host + '#' + wallet.publicKey.toString()
    navigator.clipboard.writeText(referralLink)
    toast({
      title: '📋 Copied to clipboard',
      description: `Share your link to earn a ${(PLATFORM_REFERRAL_FEE * 100)}% fee when players use this platform`,
    })
  }

  return (
    <>
      {modal && (
        <Modal onClose={() => setModal(false)}>
          <h1>{truncateString(address.toBase58(), 6, 3)}</h1>
          <ModalButtons>
            <button onClick={copyInvite}>
              💸 Copy Referral Link
            </button>
            <GambaUi.Button onClick={() => wallet.disconnect()}>
              Disconnect
            </GambaUi.Button>
          </ModalButtons>
        </Modal>
      )}
      <div style={{ position: 'relative' }}>
        <GambaUi.Button onClick={() => setModal(true)}>
          <div style={{ display: 'flex', gap: '.5em', alignItems: 'center' }}>
            <img src={wallet.wallet?.adapter.icon} height="20px" alt="Wallet Icon" />
            {truncateString(address.toBase58(), 3)}
          </div>
        </GambaUi.Button>
      </div>
    </>
  )
}

export function UserButton() {
  const walletModal = useWalletModal()
  const wallet = useWallet()

  const connect = () => {
    if (wallet.wallet) {
      wallet.connect()
    } else {
      walletModal.setVisible(true)
    }
  }

  return (
    <>
      {wallet.connected ? <ConnectedButton /> : (
        <GambaUi.Button onClick={connect}>
          {wallet.connecting ? 'Connecting' : 'Connect'}
        </GambaUi.Button>
      )}
    </>
  )
}
