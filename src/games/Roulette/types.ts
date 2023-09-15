import { INITIAL_TABLE_BETS, NAMED_BETS } from './constants'

export type NamedBet = keyof typeof NAMED_BETS
export type TableBet = typeof INITIAL_TABLE_BETS
