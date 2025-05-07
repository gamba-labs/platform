import styled, { keyframes } from 'styled-components'

const jackpotGradient = keyframes`
  0% {
    background: linear-gradient(90deg, #ffd700, #ff4500);
  }
  25% {
    background: linear-gradient(90deg, #ff4500, #32cd32);
  }
  50% {
    background: linear-gradient(90deg, #32cd32, #1e90ff);
  }
  75% {
    background: linear-gradient(90deg, #1e90ff, #ffd700);
  }
  100% {
    background: linear-gradient(90deg, #ffd700, #ff4500);
  }
`

const skeletonAnimation = keyframes`
  0%, 100% {
    background-color: #555;
  }
  50% {
    background-color: #777;
  }
`

export const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 10px;
`

export const Profit = styled.div<{$win: boolean}>`
  display: flex;
  align-items: center;
  gap: 0.5em;
  background: none; /* SIN color de fondo */
  border: 2px solid ${props => props.$win ? 'green' : 'red'};
  border-radius: 12px;
  padding: 12px 16px;
  font-size: 16px;
  color: #fff;
  font-weight: bold;
  box-shadow: 0 0 10px rgba(255, 215, 0, 0.7), 0 0 5px rgba(0, 0, 0, 0.5);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);
  transition: transform 0.2s;
  &:hover {
    transform: scale(1.05);
  }
`

export const Jackpot = styled.div`
  animation: ${jackpotGradient} 2s linear infinite;
  display: flex;
  align-items: center;
  gap: 0.5em;
  border: 2px solid gold;
  border-radius: 16px;
  padding: 12px 16px;
  font-size: 18px;
  color: #fff;
  font-weight: 900;
  box-shadow: 0 0 15px rgba(255, 215, 0, 0.8), 0 0 10px rgba(0, 0, 0, 0.6);
  text-shadow: 0 2px 3px rgba(0, 0, 0, 0.7);
`

export const Recent = styled.button`
  all: unset;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5em;
  padding: 10px 16px;
  font-size: 16px;
  color: #fff;
  border-radius: 10px;
  background: none; /* SIN color de fondo */
  border: 2px solid gold;
  font-weight: bold;
  box-shadow: 0 0 8px rgba(255, 215, 0, 0.5);
  transition: transform 0.2s;
  &:hover {
    transform: scale(1.05);
  }
`

export const Skeleton = styled.div`
  height: 50px;
  width: 100%;
  border-radius: 10px;
  animation: ${skeletonAnimation} 1.5s infinite;
  border: 2px solid gold;
  box-shadow: 0 0 5px rgba(255, 215, 0, 0.5);
`
