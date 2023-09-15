import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { useBonusToken, useGamba } from 'gamba/react'
import { formatLamports } from 'gamba/react-ui'
import React, { useState } from 'react'
import { Button, CopyButton } from '../components/Button'
import { Dropdown } from '../components/Dropdown'
import { useOnClickOutside } from '../hooks/useOnClickOutside'
import { usePromise } from '../hooks/usePromise'
import { UserModal } from './UserModal'

function ConnectedButton() {
  const bonusToken = useBonusToken()
  const [modal, setModal] = React.useState(false)
  const gamba = useGamba()
  const wallet = useWallet()
  const ref = React.useRef<HTMLDivElement>(null!)
  const [visible, setVisible] = useState(false)

  useOnClickOutside(ref, () => setVisible(false))

  const [claim, claiming] = usePromise(async () => {
    await gamba.methods.withdraw(gamba.balances.user)
    await gamba.anticipate((state, prev) => state.user.balance < prev.user.balance)
  })

  const [redeemBonus, redeeming] = usePromise(async () => {
    if (!bonusToken.mint || !bonusToken.associatedTokenAccount) {
      throw 'No mint'
    }
    await gamba.methods.redeemBonusToken(
      bonusToken.mint,
      bonusToken.associatedTokenAccount,
      bonusToken.balance,
    )
    await gamba.anticipate((state, prev) => state.user.bonusBalance > prev.user.bonusBalance)
  })

  return (
    <>
      {modal && (
        <UserModal onClose={() => setModal(false)} />
      )}
      <div style={{ position: 'relative' }} ref={ref}>
        <Button
          onClick={() => setVisible(!visible)}
          icon={<img src={wallet.wallet?.adapter.icon} height="20px" />}
          loading={gamba.user.created && gamba.user.status !== 'playing'}
        >
          {formatLamports(gamba.balances.total)}
        </Button>
        <Dropdown visible={visible}>
          <CopyButton variant="ghost" content={gamba.wallet.publicKey.toBase58()}>
            Copy Address
          </CopyButton>
          {gamba.balances.user >= 1000 && (
            <Button onClick={claim} loading={claiming}>
              Claim {formatLamports(gamba.balances.user)}
            </Button>
          )}
          {bonusToken.balance > 0 && (
            <Button onClick={redeemBonus} loading={redeeming}>
              Redeem {formatLamports(bonusToken.balance, 'gSOL')}
            </Button>
          )}
          {wallet.connected && (
            <Button variant="ghost" onClick={() => wallet.disconnect()}>
              Disconnect
            </Button>
          )}
          <Button variant="ghost" onClick={() => setModal(true)}>
            More Options
          </Button>
        </Dropdown>
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
        <Button onClick={connect} loading={wallet.connecting}>
          {wallet.connecting ? 'Connecting' : 'Connect'}
        </Button>
      )}
    </>
  )
}
