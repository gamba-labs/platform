import React from 'react'
import styles from './Slider.module.css'

interface SliderProps {
  min: number
  max: number
  value: number
  range: [number, number]
  onChange: (value: number) => void
  disabled?: boolean
}

const Slider: React.FC<SliderProps> = ({ min: minValue, max: maxValue, value, onChange, disabled, range: [min, max] }) => {
  const labels = Array.from({ length: 5 }).map((_, i, arr) => min + Math.floor(i / (arr.length - 1) * (max - min)))

  const change = (newValue: number) => {
    const fixedValue = Math.max(minValue, Math.min(maxValue, newValue))
    if (fixedValue !== value)
      onChange(fixedValue)
  }

  return (
    <>
      <div className={styles.wrapper} aria-disabled={disabled}>
        <div
          className={styles.track}
          style={{ width: `calc(${value / max * 100}%)` }}
        />
        <input
          className={styles.slider}
          type="range"
          value={value}
          disabled={disabled}
          min={min}
          max={max}
          onChange={(event) => change(Number(event.target.value))}
        />
      </div>
      {labels.map((label, i) => (
        <div
          key={i}
          className={[styles.label, value >= label && styles.active].join(' ')}
          style={{ left: (label / max * 100) + '%' }}
        >
          {label}
        </div>
      ))}
    </>
  )
}

export default Slider
