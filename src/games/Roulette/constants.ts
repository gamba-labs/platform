import { solToLamports } from 'gamba'
import { NamedBet, NumberInfo } from './types'

export const CHIPS = [
  0.01,
  0.05,
  0.1,
  0.25,
  0.5,
].map(solToLamports)

export const NUMBERS = 18
export const NUMBER_COLUMNS = Math.ceil(NUMBERS / 3)

export const getNumberInfo = (index: number): NumberInfo => {
  const number = index + 1
  const isEven = number % 2 === 0
  return {
    number,
    isEven,
    row: (2 - index % 3),
    color: isEven ? 'red' : 'black',
  }
}

const squares = Array.from({ length: NUMBERS }).fill(0).map((_, i) => i)

const filterSquares = (callback: (stuff: NumberInfo) => boolean) => {
  return squares.filter((i) => callback(getNumberInfo(i)))
}

export const NAMED_BETS = {
  firstHalf: filterSquares(({ number }) => number <= NUMBERS / 2),
  secondHalf: filterSquares(({ number }) => number > NUMBERS / 2),
  even: filterSquares(({ isEven }) => isEven),
  odd: filterSquares(({ isEven }) => !isEven),
  black: filterSquares(({ color }) => color === 'black'),
  red: filterSquares(({ color }) => color === 'red'),
  row1: filterSquares(({ row }) => row === 0),
  row2: filterSquares(({ row }) => row === 1),
  row3: filterSquares(({ row }) => row === 2),
}

export const INITIAL_TABLE_BETS = {
  numbers: Array.from({ length: NUMBERS }).fill(0) as number[],
  named: Object.keys(NAMED_BETS).reduce((prev, key) => ({ ...prev, [key]: 0 }), {} as Record<NamedBet, number>),
}
