
import { GameBundle } from 'gamba-react-ui-v2'
import React from 'react'

export const GAMES: GameBundle[] = [
  {
    id: 'dice',
    meta: {
      background: '#ffffffdf',
      name: 'Dice',
      image: '/games/dice.png',
      description: `Dice challenges players to predict the outcome of a roll with a unique twist. Select a number and aim to roll below it to win. Adjusting your choice affects potential payouts, balancing risk and reward.`,
    },
    app: React.lazy(() => import('./Dice')),
  },
  {
    id: 'slots',
    meta: {
      background: '#000000CC',
      name: 'Slots',
      image: '/games/slots.png',
      description: `Slots is the quintessential game of luck and anticipation. Spin the reels and match symbols to win, with potential rewards displayed upfront. Classic casino experience.`,
    },
    app: React.lazy(() => import('./Slots')),
  },
  {
    id: 'flip',
    meta: {
      name: 'Flip',
      image: '/games/flip.png',
      background: '#ffffffdf',
      description: `Flip offers a simple gamble: choose Heads or Tails and double your money or lose it all. High-stakes and fast.`,
    },
    app: React.lazy(() => import('./Flip')),
  },
  {
    id: 'hilo',
    meta: {
      name: 'HiLo',
      image: '/games/hilo.png',
      background: '#000000CC',
      description: `HiLo tests your foresight: guess if the next card is higher or lower. Consecutive correct guesses multiply your rewards.`,
    },
    app: React.lazy(() => import('./HiLo')),
  },
  {
    id: 'mines',
    meta: {
      name: 'Mines',
      image: '/games/mines.png',
      background: '#000000CC',
      description: `Reveal squares for rewards, but avoid hidden mines. Risk increases as you uncover more. Cash out anytime.`,
    },
    app: React.lazy(() => import('./Mines')),
  },
  {
    id: 'roulette',
    meta: {
      name: 'Roulette',
      image: '/games/roulette.png',
      background: '#ffffffdf',
      description: `Bet on where the ball will land. Watch the wheel spin in this classic game of chance.`,
    },
    app: React.lazy(() => import('./Roulette')),
  },
  {
    id: 'plinko',
    meta: {
      background: '#000000CC',
      image: '/games/plinko.png',
      name: 'Plinko',
      description: `Drop chips down the board, watch them bounce into slots with varying win amounts. A game of luck and anticipation.`,
    },
    app: React.lazy(() => import('./Plinko')),
  },
  {
    id: 'crash',
    meta: {
      background: '#ffffffdf',
      image: '/games/crash.png',
      name: 'Crash',
      description: `Predict a multiplier target and watch a rocket climb. Cash out before it crashes!`,
    },
    app: React.lazy(() => import('./CrashGame')),
  },
  {
    id: 'blackjack',
    meta: {
      background: '#000000CC',
      image: '/games/blackjack.png',
      name: 'BlackJack',
      description: `A simplified blackjack: beat the dealer without exceeding 21. Quick and rewarding rounds.`,
    },
    app: React.lazy(() => import('./BlackJack')),
  },
  {
    id: 'crypto-chart',
    meta: {
      background: '#000000CC',
      image: '/games/cryptochart.webp',
      name: 'Crypto Chart',
      description: `A crypto-inspired twist on Crash. Watch the chart rise with candlestick animations. Cash out before it crashes.`,
    },
    app: React.lazy(() => import('./CryptoChartGame')),
  },

  {
    id: '',
    meta: {
      name: 'App Store',
      description: `
        There's money hidden beneath the squares. The reward will increase the more squares you reveal, but watch out for the 5 hidden mines. Touch one and you'll go broke. You can cash out at any time.
      `,
      image: '/games/app.png',
      background: '#000000CC',
    },
    app: React.lazy(() => import('./Mines')),
  },
 {
    id: '',
    meta: {
      name: 'Play Store',
      description: `
        There's money hidden beneath the squares. The reward will increase the more squares you reveal, but watch out for the 5 hidden mines. Touch one and you'll go broke. You can cash out at any time.
      `,
      image: '/games/app2.png',
      background: '#000000CC',
    },
    app: React.lazy(() => import('./Mines')),
  },
]


