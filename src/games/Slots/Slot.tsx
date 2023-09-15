import React from 'react'
import styles from './App.module.css'
import styles2 from './Slot.module.css'
import { SLOT_ITEMS, SlotItem } from './constants'

interface SlotProps {
  revealed:boolean
  good: boolean
  index: number
  item?: SlotItem
}

export function Slot({ revealed, good, item, index }: SlotProps) {
  const items = React.useMemo(() =>
    [...SLOT_ITEMS].sort(() => Math.random() - .5)
  , [],
  )
  return (
    <div className={styles.slot} data-good={good}>
      <div className={styles2.spinner} data-spinning={!revealed}>
        {items.map((item, i) => (
          <div key={i}>
            <img className={styles.slotImage} src={item.image} />
          </div>
        ))}
      </div>
      {item && (
        <>
          <div
            className={styles.revealedSlot}
            data-revealed={revealed}
            data-good={revealed && good}
          >
            <img
              className={styles.slotImage}
              src={item.image}
              style={{ animationDelay: index * .25 + 's' }}
            />
          </div>
        </>
      )}
    </div>
  )
}
