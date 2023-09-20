import React from 'react'
import styles from './Results.module.css'
import { useRoulette } from './useRoulette'
import { SQUARES } from './constants'

export function Results() {
  const spinning = useRoulette((state) => state.spinning)
  const results = useRoulette((state) => state.results)
  const [firstResult] = results
  const firstResultColor = !spinning && firstResult >= 0 && SQUARES[firstResult].color

  return (
    <div className={styles.wrapper}>
      <div className={styles.result} data-color={firstResultColor}>
        {spinning ? '..' : typeof firstResult === 'number' ? firstResult + 1 : '-'}
      </div>
      {results.slice(spinning ? 0 : 1, spinning ? 8 : 9).map((index, i) => {
        return (
          <div
            key={i}
            className={styles.result}
            data-color={SQUARES[index].color}
          >
            {index + 1}
          </div>
        )
      })}
    </div>
  )
}
