import React from 'react'
import image from './logo.png'

export default {
  name: 'Slots',
  short_name: 'slots',
  description: `
    Play and pray. At the top of the slot machine you can see your potential rewards. Always fair.
  `,
  image,
  theme_color: '#d185ff',
  app: React.lazy(() => import('./App')),
}
