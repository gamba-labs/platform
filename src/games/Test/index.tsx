import React from 'react'
import image from './image.png'

export default {
  name: 'Test',
  short_name: 'test',
  description: 'Experimental stuff. Only play on testnet pls',
  creator: 'DwRFGbjKbsEhUMe5at3qWvH7i8dAJyhhwdnFoZMnLVRV',
  image,
  app: React.lazy(() =>
    Promise.all([
      import('./App'),
      new Promise(resolve => setTimeout(resolve, 1000)),
    ]).then(([moduleExports]) => {
      return moduleExports
    }),
  ),
}
