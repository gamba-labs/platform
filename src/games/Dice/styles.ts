import styled, { keyframes } from 'styled-components'

export const GameContainer = styled.div` {
  min-width: 50vh; 
}`

export const WagerSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 25px;
`

export const WagerInputs = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px; 
  width: 100%; 
`

export const WagerButtons = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;  // Adjust this value to change the space between the buttons
  margin-top: 10px;  // Add some space above the buttons
`

export const StyledSlider = styled.input`
-webkit-appearance: none;
width: 50%;
height: 15px;
background: #d3d3d3;
outline: none;
opacity: 0.7;
transition: opacity .2s;

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
margin: 25px;
`

export const SemiCircleContainer = styled.div`
  width: 100px;
  height: 50px;
  background-color: transparent;
  border: 1px solid #ff335c;
  border-radius: 50px 50px 0 0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  color: white;
  margin-bottom: -1px;
  font-weight: bold;
`

export const StatContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
  gap: 1rem;
  border: 1px solid #ff335c;
  border-radius: 0.5rem;
  
`

export const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-grow: 1;
  background: transparent;
  padding: 0.5rem;
  text-align: center;
  font-weight: bold;
`


