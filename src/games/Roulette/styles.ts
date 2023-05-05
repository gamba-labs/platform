import styled, { keyframes } from 'styled-components'

export const numberColorToHex = (numberColor: string) => {
  if (numberColor === 'red') {
    return { text: '#ff3d5e', background: '#ff3d5e' }
  }
  if (numberColor === 'black') {
    return { text: '#00ff61', background: '#242634' }
  }
  return { text: 'white', background: 'transparent' }
}

const getChipColor = (value = 0) => {
  if (value >= .5) {
    return '#d46bff'
  }
  if (value >= .25) {
    return '#ffdf56'
  }
  if (value >= .1) {
    return '#ff384b'
  }
  if (value >= .05) {
    return '#5187ff'
  }
  return '#00ff61'
}

export const TableWrapper = styled.div`
  display: inline-grid;
  user-select: none;
  gap: 10px;
  text-align: center;
`

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`

export const Loader = styled.div`
  border: 3px solid transparent;
  border-top: 3px solid white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  animation: ${spin} .3s linear infinite;
`

export const Relative = styled.div`
  position: relative;
`

export const StylelessButton = styled.button`
  border: none;
  margin: 0;
  outline: none;
  padding: 0;
  background: none;
`

export const TableSquare = styled.div<{$color: 'red' | 'black' | 'none', $transparent?: boolean, $highlighted?: boolean}>`
  border-radius: 5px;
  width: 60px;
  height: 40px;
  line-height: 40px;
  background: ${({ $color }) => numberColorToHex($color).background};
  color: white;
  transition: opacity .2s;
  ${({ $transparent }) => $transparent && `
    opacity: .5;
  `}
  ${({ $highlighted }) => $highlighted && `
    box-shadow: 0 0 0 1px #ffffffcc;
  `}
`

export const Chip = styled.div<{value?: number, inactive?: boolean}>`
  --chip-color: ${({ value, inactive }) => inactive ? '#ccc' : getChipColor(value)};
  width: 30px;
  border-radius: 5px;
  background: var(--chip-color);
  color: black;
  font-size: 12px;
  font-weight: bold;
  border: 1px dashed #fff;
  display: inline-block;
  box-shadow: 0 0 0 1px var(--chip-color), 0 0 5px 5px ${({ value }) => getChipColor(value)}33, -4px 4px #00000033;
  text-align: center;
  user-select: none;
`

const chipAnimation = keyframes`
  0% { transform: translate(50%, -50%) scale(1.2, 1.2); }
  100% { transform: translate(50%, -50%) scale(1, 1); }
`

export const ChipWrapper = styled.div`
  position: absolute;
  right: 0;
  top: 0;
  z-index: 1;
  transform: translate(50%, -50%);
  pointer-events: none;
  animation: ${chipAnimation} .1s;
`

export const StyledBetButton = styled.div`
  height: 40px;
  width: 60px;
  line-height: 40px;
  text-align: center;
  color: white;
`
