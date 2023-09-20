import React from 'react'
import image from './logo.png'

export default {
  name: 'Roulette',
  short_name: 'roulette',
  description: `
    A miniature version of Roulette. WYSIWYG!
  `,
  image,
  theme_color: 'rgb(29 232 126)',
  app: React.lazy(() => import('./App')),
}
