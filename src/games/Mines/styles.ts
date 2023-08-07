// styles.ts
import styled, { css } from 'styled-components'

interface CellProps {
  status: 'hidden' | 'gold' | 'mine'
  selected: boolean
}

export const Container = styled.div`
  display: grid;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 100px;
  font-size: 14px;
`

export const CellGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  grid-template-rows: repeat(5, 1fr);
  gap: 10px;
`

export const Cell = styled.button<CellProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  background: #eee;
  border: none;
  border-bottom: 5px solid #00000033;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  outline: none;
  aspect-ratio: 1;
  width: 50px;
  overflow: hidden;
  transition: background 0.3s, opacity .3s;
  font-size: 12px;

  @keyframes hover-pulse {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
    }
    100% {
      transform: scale(1);
    }
  }

  @keyframes selected-animation {
    0% {
      transform: scale(1);
      background: #764cc4;
      box-shadow: 0 0 1px 1px #ffffff00;
    }
    50% {
      transform: scale(1.1);
      background: #945ef7;
      box-shadow: 0 0 1px 1px #ffffff99;
    }
    100% {
      transform: scale(1);
      background: #764cc4;
      box-shadow: 0 0 1px 1px #ffffff00;
    }
  }

  @keyframes gold-reveal {
    0% {
      color: white;
      background: #32cd5e;
      transform: scale(1.1);
    }
    75% {
      color: white;
      background: #ffffff;
      transform: scale(1.2);
    }
  }

  @keyframes mine-reveal {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.5);
    }
    51% {
      background: #ffffff;
      transform: scale(1.6);
    }
    100% {
      transform: scale(1);
    }
  }

  ${({ status }) =>
    status === 'hidden' &&
    css`
      background: #573c89;
    `}

  ${({ selected }) =>
    selected &&
    css`
      animation: selected-animation .5s ease infinite;
      z-index: 10;
    `}


  ${({ status }) =>
    status === 'mine' &&
    css`
      background: #ff5252;
      animation: mine-reveal .3s ease;
      z-index: 10;
    `}

    ${({ status }) =>
    status === 'gold' &&
    css`
      color: white;
      background: #32cd5e;
      animation: gold-reveal .5s ease;
    `}

  &:disabled {
    opacity: .9;
    cursor: default;
  }
  &:hover:not(:disabled) {
    background: #764cc4;
    animation: hover-pulse .5s ease infinite;
  }
`

export const MultiplierWrapper = styled.div`
  border-radius: 5px;
  background: #292a307d;
  font-weight: bold;
  overflow: hidden;
  width: 100%;
  display: flex;
  align-items: center;
  overflow: hidden;
`

export const MultiplierCurrent = styled.div<{isCurrent?: boolean}>`
  color: ${({ isCurrent }) => isCurrent ? '#32cd5e' : 'white'};
  display: flex;
  align-items: center;
  margin: 0 auto;
  width: 25%;
  justify-content: center;
  padding: 15px 0;
  background: ${({ isCurrent }) => isCurrent ? '#FFFFFF11' : 'transparent'};
  box-shadow: ${({ isCurrent }) => isCurrent ? '2px 0px 10px #00000033' : 'none'};
`

export const PulsingText = styled.div`
  font-weight: bold;
  color: #ff004f;

  @keyframes pulse {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.2);
    }
  }

  animation: pulse .5s linear infinite;
`
