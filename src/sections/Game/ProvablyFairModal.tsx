import { useGamba, useGambaProgram, useSendTransaction } from 'gamba-react-v2'
import { GambaPlatformContext, GambaUi } from 'gamba-react-ui-v2'
import React from 'react'
import { Icon } from '../../components/Icon'
import { Modal } from '../../components/Modal'

export function ProvablyFairModal(props: {onClose: () => void}) {
  const gamba = useGamba()
  const platform = React.useContext(GambaPlatformContext)
  const [initializing, setInitializing] = React.useState(false)
  const program = useGambaProgram()
  const sendTransaction = useSendTransaction()

  const initialize = async () => {
    try {
      setInitializing(true)
      await sendTransaction(
        program.methods
          .playerInitialize()
          .instruction(),
        { confirmation: 'confirmed' },
      )
    } finally {
      setInitializing(false)
    }
  }

  return (
    <Modal onClose={() => props.onClose()}>
      <h1>Provably Fair</h1>
      {!gamba.userCreated && (
        <>
          <p>
            Provably Fair allows you to verify that the result of each game was randomly generated. Since you are playing from this wallet for the first time, you can request the initial hashed seed ahead of time. After this it will be done automatically for each play.
          </p>
          <GambaUi.Button main disabled={initializing} onClick={initialize}>
            Get hashed seed
          </GambaUi.Button>
        </>
      )}
      {gamba.userCreated && (
        <>
          <p>
            Your client seed will affect the result of the next game you play.
          </p>
          <div style={{ display: 'grid', gap: '10px', width: '100%', padding: '20px' }}>
            <div>Next RNG Seed (sha256)</div>
            <GambaUi.TextInput
              value={gamba.nextRngSeedHashed ?? ''}
              disabled
            />
            <div>Client Seed</div>
            <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
              <GambaUi.TextInput
                style={{ flexGrow: '1' }}
                value={platform.clientSeed}
                disabled={gamba.isPlaying}
                maxLength={32}
                onChange={platform.setClientSeed}
              />
              <GambaUi.Button
                disabled={gamba.isPlaying}
                onClick={() => platform.setClientSeed(String(Math.random() * 1e9 | 0))}
              >
                <Icon.Shuffle />
              </GambaUi.Button>
            </div>
          </div>
        </>
      )}
    </Modal>
  )
}
