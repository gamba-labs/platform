import { decodeGame, getGameAddress } from 'gamba-core-v2'
import { useAccount, useTransactionStore, useWalletAddress } from 'gamba-react-v2'
import React, { useMemo } from 'react'
import styled, { css, keyframes } from 'styled-components'

const Container = styled.div`
  display: flex;
  width: 100%;
  gap: 5px;
`

const pulse = keyframes`
  0%, 100% { opacity: 0.6 }
  50%     { opacity: 0.8 }
`

const Bar = styled.div<{$state: 'none' | 'loading' | 'finished'}>`
  flex-grow: 1;
  height: 6px;
  border-radius: 10px;
  background: var(--gamba-ui-primary-color);
  opacity: 0.2;

  ${({ $state }) =>
    $state === 'loading' &&
    css`
      animation: ${pulse} 1s ease infinite;
    `}

  ${({ $state }) =>
    $state === 'finished' &&
    css`
      opacity: 0.8;
    `}
`

const steps = ['Signing', 'Sending', 'Settling'] as const

export function useLoadingState(): Array<'none' | 'loading' | 'finished'> {
  const user = useWalletAddress()
  const tx = useTransactionStore()
  const game = useAccount(getGameAddress(user), decodeGame)

  const status = useMemo<string | null>(
    () => (game?.status ? Object.keys(game.status)[0] : null),
    [game?.status]
  )

  const states: Array<'none' | 'loading' | 'finished'> = ['none', 'none', 'none']

  if (tx.label !== 'play') return states

  if (tx.state === 'simulating' || tx.state === 'signing') {
    states[0] = 'loading'
    return states
  }

  if (tx.state === 'processing' || tx.state === 'sending') {
    states[0] = 'finished'
    states[1] = 'loading'
    return states
  }

  if (tx.state === 'confirming' || status === 'ResultRequested') {
    states[0] = 'finished'
    states[1] = 'finished'
    states[2] = 'loading'
    return states
  }

  if (status === 'Ready') {
    return states
  }

  return states
}

export function LoadingBar() {
  const states = useLoadingState()

  return (
    <Container>
      {states.map((state, i) => (
        <Bar key={i} $state={state} />
      ))}
    </Container>
  )
}
