import { solToLamports } from 'gamba'

export { default as SOUND_FINISH } from './finish.mp3'
export { default as SOUND_LOSE } from './lose.mp3'
export { default as SOUND_TICK } from './tick.mp3'
export { default as SOUND_WIN } from './win.mp3'

export const GRID_SIZE = 25
export const PITCH_INCREASE_FACTOR = 1.06
export const MINE_SELECT = [1, 3, 5, 10, 15, 20]
export const WAGER_OPTIONS = [.05, .1, .25, .5, 1, 3].map(solToLamports)
