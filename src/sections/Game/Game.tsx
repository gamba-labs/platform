import { GambaUi, useGambaAudioStore } from 'gamba-react-ui-v2'
import { useGamba } from 'gamba-react-v2'
import React from 'react'
import { useParams } from 'react-router-dom'
import { Icon } from '../../components/Icon'
import { Modal } from '../../components/Modal'
import { GAMES } from '../../games'
import { GameSlider } from '../Dashboard/Dashboard'
import { Container, Controls, IconButton, LoadingIndicator, Screen, SettingControls, Splash } from './Game.styles'
import { ProvablyFairModal } from './ProvablyFairModal'

function CustomError() {
  return (
    <>
      <GambaUi.Portal target="error">
        <GambaUi.Responsive>
          <h1>😭 Oh no!</h1>
          <p>Something went wrong</p>
        </GambaUi.Responsive>
      </GambaUi.Portal>
    </>
  )
}

/**
 * A renderer component to display the contents of the loaded GambaUi.Game
 * Screen
 * Controls
 */
function CustomRenderer() {
  const gamba = useGamba()
  const { game } = GambaUi.useGame()
  const [info, setInfo] = React.useState(false)
  const [provablyFair, setProvablyFair] = React.useState(false)
  const audioStore = useGambaAudioStore()

  return (
    <>
      {info && (
        <Modal onClose={() => setInfo(false)}>
          <h1>{game.meta.name}</h1>
          <p>{game.meta.description}</p>
        </Modal>
      )}
      {provablyFair && (
        <ProvablyFairModal onClose={() => setProvablyFair(false)} />
      )}
      <Container>
        <Splash>
          <img height="150px" src={game.meta.image} />
        </Splash>
        <Screen>
          <GambaUi.PortalTarget target="error" />
          <GambaUi.PortalTarget target="screen" />
          <SettingControls>
            <button onClick={() => audioStore.set((audioStore.masterGain + .25) % 1.25)}>
              Volume: {audioStore.masterGain * 100}%
            </button>
          </SettingControls>
        </Screen>
        <LoadingIndicator key={Number(gamba.isPlaying)} $active={gamba.isPlaying} />
        <Controls>
          <div style={{ display: 'flex' }}>
            <IconButton onClick={() => setInfo(true)}>
              <Icon.Info />
            </IconButton>
            <IconButton onClick={() => setProvablyFair(true)}>
              <Icon.Fairness />
            </IconButton>
          </div>
          <GambaUi.PortalTarget target="controls" />
          <GambaUi.PortalTarget target="play" />
        </Controls>
      </Container>
    </>
  )
}

export default function Game() {
  const { gameId } = useParams()
  const game = GAMES.find((x) => x.id === gameId)

  return (
    <>
      {game ? (
        <GambaUi.Game
          game={game}
          errorFallback={<CustomError />}
          children={<CustomRenderer />}
        />
      ) : (
        <h1>Game not found! 👎</h1>
      )}
      <GameSlider />
    </>
  )
}
