import React from 'react'
import styles from './Chip.module.css'

const color = (value: number) => {
  if (value <= 1) return 'green'
  if (value <= 2) return 'red'
  if (value <= 10) return 'blue'
  return 'white'
}

export const Chip: React.FC<{value: number}> = ({ value }) => {
  return (
    <div className={styles.chip} data-color={color(value)}>
      {value}
    </div>
  )
}
