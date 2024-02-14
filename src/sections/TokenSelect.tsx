import { PublicKey } from '@solana/web3.js'
import { GambaPlatformContext, GambaUi, TokenValue, useCurrentToken, useTokenList, useUserBalance } from 'gamba-react-ui-v2'
import React from 'react'
import styled from 'styled-components'
import { Dropdown } from '../components/Dropdown'

const StyledToken = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  img {
    height: 20px;
  }
`

const TokenImage = styled.img`
  height: 20px;
  aspect-ratio: 1/1;
  border-radius: 50%;
`

const StyledTokenButton = styled.button`
  all: unset;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
`

export default function TokenSelect() {
  const [visible, setVisible] = React.useState(false)
  const context = React.useContext(GambaPlatformContext)
  const selectedToken = useCurrentToken()
  const balance = useUserBalance()
  const tokenList = useTokenList()

  const setToken = (token: PublicKey) => {
    context.setToken(token)
    setVisible(false)
  }

  const click = () => {
    setVisible(!visible)
  }

  return (
    <div style={{ position: 'relative' }}>
      <GambaUi.Button onClick={click}>
        {selectedToken && (
          <StyledToken>
            <TokenImage src={selectedToken.image} />
            <TokenValue amount={balance.balance} />
          </StyledToken>
        )}
      </GambaUi.Button>
      <Dropdown visible={visible}>
        {tokenList.map((x, i) => (
          <StyledTokenButton onClick={() => setToken(x.mint)} key={i}>
            <TokenImage src={x.image} />
            {' '}{x.symbol}
          </StyledTokenButton>
        ))}
      </Dropdown>
    </div>
  )
}
