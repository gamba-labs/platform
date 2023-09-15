import React from 'react'
import { SLOT_ITEMS, SlotItem } from './constants'
import styles from './ItemPreview.module.css'
import appStyles from './App.module.css'

const itemsByMultiplier = Object.entries(
  SLOT_ITEMS.reduce<Record<string, SlotItem[]>>(
    (prev, item) => {
      const previousItems = prev[item.multiplier] ?? []
      return {
        ...prev,
        [item.multiplier]: [...previousItems, item],
      }
    }
    , {},
  ),
)
  .map(([multiplier, items]) => ({ multiplier: Number(multiplier), items }))
  .sort((a, b) => a.multiplier - b.multiplier)


export function ItemPreview({ betArray }: {betArray: number[]}) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <div className={styles.items}>
        {itemsByMultiplier.map(({ items, multiplier }, i) => (
          <div className={!betArray.includes(multiplier) ? styles.hidden : ''} key={i}>
            <div className={styles.multiplier}>{multiplier}x</div>
            <div
              key={i}
              className={styles.icon}
            >
              <img className={appStyles.slotImage} src={items[0].image} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
