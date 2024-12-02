import styled, { css, keyframes } from 'styled-components'

const appear = keyframes`
  0% { transform: scale(.0) translateY(100px) rotateY(90deg); }
  100% { transform: scale(1) translateY(0) rotateY(0deg) }
`

export const Container = styled.div<{ $disabled?: boolean }>`
  user-select: none;
  transition: opacity .2s;
  ${({ $disabled }) => $disabled && css`
    pointer-events: none;
    opacity: .7;
  `}
`

export const CardArea = styled.div`
  border: 2px solid white;
  border-radius: 10px;
  padding: 10px;
  margin: 10px;
  width: 300px;
  min-height: 150px;
  display: flex;
  justify-content: center;
  align-items: center;
`

export const CardsContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`

export const CardContainer = styled.div`
  margin: 0 5px;
  animation: ${appear} .25s cubic-bezier(0.5, 0.9, 0.35, 1.05);
`

export const Card = styled.div<{ color: string }>`
  height: 120px;
  font-size: 50px;
  padding: 10px;
  border-radius: 8px;
  box-shadow: -5px 5px 10px 1px #0000003d;
  background: white;
  aspect-ratio: 4/5.5;
  position: relative;
  color: ${(props) => props.color || '#333'};
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  .rank {
    font-weight: bold;
    margin-left: 5px;
  }
  .suit {
    font-size: 40px;
    margin-right: 5px;
    align-self: flex-end;
  }
`

export const Profit = styled.div`
  font-size: 18px;
  color: #005400;
  margin-top: 20px;
  border-radius: 50px;
  background: #69ff6d;
  padding: 5px 10px;
  animation: ${appear} .25s cubic-bezier(0.18, 0.89, 0.32, 1.28);
  cursor: pointer;
`