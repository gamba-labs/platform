import { PublicKey } from '@solana/web3.js'
import { FAKE_TOKEN_MINT, GambaPlatformContext, GambaUi, PoolToken, TokenValue, useCurrentToken, useTokenBalance, useTokenMeta } from 'gamba-react-ui-v2'
import React, { useEffect } from 'react'
import styled from 'styled-components'
import { Dropdown } from '../components/Dropdown'
import { Modal } from '../components/Modal'
import { POOLS } from '../constants'
import { useUserStore } from '../hooks/useUserStore'

const StyledToken = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  img {
    height: 20px;
  }
`

const StyledTokenImage = styled.img`
  height: 20px;
  aspect-ratio: 1/1;
  border-radius: 50%;
`

const StyledTokenButton = styled.button`
  box-sizing: border-box;
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  display: flex;
  width: 100%;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border-radius: 5px;
  &:hover {
    background: #ffffff11;
  }
`

function TokenImage({ mint, ...props }: {mint: PublicKey}) {
  const meta = useTokenMeta(mint)
  return (
    <StyledTokenImage src={meta.image} {...props} />
  )
}

function TokenSelectItem({ mint }: {mint: PublicKey}) {
  const balance = useTokenBalance(mint)
  return (
    <>
      <TokenImage mint={mint} /> <TokenValue mint={mint} amount={balance.balance} />
    </>
  )
}

export default function TokenSelect() {
  const [visible, setVisible] = React.useState(false)
  const [warning, setWarning] = React.useState(false)
  // Allow real plays override via query param/localStorage for deployed testing
  const [allowRealPlays, setAllowRealPlays] = React.useState(false)
  const context = React.useContext(GambaPlatformContext)
  const selectedToken = useCurrentToken()
  const userStore = useUserStore()
  const balance = useTokenBalance()

  // Update the platform context with the last selected token from localStorage
  useEffect(() => {
    if (userStore.lastSelectedPool) {
      context.setPool(userStore.lastSelectedPool.token, userStore.lastSelectedPool.authority)
    }
  }, [])

  // Read real-play override – enables SOL selection on deployed builds when needed
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search)
      const q = params.get('allowReal') || params.get('real') || params.get('realplays')
      if (q != null) {
        const v = q === '1' || q === 'true'
        localStorage.setItem('allowRealPlays', v ? '1' : '0')
      }
      const saved = localStorage.getItem('allowRealPlays')
      setAllowRealPlays(saved === '1')
    } catch {}
  }, [])

  const selectPool = (pool: PoolToken) => {
    setVisible(false)
    // Check if platform has real plays disabled
    const realDisabled = Boolean(import.meta.env.VITE_REAL_PLAYS_DISABLED) && !allowRealPlays
    if (realDisabled && !pool.token.equals(FAKE_TOKEN_MINT)) {
      setWarning(true)
      return
    }
    // Update selected pool
    context.setPool(pool.token, pool.authority)
    userStore.set({
      lastSelectedPool: {
        token: pool.token.toString(),
        authority: pool.authority?.toString(),
      },
    })
  }

  const click = () => {
    setVisible(!visible)
  }

  return (
    <>
      {warning && (
        <Modal>
          <h1>Real plays disabled</h1>
          <p>
            This platform only allows you to play with fake tokens.
          </p>
          <GambaUi.Button
            main
            onClick={() => setWarning(false)}
          >
            Okay
          </GambaUi.Button>
        </Modal>
      )}
      <div style={{ position: 'relative' }}>
        <GambaUi.Button onClick={click}>
          {selectedToken && (
            <StyledToken>
              <TokenImage mint={selectedToken.mint} />
              <TokenValue amount={balance.balance} />
            </StyledToken>
          )}
        </GambaUi.Button>
        <Dropdown visible={visible}>
          {/* Mount balances for list items only when dropdown is visible to avoid unnecessary watchers */}
          {visible && POOLS.map((pool, i) => (
            <StyledTokenButton onClick={() => selectPool(pool)} key={i}>
              <TokenSelectItem mint={pool.token} />
            </StyledTokenButton>
          ))}
        </Dropdown>
      </div>
    </>
  )
}
