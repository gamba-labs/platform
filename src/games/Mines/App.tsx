import { solToLamports, lam} from 'gamba'
import { useGamba } from 'gamba/react'
import { ActionBar, Button, ResponsiveSize, formatLamports } from 'gamba/react-ui'
import React, { useMemo, useState, useEffect } from 'react'
import * as Tone from 'tone'
import { Dropdown } from '../../components/Dropdown'
import { Cell, Container, Grid, Overlay, OverlayText, MultiplierCurrent, MultiplierWrapper } from './styles'
import winSrc from './win.mp3'
import tickSrc from './tick.mp3'
import loseSrc from './lose.mp3'

const GRID_SIZE = 25
const MINE_COUNT = 5

const MINE_SELECT = [1, 3, 5, 10, 15, 20, 24]
const WAGER_AMOUNTS = [0.05, 0.1, 0.25, 0.5, 1, 3].map(solToLamports)

const createSound = (url: string) =>
  new Tone.Player({ url }).toDestination()

const soundTick = createSound(tickSrc)
const soundWin = createSound(winSrc)
const soundLose = createSound(loseSrc)

const pitchIncreaseFactor = 1.06

function Mines() {
  const gamba = useGamba()
  const [grid, setGrid] = useState(() => generateGrid())
  const [unclickedSquares, setUnclickedSquares] = useState(GRID_SIZE)
  const [loading, setLoading] = useState(false)
  const [mines, setMines] = useState(MINE_COUNT)
  const [claiming, setClaiming] = useState(false)
  const [wager, setWager] = useState(WAGER_AMOUNTS[0])
  const [playbackRate, setPlaybackRate] = useState(1)
  const [multipliers, setMultipliers] = useState(() => calculateMultipliers(GRID_SIZE, MINE_COUNT))
  const [currentMultiplierIndex, setCurrentMultiplierIndex] = useState(0)
  const [totalGain, setTotalGain] = useState(0)
  const [gameState, setGameState] = useState('idle') // idle, playing, lost

  const playWinSound = () => {
    soundWin.playbackRate = playbackRate
    soundWin.start()
  }

  useEffect(() => {
    setMultipliers(calculateMultipliers(unclickedSquares, mines))
  }, [mines])

  const claim = async () => {
    if (gamba.balances.user > 0) {
      setClaiming(true)
      await gamba.withdraw()
      setClaiming(false)
    }
    setGameState('lost')
  }

  const reset = async () => {
    setGrid(generateGrid())
    setUnclickedSquares(GRID_SIZE)
    setLoading(false)
    setGameState('idle')
    setPlaybackRate(1)
    setCurrentMultiplierIndex(0)
    setTotalGain(0)
  }

  const multiplier = useMemo(() => {
    return 1 / ((unclickedSquares - mines) / unclickedSquares)
  }, [unclickedSquares, mines])

  const handleClick = async (index: number) => {
    if (grid[index].status !== 'hidden') {
      return
    }

    setLoading(true)

    try {
      const bet = new Array(unclickedSquares).fill(multiplier)
      for (let i = 0; i < mines; i++) {
        bet[i] = 0
      }

      const WAGER_AMOUNTSum = bet.reduce((sum, val) => sum + val, 0)
      if (WAGER_AMOUNTSum > bet.length) {
        const overflow = WAGER_AMOUNTSum - bet.length
        bet[bet.length - 1] -= overflow
      }

      let wagerInput = wager
      let res

      if (gameState === 'playing') {
        wagerInput = wager + totalGain //rebet with winnings
        res = await gamba.play(bet, wagerInput, { deductFees: true })
      } else {
        res = await gamba.play(bet, wagerInput) //if its first bet just use inital wager
      }

      soundTick.start()
      const result = await res.result()
      const win = result.payout > 0
      setGameState('playing')

      const updatedGrid = [...grid]
      if (win) {
        updatedGrid[index].status = 'gold'
        setUnclickedSquares(unclickedSquares - 1)
        soundTick.stop()
        playWinSound()
        setPlaybackRate(playbackRate * pitchIncreaseFactor)
        setCurrentMultiplierIndex(currentMultiplierIndex + 1)
        setTotalGain(totalGain + result.payout)
      } else if (!win) {
        setGameState('lost')
        updatedGrid[index].status = 'mine'
        revealRandomMines(updatedGrid, mines - 1, index)
        soundTick.stop()
        soundLose.start()
        setPlaybackRate(1)
      }
      setGrid(updatedGrid)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const needsReset = gameState === 'lost'

  return (
    <>
      <ResponsiveSize>
        <Container>
          <MultiplierWrapper>
            {multipliers.slice(currentMultiplierIndex, currentMultiplierIndex + 4).map((mult, i) => (
              <MultiplierCurrent key={i} isCurrent={i === 0}>
                {mult.toFixed(3)}x
              </MultiplierCurrent>
            ))}
          </MultiplierWrapper>


          {needsReset && !loading && (
            <Overlay>
              <OverlayText>
                Reset to start
              </OverlayText>
            </Overlay>
          )}
          <Grid>
            {grid.map((cell, index) => (
              <Cell
                key={index}
                status={cell.status}
                onClick={() => handleClick(index)}
                disabled={needsReset}
              />
            ))}
          </Grid>
        </Container>
      </ResponsiveSize>
      <ActionBar>
        {gameState === 'idle' ? (
          <>
            <Dropdown
              value={wager}
              format={(value) => formatLamports(value)}
              label="Wager"
              onChange={setWager}
              options={WAGER_AMOUNTS.map((value) => ({
                label: formatLamports(value),
                value,
              }))}
            />
            <Dropdown
              value={mines}
              format={(value) => value + ' Mines'}
              label="Mines"
              onChange={setMines}
              options={MINE_SELECT.map((value) => ({
                label: value + ' SOL',
                value,
              }))}
            />
          </>
        ) : gameState === 'playing' ? (
          <div>
            <Button
              loading={claiming}
              disabled={claiming || loading}
              onClick={claim}
            >
              Claim {formatLamports(gamba.balances.user)}
            </Button>
          </div>
        ) : null}
        {gameState === 'lost' ? (
          <Button disabled={!needsReset || claiming || loading} onClick={reset}>Reset</Button>
        ) : null}
      </ActionBar>

    </>
  )
}

function calculateMultipliers(unclickedSquares: number, mines: number) {
  const multipliers = []
  for (let i = 0; i < unclickedSquares; i++) {
    multipliers[i] = 1 / ((unclickedSquares - i - mines) / (unclickedSquares - i))
  }
  return multipliers
}

function generateGrid() {
  const grid = Array.from({ length: GRID_SIZE }, () => ({ status: 'hidden' }))
  return grid
}

function revealRandomMines(grid: any[], count: number, excludeIndex: number) {
  let revealed = 0
  while (revealed < count) {
    const randomIndex = Math.floor(Math.random() * GRID_SIZE)
    if (grid[randomIndex].status === 'hidden' && randomIndex !== excludeIndex) {
      grid[randomIndex].status = 'mine'
      revealed++
    }
  }
}

export default Mines
