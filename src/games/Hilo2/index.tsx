import React from 'react'

export default {
  name: 'Hilo2',
  short_name: 'hilo2',
  description: 'Experimental stuff. Only play on testnet pls',
  creator: 'DwRFGbjKbsEhUMe5at3qWvH7i8dAJyhhwdnFoZMnLVRV',
  theme_color: '#ff0066',
  app: React.lazy(() =>
    Promise.all([
      import('./App'),
      // new Promise(resolve => setTimeout(resolve, 1000)),
    ]).then(([moduleExports]) => {
      return moduleExports
    }),
  ),
}
