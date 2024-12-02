export const RANK_SYMBOLS: Record<number, string> = {
  0: '2',
  1: '3',
  2: '4',
  3: '5',
  4: '6',
  5: '7',
  6: '8',
  7: '9',
  8: '10',
  9: 'J',
  10: 'Q',
  11: 'K',
  12: 'A',
}

export const CARD_VALUES: Record<number, number> = {
  0: 2,
  1: 3,
  2: 4,
  3: 5,
  4: 6,
  5: 7,
  6: 8,
  7: 9,
  8: 10,
  9: 10, // J
  10: 10, // Q
  11: 10, // K
  12: 11, // A
}

export const SUIT_SYMBOLS: Record<number, string> = {
  0: '♠', // Spades
  1: '♥', // Hearts
  2: '♦', // Diamonds
  3: '♣', // Clubs
}

export const SUIT_COLORS: Record<number, string> = {
  0: 'black', // Spades
  1: 'red',   // Hearts
  2: 'red',   // Diamonds
  3: 'black', // Clubs
}

export const RANKS = Object.keys(RANK_SYMBOLS).length
export const SUITS = Object.keys(SUIT_SYMBOLS).length

export { default as SOUND_LOSE } from './lose.mp3'
export { default as SOUND_PLAY } from './play.mp3'
export { default as SOUND_WIN } from './win.mp3'
export { default as SOUND_CARD } from './card.mp3'
export { default as SOUND_JACKPOT } from './win2.mp3'