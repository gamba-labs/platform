import { solToLamports } from 'gamba'
import { useGamba } from 'gamba/react'
import { ActionBar, Button, ResponsiveSize, formatLamports } from 'gamba/react-ui'
import React, { useMemo, useState } from 'react'
import { FaHandPointDown, FaHandPointUp, FaEquals } from 'react-icons/fa'
import { Dropdown } from '../../components/Dropdown'
import { RANKS } from './constants'
import { Card, Container, Option, Overlay, OverlayText } from './styles'
import * as Tone from 'tone'
import cardSrc from './card.mp3'
import winSrc from './win.wav'

const createSound = (url: string) =>
  new Tone.Player({ url }).toDestination()

const cardSound = createSound(cardSrc)
const winSound = createSound(winSrc)

const randomRank = () => 1 + Math.floor(Math.random() * (RANKS - 1))
const WAGER_AMOUNTS = [0.05, 0.1, 0.25, 0.5, 1, 2].map(solToLamports)

export default function HiLo() {
  const gamba = useGamba()
  const [cards, setCards] = useState([randomRank()])
  const [loading, setLoading] = useState(false)
  const [claiming, setClaiming] = useState(false)
  const [wager, setWager] = useState(WAGER_AMOUNTS[0])
  const [currentRank] = cards
  const addCard = (rank: number) => setCards((cards) => [rank, ...cards])
  const [option, setOption] = useState<'hi' | 'lo' | 'same'>()
  const [totalGain, setTotalGain] = useState(0)
  const [gameState, setGameState] = useState('idle') // idle, playing, lost

  const betHi = useMemo(() =>
    Array.from({ length: RANKS }).map((_, i) =>
      i > 0 && i >= currentRank ? (currentRank === 0 ? RANKS / (RANKS - 1) : RANKS / (RANKS - currentRank)) : 0,
    ), [currentRank])

  const betLo = useMemo(() =>
    Array.from({ length: RANKS }).map((_, i) =>
      i < RANKS - 1 && i <= currentRank ? (currentRank === RANKS - 1 ? RANKS / currentRank : RANKS / (currentRank + 1)) : 0,
    ), [currentRank])
  
  const betSame = useMemo(() => [RANKS, ...Array(RANKS - 1).fill(0)], [currentRank])

  const claim = async () => {
    if (gamba.balances.user > 0) {
      setClaiming(true)
      await gamba.withdraw()
      setClaiming(false)
    }
    setGameState('lost')
  }

  const reset = async () => {
    setCards([randomRank()])
    setLoading(false)
    setTotalGain(0)
    setGameState('idle')
  }

  const play = async () => {
    try {
      let bet
      switch (option) {
        case 'hi':
          bet = betHi
          break
        case 'lo':
          bet = betLo
          break
        case 'same':
          bet = betSame
          break
      }
      let wagerInput = wager
      let res

      if (gameState === 'playing') {
        wagerInput = wager + totalGain
        res = await gamba.play(bet, wagerInput, { deductFees: true })
      } else {
        res = await gamba.play(bet, wagerInput, { deductFees: false })
      }
      
      setLoading(true)
      setGameState('playing')
      const result = await res.result()
      addCard(result.resultIndex)
      cardSound.start()

      const win = result.payout > 0

      if (win) {
        winSound.start()
        setTotalGain(totalGain + result.payout)
      } else {
        setGameState('lost')
        setTotalGain(0)
      }
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
          {currentRank !== 0 ? (
            <Option
              $selected={option === 'lo'}
              onClick={() => setOption('lo')}
            >
              <div><FaHandPointDown /></div>
              <div>(x{Math.max(...betLo).toFixed(2)})</div>
            </Option>
          ) : (
            <Option
              $selected={option === 'same'}
              onClick={() => setOption('same')}
            >
              <div><FaEquals /></div>
              <div>(x{Math.max(...betSame).toFixed(2)})</div>
            </Option>
          )}
          <Card key={cards.length}>
            <div className="rank">{currentRank + 1}</div>
            <div className="suit"></div>
          </Card>
          {currentRank !== RANKS - 1 ? (
            <Option
              $selected={option === 'hi'}
              onClick={() => setOption('hi')}
            >
              <div><FaHandPointUp /></div>
              <div>(x{Math.max(...betHi).toFixed(2)})</div>
            </Option>
          ) : (
            <Option
              $selected={option === 'same'}
              onClick={() => setOption('same')}
            >
              <div><FaEquals /></div>
              <div>(x{Math.max(...betSame).toFixed(2)})</div>
            </Option>
          )}
          {needsReset && !loading && (
            <Overlay>
              <OverlayText>
                Reset to start
              </OverlayText>
            </Overlay>
          )}
        </Container>
      </ResponsiveSize>
      <ActionBar>
        {gameState === 'lost' ? (
          <Button onClick={reset}>Reset</Button>
        ) : (
          <>
            {gameState === 'idle' ? (
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
            ) : (
              <Button
                loading={claiming}
                disabled={claiming || loading}
                onClick={claim}
              >
                CASHOUT {formatLamports(gamba.balances.user)}
              </Button>
            )}
            <Button loading={loading} disabled={!option} onClick={play}>
              PLAY {option}
            </Button>
          </>
        )}
      </ActionBar>

    </>
  )
}
