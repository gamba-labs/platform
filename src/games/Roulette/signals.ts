import { computed, signal } from '@preact/signals-react'
import { CHIPS, NUMBERS, tableLayout } from './constants'

export const chipPlacements = signal<Record<string, number>>({})
export const hovered = signal<number[]>([])
export const results = signal<number[]>([])
export const selectedChip = signal<number>(CHIPS[0])

export const distributedChips = computed(
  () => {
    const placements = Object.entries(chipPlacements.value)
    const distributed = Array.from({ length: NUMBERS }).map(() => 0)
    for (const [id, amount] of placements) {
      const square = tableLayout[id]
      const divided = Number(BigInt(amount * 10_000) / BigInt(square.numbers.length))
      for (const number of square.numbers) {
        distributed[number - 1] += divided
      }
    }
    return distributed
  },
)

export const totalChipValue = computed(
  () => {
    return Math.floor(distributedChips.value.reduce((a, b) => a + b, 0))
  },
)

export const bet = computed(
  () => {
    const bet = distributedChips.value.map((amount) => {
      return Number(BigInt(amount * distributedChips.value.length * 10_000) / BigInt(totalChipValue.value || 1)) / 10_000
    })
    return bet
  },
)

export const addResult = (index: number) => {
  results.value = [...results.value, index]
}

export const getChips = (id: string) => {
  return chipPlacements.value[id] ?? 0
}

export const hover = (ids: number[]) => {
  hovered.value = ids
}

export const addChips = (id: string, amount: number) => {
  chipPlacements.value = {
    ...chipPlacements.value,
    [id]: getChips(id) + amount,
  }
}

export const removeChips = (id: string) => {
  chipPlacements.value = {
    ...chipPlacements.value,
    [id]: 0,
  }
}

export const clearChips = () => {
  chipPlacements.value = {}
}
