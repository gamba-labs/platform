// src/sections/Game/Game.tsx
import React from 'react'
import { useParams } from 'react-router-dom'
import { GambaUi, useSoundStore } from 'gamba-react-ui-v2'
import { useTransactionError } from 'gamba-react-v2'

import { Icon } from '../../components/Icon'
import { Modal } from '../../components/Modal'
import { GAMES } from '../../games'
import { useUserStore } from '../../hooks/useUserStore'
import { GameSlider } from '../Dashboard/Dashboard'
import { Container, Controls, IconButton, MetaControls, Screen, Spinner, Splash } from './Game.styles'
import { LoadingBar, useLoadingState } from './LoadingBar'
import { ProvablyFairModal } from './ProvablyFairModal'
import { TransactionModal } from './TransactionModal'

function CustomError() {
  return (
    <GambaUi.Portal target="error">
      <GambaUi.Responsive>
        <h1>😭 Oh no!</h1>
        <p>Something went wrong</p>
      </GambaUi.Responsive>
    </GambaUi.Portal>
  )
}

function CustomRenderer() {
  const { game } = GambaUi.useGame()
  const [info, setInfo] = React.useState(false)
  const [provablyFair, setProvablyFair] = React.useState(false)
  const soundStore = useSoundStore()
  const firstTimePlaying = useUserStore(s => !s.gamesPlayed.includes(game.id))
  const markGameAsPlayed = useUserStore(s => () => s.markGameAsPlayed(game.id, true))
  const [ready, setReady] = React.useState(false)
  const [txModal, setTxModal] = React.useState(false)
  const loading = useLoadingState()

  React.useEffect(() => {
    const t = setTimeout(() => setReady(true), 750)
    return () => clearTimeout(t)
  }, [])

  React.useEffect(() => {
    const t = setTimeout(() => setInfo(firstTimePlaying), 1000)
    return () => clearTimeout(t)
  }, [firstTimePlaying])

  const closeInfo = () => {
    markGameAsPlayed()
    setInfo(false)
  }

  // global transaction errors
  useTransactionError(err => {
    if (err.message === 'NOT_CONNECTED') return
    // you might want to show a toast here
  })

  return (
    <>
      {info && (
        <Modal onClose={closeInfo}>
          <h1>
            <img height="100" title={game.meta.name} src={game.meta.image} />
          </h1>
          <p>{game.meta.description}</p>
          <GambaUi.Button main onClick={closeInfo}>Play</GambaUi.Button>
        </Modal>
      )}
      {provablyFair && <ProvablyFairModal onClose={() => setProvablyFair(false)} />}
      {txModal     && <TransactionModal onClose={() => setTxModal(false)} />}

      <Container>
        <Screen>
          <Splash><img height="150" src={game.meta.image} /></Splash>
          <GambaUi.PortalTarget target="error" />
          {ready && <GambaUi.PortalTarget target="screen" />}

          <MetaControls>
            <IconButton onClick={() => setInfo(true)}><Icon.Info /></IconButton>
            <IconButton onClick={() => setProvablyFair(true)}><Icon.Fairness /></IconButton>
            <IconButton onClick={() => soundStore.set(soundStore.volume ? 0 : .5)}>
              {soundStore.volume ? <Icon.Volume /> : <Icon.VolumeMuted />}
            </IconButton>
          </MetaControls>
        </Screen>

        <LoadingBar />

        {/* ← No inner wrapper—controls & play buttons are centered by Controls */}
        <Controls>
          <GambaUi.PortalTarget target="controls" />
          <GambaUi.PortalTarget target="play" />
        </Controls>
      </Container>
    </>
  )
}

export default function Game() {
  const { gameId } = useParams()
  const game = GAMES.find(g => g.id === gameId)

  return (
    <>
      {game ? (
        <GambaUi.Game game={game} errorFallback={<CustomError />} children={<CustomRenderer />} />
      ) : (
        <h1>Game not found! 👎</h1>
      )}
      <GameSlider />
    </>
  )
}
