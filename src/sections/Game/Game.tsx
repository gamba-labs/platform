import { decodeGame, getGameAddress } from 'gamba-core-v2'
import { GambaUi, useGambaAudioStore } from 'gamba-react-ui-v2'
import { useAccount, useTransactionStore, useWalletAddress } from 'gamba-react-v2'
import React from 'react'
import { useParams } from 'react-router-dom'
import styled, { css, keyframes } from 'styled-components'
import { Icon } from '../../components/Icon'
import { Modal } from '../../components/Modal'
import { GAMES } from '../../games'
import { useUserStore } from '../../hooks/useUserStore'
import { GameSlider } from '../Dashboard/Dashboard'
import { Container, Controls, IconButton, Screen, Splash } from './Game.styles'
import { ProvablyFairModal } from './ProvablyFairModal'
// import { TransactionModal } from './TransactionModal'

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

const StyledLoadingThingy = styled.div`
  position: relative;
  display: flex;
  width: 100%;
  gap: 5px;
`

export const loadingAnimation = keyframes`
  0%, 100% { opacity: .6 }
  50% { opacity: .8 }
`

const StyledLoadingBar = styled.div<{$state: 'finished' | 'loading' | 'none'}>`
  position: relative;
  width: 100%;
  border-radius: 10px;
  flex-grow: 1;
  background: var(--gamba-ui-primary-color);
  color: black;
  padding: 0 10px;
  font-size: 12px;
  height: 6px;
  font-weight: bold;
  opacity: .2;
  ${(props) => props.$state === 'loading' && css`
    animation: ${loadingAnimation} ease infinite 1s;
  `}
  ${(props) => props.$state === 'finished' && css`
    opacity: .8;
  `}
  &:after {
    content: " ";
    position: absolute;
    width: 25%;
    height: 100%;
    transition: opacity .5s;
  }
`

const steps = [
  'Signing',
  'Sending',
  'Settling',
]

function useLoadingState() {
  const userAddress = useWalletAddress()
  const game = useAccount(getGameAddress(userAddress), decodeGame)
  const txStore = useTransactionStore()
  const step = (
    () => {
      if (txStore.label !== 'play') {
        return -1
      }
      if (game?.status.resultRequested) {
        return 2
      }
      if (txStore.state === 'processing' || txStore.state === 'sending') {
        return 1
      }
      if (txStore.state === 'simulating' || txStore.state === 'signing') {
        return 0
      }
      return -1
    }
  )()

  return step
}

export function LoadingBar() {
  const step = useLoadingState()

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <StyledLoadingThingy>
          {steps
            .map((__, i) => (
              <StyledLoadingBar
                key={i}
                $state={step === i ? 'loading' : step > i ? 'finished' : 'none'}
              />
            ),
            )}
        </StyledLoadingThingy>
      </div>
    </div>
  )
}

/**
 * A renderer component to display the contents of the loaded GambaUi.Game
 * Screen
 * Controls
 */
function CustomRenderer() {
  const { game } = GambaUi.useGame()
  const [info, setInfo] = React.useState(false)
  const [provablyFair, setProvablyFair] = React.useState(false)
  // const [txModal, setTransactionModal] = React.useState(false)
  const audioStore = useGambaAudioStore()
  const firstTimePlaying = useUserStore((state) => !state.gamesPlayed.includes(game.id))
  const markGameAsPlayed = useUserStore((state) => () => state.markGameAsPlayed(game.id, true))
  const [ready, setReady] = React.useState(false)
  // const loading = useLoadingState()

  React.useEffect(
    () => {
      const timeout = setTimeout(() => {
        setReady(true)
      }, 750)
      return () => clearTimeout(timeout)
    },
    [],
  )

  React.useEffect(
    () => {
      const timeout = setTimeout(() => {
        setInfo(firstTimePlaying)
      }, 1000)
      return () => clearTimeout(timeout)
    },
    [firstTimePlaying],
  )

  const closeInfo = () => {
    markGameAsPlayed()
    setInfo(false)
  }

  return (
    <>
      {info && (
        <Modal onClose={() => setInfo(false)}>
          <h1>
            <img height="100px" title={game.meta.name} src={game.meta.image} />
          </h1>
          <p>{game.meta.description}</p>
          <GambaUi.Button main onClick={closeInfo}>
            Play
          </GambaUi.Button>
        </Modal>
      )}
      {provablyFair && (
        <ProvablyFairModal onClose={() => setProvablyFair(false)} />
      )}
      {/* {txModal && (
        <TransactionModal onClose={() => setTransactionModal(false)} />
      )} */}
      <Container>
        <Screen>
          <Splash>
            <img height="150px" src={game.meta.image} />
          </Splash>
          <GambaUi.PortalTarget target="error" />
          {ready && <GambaUi.PortalTarget target="screen" />}
          <div style={{
            position: 'absolute',
            bottom: '0',
            left: 0,
            width: '100%',
            padding: '10px',
            display: 'flex',
            justifyContent: 'left',
            alignItems: 'left',
          }}>
            <IconButton onClick={() => audioStore.set(audioStore.masterGain ? 0 : .5)}>
              {audioStore.masterGain ? '🔈' : '🔇'}
            </IconButton>
            <IconButton onClick={() => setInfo(true)}>
              <Icon.Info />
            </IconButton>
            <IconButton onClick={() => setProvablyFair(true)}>
              <Icon.Fairness />
            </IconButton>
          </div>
        </Screen>
        <LoadingBar />
        <Controls>
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ display: 'flex' }}>
              {/* <IconButton onClick={() => setTransactionModal(true)}>
                {loading === -1 ? (
                  <Icon.Shuffle />
                ) : (
                  <Spinner />
                )}
              </IconButton> */}
             
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <GambaUi.PortalTarget target="controls" />
              <GambaUi.PortalTarget target="play" />
            </div>
          </div>
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
