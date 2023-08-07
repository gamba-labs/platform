import { lamportsToSol, solToLamports } from 'gamba'
import { useGamba } from 'gamba/react'
import { ActionBar, Button, ResponsiveSize, formatLamports } from 'gamba/react-ui'
import React, { useEffect, useState } from 'react'
import * as Tone from 'tone'
import { Dropdown } from '../../components/Dropdown'
import { Bomb } from './Svg'
import { Cell, Container, CellGrid, MultiplierCurrent, MultiplierWrapper, PulsingText } from './styles'

import finishSrc from './finish.mp3'
import loseSrc from './lose.mp3'
import tickSrc from './tick.mp3'
import winSrc from './win.mp3'

const GRID_SIZE = 25
const PITCH_INCREASE_FACTOR = 1.06
const MINE_SELECT = [1, 3, 5, 10, 15, 20, 24]
const WAGER_AMOUNTS = [.05, .1, .25, .5, 1, 3].map(solToLamports)

type CellStatus = 'hidden' | 'gold' | 'mine'
interface CellState {
  status: CellStatus
  profit: number
}
type MinesStatus = 'playing' | 'idle' | 'lost'
type LoadState = 'playing' | 'claiming'

const generateGrid = () =>
  new Array(GRID_SIZE).fill({ status: 'hidden', profit: 0 }) as CellState[]

const createSound = (url: string) =>
  new Tone.Player({ url }).toDestination()

const soundTick = createSound(tickSrc)
const soundWin = createSound(winSrc)
const soundLose = createSound(loseSrc)
const soundFinish = createSound(finishSrc)

function Mines() {
  const gamba = useGamba()
  const [grid, setGrid] = useState(generateGrid())
  const [currentLevel, setLevel] = useState(0)
  const [selected, setSelected] = useState(-1)
  const [totalGain, setTotalGain] = useState(0)
  const [loadingState, setLoading] = useState<LoadState | null>(null)
  const [gameState, setGameState] = useState<MinesStatus>('idle')
  const [config, setConfig] = useState({
    wager: WAGER_AMOUNTS[0],
    mines: MINE_SELECT[2],
  })

  const remainingCells = GRID_SIZE - currentLevel
  const remainingLevels = remainingCells - config.mines
  const gameFinished = remainingLevels <= 0
  const needsReset = gameState === 'lost' || gameFinished
  const loading = loadingState !== null

  useEffect(
    () => {
      if (gameFinished) {
        soundFinish.start()
      }
    }
    , [gameFinished])

  // const nextGain = ((config.wager + totalGain) * multipliers[0]) - config.wager

  const claim = async () => {
    try {
      setLoading('claiming')
      await gamba.withdraw()
      reset()
    } finally {
      setLoading(null)
    }
  }

  const reset = async () => {
    setGrid(generateGrid())
    setLoading(null)
    setGameState('idle')
    setLevel(0)
    setTotalGain(0)
  }

  const playCell = async (cellIndex: number) => {
    setLoading('playing')

    try {
      const firstBet = currentLevel === 0

      const bet = Array.from({ length: remainingCells })
        .map((_, i, arr) =>
          i < config.mines ? 0 : arr.length / (arr.length - config.mines),
        )

      setSelected(cellIndex)

      const res = await gamba.play(
        bet,
        firstBet ? config.wager : config.wager + totalGain,
        { deductFees: !firstBet },
      )

      soundTick.start()

      const result = await res.result()

      setGameState('playing')

      if (result.payout > 0) {
        soundTick.stop()
        soundWin.playbackRate = Math.pow(PITCH_INCREASE_FACTOR, currentLevel)
        soundWin.start()

        setLevel((x) => x + 1)
        setTotalGain((x) => x + result.payout)
        // Update selected cell
        setGrid(
          (cells) => cells.map(
            (cell, i) =>
              i === cellIndex ?
                { ...cell, status: 'gold', profit: result.payout }
                : cell,
          ),
        )
      } else {
        setGameState('lost')

        // "Reveal" mines under random hidden squares
        const revealedMines = grid
          .map((cell, index) => ({ cell, index }))
          .sort((a, b) => {
            if (a.index === cellIndex) return -1
            if (b.index === cellIndex) return 1
            if (a.cell.status === 'hidden' && b.cell.status === 'hidden') {
              return Math.random() - .5
            }
            if (a.cell.status === 'hidden') return -1
            if (b.cell.status === 'hidden') return 1
            return 0
          })
          .map((x) => x.index)
          .slice(0, config.mines)

        // Update revealed cells
        setGrid(
          (cells) =>
            cells.map(
              (cell, i) =>
                revealedMines.includes(i) ? { ...cell, status: 'mine' } : cell,
            ),
        )

        soundTick.stop()
        soundLose.start()
      }
    } catch (err) {
      console.error(err)
      setGameState('idle')
    } finally {
      setLoading(null)
      setSelected(-1)
    }
  }

  return (
    <>
      <ResponsiveSize maxScale={1.5}>
        <Container>
          <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
            <div>
              +{formatLamports(totalGain)}
            </div>
            {needsReset && !loading && (
              <PulsingText onClick={reset}>
                {gameFinished ? 'a winner is you!' : 'Reset!'}
              </PulsingText>
            )}
          </div>
          <MultiplierWrapper>
            {Array.from({ length: 4 })
              .map((_, i) => {
                const level = currentLevel + i
                if (level >= GRID_SIZE - config.mines) {
                  return (
                    <MultiplierCurrent key={i}>
                      -
                    </MultiplierCurrent>
                  )
                }
                const unrevealed = GRID_SIZE - level
                const multiplier = unrevealed / (unrevealed - config.mines)
                return (
                  <MultiplierCurrent key={i} isCurrent={i === 0}>
                    {parseFloat(multiplier.toFixed(3))}x
                  </MultiplierCurrent>
                )
              })}
          </MultiplierWrapper>
          <CellGrid>
            {grid.map((cell, index) => (
              <Cell
                key={index}
                status={cell.status}
                onClick={() => playCell(index)}
                selected={selected === index}
                disabled={loading || needsReset || cell.status !== 'hidden'}
              >
                {(cell.status === 'hidden' || cell.status === 'mine') && <Bomb />}
                {(cell.status === 'gold') && (
                  <div>
                    +{parseFloat(lamportsToSol(cell.profit).toFixed(3))}
                  </div>
                )}
              </Cell>
            ))}
          </CellGrid>
        </Container>
      </ResponsiveSize>
      <ActionBar>
        {gameState === 'idle' ? (
          <>
            <Dropdown
              value={config.wager}
              format={(value) => formatLamports(value)}
              label="Wager"
              onChange={(wager) => setConfig({ ...config, wager })}
              options={WAGER_AMOUNTS.map((value) => ({
                label: formatLamports(value),
                value,
              }))}
            />
            <Dropdown
              value={config.mines}
              format={(value) => value + ' Mines'}
              label="Mines"
              onChange={(mines) => setConfig({ ...config, mines })}
              options={MINE_SELECT.map((value) => ({
                label: value + ' SOL',
                value,
              }))}
            />
          </>
        ) : gameState === 'playing' ? (
          <div>
            <Button
              loading={loadingState === 'claiming'}
              disabled={loading}
              onClick={claim}
            >
              Claim {formatLamports(gamba.balances.user)}
            </Button>
          </div>
        ) : null}
        {gameState === 'lost' ? (
          <Button
            disabled={!needsReset || loading}
            onClick={reset}
          >
            Reset
          </Button>
        ) : null}
      </ActionBar>

    </>
  )
}

export default Mines
