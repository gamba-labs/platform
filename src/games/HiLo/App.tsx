import { useGamba } from 'gamba/react'
import { ActionBar, Button, ResponsiveSize } from 'gamba/react-ui'
import React, { useMemo, useState } from 'react'
import { FaHandPointDown, FaHandPointUp } from 'react-icons/fa'
import { MIN_WAGER, RANKS } from './constants'
import { useHiLo } from './store'
import { Card, Container, Option } from './styles'

export default function HiLo() {
  const gamba = useGamba()
  const cards = useHiLo((state) => state.cards)
  const addCard = useHiLo((state) => state.addCard)
  const [loading, setLoading] = useState(false)
  const [claiming, setClaiming] = useState(false)
  const [currentRank] = cards
  const newSession = gamba.balances.user < MIN_WAGER

  const [option, setOption] = useState<'hi' | 'lo'>()

  const betHi = useMemo(() =>
    Array.from({ length: RANKS }).map((_, i) =>
      i > currentRank ? RANKS / (RANKS - currentRank - 1) : 0,
    ), [currentRank])

  const betLo = useMemo(() =>
    Array.from({ length: RANKS }).map((_, i) =>
      i < currentRank ? RANKS / currentRank : 0,
    ), [currentRank])

  const claim = async () => {
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
      const wager = newSession ? MIN_WAGER : gamba.balances.user
      const res = await gamba.play(bet, wager, { deductFees: true })
      setLoading(true)
      const result = await res.result()
      addCard(result.resultIndex)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <ResponsiveSize>
        <Container>
          <Option $selected={option === 'lo'} onClick={() => setOption('lo')}>
            <div><FaHandPointDown /></div>
            <div>(x{Math.max(...betLo).toFixed(2)})</div>
          </Option>
          <Card key={cards.length}>
            <div className="rank">{currentRank + 1}</div>
            <div className="suit"></div>
          </Card>
          <Option $selected={option === 'hi'} onClick={() => setOption('hi')}>
            <div><FaHandPointUp /></div>
            <div>(x{Math.max(...betHi).toFixed(2)})</div>
          </Option>
        </Container>
      </ResponsiveSize>
      <ActionBar>
        <Button loading={loading} disabled={!option} onClick={play}>
          PLAY {option}
        </Button>
        <Button loading={claiming} disabled={newSession || claiming || loading} onClick={() => claim()}>
          CLAIM
        </Button>
      </ActionBar>
    </>
  )
}
