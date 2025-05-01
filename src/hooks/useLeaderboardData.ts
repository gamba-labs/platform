// src/hooks/useLeaderboardData.ts
import { useState, useEffect } from 'react'

export type Period = 'weekly' | 'monthly';

export interface Player {
  user: string;
  usd_volume: number;          // USD volume across every token
}

interface LeaderboardResult {
  players: Player[];
}

// gamba standard api (can be slow sometimes)
const API_BASE_URL = 'https://api.gamba.so'

/**
 * Fetches leaderboard data (USD volume) for a given creator
 * over the chosen period.
 */
export function useLeaderboardData(period: Period, creator: string) {
  const [data, setData] = useState<Player[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!creator) return

    const controller = new AbortController()
    const { signal } = controller;

    (async () => {
      try {
        setLoading(true)
        setError(null)

        // Determine starting timestamp for the selected period
        const now = Date.now()
        const startTime =
          period === 'weekly'
            ? now - 7 * 24 * 60 * 60 * 1000      // 7 days
            : now - 30 * 24 * 60 * 60 * 1000    // 30 days

        const url =
          `${API_BASE_URL}/players` +
          `?creator=${creator}` +
          `&sortBy=usd_volume` +
          `&startTime=${startTime}`

        const res = await fetch(url, { signal })
        if (!res.ok) throw new Error(await res.text())

        const { players }: LeaderboardResult = await res.json()
        setData(players)
      } catch (err: any) {
        if (err.name === 'AbortError') return
        console.error(err)
        setError(err.message ?? 'Failed to fetch leaderboard data.')
      } finally {
        setLoading(false)
      }
    })()

    return () => controller.abort()
  }, [period, creator])

  return { data, loading, error }
}
