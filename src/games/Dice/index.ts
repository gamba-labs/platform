import React from 'react'
import image from './logo.png'

export default {
  name: 'Dice',
  short_name: 'dice',
  description: `
    Use the slider to pick a number, then roll below that number to win. Lower numbers will increase your potential payout, while higher ones are safer.
  `,
  image,
  theme_color: 'rgb(255 100 144)',
  app: React.lazy(() => import('./App')),
}
