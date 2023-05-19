import { ITEMS, BAD_WIN_ITEMS, MEDIUM_WIN_ITEMS } from './constants'

export const getEmojiSelector = (wager: number, payout: number) => {
  const badWin = payout > 0
  const mediumWin = payout > wager * 1.5
  const bigWin = payout > wager * 6.5

  console.log('badWin', badWin, 'mediumWin', mediumWin, 'bigWin', bigWin)

  let finalCombination: string[] = []

  if (badWin) {
    if (bigWin) {
      // Select a combination of unicorns for big win
      finalCombination = ['🦄', '🦄', '🦄']
    } else if (mediumWin) {
      // Select a single emoji from medium win items
      const emoji =
          MEDIUM_WIN_ITEMS[Math.floor(Math.random() * MEDIUM_WIN_ITEMS.length)]
      finalCombination = Array(3).fill(emoji)
    } else {
      // Select a single emoji from small win items
      const emoji =
          BAD_WIN_ITEMS[Math.floor(Math.random() * BAD_WIN_ITEMS.length)]
      finalCombination = Array(3).fill(emoji)
    }
  } else {
    // Randomly decide if we are going to display two identical emojis or not 50% of the time it will be close
    const displayTwoIdentical = Math.random() < 0.5

    if (displayTwoIdentical) {
      // Select one emoji to be shown twice and another to be shown once
      const firstEmoji = ITEMS[Math.floor(Math.random() * ITEMS.length)]
      let secondEmoji
      do {
        secondEmoji = ITEMS[Math.floor(Math.random() * ITEMS.length)]
      } while (firstEmoji === secondEmoji)

      // Add the emojis to the combination
      finalCombination = [firstEmoji, firstEmoji, secondEmoji]
    } else {
      // Select three different emojis
      while (finalCombination.length < 3) {
        const newEmoji = ITEMS[Math.floor(Math.random() * ITEMS.length)]
        if (!finalCombination.includes(newEmoji)) {
          finalCombination.push(newEmoji)
        }
      }
    }
  }

  return finalCombination
}
