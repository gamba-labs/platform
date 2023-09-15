export type CellStatus = 'hidden' | 'gold' | 'mine'
export interface CellState {
  status: CellStatus
  profit: number
}
export type GameStatus = 'playing' | 'idle' | 'lost'
export type LoadState = 'playing' | 'claiming'
export interface GameConfig {
  wager: number
  mines: number
}
