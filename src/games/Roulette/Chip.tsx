import React from 'react'
import styled, { css } from 'styled-components'

const StyledChip = styled.div<{$color: string}>`
  width: 18px;
  height: 18px;
  line-height: 16px;
  border-radius: 10px;
  background: var(--chip-color);
  border: 1px dashed var(--border-color);
  color: black;
  font-size: 9px;
  font-weight: bold;
  color: var(--text-color);
  box-shadow: 0 0 0 1px var(--chip-color);
  padding: 0;
  display: inline-block;
  text-align: center;
  user-select: none;

  ${(props) => props.$color === 'white' && css`
    --chip-color: #f0f0ff;
    --border-color: #8888C0;
    --text-color: #333333;
  `}
  ${(props) => props.$color === 'green' && css`
    --chip-color: #47ff7d;
    --border-color: #006600;
    --text-color: #004400;
  `}
  ${(props) => props.$color === 'red' && css`
    --chip-color: #ff5b72;
    --border-color: #ffffff;
    --text-color: #220000;
  `}
  ${(props) => props.$color === 'blue' && css`
    --chip-color: #a692ff;
    --border-color: #ffffff;
    --text-color: #000245;
  `}
`

const color = (value: number) => {
  if (value <= 1) return 'green'
  if (value <= 2) return 'red'
  if (value <= 10) return 'blue'
  return 'white'
}

export function Chip({ value }: {value: number}) {
  return (
    <StyledChip $color={color(value)}>
      {value}
    </StyledChip>
  )
}
