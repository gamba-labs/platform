import React from 'react'

const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
} as const

type Breakpoints = keyof typeof breakpoints

export function useMediaQuery(query: Breakpoints) {
  const [matches, setMatches] = React.useState(false)

  React.useLayoutEffect(() => {
    const mediaQuery = window.matchMedia(`(min-width: ${breakpoints[query]})`)
    setMatches(mediaQuery.matches)

    mediaQuery.addEventListener('change', (event) => {
      setMatches(event.matches)
    })

    return () =>
      mediaQuery.removeEventListener('change', (event) => {
        setMatches(event.matches)
      })
  }, [query])

  return matches
}
