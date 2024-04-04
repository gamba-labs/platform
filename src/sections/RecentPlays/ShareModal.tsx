import { GambaTransaction } from 'gamba-core-v2'
import { GambaUi, TokenValue, useTokenMeta } from 'gamba-react-ui-v2'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { Flex } from '../../components'
import { Modal } from '../../components/Modal'
import { EXPLORER_URL, PLATFORM_SHARABLE_URL } from '../../constants'
import { extractMetadata } from '../../utils'

const Container = styled.div`
  display: grid;
  gap: 10px;
  padding: 20px;
  padding-bottom: 0;
  width: 100%;
`

const Inner = styled.div`
  overflow: hidden;
`

const Content = styled.div`
  border-radius: 10px;
  padding: 20px;
  background: linear-gradient(156deg, #52527822, #12121700);
`

export function ShareModal({ event, onClose }: {event: GambaTransaction<'GameSettled'>, onClose: () => void}) {
  const navigate = useNavigate()
  const { game } = extractMetadata(event)
  const gotoGame = () => {
    navigate('/' + game?.id)
    onClose()
  }
  const tokenMeta = useTokenMeta(event.data.tokenMint)
  const ref = React.useRef<HTMLDivElement>(null!)

  const profit = event.data.payout.sub(event.data.wager).toNumber()
  const percentChange = profit / event.data.wager.toNumber()

  return (
    <Modal onClose={() => onClose()}>
      <Container>
        <Inner>
          <Content ref={ref}>
            <div style={{ display: 'grid', gap: '5px', gridTemplateColumns: 'auto 1fr auto', alignItems: 'center', padding: '10px' }}>
              <img src={tokenMeta.image} style={{ borderRadius: '50%', height: '40px' }} />
              <div style={{ fontSize: '24px', color: percentChange >= 0 ? '#9bffad' : '#ff4f4f', padding: '10px' }}>
                <b>
                  {profit >= 0 ? '+' : '-'}
                  <TokenValue exact amount={Math.abs(profit)} mint={event.data.tokenMint} />
                </b>
                <div style={{ fontSize: '18px' }}>
                  {(event.data.multiplierBps / 10_000).toLocaleString()}x
                </div>
              </div>
              <div style={{ padding: '10px', textAlign: 'center' }}>
                <img src={game?.meta?.image} width="100px" />
              </div>
            </div>
            <div style={{ background: '#121217CC', color: '#ffffffcc', fontStyle: 'italic', display: 'flex', alignContent: 'center', gap: '10px', padding: '10px', borderRadius: '10px' }}>
              <img src="/gamba.svg" height="25px" />
              <div>play on <b>{PLATFORM_SHARABLE_URL}</b></div>
            </div>
          </Content>
        </Inner>
        <Flex>
          <GambaUi.Button size="small" onClick={() => window.open(`${EXPLORER_URL}/tx/${event.signature}`, '_blank')}>
            Verify
          </GambaUi.Button>
          <GambaUi.Button size="small" onClick={gotoGame}>
            Play {game?.meta?.name}
          </GambaUi.Button>
        </Flex>
      </Container>
    </Modal>
  )
}
