import { GameBundle } from 'gamba-react-ui-v2'
import React from 'react'

export const GAMES: GameBundle[] = [
  // {
  //   id: 'example',
  //   meta: {
  //     background: '#00ffe1',
  //     name: 'Example',
  //     image: '#',
  //     description: '',
  //   },
  //   app: React.lazy(() => import('./ExampleGame')),
  // },
  {
    id: 'dice',
    meta: {
      background: '#ff6490',
      name: 'Dice',
      image: '/games/dice.png',
      description: `
        Dice challenges players to predict the outcome of a roll with a unique twist. Select a number and aim to roll below it to win. Adjusting your choice affects potential payouts, balancing risk and reward for an engaging experience.
      `,
    },
    app: React.lazy(() => import('./Dice')),
  },
  {
    id: 'slots',
    meta: {
      background: '#5465ff',
      name: 'Slots',
      image: '/games/slots.png',
      description: `
        Slots is the quintessential game of luck and anticipation. Spin the reels and match symbols to win, with potential rewards displayed upfront. A fair and exciting game, Slots offers a classic casino experience tailored for digital enjoyment.
      `,
    },
    app: React.lazy(() => import('./Slots')),
  },
  {
    id: 'flip',
    meta: {
      name: 'Flip',
      description: `
        Flip offers a straightforward yet thrilling gamble: choose Heads or Tails and double your money or lose it all. This simple, high-stakes game tests your luck and decision-making with every flip of the coin.
      `,
      image: '/games/flip.png',
      background: '#ffe694',
    },
    app: React.lazy(() => import('./Flip')),
  },
  {
    id: 'hilo',
    meta: {
      name: 'HiLo',
      image: '/games/hilo.png',
      description: `
        HiLo is a game of foresight and luck, challenging players to guess whether the next card will be higher or lower. Make consecutive correct guesses to increase your winnings, and decide when to cash out for maximum rewards.
      `,
      background: '#ff4f4f',
    },
    props: { logo: '/logo.svg' },
    app: React.lazy(() => import('./HiLo')),
  },
  {
    id: 'mines',
    meta: {
      name: 'Mines',
      description: `
        There's money hidden beneath the squares. The reward will increase the more squares you reveal, but watch out for the 5 hidden mines. Touch one and you'll go broke. You can cash out at any time.
      `,
      image: '/games/mines.png',
      background: '#8376ff',
    },
    app: React.lazy(() => import('./Mines')),
  },
  {
    id: 'roulette',
    meta: {
      name: 'Roulette',
      image: '/games/roulette.png',
      description: `
        Roulette brings the classic wheel-spinning game to life with a digital twist. Bet on where the ball will land and watch as the wheel decides your fate. With straightforward rules and the chance for big wins, Roulette is a timeless game of chance.
      `,
      background: '#1de87e',
    },
    app: React.lazy(() => import('./Roulette')),
  },
  {
    id: 'plinko',
    meta: {
      background: '#7272ff',
      image: '/games/plinko.png',
      name: 'Plinko',
      description: `
        Plinko is played by dropping chips down a pegged board where they randomly fall into slots with varying win amounts. Each drop is a mix of anticipation and strategy, making Plinko an endlessly entertaining game of chance.
        ⚠️ Under development. Results shown might be incorrect. ⚠️
      `,
    },
    app: React.lazy(() => import('./Plinko')),
  },
  {
    id: 'crash',
    meta: {
      background: '#de95e8',
      image: '/games/crash.png',
      name: 'Crash',
      description: `
      Predict a multiplier target and watch a rocket attempt to reach it. If the rocket crashes before the target, the player loses; if it reaches or exceeds the target, the player wins.
      `,
    },
    app: React.lazy(() => import('./CrashGame')),
  },
  {
    id: 'blackjack',
    meta: {
      background: '#084700',
      image: '/games/blackjack.png',
      name: 'BlackJack',
      description: `
        A simplified blackjack game where you and the dealer each get two cards. Win 2.5x your wager with a blackjack (21 with two cards), or 2x if your total beats the dealer's without exceeding 21. Ties or lower totals result in a loss. Enjoy quick gameplay without the usual complexities.
      `,
    },
    app: React.lazy(() => import('./BlackJack')),
  },
]
