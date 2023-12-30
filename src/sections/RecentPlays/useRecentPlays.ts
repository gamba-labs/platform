import { GambaTransaction } from 'gamba-core-v2'
import { useGambaEventListener, useGambaEvents, useWalletAddress } from 'gamba-react-v2'
import React from 'react'
import { useLocation } from 'react-router-dom'

/*
  Note:
  "useGambaEvents" fetches the last couple of transactions made on this app's "creator" address,
  and tries to find any Gamba-related events happening in them (e.g. GameSettled).
  Fetching this way doesn't require any off-chain service, but comes at the cost of being slow, and often unreliable.
*/
export function useRecentPlays() {
  const location = useLocation()
  const userAddress = useWalletAddress()

  // Fetch previous events
  const previousEvents = useGambaEvents('GameSettled')

  const [newEvents, setEvents] = React.useState<GambaTransaction<'GameSettled'>[]>([])

  // Listen for new events
  useGambaEventListener(
    'GameSettled',
    (event) => {
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
