import React from 'react'
import { SLOT_ITEMS, SlotItem } from './constants'
import styled, { css, keyframes } from 'styled-components'
import { StyledSpinner } from './Slot.styles'

interface SlotProps {
  revealed:boolean
  good: boolean
  index: number
  item?: SlotItem
}

const reveal = keyframes`
  0% {
    transform: translateY(100%);
    opacity: 0;
  }
  100% {
    transform: translateY(0%);
    opacity: 1;
  }
`

const pulse = keyframes`
  0%, 30% {
    transform: scale(1)
  }
  10% {
    transform: scale(1.3)
  }
`

const StyledSlot = styled.div<{$good: boolean}>`
  width: 100px;
  aspect-ratio: 1/1.5;
  position: relative;
  background: #4444FF11;
  overflow: hidden;
  border-radius: 10px;
  border: 2px solid #2d2d57;
  transition: background .2s, border .2s, box-shadow .2s;
  ${(props) => props.$good && css`
    animation: reveal-glow 1s;
  `}
`

const Revealed = styled.div<{$revealed: boolean, $good: boolean}>`
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  padding: 10px;
  transition: opacity .2s, transform .3s ease;
  transform: translateY(-100%);
  opacity: 0;

  ${(props) => props.$revealed && css`
    opacity: 1;
    transform: translateY(0%);
    animation: ${reveal} cubic-bezier(0.18, 0.89, 0.32, 1.28) .25s;
  `}

  ${(props) => props.$good && css`
    & > img {
      animation: ${pulse} 2s .25s cubic-bezier(0.04, 1.14, 0.48, 1.63) infinite;
    }
  `}
`

export function Slot({ revealed, good, item, index }: SlotProps) {
  const items = React.useMemo(() =>
    [...SLOT_ITEMS].sort(() => Math.random() - .5)
  , [],
  )
  return (
    <StyledSlot $good={good}>
      <StyledSpinner data-spinning={!revealed}>
        {items.map((item, i) => (
          <div key={i}>
            <img className={"slotImage"} src={item.image} />
          </div>
        ))}
      </StyledSpinner>
      {item && (
        <>
          <Revealed
            className={"revealedSlot"}
            $revealed={revealed}
            $good={revealed && good}
          >
            <img
              className={"slotImage"}
              src={item.image}
              style={{ animationDelay: index * .25 + 's' }}
            />
          </Revealed>
        </>
      )}
    </StyledSlot>
  )
}
