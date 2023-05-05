import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { RANKS } from './constants'

export const randomRank = () => 1 + Math.floor(Math.random() * (RANKS - 1))

interface HiLoState {
  cards: number[],
  addCard: (result: number) => void,
}

export const useHiLo = create(
  persist<HiLoState>(
    (set, get) => ({
      cards: [randomRank()],
      addCard: (result: number) => set({ cards: [result, ...get().cards] }),
    }),
    {
      name: 'hilo',
      version: 1,
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
)
