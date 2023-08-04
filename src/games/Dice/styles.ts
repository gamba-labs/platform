import styled from 'styled-components'

export const GameContainer = styled.div` {
  min-width: 50vh;
}`

export const WagerSection = styled.div`
  & > div {
    background: #32294399;
    padding: 10px 20px;
    border-radius: 10px;
  }
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 20px;
`

export const WagerInput = styled.div`
  width: 100%;
  text-align: center;
  margin-bottom: 10px;
  font-size: 18px;
  font-weight: bold;
  input {
    background: transparent;
    color: white;
    font: inherit;
    border: none;
  }
`

export const WagerButtons = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 10px;
  & > button {
    background: #00000033;
    border: none;
    color: white;
    border-radius: 5px;
    padding: 5px 10px;
  }
`

export const StyledSlider = styled.input`
  -webkit-appearance: none;
  width: 100%;
  height: 10px;
  background: #ffffff33;
  outline: none;
  transition: opacity .2s;
  border-radius: 10px;

  &:hover {
    opacity: 1;
  }

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 25px;
    height: 25px;
    background: #ff335c;
    cursor: pointer;
    border-radius: 3px;  // slight rounding
  }

  &::-moz-range-thumb {
    width: 25px;
    height: 25px;
    background: #4CAF50;
    cursor: pointer;
    border-radius: 3px;
  }
`
export const StatContainerWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`

export const SemiCircleContainer = styled.div`
  width: 150px;
  height: 75px;
  background: #32294399;
  backdrop-filter: blur(50px);
  border-radius: 100px 100px 0 0;
  border-bottom: none;
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  flex-direction: column;
  color: white;
  user-select:none;
  & > div:first-child {
    font-weight: bold;
    font-size: 30px;
  }
  & > div:last-child {
    font-size: 12px;
    opacity: .8;
  }
`

export const StatContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
  gap: 1rem;
  background: #32294399;
  backdrop-filter: blur(50px);
  border-radius: 0.5rem;
  padding: 0 10px;
`

export const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-grow: 1;
  text-align: center;
  padding: 10px;
  & > div {
    padding: 5px;
  }
  & > div:last-child {
    opacity: .8;
    font-size: 12px;
  }
  & > div:first-child {
    font-weight: bold;
  }
`
