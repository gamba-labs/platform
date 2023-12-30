export { default as SOUND_CHIP } from './chip.mp3'
export { default as SOUND_LOSE } from './lose.mp3'
export { default as SOUND_PLAY } from './play.mp3'
export { default as SOUND_WIN } from './win.mp3'

export const CHIPS = [1, 2, 10]
export const NUMBERS = 18
export const NUMBER_COLUMNS = Math.ceil(NUMBERS / 3)

const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]

const isRed = (number: number) => RED_NUMBERS.includes(number % (RED_NUMBERS.length + 1))

const getRow = (index: number) => (3 - index % 3)

const allNumbers = Array.from({ length: NUMBERS }).map((_, i) => i + 1)

const makeSquare = (
  label: string,
  numberFilter: (number: number) => boolean,
  [column, row]: [number, number],
): TableSquare => {
  const numbers = allNumbers.filter(numberFilter)
  return { label, numbers, row, column }
}

interface TableSquare {
  label: string
  numbers: number[]
  row: number
  column: number
  color?: 'red' | 'black'
}

type TableLayout = Record<string, TableSquare>

const numbersLayout = Array.from({ length: NUMBERS }).reduce<TableLayout>((prev, _, index) => ({
  ...prev,
  [index + 1]: {
    label: String(index + 1),
    numbers: [String(index + 1)],
    row: getRow(index),
    column: 1 + Math.floor(index / 3),
    color: isRed(index + 1) ? 'red' : 'black',
  },
}), {})

export const tableLayout: TableLayout = {
  ...numbersLayout,
  firstHalf: makeSquare(
    '<' + Math.floor(NUMBERS / 2 + 1),
    (number) => number <= NUMBERS / 2,
    [1, 4],
  ),
  even: makeSquare(
    'Even',
    (number) => number % 2 === 0,
    [2, 4],
  ),
  red: makeSquare(
    'Red',
    (number) => isRed(number),
    [3, 4],
  ),
  black: makeSquare(
    'Black',
    (number) => !isRed(number),
    [4, 4],
  ),
  odd: makeSquare(
    'Odd',
    (number) => number % 2 === 1,
    [5, 4],
  ),
  secondHalf: makeSquare(
    '>' + Math.floor(NUMBERS / 2),
    (number) => number > NUMBERS / 2,
    [6, 4],
  ),
  row1: makeSquare(
    '2:1',
    (number) => getRow(number - 1) === 1,
    [NUMBER_COLUMNS + 1, 1],
  ),
  row2: makeSquare(
    '2:1',
    (number) => getRow(number - 1) === 2,
    [NUMBER_COLUMNS + 1, 2],
  ),
  row3: makeSquare(
    '2:1',
    (number) => getRow(number - 1) === 3,
    [NUMBER_COLUMNS + 1, 3],
  ),
}
