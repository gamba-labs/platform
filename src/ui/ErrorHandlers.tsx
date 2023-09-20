import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { GambaError } from 'gamba'
import { useGamba, useGambaError } from 'gamba/react'
import React, { Fragment } from 'react'
import { Button, CopyButton } from '../components/Button'
import { Modal } from '../components/Modal'

function InitUserModal({ onClose }: {onClose: () => void}) {
  const [creating, setCreating] = React.useState(false)
  const [initUser, setInitUser] = React.useState(false)
  const gamba = useGamba()

  React.useEffect(
    () => {
      if (gamba.user.status === 'playing') {
        onClose()
      }
    },
    [gamba.user.status],
  )

  const create = async () => {
    try {
      setCreating(true)
      await gamba.initializeAccount()
      setInitUser(true)
    } catch {
      onClose()
    }
  }

  return (
    <Modal onClose={onClose}>
      <h1>Welcome!</h1>
      <p>
        Since this is your first time playing from this wallet, you need to initialize it to start playing.
        <br />
        This only needs to be done once.
      </p>
      <Button color="white" loading={creating} pulse onClick={create}>
        {!initUser ? 'Initialize' : 'Initializing..'}
      </Button>
    </Modal>
  )
}

function LowBalanceModal({ onClose }: {onClose: () => void}) {
  const gamba = useGamba()
  const initialBalance = React.useMemo(() => gamba.balances.total, [])

  React.useEffect(
    () => {
      if (gamba.balances.total > initialBalance) {
        onClose()
      }
    },
    [gamba.balances.total],
  )

  return (
    <Modal onClose={onClose}>
      <h1>Insufficient Balance</h1>
      <p>
        You do not have enough SOL to make this bet. Fund it to continue.
        <br />
        <CopyButton
          content={gamba.wallet.publicKey.toBase58()}
          variant="ghost"
          size="small"
        >
          Copy address
        </CopyButton>
      </p>

      <Button onClick={onClose}>
        Cancel
      </Button>
    </Modal>
  )
}

export function ErrorHandlers() {
  const walletModal = useWalletModal()
  const [initUserModal, setInitUserModal] = React.useState(false)
  const [lowBalanceModal, setLowBalanceModal] = React.useState(false)
  const [genericError, setGenericError] = React.useState<GambaError | null>(null)

  useGambaError(
    (error) => {
      console.log('GambaError', { error })
      if (error.code === 'WalletNotConnected') {
        walletModal.setVisible(true)
        return
      }
      if (error.code === 'AccountNotInitialized') {
        setInitUserModal(true)
        return
      }
      if (error.code === 'InsufficentFunds') {
        setLowBalanceModal(true)
        return
      }
      setGenericError(error)
    },
  )

  return (
    <>
      {genericError && (
        <Modal onClose={() => setGenericError(null)}>
          <h1>Something happened</h1>
          <p>
            {genericError.message}
          </p>
          {genericError.logs && (
            <div style={{ width: '100%', padding: '30px', fontSize: '12px', fontFamily: 'monospace' }}>
              {genericError.logs.map((x, i) => (
                <Fragment key={i}>
                  {x}<br />
                </Fragment>
              ))}
            </div>
          )}
        </Modal>
      )}
      {lowBalanceModal && (
        <LowBalanceModal onClose={() => setLowBalanceModal(false)} />
      )}
      {initUserModal && (
        <InitUserModal onClose={() => setInitUserModal(false)} />
      )}
    </>
  )
}
