import { lamportsToSol } from 'gamba'
import { useGamba } from 'gamba/react'
import { GameUi, formatLamports } from 'gamba/react-ui'
import React from 'react'
import { GRID_SIZE, MINE_SELECT, PITCH_INCREASE_FACTOR, SOUND_FINISH, SOUND_LOSE, SOUND_TICK, SOUND_WIN, WAGER_OPTIONS } from './constants'
import { GameConfig } from './types'
import { generateGrid, revealAllMines, revealGold } from './utils'
import { CellButton, Container, Grid, Levels, StatusBar } from './styles'

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
  const canPlay = started && !loading && !claiming && !gameFinished

  const bet = React.useMemo(
    () => Array
      .from({ length: remainingCells })
      .map((_, i, arr) =>
        i < config.mines ? 0 : arr.length / (arr.length - config.mines),
      ),
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
      const amountToWithdraw = Math.min(totalGain, gamba.user.balance)
      if (amountToWithdraw > 0) {
        await gamba.withdraw(amountToWithdraw)
        sounds.finish.play()
      }
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
      const res = await gamba.play({
        bet,
        wager: totalGain || config.wager,
      })

      sounds.tick.play({ playbackRate: 1.5 })

      const result = await res.result()

      sounds.tick.player.stop()

      // Lose
      if (result.payout === 0) {
        setStarted(false)
        setGrid(revealAllMines(grid, cellIndex, config.mines))
        sounds.lose.play()
        return
      }

      const nextLevel = currentLevel + 1
      setLevel(nextLevel)
      setGrid(revealGold(grid, cellIndex, result.profit))
      setTotalGain(result.payout)

      if (nextLevel < GRID_SIZE - config.mines) {
        sounds.win.play({ playbackRate: Math.pow(PITCH_INCREASE_FACTOR, currentLevel) })
      } else {
        // No more squares
        sounds.win.play({ playbackRate: .9 })
        sounds.finish.play()
      }
    } finally {
      setLoading(false)
      setSelected(-1)
    }
  }

  return (
    <GameUi.Fullscreen maxScale={1.25}>
      <GameUi.Controls disabled={loading || claiming}>
        {!started ? (
          <>
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
          </>
        ) : (
          <GameUi.Button variant="primary" onClick={endGame}>
            {totalGain > 0 ? `Cashout ${formatLamports(totalGain)}` : 'Reset'}
          </GameUi.Button>
        )}
      </GameUi.Controls>

      <Container>
        <StatusBar>
          <div>
            <span>
              Mines: {config.mines}
            </span>
            {totalGain > 0 && (
              <span>
                {formatLamports(totalGain)} +{Math.round(totalGain / config.wager * 100 - 100)}%
              </span>
            )}
          </div>
        </StatusBar>
        <Levels>
          {Array.from({ length: 5 })
            .map((_, i) => {
              const level = currentLevel + i
              if (level >= GRID_SIZE - config.mines) {
                return (
                  <div key={i}>
                    <div>-</div>
                    <div>-</div>
                  </div>
                )
              }
              const unrevealed = GRID_SIZE - level
              return (
                <div key={i}>
                  <div>
                    LEVEL {level + 1}
                  </div>
                  <div>
                    +{Math.round(GRID_SIZE / (unrevealed - config.mines) * 100 - 100).toLocaleString()}%
                  </div>
                </div>
              )
            })}
        </Levels>
        <Grid>
          {grid.map((cell, index) => (
            <CellButton
              key={index}
              status={cell.status}
              selected={selected === index}
              onClick={() => play(index)}
              disabled={!canPlay || cell.status !== 'hidden'}
            >
              {(cell.status === 'hidden' || cell.status === 'mine') && <MineSvg />}
              {(cell.status === 'gold') && (
                <div>
                  +{parseFloat(lamportsToSol(cell.profit).toFixed(3))}
                </div>
              )}
            </CellButton>
          ))}
        </Grid>
      </Container>
    </GameUi.Fullscreen>
  )
}

export default Mines


function MineSvg() {
  return (
    <svg width="40px" height="40px" viewBox="0 0 347 347" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" clipRule="evenodd" fill="#111133" d="M276.067 26.6409C276.067 22.9731 279.041 20 282.708 20C286.376 20 289.349 22.9731 289.349 26.6409V52.7896C289.349 56.457 286.376 59.4302 282.708 59.4302C279.041 59.4302 276.067 56.457 276.067 52.7896V26.6409ZM238.415 47.2454C235.821 44.6519 235.821 40.4473 238.415 37.8538C241.008 35.2605 245.213 35.2605 247.806 37.8538L266.296 56.3438C268.889 58.937 268.889 63.1418 266.296 65.7354C263.703 68.3286 259.498 68.3286 256.905 65.7354L238.415 47.2454ZM281.758 76.5347C278.243 73.0198 272.545 73.02 269.03 76.5347L241.696 103.869L231.089 93.2622C227.184 89.3569 220.853 89.3569 216.947 93.2622L205.833 104.377C168.476 86.5315 122.378 93.0796 91.4359 124.021C52.188 163.269 52.188 226.902 91.4359 266.15C130.683 305.397 194.317 305.397 233.564 266.15C264.241 235.473 270.94 189.898 253.662 152.714L265.031 141.345C268.936 137.44 268.936 131.109 265.031 127.203L254.424 116.597L281.758 89.2625C285.273 85.7478 285.273 80.0493 281.758 76.5347ZM292.862 92.301C290.268 94.8945 290.268 99.0991 292.862 101.693L311.352 120.183C313.945 122.776 318.15 122.776 320.743 120.183C323.337 117.589 323.337 113.384 320.743 110.791L302.253 92.301C299.66 89.7078 295.455 89.7078 292.862 92.301ZM337.779 75.0706C337.779 71.4028 334.805 68.4297 331.138 68.4297H304.989C301.322 68.4297 298.348 71.4028 298.348 75.0706C298.348 78.738 301.322 81.7112 304.989 81.7112H331.138C334.805 81.7112 337.779 78.738 337.779 75.0706ZM314.075 34.3184C316.669 31.7249 320.873 31.7249 323.467 34.3184C326.06 36.9116 326.06 41.1165 323.467 43.7097L304.977 62.1997C302.383 64.7932 298.179 64.7932 295.585 62.1997C292.992 59.6064 292.992 55.4016 295.585 52.8083L314.075 34.3184ZM138.459 147.709C152.127 134.041 174.288 134.041 187.956 147.709C191.861 151.615 198.193 151.615 202.098 147.709C206.003 143.804 206.003 137.473 202.098 133.567C180.619 112.089 145.795 112.089 124.316 133.567C120.411 137.473 120.411 143.804 124.316 147.709C128.222 151.615 134.553 151.615 138.459 147.709Z" />
    </svg>
  )
}
