import { CellState } from './types'

export const generateGrid = (size: number) =>
  Array
    .from<CellState>({ length: size })
    .fill({ status: 'hidden', profit: 0 })

export const revealGold = (cells: CellState[], cellIndex: number, value: number) => {
  return cells.map<CellState>(
    (cell, i) => {
      if (i === cellIndex) {
        return { status: 'gold', profit: value }
      }
      return cell
    },
  )
}

export const revealAllMines = (
  cells: CellState[],
  cellIndex: number,
  numberOfMines: number,
) => {
  const mineIndices = cells
    .map((cell, index) => ({ cell, index }))
    .sort((a, b) => {
      if (a.index === cellIndex) return -1
      if (b.index === cellIndex) return 1
      if (a.cell.status === 'hidden' && b.cell.status === 'hidden') {
        return Math.random() - .5
      }
      if (a.cell.status === 'hidden') return -1
      if (b.cell.status === 'hidden') return 1
      return 0
    })
    .map((x) => x.index)
    .slice(0, numberOfMines)

  return cells.map<CellState>(
    (cell, i) => {
      if (mineIndices.includes(i)) {
        return { status: 'mine', profit: 0 }
      }
      return cell
    },
  )
}
