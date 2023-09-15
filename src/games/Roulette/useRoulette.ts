import { create } from 'zustand'
import { CHIPS, INITIAL_TABLE_BETS } from './constants'
import { NamedBet, TableBet } from './types'

interface RouletteState {
  spinning: boolean
  setSpinning: (spinning: boolean) => void

  selectedBetAmount: number,
  setSelectedBetAmount: (selectedBetAmount: number) => void,

  tableBet: TableBet,
  clearChips: () => void,
  placeChip: (square: number | NamedBet, amount: number) => void
  removeChips: (square: number | NamedBet) => void

  results: number[],
  addResult: (result: number) => void,

  highlightedSquares: number[]
  setHighlightedSquares: (highlightedSquares: number[]) => void
}

export const useRoulette = create<RouletteState>(
  (set, get) => ({
    tableBet: INITIAL_TABLE_BETS,

    selectedBetAmount: CHIPS[0],
    setSelectedBetAmount: (selectedBetAmount) => set({ selectedBetAmount }),

    spinning: false,
    setSpinning: (spinning) => set({ spinning }),

    clearChips: () => set({ tableBet: INITIAL_TABLE_BETS }),
    placeChip: (indexOrSquare, amount) => {
      if (typeof indexOrSquare === 'number') {
        const index = indexOrSquare
        const numbers = [...get().tableBet.numbers]
        numbers[index] = Math.max(0, numbers[index] + amount)
        set({
          tableBet: {
            ...get().tableBet,
            numbers,
          },
        })
      } else {
        const square = indexOrSquare
        set({
          tableBet: {
            ...get().tableBet,
            named: {
              ...get().tableBet.named,
              [square]: Math.max(0, get().tableBet.named[square] + amount),
            },
          },
        })
      }
    },
    removeChips: (indexOrSquare) => {
      if (typeof indexOrSquare === 'number') {
        const index = indexOrSquare
        const numbers = [...get().tableBet.numbers]
        numbers[index] = 0
        set({
          tableBet: {
            ...get().tableBet,
            numbers,
          },
        })
      } else {
        const square = indexOrSquare
        set({
          tableBet: {
            ...get().tableBet,
            named: {
              ...get().tableBet.named,
              [square]: 0,
            },
          },
        })
      }
    },

    results: [],
    addResult: (result: number) => set({ results: [result, ...get().results] }),

    highlightedSquares: [],
    setHighlightedSquares: (highlightedSquares) => set({ highlightedSquares }),
  }),
)
