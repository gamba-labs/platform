export { default as SOUND_LOSE } from './assets/lose.mp3'
export { default as SOUND_PLAY } from './assets/insert.mp3'
export { default as SOUND_REVEAL_LEGENDARY } from './assets/reveal-legendary.mp3'
export { default as SOUND_REVEAL } from './assets/reveal.mp3'
export { default as SOUND_SPIN } from './assets/spin.mp3'
export { default as SOUND_WIN } from './assets/win.mp3'

import IMAGE_2X from './assets/slot-2x.png'
import IMAGE_3X from './assets/slot-3x.png'
import IMAGE_5X from './assets/slot-5x.png'
import IMAGE_COOL from './assets/slot-emoji-cool.png'
import IMAGE_HEARTS from './assets/slot-emoji-hearts.png'
import IMAGE_UNICORN from './assets/slot-unicorn.png'
import IMAGE_WOJAK from './assets/slot-wojak.png'

export interface SlotItem {
  multiplier: number
  image: string
}

const slotItem = (multiplier: number, ...icons: string[]): SlotItem[] =>
  icons.map((image) => ({ multiplier, image }))

export const SLOT_ITEMS = [
  slotItem(7, IMAGE_UNICORN),
  slotItem(5, IMAGE_5X),
  slotItem(3, IMAGE_3X),
  slotItem(2, IMAGE_2X),
  slotItem(1, IMAGE_COOL, IMAGE_HEARTS),
  slotItem(.5, IMAGE_WOJAK),
].flat()

export const NUM_SLOTS = 3
// MS that it takes for spin to finish and reveal to start
export const SPIN_DELAY = 1000
// MS between each slot reveal
export const REVEAL_SLOT_DELAY = 500
// MS after reveal until win / lose effect is played
export const FINAL_DELAY = 500
//
export const LEGENDARY_THRESHOLD = 5
