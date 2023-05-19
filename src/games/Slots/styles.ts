import styled, { keyframes, css } from 'styled-components'

export const SlotContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 20px; // Creates space between the slot windows
  font-size: 5rem; // Adjust as needed
  padding: 20px;
  border-radius: 10px;
  span {
    text-shadow: 5px 20px 4px rgba(0, 0, 0, 0.5);
    color: #000000;
  }
`

const lightUpKeyframes = keyframes`
  0% { box-shadow: 0 0 3px #ffec63, 0 0 5px #ffec63, 0 0 8px #ffec63, 0 0 10px #ffec63; }
  50% { box-shadow: 0 0 5px #ffec63, 0 0 10px #ffec63, 0 0 15px #ffec63, 0 0 20px #ffec63; }
  100% { box-shadow: 0 0 3px #ffec63, 0 0 5px #ffec63, 0 0 8px #ffec63, 0 0 10px #ffec63; }
`

export const lightUp = css`
  animation: ${lightUpKeyframes} 2s infinite;
`

export const SlotWindowContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 8rem;
  height: 12rem;
  border-radius: 10px;
  background-color: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), inset 0 0 10px rgba(0, 0, 0, 0.3);
  border: 0px solid #ccc;

  &.light-up {
    ${lightUp}
  }
`

const moneyIncrease = keyframes`
  0% {
    transform: translateY(20px);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
`

const flash = keyframes`
  0%, 100% {
    background-color: #ffec63;
    color: #333;
  }
  50% {
    background-color: #333;
    color: #ffec63;
  }
`

export const WinPopup = styled.div`
  position: absolute;
  padding: 15px;
  width: 100%;
  margin-top: 20px;
  border-radius: 10px;
  background-color: #ffec63;
  color: #333;
  font-size: 2rem;
  font-weight: bold;
  text-align: center;
  animation: ${flash} 1s infinite, ${moneyIncrease} 0.5s ease-out;

  &:after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: inherit;
    border-radius: inherit;
    animation: ${flash} 1s infinite;
    z-index: -1;
    opacity: 0.6;
  }
`
