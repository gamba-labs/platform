import { StoreApi, create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export interface UserStore {
  newcomer: boolean
  /** A list of games played. The first time a game is opened we display instructions. */
  gamesPlayed: Set<string>
  set: StoreApi<UserStore>['setState']
}

/**
 * Store client settings here
 */
export const useUserStore = create(
  persist<UserStore>(
    (set) => ({
      newcomer: true,
      gamesPlayed: new Set,
      set,
    }),
    {
      name: 'user',
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
)
