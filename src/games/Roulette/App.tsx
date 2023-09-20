import { solToLamports } from 'gamba'
import { useGamba } from 'gamba/react'
import { GameUi, formatLamports } from 'gamba/react-ui'
import React from 'react'
import styles from './App.module.css'
import { Chip } from './Chip'
import { Results } from './Results'
import { Table } from './Table'
import { CHIPS, NAMED_BETS, SOUND_LOSE, SOUND_PLAY, SOUND_WIN } from './constants'
import { NamedBet } from './types'
import { useRoulette } from './useRoulette'

const CHIP_RATE = solToLamports(0.05)

export default function Roulette() {
  const gamba = useGamba()
  const spinning = useRoulette((state) => state.spinning)
  const setSpinning = useRoulette((state) => state.setSpinning)
  const tableBet = useRoulette((state) => state.tableBet)
  const clearChips = useRoulette((state) => state.clearChips)
  const selectedBetAmount = useRoulette((state) => state.selectedBetAmount)
  const setSelectedBetAmount = useRoulette((state) => state.setSelectedBetAmount)
  const addResult = useRoulette((state) => state.addResult)
  const sounds = GameUi.useSounds({
    win: SOUND_WIN,
    lose: SOUND_LOSE,
    play: SOUND_PLAY,
  })

  const distributedBet = React.useMemo(() =>
    tableBet.numbers.map((value, i) => {
      return Object
        .entries(NAMED_BETS)
        .reduce((prev, [betName, { ids }]) => {
          if (ids.includes(i)) {
            return prev + tableBet.named[betName as NamedBet] / ids.length
          }
          return prev
        }, value) * CHIP_RATE
    }), [tableBet],
  )

  const { bet, wager } = React.useMemo(() => {
    const wager = Math.floor(distributedBet.reduce((a, b) => a + b, 0))
    const bet = distributedBet.map((amount) => +((amount * distributedBet.length) / (wager || 1)).toFixed(4))
    return { bet, wager }
  }, [distributedBet, gamba.house.maxPayout])

  const maxPayout = Math.max(...bet) * wager
  const maxPayoutExceeded = maxPayout > gamba.house.maxPayout

  const play = async () => {
    try {
      setSpinning(true)
      const res = await gamba.play({
        bet,
        wager,
      })
      sounds.play.play()
      const result = await res.result()
      addResult(result.resultIndex)
      if (result.payout > 0) {
        sounds.win.play()
      } else {
        sounds.lose.play()
      }
    } finally {
      setSpinning(false)
    }
  }

  return (
    <GameUi.Fullscreen maxScale={1.25} onContextMenu={(e) => e.preventDefault()}>
      <GameUi.Controls disabled={spinning}>
        <GameUi.Group>
          {CHIPS.map((value) => (
            <GameUi.Button
              key={value}
              selected={value === selectedBetAmount}
              onClick={() => setSelectedBetAmount(value)}
            >
              <Chip value={value} />
            </GameUi.Button>
          ))}
        </GameUi.Group>
        <GameUi.Group>
          <GameUi.Button
            disabled={!wager}
            onClick={clearChips}
          >
            Clear
          </GameUi.Button>
          <GameUi.Button variant="primary" disabled={!wager} onClick={play}>
            Spin
          </GameUi.Button>
        </GameUi.Group>
      </GameUi.Controls>

      <div className={styles.container}>
        <div style={{ textAlign: 'center', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr' }}>
          <div>
            <div>
              {formatLamports(wager)}
            </div>
            <div>
              TOTAL BET
            </div>
          </div>
          <div>
            <div>
              {maxPayoutExceeded ? (
                <span style={{ color: '#ff0066' }}>
                  TOO HIGH
                </span>
              ) : (
                <>
                  {formatLamports(maxPayout)}
                </>
              )}
            </div>
            <div>
              MAX PAYOUT
            </div>
          </div>
        </div>
        <Results />
        <Table />
      </div>
    </GameUi.Fullscreen>
  )
}
