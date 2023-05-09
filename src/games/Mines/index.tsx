import React from 'react'

import image from './image.png'

export default {
  name: 'Mines',
  short_name: 'mines',
  description: '',
  creator: 'DwRFGbjKbsEhUMe5at3qWvH7i8dAJyhhwdnFoZMnLVRV',
  theme_color: '#ff6a6a',
  image,
  app: React.lazy(() => import('./App')),
}
