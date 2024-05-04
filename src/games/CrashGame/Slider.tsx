import React from 'react'
import styled from 'styled-components'
import rocketIcon from './rocket.gif'

const SliderContainer = styled.div`
  position: relative;
  width: 100%;
  padding: 10px 0;
`

const Slider = styled.input.attrs({ type: 'range' })`
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 8px;
  border-radius: 5px;
  background: #d3d3d3;
  outline: none;
  opacity: 0.7;
  -webkit-transition: .2s;
  transition: opacity .2s;

  &:hover {
    opacity: 1;
  }

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background-image: url(${rocketIcon});
    background-size: 100% 100%;
    cursor: pointer;
  }

  /* The slider handle (thumb) for Firefox */
  &::-moz-range-thumb {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background-image: url(${rocketIcon});
    background-size: 100% 100%;
    cursor: pointer;
  }
`

interface CustomSliderProps {
  value: number
  onChange: (value: number) => void
}


export default function CustomSlider({ value, onChange }: CustomSliderProps) {
  // First half of slider represents multipliers 1 to 10, second half 10-100
  const multipliers = React.useMemo(
    () => {
      return Array.from({ length: 101 })
        .map(
          (_, i) => {
            if (i <= 50) {
              return Math.round((1 + (9 * (i / 50))) * 4) / 4
            }
            return Math.round(10 + (90 * ((i - 50) / 50)))
          },
        )
    },
    [],
  )

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(multipliers[Number(e.target.value)])
  }

  const sliderValue = multipliers.indexOf(value)

  return (
    <SliderContainer>
      <div
        style={{
          bottom: '30px',
          left: '50%',
        }}
      >
        {value.toFixed(2)}x
      </div>
      <Slider
        type="range"
        min="0"
        max="100"
        value={sliderValue}
        onChange={handleSliderChange}
      />
    </SliderContainer>
  )
}


