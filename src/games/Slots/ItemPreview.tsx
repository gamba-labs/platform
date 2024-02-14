import React from 'react'
import { SLOT_ITEMS, SlotItem } from './constants'
import { StyledItemPreview } from './ItemPreview.styles'

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
      <StyledItemPreview>
        {itemsByMultiplier.map(({ items, multiplier }, i) => (
          <div className={!betArray.includes(multiplier) ? "hidden" : ''} key={i}>
            <div className={"multiplier"}>{multiplier}x</div>
            <div
              key={i}
              className={"icon"}
            >
              <img className={"slotImage"} src={items[0].image} />
            </div>
          </div>
        ))}
      </StyledItemPreview>
    </div>
  )
}
