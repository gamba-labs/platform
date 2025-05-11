
import React from 'react'

type SliderProps = {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
}

const CustomSlider: React.FC<SliderProps> = ({
  value,
  onChange,
  min = 1.1,
  max = 10,
  step = 0.1,
}) => {
  return (
    <div style={{ width: '100%', margin: '10px 0' }}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{ width: '100%' }}
      />
      <div style={{ textAlign: 'center', color: '#fff' }}>{value.toFixed(2)}x</div>
    </div>
  )
}

export default CustomSlider
