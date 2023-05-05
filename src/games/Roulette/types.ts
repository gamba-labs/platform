import { INITIAL_TABLE_BETS, NAMED_BETS } from './constants'

export type NumberColor = 'black' | 'red' | 'none'

export interface NumberInfo {
  number: number
  row: number
  isEven: boolean
  color: NumberColor
}

export type NamedBet = keyof typeof NAMED_BETS
export type TableBet = typeof INITIAL_TABLE_BETS
