import { solToLamports } from 'gamba'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { INITIAL_TABLE_BETS } from './constants'
import { NamedBet, TableBet } from './types'

interface RouletteState {
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

export const useRoulette = create(
  persist<RouletteState>(
    (set, get) => ({
      selectedBetAmount: solToLamports(0.01),
      setSelectedBetAmount: (selectedBetAmount) => set({ selectedBetAmount }),

      tableBet: INITIAL_TABLE_BETS,
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
    {
      name: 'roulette',
      version: 1,
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
)
