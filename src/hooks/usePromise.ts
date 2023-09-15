import React from 'react'

export function usePromise<T, Args extends unknown[]>(fn: (...args: Args) => Promise<T>) {
  const [loading, setLoading] = React.useState(false)
  const func = async (...args: Args) => {
    try {
      setLoading(true)
      await fn(...args)
    } finally {
      setLoading(false)
    }
  }
  return [func, loading] as const
}
