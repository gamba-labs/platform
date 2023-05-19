import { solToLamports } from 'gamba'

export const ITEMS = [
  '🍭',
  '❌',
  '⛄️',
  '🦄',
  '🍌',
  '💩',
  '👻',
  '😻',
  '💵',
  '🤡',
  '🦖',
  '🍎',
  '😂',
  '🖕',
]

export const MEDIUM_WIN_ITEMS = ['🍭', '⛄️', '🍌', '😻', '💵', '🦖', '🍎', '😂']

export const BAD_WIN_ITEMS = ['❌', '💩', '👻', '🤡', '🖕']

export const DEGEN_ARRAY = [
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, // 0x * 10, lose (10 outcomes array sum = 0)
  0, 0, 0, 0, 0, 0,  // 0x * 6 lose (16 outcomes array sum = 0)
  0.5, 0.5, 0.5, 0.5, 0.5, 0.5, // 0.5x * 6, small win (22 outcomes array sum = 3)
  1, 1, 1, 1, // 1x * 4, small win (26 outcomes array sum = 7)
  2, 2, 2, // 2x * 3, small win (29 outcomes array sum = 13)
  3, 3, 3, // 3x * 3, medium win (32 outcomes array sum = 22)
  5, // 5x * 1, medium win (33 outcomes array sum = 27)
  7] // 7x * 1, very big win (34 outcomes array sum = 34)

export const DEGEN_ARRAY_2 = [ // THIS ARRAY CURRENTLY DOESNT WORK BECAUSE MAX SIZE IS 34
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, // 0x * 10, lose (10 outcomes array sum = 0)
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, // 0x * 10, lose (20 outcomes array sum = 0)
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, // 0x * 10, lose (30 outcomes array sum = 0)
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, // 0x * 10, lose (40 outcomes array sum = 0)
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, // 0x * 10, lose (50 outcomes array sum = 0)
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, // 0x * 10, lose (60 outcomes array sum = 0)
  0, 0, 0, 0, 0, 0,  // 0x * 6, lose (66 outcomes array sum = 0)
  0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, // 0.5x * 10, small win (76 outcomes array sum = 5)
  1, 1, 1, 1, 1, 1, // 1x * 6, small win (82 outcomes array sum = 11)
  2, 2, 2, 2, 2, 2, 2, // 2x * 7, medium win (89 outcomes array sum = 25)
  3, 3, 3, 3, 3, // 3x * 5, medium win (94 outcomes array sum = 40)
  5, 5, 5, 5, // 5x * 4, big win (98 outcomes array sum = 60)
  10, // 10x * 1, very big win (99 outcomes array sum = 70)
  30] // 30x * 1, jackpot (100 outcomes array sum = 100)

export const WAGER_AMOUNTS = [
  0.01,
  0.05,
  0.1,
  .25,
  0.5,
  0.75,
].map(solToLamports)
