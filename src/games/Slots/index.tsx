import React from 'react'
import image from './image.png'

export default {
  name: 'Slots',
  short_name: 'slots',
  description: '',
  creator: 'DwRFGbjKbsEhUMe5at3qWvH7i8dAJyhhwdnFoZMnLVRV',
  image,
  theme_color: '#ad6bff',
  app: React.lazy(() => import('./App')),
}
