import { lamportsToSol } from 'gamba'
import { useGamba } from 'gamba/react'
import { GameUi, formatLamports } from 'gamba/react-ui'
import React from 'react'
import styles from './App.module.css'
import { GRID_SIZE, ICON_MINE, MINE_SELECT, PITCH_INCREASE_FACTOR, SOUND_FINISH, SOUND_LOSE, SOUND_TICK, SOUND_WIN, WAGER_OPTIONS } from './constants'
import { GameConfig } from './types'
import { generateGrid, revealAllMines, revealGold } from './utils'

function Mines() {
  const gamba = useGamba()
  const sounds = GameUi.useSounds({
    tick: SOUND_TICK,
    win: SOUND_WIN,
    lose: SOUND_LOSE,
    finish: SOUND_FINISH,
  })

  const [grid, setGrid] = React.useState(generateGrid(GRID_SIZE))
  const [currentLevel, setLevel] = React.useState(0)
  const [selected, setSelected] = React.useState(-1)
  const [claiming, setClaiming] = React.useState(false)
  const [totalGain, setTotalGain] = React.useState(0)
  const [loading, setLoading] = React.useState(false)
  const [started, setStarted] = React.useState(false)

  const [config, setConfig] = React.useState<GameConfig>({
    wager: WAGER_OPTIONS[0],
    mines: MINE_SELECT[2],
  })

  const remainingCells = GRID_SIZE - currentLevel
  const gameFinished = remainingCells <= config.mines
  const needsReset = gameFinished

  const canPlay = started && !loading && !claiming && !needsReset

  const bet = React.useMemo(
    () => Array
      .from({ length: remainingCells })
      .map((_, i, arr) => {
        return i < config.mines ? 0 : arr.length / (arr.length - config.mines)
      }),
    [remainingCells, config],
  )

  const start = () => {
    setGrid(generateGrid(GRID_SIZE))
    setLoading(false)
    setLevel(0)
    setTotalGain(0)
    setStarted(true)
  }

  const endGame = async () => {
    try {
      setClaiming(true)
      await gamba.methods.withdraw(gamba.balances.user)
      await gamba.anticipate((state, prev) => state.user.balance < prev.user.balance)
      sounds.finish.play()
      reset()
    } finally {
      setClaiming(false)
    }
  }

  const reset = () => {
    setGrid(generateGrid(GRID_SIZE))
    setLoading(false)
    setLevel(0)
    setTotalGain(0)
    setStarted(false)
  }

  const play = async (cellIndex: number) => {
    setLoading(true)
    setSelected(cellIndex)
    try {
      await gamba.play({
        bet,
        wager: config.wager + totalGain,
      })

      sounds.tick.play({ playbackRate: 1.5 })

      const result = await gamba.nextResult()

      sounds.tick.player.stop()

      // Lose
      if (result.payout === 0) {
        // setGameStatus('lost')
        setStarted(false)
        setGrid(revealAllMines(grid, cellIndex, config.mines))
        sounds.lose.play()
        return
      }

      const nextLevel = currentLevel + 1
      setLevel(nextLevel)
      setGrid(revealGold(grid, cellIndex, result.profit))
      setTotalGain(totalGain + result.profit)

      if (nextLevel < GRID_SIZE - config.mines) {
        sounds.win.play({ playbackRate: Math.pow(PITCH_INCREASE_FACTOR, currentLevel) })
      } else {
        sounds.win.play({ playbackRate: .9 })
        sounds.finish.play()
      }
    } catch (err) {
      // setGameStatus('playing')
    } finally {
      setLoading(false)
      setSelected(-1)
    }
  }

  return (
    <GameUi.Fullscreen maxScale={1.25}>
      <GameUi.Controls disabled={started}>
        <GameUi.Select.Root
          value={config.wager}
          label="Wager"
          onChange={(wager) => setConfig({ ...config, wager })}
          format={(wager) => formatLamports(wager)}
        >
          {WAGER_OPTIONS.map((wager) => (
            <GameUi.Select.Option key={wager} value={wager}>
              {formatLamports(wager)}
            </GameUi.Select.Option>
          ))}
        </GameUi.Select.Root>
        <GameUi.Select.Root
          value={config.mines}
          label="Mines"
          onChange={(mines) => setConfig({ ...config, mines })}
          format={(mines) => mines + ' Mines'}
        >
          {MINE_SELECT.map((mines) => (
            <GameUi.Select.Option key={mines} value={mines}>
              {mines} Mines
            </GameUi.Select.Option>
          ))}
        </GameUi.Select.Root>
        <GameUi.Button variant="primary" onClick={start}>
          Start
        </GameUi.Button>
      </GameUi.Controls>

      <div className={styles.container}>
        <div className={styles.statusBar}>
          <div>
            <span>
              +{formatLamports(totalGain)}
            </span>
            <span>
              Mines: {config.mines}
            </span>
          </div>
          {totalGain > 0 && (
            <button
              className={styles.reset}
              disabled={loading || claiming}
              onClick={endGame}
            >
              Cashout
            </button>
          )}
        </div>
        <div className={styles.levels}>
          {Array.from({ length: 4 })
            .map((_, i) => {
              const level = currentLevel + i
              if (level >= GRID_SIZE - config.mines) {
                return (
                  <div key={i}>
                    -
                  </div>
                )
              }
              const unrevealed = GRID_SIZE - level
              const multiplier = unrevealed / (unrevealed - config.mines)
              return (
                <div key={i}>
                  <div>
                    LEVEL {level + 1}
                  </div>
                  <div>
                    {parseFloat(multiplier.toFixed(3))}x
                  </div>
                </div>
              )
            })}
        </div>
        <div className={styles.grid}>
          {grid.map((cell, index) => (
            <button
              key={index}
              className={styles.cell}
              data-status={cell.status}
              data-selected={selected === index}
              onClick={() => play(index)}
              disabled={!canPlay || cell.status !== 'hidden'}
            >
              {(cell.status === 'hidden' || cell.status === 'mine') && <img src={ICON_MINE} />}
              {(cell.status === 'gold') && (
                <div>
                  +{parseFloat(lamportsToSol(cell.profit).toFixed(3))}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </GameUi.Fullscreen>
  )
}

export default Mines
