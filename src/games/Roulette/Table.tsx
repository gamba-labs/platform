import { useSound } from 'gamba-react-ui-v2'
import { useGamba } from 'gamba-react-v2'
import React from 'react'
import { Chip } from './Chip'
import { ChipContainer, StyledBetButton, StyledTable } from './Roulette.styles'
import { SOUND_CHIP, tableLayout } from './constants'
import { addChips, getChips, hover, hovered, removeChips, selectedChip } from './signals'

export function Table() {
  const gamba = useGamba()
  const sounds = useSound({ chip: SOUND_CHIP })

  const add = (id: string) => {
    if (gamba.isPlaying) return
    sounds.play('chip', { playbackRate: 1 })
    addChips(id, selectedChip.value)
  }

  const remove = (id: string) => {
    if (gamba.isPlaying) return
    sounds.play('chip', { playbackRate: .8 })
    removeChips(id)
  }

  return (
    <StyledTable>
      {Object.entries(tableLayout)
        .map(([id, square]) => {
          const amount = getChips(id)
          return (
            <StyledBetButton
              key={id}
              onClick={(evt) => {
                evt.preventDefault()
                if (evt.button !== 2) {
                  add(id)
                } else {
                  remove(id)
                }
              }}
              onContextMenu={() => remove(id)}
              style={{
                gridRow: square.row,
                gridColumn: square.column,
              }}
              $highlighted={hovered.value.includes(Number(id))}
              $color={square.color}
              onMouseOver={() => hover(square.numbers)}
              onMouseLeave={() => hover([])}
            >
              {square.label}
              {amount > 0 && (
                <ChipContainer key={amount}>
                  <Chip value={amount} />
                </ChipContainer>
              )}
            </StyledBetButton>
          )
        })}
    </StyledTable>
  )
}
