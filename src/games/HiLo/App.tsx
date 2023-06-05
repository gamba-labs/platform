import { solToLamports} from 'gamba'
import { useGamba } from 'gamba/react'
import { ActionBar, Button, ResponsiveSize, formatLamports } from 'gamba/react-ui'
import React, { useMemo, useState } from 'react'
import { FaHandPointDown, FaHandPointUp } from 'react-icons/fa'
import { Dropdown } from '../../components/Dropdown'
import { RANKS } from './constants'
import { Card, Container, Option , Overlay, OverlayText} from './styles'
import * as Tone from 'tone'
import cardSrc from './card.mp3'
import winSrc from './win.wav'

const createSound = (url: string) =>
  new Tone.Player({ url }).toDestination()

const cardSound = createSound(cardSrc)
const winSound = createSound(winSrc)

const randomRank = () => 0 + Math.floor(Math.random() * (RANKS - 1))
const WAGER_AMOUNTS = [0.05, 0.1, 0.25, 0.5, 1, 2].map(solToLamports)

export default function HiLo() {
  const gamba = useGamba()
  const [cards, setCards] = useState([randomRank()])
  const [loading, setLoading] = useState(false)
  const [claiming, setClaiming] = useState(false)
  const [firstPlay, setFirstPlay] = useState(true)
  const [wager, setWager] = useState(WAGER_AMOUNTS[0])
  const [currentRank] = cards
  const newSession = gamba.balances.user < wager
  const addCard = (rank: number) => setCards((cards) => [rank, ...cards])
  const [option, setOption] = useState<'hi' | 'lo'>()
  const betHi = useMemo(() =>
    Array.from({ length: RANKS }).map((_, i) =>
      i > currentRank ? RANKS / (RANKS - currentRank - 1) : 0,
    ), [currentRank])
  const betLo = useMemo(() =>
    Array.from({ length: RANKS }).map((_, i) =>
      i < currentRank ? RANKS / currentRank : 0,
    ), [currentRank])

  const hasClaimableBalance = gamba.balances.user > 0

  const resetGame = async () => {
    if (gamba.balances.user > 0) {
      setClaiming(true)
      await gamba.withdraw()
      setClaiming(false)
    }
    setCards([randomRank()])
    setLoading(false)
    setFirstPlay(true)
  }

  const cashout = async () => {
    try {
      const res = await gamba.withdraw()
      setClaiming(true)
      await res.result()
    } catch (err) {
      console.error(err)
    } finally {
      setClaiming(false)
    }
  }

  const play = async () => {
    try {
      const bet = option === 'hi' ? betHi : betLo
      const wagerInput = newSession ? wager : gamba.balances.user
      const res = await gamba.play(bet, wagerInput, { deductFees: true })
      setLoading(true)
      setFirstPlay(false)
      const result = await res.result()
      addCard(result.resultIndex)
      cardSound.start()

      if (result.payout == 0 ) {
        setFirstPlay(true)
      } else {
        winSound.start()
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
      
    }
  }

  const needsReset = firstPlay && hasClaimableBalance

  return (
    <>
      <ResponsiveSize>
        <Container>
          <Option 
            $selected={option === 'lo'} 
            onClick={currentRank !== 0 ? () => setOption('lo') : undefined}
            style={{visibility: currentRank === 0 ? 'hidden' : 'visible'}}
          >
            <div><FaHandPointDown /></div>
            <div>(x{Math.max(...betLo).toFixed(2)})</div>
          </Option>
          <Card key={cards.length}>
            <div className="rank">{currentRank + 1}</div>
            <div className="suit"></div>
          </Card>
          <Option 
            $selected={option === 'hi'} 
            onClick={currentRank !== 12 ? () => setOption('hi') : undefined}
            style={{visibility: currentRank === 12 ? 'hidden' : 'visible'}}
          >
            <div><FaHandPointUp /></div>
            <div>(x{Math.max(...betHi).toFixed(2)})</div>
          </Option>
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
        {firstPlay ? (
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
          </>
        ) : (
          <Button
            loading={claiming}
            disabled={newSession || claiming || loading || needsReset}
            onClick={cashout}
          >
            CASHOUT {formatLamports(gamba.balances.user)}
          </Button>
        )}
        <Button loading={loading} disabled={!option || needsReset} onClick={play}>
          PLAY {option}
        </Button>
        <Button disabled={!needsReset} onClick={resetGame}>Reset</Button>
      </ActionBar>
    </>
  )
  
  
}
