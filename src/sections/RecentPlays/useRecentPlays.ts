import { GambaTransaction } from 'gamba-core-v2'
import { useGambaEventListener, useGambaEvents, useWalletAddress } from 'gamba-react-v2'
import React from 'react'
import { useLocation } from 'react-router-dom'
import { PLATFORM_CREATOR_ADDRESS } from '../../constants'

export function useRecentPlays() {
  const location = useLocation()
  const userAddress = useWalletAddress()

  // Fetch previous events from our platform
  const previousEvents = useGambaEvents('GameSettled', { address: PLATFORM_CREATOR_ADDRESS })

  const [newEvents, setEvents] = React.useState<GambaTransaction<'GameSettled'>[]>([])

  // Listen for new events
  useGambaEventListener(
    'GameSettled',
    (event) => {
      // Ignore events that occured on another platform
      if (!event.data.creator.equals(PLATFORM_CREATOR_ADDRESS)) return
      // Todo handle delays in platform library
      const delay = event.data.user.equals(userAddress) && ['plinko', 'slots'].some((x) => location.pathname.includes(x)) ? 3000 : 1
      setTimeout(
        () => {
          setEvents((events) => [event, ...events])
        },
        delay,
      )
    },
    [location.pathname, userAddress],
  )

  // Merge previous & new events
  return React.useMemo(
    () => {
      return [...newEvents, ...previousEvents]
    },
    [newEvents, previousEvents],
  )
}
