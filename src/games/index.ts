import { GameBundle } from 'gamba/react-ui'
import Dice from './Dice'
import Flip from './Flip'
import Mines from './Mines'
import Slots from './Slots'
import Roulette from './Roulette'
import HiLo from './HiLo'

export const GAMES: GameBundle[] = [
  Dice,
  HiLo,
  Roulette,
  Slots,
  Mines,
  Flip,
]
