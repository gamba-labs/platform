import { GameUi } from 'gamba/react-ui'
import React, { MouseEventHandler } from 'react'
import { Chip } from './Chip'
import styles from './Table.module.css'
import { NAMED_BETS, SOUND_CHIP, SQUARES } from './constants'
import { NamedBet } from './types'
import { useRoulette } from './useRoulette'

interface BetButtonProps {
  square: {name?: NamedBet, number?: number}
  value: number
}

function BetButton({ square, children, value, className, ...rest }: React.PropsWithChildren<BetButtonProps> & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const spinning = useRoulette((state) => state.spinning)
  const placeChip = useRoulette((state) => state.placeChip)
  const removeChips = useRoulette((state) => state.removeChips)
  const selectedBetAmount = useRoulette((state) => state.selectedBetAmount)
  const setHighlightedSquares = useRoulette((state) => state.setHighlightedSquares)
  const sounds = GameUi.useSounds({ chip: SOUND_CHIP })

  const hover = () => {
    if (typeof square.number !== 'undefined')
      setHighlightedSquares([square.number])
    if (typeof square.name !== 'undefined')
      setHighlightedSquares(NAMED_BETS[square.name].ids)
  }

  const leave = () => {
    setHighlightedSquares([])
  }

  const click: MouseEventHandler = (evt) => {
    evt.preventDefault()
    const numberOrName = square.name ?? square.number
    if (typeof numberOrName !== 'undefined') {
      if (evt.button === 2) {
        if (value > 0) {
          sounds.chip.play({})
          removeChips(numberOrName)
        }
      } else {
        sounds.chip.play({ playbackRate: .9 })
        placeChip(numberOrName, selectedBetAmount)
      }
    }
  }

  return (
    <button
      className={[styles.betButton, className].join(' ')}
      onContextMenu={click}
      onClick={click}
      disabled={spinning}
      onMouseOver={hover}
      onMouseLeave={leave}
      {...rest}
    >
      {children}
      {value > 0 && (
        <div key={value} className={styles.chip2}>
          <Chip value={value} />
        </div>
      )}
    </button>
  )
}

export function Table() {
  const highlightedSquares = useRoulette((state) => state.highlightedSquares)
  const tableBet = useRoulette((state) => state.tableBet)

  return (
    <div className={styles.wrapper}>
      {SQUARES.map(({ row, color }, i) => {
        const value = tableBet.numbers[i]
        const isHighlighted = highlightedSquares.includes(i)
        return (
          <BetButton
            key={i}
            square={{ number: i }}
            value={value}
            data-highlight={isHighlighted}
            data-color={color}
            style={{ gridRow: row + 1 }}
          >
            {i + 1}
          </BetButton>
        )
      })}
      {Object.entries(NAMED_BETS).map(([name, { label, row, col }], i) => (
        <BetButton
          key={i}
          square={{ name: name as NamedBet }}
          value={tableBet.named[name as NamedBet]}
          style={{
            gridRow: row,
            gridColumn: col,
          }}
        >
          <div>
            {label}
          </div>
        </BetButton>
      ))}
    </div>
  )
}
