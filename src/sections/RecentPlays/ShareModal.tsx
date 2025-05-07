import { GambaTransaction } from 'gamba-core-v2'
import { GambaUi, TokenValue, useTokenMeta } from 'gamba-react-ui-v2'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import styled, { css } from 'styled-components'
import { Flex } from '../../components'
import { Modal } from '../../components/Modal'
import { EXPLORER_URL } from '../../constants'
import { extractMetadata } from '../../utils'

const Container = styled.div`
  display: grid;
  gap: 20px;
  padding: 15px;
  padding-bottom: 0;
  width: 100%;
  position: relative;
`

const Inner = styled.div`
  overflow: hidden;
`

const Content = styled.div`
  border-radius: 10px;
  padding: 55px;
  background-image: url(https://iili.io/315va8G.webp);
  background-size: cover;
  background-position: center;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
`

const ResultBox = styled.div`
  background: rgba(0, 0, 0, 0.5);
  border-radius: 15px;
  padding: 20px 30px;
  text-align: center;
  max-width: 300px;
`

const glowStyle = (color: string) => css`
  color: ${color};
  text-shadow: 0 0 8px ${color}, 0 0 16px ${color};
`

const BigText = styled.div<{ isProfit: boolean }>`
  font-size: 45px;
  font-weight: bold;
  ${({ isProfit }) => glowStyle(isProfit ? '#00ff00' : '#ff0000')}
`

const BiggerText = styled.div<{ isProfit: boolean }>`
  font-size: 60px;
  font-weight: bold;
  margin-top: 10px;
  ${({ isProfit }) => glowStyle(isProfit ? '#00ff00' : '#ff0000')}
`

const PlayText = styled.div`
  position: absolute;
  bottom: 10px;
  left: 15px;
  font-size: 16px;
  color: #ffffffcc;
  font-style: italic;
  text-align: left;

  b {
    font-weight: bold;
    color: #fff;
    text-shadow: 0 0 3px #000, 0 0 5px #000;
  }
`

export function ShareModal({ event, onClose }: { event: GambaTransaction<'GameSettled'>, onClose: () => void }) {
  const navigate = useNavigate()
  const { game } = extractMetadata(event)
  const gotoGame = () => {
    navigate('/' + game?.id)
    onClose()
  }
  const tokenMeta = useTokenMeta(event.data.tokenMint)

  const profit = event.data.payout.sub(event.data.wager).toNumber()
  const isProfit = profit >= 0
  const multiplier = (event.data.multiplierBps / 10_000).toLocaleString()

  return (
    <Modal onClose={() => onClose()}>
      <Container>
        <Inner>
          <Content>
            <ResultBox>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '15px' }}>
                <img src={tokenMeta.image} style={{ borderRadius: '50%', height: '50px' }} alt="token" />
              </div>
              <BigText isProfit={isProfit}>
                {isProfit ? '+' : '-'}
                <TokenValue exact amount={Math.abs(profit)} mint={event.data.tokenMint} />
              </BigText>
              <BiggerText isProfit={isProfit}>
                {multiplier}x
              </BiggerText>
            </ResultBox>
            <PlayText>
              Play now on <b>banabets.com</b>
            </PlayText>
          </Content>
        </Inner>
        <Flex>
          <GambaUi.Button size="small" onClick={() => window.open(`${EXPLORER_URL}/tx/${event.signature}`, '_blank')}>
            Verify Solscan
          </GambaUi.Button>
          <GambaUi.Button size="small" onClick={gotoGame}>
            Play {game?.meta?.name}
          </GambaUi.Button>
        </Flex>
      </Container>
    </Modal>
  )
}
