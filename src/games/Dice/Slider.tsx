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
  margin: 50px 0;
`

const SliderLabels = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 25px;
  & > div {
    opacity: .9;
    width: 50px;
    text-align: center;
  }
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
    width: 30px;
    height: 30px;
    border: none;
    background: #4CAF50;
    border-radius: 3px;
    cursor: pointer;
    transition: background .3s;
  }

  &::-moz-range-thumb {
    -moz-appearance: none;
    appearance: none;
    width: 30px;
    height: 30px;
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
  background: #00bf57;
  position: absolute;
  height: 8px;
  border-radius: 4px;
  top: 14px;
  z-index: 1;
`

const ResultLabel = styled.div`
  position: absolute;
  top: -40px;
  background: #ffffffCC;
  backdrop-filter: blur(50px);
  border-radius: 3px;
  padding: 5px;
  font-size: 18px;
  font-weight: bold;
  transform: translateX(-50%);
  width: 50px;
  text-align: center;
  transition: left 0.3s ease-in-out;
  color:black;
  &::after {
    content: "";
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: -10px;
    border-width: 10px 10px 0px 10px;
    border-style: solid;
    border-color: #ffffffCC transparent transparent transparent;
  }
`

interface SliderProps {
  min: number
  max: number
  value: number
  onChange: (value: number) => void
  resultIndex: number
  disabled?: boolean
}

const Slider: React.FC<SliderProps> = ({ min, max, value, onChange, resultIndex, disabled }) => {
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
      <Track style={{ width: `${value}%` }} />
      <Track style={{ width: `${100 - value}%`, background: '#322943', right: 0 }} />
      {resultIndex > -1 &&
        <ResultLabel style={{ left: `${resultIndex}%` }}>{resultIndex}</ResultLabel>
      }
      <SliderInput
        disabled={disabled}
        type="range"
        min={min.toString()}
        max={max.toString()}
        value={value}
        onChange={handleChange}
      />
      <SliderLabels>
        {labels.map((label, i) => (
          <div key={i}>
            {label}
          </div>
        ))}
      </SliderLabels>
    </SliderWrapper>
  )
}

export default Slider
