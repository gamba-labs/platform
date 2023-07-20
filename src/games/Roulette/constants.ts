import { solToLamports } from 'gamba'
import { NamedBet, NumberInfo } from './types'

export const CHIPS = [
  0.05,
  0.1,
  0.25,
  0.5,
  1,
].map(solToLamports)

export const NUMBERS = 18
export const NUMBER_COLUMNS = Math.ceil(NUMBERS / 3)

const RED_NUMBERS = [
  1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
]

export const getNumberInfo = (index: number): NumberInfo => {
  const number = index + 1
  const isEven = number % 2 === 0
  const isRed = RED_NUMBERS.includes(number % (RED_NUMBERS.length + 1))
  return {
    number,
    isEven,
    row: (2 - index % 3),
    color: isRed ? 'red' : 'black',
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
  red: filterSquares(({ color }) => color === 'red'),
  black: filterSquares(({ color }) => color === 'black'),
  row1: filterSquares(({ row }) => row === 0),
  row2: filterSquares(({ row }) => row === 1),
  row3: filterSquares(({ row }) => row === 2),
}

export const INITIAL_TABLE_BETS = {
  numbers: Array.from({ length: NUMBERS }).fill(0) as number[],
  named: Object.keys(NAMED_BETS).reduce((prev, key) => ({ ...prev, [key]: 0 }), {} as Record<NamedBet, number>),
}
