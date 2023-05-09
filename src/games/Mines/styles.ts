// styles.ts
import styled, { css } from 'styled-components'

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 200px;
`

export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  grid-template-rows: repeat(5, 1fr);
  gap: 8px;
  width: 300px;
  height: 300px;
`

interface CellProps {
  hasMine: boolean
  status: 'hidden' | 'gold' | 'mine'
}

export const Cell = styled.button<CellProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background-color: #eee;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  outline: none;
  transition: background-color 0.3s;

  ${({ status }) =>
    status === 'hidden' &&
    css`
      background-color: #322943;
    `}

  ${({ status }) =>
    status === 'mine' &&
    css`
      background-color: #ff5252;
    `}

    ${({ status }) =>
    status === 'gold' &&
    css`
      background-color: #32cd32;
    `}

  &:hover {
    background-color: #ddd;
  }
`

export const Overlay = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`

export const OverlayText = styled.div`
  font-size: 1.5rem;
  color: red;
`
