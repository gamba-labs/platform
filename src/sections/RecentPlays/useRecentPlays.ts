// apps/platform/src/sections/RecentPlays/useRecentPlays.ts

import { GambaTransaction } from 'gamba-core-v2'
import {
  useWalletAddress,
  useGambaEvents,
  useGambaEventListener,
} from 'gamba-react-v2'
import React from 'react'
import { useLocation } from 'react-router-dom'
import { PLATFORM_CREATOR_ADDRESS } from '../../constants'

interface Params {
  showAllPlatforms?: boolean
}

export function useRecentPlays(params: Params = {}) {
  const { showAllPlatforms = false } = params
  const location    = useLocation()
  const userAddress = useWalletAddress()

  // 1) Historical events via lightweight fetchRecentLogs under the hood
  const previousEvents = useGambaEvents<'GameSettled'>(
    'GameSettled',
    {
      address: !showAllPlatforms
        ? PLATFORM_CREATOR_ADDRESS
        : undefined,
      signatureLimit: 30,
    },
  )

  // 2) State for live events
  const [liveEvents, setLiveEvents] = React.useState<
  GambaTransaction<'GameSettled'>[]
  >([])

  // 3) Refs for up-to-date filter values
  const showAllRef = React.useRef(showAllPlatforms)
  const userRef    = React.useRef(userAddress)
  const pathRef    = React.useRef(location.pathname)
  React.useEffect(() => {
    showAllRef.current = showAllPlatforms 
  }, [showAllPlatforms])
  React.useEffect(() => {
    userRef.current    = userAddress    
  }, [userAddress])
  React.useEffect(() => {
    pathRef.current    = location.pathname 
  }, [location.pathname])

  // 4) Live subscription via the single‐argument callback signature
  useGambaEventListener<'GameSettled'>(
    'GameSettled',
    (evt) => {
      const { data, signature } = evt

      // Platform filter
      if (
        !showAllRef.current &&
        !data.creator.equals(PLATFORM_CREATOR_ADDRESS)
      ) {
        return
      }

      // Optional suspense delay for user’s own plays
      const isUserGame = data.user.equals(userRef.current)
      const inSuspense = ['plinko', 'slots'].some((p) =>
        pathRef.current.includes(p),
      )
      const delay = isUserGame && inSuspense ? 3000 : 1

      setTimeout(() => {
        setLiveEvents((all) => [evt, ...all])
      }, delay)
    },
    // re-subscribe whenever these change
    [showAllPlatforms, userAddress, location.pathname],
  )

  // 5) Merge & return
  return React.useMemo(
    () => [...liveEvents, ...previousEvents],
    [liveEvents, previousEvents],
  )
}
