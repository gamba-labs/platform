import { GameUi } from 'gamba/react-ui'
import React from 'react'
import { useParams } from 'react-router-dom'
import { Button } from '../components/Button'
import { Modal } from '../components/Modal'
import { GAMES } from '../games'
import styles from './Game.module.css'
import { Home } from './Home'

function Splash() {
  const game = GameUi.useCurrentGame()

  return (
    <div className={styles.splash}>
      <img src={game.image} />
    </div>
  )
}

function Controls() {
  const game = GameUi.useCurrentGame()
  const [showInfo, setShowInfo] = React.useState(false)

  // Show info modal the first time that the game is played
  React.useEffect(
    () => {
      const timeout = setTimeout(() => {
        if (!window.localStorage.getItem('played-' + game.short_name)) {
          setShowInfo(true)
          window.localStorage.setItem('played-' + game.short_name, String(Date.now()))
        }
      }, 1000)
      return () => clearTimeout(timeout)
    },
    [],
  )

  return (
    <>
      {showInfo && (
        <Modal>
          <h1 style={{ textAlign: 'center' }}>
            <img height="100px" src={game.image} alt={game.name} />
          </h1>
          <p>
            {game.description}
          </p>
          <Button color="white" onClick={() => setShowInfo(false)}>
            Continue
          </Button>
        </Modal>
      )}
      <div className={styles.controls}>
        <div>
          <Button
            variant="ghost"
            size="small"
            style={{ width: '100px' }}
            onClick={() => setShowInfo(true)}
          >
            <img src={game.image} height="40px" />
          </Button>
          <GameUi.ControlView />
        </div>
      </div>
    </>
  )
}

export function Game() {
  const { shortName } = useParams()
  const game = React.useMemo(() => GAMES.find((x) => x.short_name === shortName), [shortName])

  if (!game) return (<Home />)

  return (
    <GameUi.Provider
      key={game.short_name}
      game={game}
    >
      <div className={styles.container}>
        <div className={styles.view}>
          <GameUi.View />
        </div>
        <Splash />
        <Controls />
      </div>
    </GameUi.Provider>
  )
}
