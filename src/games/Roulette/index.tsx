import React from 'react'
import image from './image.png'

export default {
  name: 'Roulette',
  short_name: 'roulette',
  description: '',
  creator: 'DwRFGbjKbsEhUMe5at3qWvH7i8dAJyhhwdnFoZMnLVRV',
  image,
  theme_color: '#59ff5f',
  app: React.lazy(() => import('./App')),
}
