import React from 'react'
import image from './image.png'

export default {
  name: 'Roulette',
  short_name: 'roulette',
  description: '',
  creator: 'DwRFGbjKbsEhUMe5at3qWvH7i8dAJyhhwdnFoZMnLVRV',
  image,
  theme_color: '#ff6a6a',
  app: React.lazy(() => import('./App')),
}
