import { useGamba } from 'gamba/react'
import { formatLamports } from 'gamba/react-ui'
import React from 'react'
import { Button } from '../components/Button'
import { Icon } from '../components/Icon'
import { Modal } from '../components/Modal'
import { usePromise } from '../hooks/usePromise'

interface Props {
  onClose: () => void
}

export function UserModal({ onClose }: Props) {
  const gamba = useGamba()

  const [createAccount, creating] = usePromise(async () => {
    await gamba.methods.initializeAccount()
    await gamba.anticipate((state) => state.user.created)
  })

  const [closeAccount, closing] = usePromise(async () => {
    await gamba.methods.closeAccount()
    await gamba.anticipate((state) => !state.user.created)
    onClose()
  })

  return (
    <Modal onClose={onClose}>
      <h1>{formatLamports(gamba.balances.total)}</h1>
      <p>{gamba.wallet.publicKey.toBase58()}</p>
      <div style={{ display: 'grid', gap: '10px' }}>
        <Button
          onClick={() => gamba.updateSeed()}
          icon={<Icon.Shuffle />}
        >
          SEED: {gamba.seed}
        </Button>
        {!gamba.user.created && (
          <Button loading={creating} onClick={createAccount}>
            Create Account
          </Button>
        )}
        {gamba.user.created && (
          <Button loading={closing} onClick={closeAccount}>
            Close Account
          </Button>
        )}
        <Button
          as="a"
          icon={<Icon.ExternalLink />}
          href="https://www.gamba.so/docs/account"
          target="_blank"
        >
          More info
        </Button>
      </div>
    </Modal>
  )
}
