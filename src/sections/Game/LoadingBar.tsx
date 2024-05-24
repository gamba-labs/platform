import { decodeGame, getGameAddress } from 'gamba-core-v2'
import { useAccount, useTransactionStore, useWalletAddress } from 'gamba-react-v2'
import React from 'react'
import styled, { css, keyframes } from 'styled-components'

const StyledLoadingThingy = styled.div`
  position: relative;
  display: flex;
  width: 100%;
  gap: 5px;
`

export const loadingAnimation = keyframes`
  0%, 100% { opacity: .6 }
  50% { opacity: .8 }
`

const StyledLoadingBar = styled.div<{$state: 'finished' | 'loading' | 'none'}>`
  position: relative;
  width: 100%;
  border-radius: 10px;
  flex-grow: 1;
  background: var(--gamba-ui-primary-color);
  color: black;
  padding: 0 10px;
  font-size: 12px;
  height: 6px;
  font-weight: bold;
  opacity: .2;
  ${(props) => props.$state === 'loading' && css`
    animation: ${loadingAnimation} ease infinite 1s;
  `}
  ${(props) => props.$state === 'finished' && css`
    opacity: .8;
  `}
  &:after {
    content: " ";
    position: absolute;
    width: 25%;
    height: 100%;
    transition: opacity .5s;
  }
`

const steps = [
  'Signing',
  'Sending',
  'Settling',
]

export function useLoadingState() {
  const userAddress = useWalletAddress()
  const game = useAccount(getGameAddress(userAddress), decodeGame)
  const txStore = useTransactionStore()
  const step = (
    () => {
      if (txStore.label !== 'play') {
        return -1
      }
      if (game?.status.resultRequested) {
        return 2
      }
      if (txStore.state === 'processing' || txStore.state === 'sending') {
        return 1
      }
      if (txStore.state === 'simulating' || txStore.state === 'signing') {
        return 0
      }
      return -1
    }
  )()

  return step
}

export function LoadingBar() {
  const step = useLoadingState()

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <StyledLoadingThingy>
          {steps
            .map((__, i) => (
              <StyledLoadingBar
                key={i}
                $state={step === i ? 'loading' : step > i ? 'finished' : 'none'}
              />
            ),
            )}
        </StyledLoadingThingy>
      </div>
    </div>
  )
}
