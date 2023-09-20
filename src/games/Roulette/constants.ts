import { NamedBet } from './types'

export { default as SOUND_CHIP } from './chip.mp3'
export { default as SOUND_LOSE } from './lose.mp3'
export { default as SOUND_PLAY } from './play.mp3'
export { default as SOUND_WIN } from './win.mp3'

export const CHIPS = [1, 2, 10, 25]
export const NUMBERS = 18
export const NUMBER_COLUMNS = Math.ceil(NUMBERS / 3)

const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]

export const SQUARES = Array.from({ length: NUMBERS })
  .map((_, index) => {
    const number = index + 1
    const isEven = number % 2 === 0
    const isRed = RED_NUMBERS.includes(number % (RED_NUMBERS.length + 1))
    return {
      index,
      number,
      isEven,
      row: (2 - index % 3),
      color: isRed ? 'red' : 'black' as 'red' | 'black',
    }
  })

export type NumberInfo = typeof SQUARES[0]

const multi = (
  filter: (stuff: NumberInfo) => boolean,
  label: string,
  col: number,
  row: number,
) => {
  const ids = SQUARES.filter((x) => filter(x)).map(({ index }) => index)
  return { ids, label, row, col }
}

export const NAMED_BETS = {
  firstHalf: multi(
    ({ number }) => number <= NUMBERS / 2,
    '<' + Math.floor(NUMBERS / 2 + 1), 1, 4,
  ),
  even: multi(
    ({ isEven }) => isEven,
    'Even', 2, 4,
  ),
  red: multi(
    ({ color }) => color === 'red',
    'Red', 3, 4,
  ),
  black: multi(
    ({ color }) => color === 'black',
    'Black', 4, 4,
  ),
  odd: multi(
    ({ isEven }) => !isEven,
    'Odd', 5, 4,
  ),
  secondHalf: multi(
    ({ number }) => number > NUMBERS / 2,
    '>' + Math.floor(NUMBERS / 2), 6, 4,
  ),
  row1: multi(
    ({ row }) => row === 0,
    '2:1', NUMBER_COLUMNS + 1, 1,
  ),
  row2: multi(
    ({ row }) => row === 1,
    '2:1', NUMBER_COLUMNS + 1, 2,
  ),
  row3: multi(
    ({ row }) => row === 2,
    '2:1', NUMBER_COLUMNS + 1, 3,
  ),
}

export const INITIAL_TABLE_BETS = {
  numbers: Array.from({ length: NUMBERS }).fill(0) as number[],
  named: Object.keys(NAMED_BETS).reduce((prev, key) => ({ ...prev, [key]: 0 }), {} as Record<NamedBet, number>),
}
