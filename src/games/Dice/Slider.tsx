import React from 'react'
import styled from 'styled-components'
import * as Tone from 'tone'
import tickSrc from './tick.wav'

const createSound = (url: string) =>
  new Tone.Player({ url }).toDestination()

const soundTick = createSound(tickSrc)

const SliderWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 36px;
`

const SliderLabel = styled.div`
  position: absolute;
  top: -20px;
  transform: translateX(-50%);
`



const SliderInput = styled.input`
  -webkit-appearance: none;
  width: 100%;
  height: 8px;
  background: transparent;
  outline: none;
  position: relative;
  z-index: 2;

  &::-webkit-slider-runnable-track {
    height: 8px;
    background: transparent;
    border-radius: 4px;
  }

  &::-moz-range-track {
    height: 8px;
    background: transparent;
    border-radius: 4px;
  }

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 36px;
    height: 36px;
    border: none;
    background: #4CAF50;
    border-radius: 3px;
    cursor: pointer;
    transition: background .3s;
  }

  &::-moz-range-thumb {
    -moz-appearance: none;
    appearance: none;
    width: 36px;
    height: 36px;
    border: none;
    background: #4CAF50;
    border-radius: 3px;
    cursor: pointer;
    transition: background .3s;
  }

  &:hover::-webkit-slider-thumb {
    background: #45a049;
  }

  &:hover::-moz-range-thumb {
    background: #45a049;
  }
`



const Track = styled.div`
  position: absolute;
  height: 8px;
  border-radius: 4px;
  top: 14px;
  z-index: 1;
`

const ResultLabel = styled.div`
  position: absolute;
  top: -30px;
  background: white;
  border-radius: 3px;
  padding: 5px;
  font-size: 12px;
  transform: translateX(-50%);
  transition: left 0.3s ease-in-out;
  color:black;
  &::after {
    content: "";
    position: absolute;
    top: 90%;
    left: 50%;
    margin-left: -5px;
    border-width: 20px 5px 0px 5px; 
    border-style: solid;
    border-color: white transparent transparent transparent;
  }
`

interface SliderProps {
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  resultIndex: number;
}

const Slider: React.FC<SliderProps> = ({ min, max, value, onChange, resultIndex }) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(event.target.value)
    if (newValue <= 95) {
      onChange(newValue)
      soundTick.start()
    }
  }

  const labels = [0, 25, 50, 75, 100]

  return (
    <SliderWrapper>
      {labels.map((label, i) => (
        <SliderLabel style={{ left: `${label}%` }} key={i}>
          {label}
        </SliderLabel>
      ))}
      <Track style={{ width: `${value}%`, background: 'green' }} />
      <Track style={{ width: `${100 - value}%`, background: 'red', right: 0 }} />
      {resultIndex > 0 && 
        <ResultLabel style={{ left: `${resultIndex}%` }}>{resultIndex}</ResultLabel>
      }
      <SliderInput
        type="range"
        min={min.toString()}
        max={max.toString()}
        value={value}
        onChange={handleChange}
      />
    </SliderWrapper>
  )
}

export default Slider
