import { GambaTransaction } from 'gamba-core-v2'
import { GAMES } from './games'

export const truncateString = (s: string, startLen = 4, endLen = startLen) => s.slice(0, startLen) + '...' + s.slice(-endLen)

export const extractMetadata = (event: GambaTransaction<'GameSettled'>) => {
  try {
    const [version, ...parts] = event.data.metadata.split(':')
    const [gameId] = parts
    const game = GAMES.find((x) => x.id === gameId)
    return { game }
  } catch {
    return {}
  }
}
