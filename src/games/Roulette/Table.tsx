import React, { MouseEventHandler } from 'react'
import { NAMED_BETS, NUMBERS, NUMBER_COLUMNS, getNumberInfo } from './constants'
import { useRoulette } from './store'
import { Chip, ChipWrapper, StyledBetButton, Relative, StylelessButton, TableSquare, TableWrapper } from './styles'
import { NamedBet } from './types'
import { lamportsToSol } from 'gamba'
import { soundChip } from './App'

interface BetButtonProps {
  square: {name?: NamedBet, number?: number}
  value: number
}

function BetButton({
  square,
  children,
  value,
}: React.PropsWithChildren<BetButtonProps>) {
  const placeChip = useRoulette((state) => state.placeChip)
  const removeChips = useRoulette((state) => state.removeChips)
  const selectedBetAmount = useRoulette((state) => state.selectedBetAmount)
  const setHighlightedSquares = useRoulette((state) => state.setHighlightedSquares)

  const hover = () => {
    if (typeof square.number !== 'undefined')
      setHighlightedSquares([square.number])
    if (typeof square.name !== 'undefined')
      setHighlightedSquares(NAMED_BETS[square.name])
  }

  const leave = () => {
    setHighlightedSquares([])
  }

  const click: MouseEventHandler = (evt) => {
    evt.preventDefault()
    const numberOrName = square.name ?? square.number
    if (typeof numberOrName !== 'undefined') {
      if (evt.button === 2) {
        soundChip.playbackRate = .8
        soundChip.start()
        removeChips(numberOrName)
      } else {
        soundChip.playbackRate = 1
        soundChip.start()
        placeChip(numberOrName, selectedBetAmount)
      }
    }
  }

  return (
    <Relative>
      <StylelessButton
        onContextMenu={click}
        onClick={click}
        onMouseOver={hover}
        onMouseLeave={leave}
        onPointerDown={hover}
        onPointerUp={leave}
        onPointerCancel={leave}
        style={{ fontWeight: 'bold' }}
      >
        {children}
      </StylelessButton>
      {value > 0 && (
        <ChipWrapper key={value}>
          <Chip value={lamportsToSol(value)}>
            {lamportsToSol(value)}
          </Chip>
        </ChipWrapper>
      )}
    </Relative>
  )
}

export function Table() {
  const highlightedSquares = useRoulette((state) => state.highlightedSquares)
  const tableBet = useRoulette((state) => state.tableBet)

  return (
    <TableWrapper>
      {Array.from({ length: NUMBERS }).map((_, i) => {
        const { row, color } = getNumberInfo(i)
        const value = tableBet.numbers[i]
        const isHighlighted = highlightedSquares.includes(i)
        const transparent = highlightedSquares.length > 1 && !isHighlighted
        return (
          <div style={{ gridRow: row + 1 }} key={i}>
            <BetButton
              square={{ number: i }}
              value={value}
            >
              <TableSquare $highlighted={isHighlighted} $transparent={transparent} $color={color}>
                {i + 1}
              </TableSquare>
            </BetButton>
          </div>
        )
      })}
      {(['row1', 'row2', 'row3'] as const).map((name, i) => (
        <div style={{ gridRow: (i + 1), gridColumn: NUMBER_COLUMNS + 1 }} key={i}>
          <BetButton
            square={{ name }}
            value={tableBet.named[name]}
          >
            <StyledBetButton>
              1:2
            </StyledBetButton>
          </BetButton>
        </div>
      ))}
      {(['firstHalf', 'odd', 'red', 'black', 'even', 'secondHalf'] as const).map((name, i) => (
        <div style={{ gridRow: 4, gridColumn: i + 1 }} key={i}>
          <BetButton
            square={{ name }}
            value={tableBet.named[name]}
          >
            <StyledBetButton>
              {name}
            </StyledBetButton>
          </BetButton>
        </div>
      ))}
    </TableWrapper>
  )
}
