import React from 'react'
import styled from 'styled-components'
import { motion, AnimatePresence } from 'framer-motion'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import { useRecentMultiplayerEvents } from 'gamba-react-v2'
import { DESIRED_CREATOR, DESIRED_MAX_PLAYERS } from './config'
import { ParsedEvent } from '@gamba-labs/multiplayer-sdk'

const Container = styled.div`
  background: #23233b;
  border-radius: 15px;
  padding: 15px;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
`
const Header = styled.header`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 10px;
  flex-shrink: 0;
  h3 { margin: 0; font-size: 1rem; color: #fff; }
`
const List = styled.ul`
  list-style: none;
  margin: 0; padding: 0;
  overflow-y: auto; flex-grow: 1;
  &::-webkit-scrollbar { width: 0; background: transparent; }
`
const GameItem = styled(motion.li)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #2c2c54;
  padding: 4px 8px;
  border-radius: 8px;
  border: 1px solid #4a4a7c;
  margin-bottom: 4px;
  font-size: 0.8rem;
  white-space: nowrap;
`
const GameId     = styled.div` font-family: monospace; color: #a9a9b8; flex: 0 0 auto; `
const PotSize    = styled.div` flex: 1 1 auto; text-align: center; color: #e0e0e0; `
const Multiplier = styled.div`
  font-family: monospace;
  text-align: right;
  color: #2ecc71;
  font-weight: bold;
  flex: 0 0 auto;
`
const EmptyState = styled.div`
  display: flex; align-items: center; justify-content: center;
  height: 100%; color: #a9a9b8; font-size: 0.9rem;
`
const Fade = styled.div`
  position: absolute;
  bottom: 15px; left: 15px; right: 15px;
  height: 40px;
  pointer-events: none;
  background: linear-gradient(rgba(35,35,59,0), rgba(35,35,59,1));
`

const toNum = (x: any): number =>
  typeof x === 'number'
    ? x
    : typeof x === 'bigint'
      ? Number(x)
      : x?.toNumber
        ? x.toNumber()
        : Number(x)

const toStr = (x: any): string =>
  typeof x === 'string'
    ? x
    : x?.toString
      ? x.toString()
      : String(x)

const fmt2 = (n: number) =>
  n.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

export function RecentGames() {
  const { events, loading } = useRecentMultiplayerEvents(
    'winnersSelected',
    20,
    0,
  )

  const filtered = React.useMemo<
    ParsedEvent<'winnersSelected'>[]
  >(() => {
    return events.filter(ev =>
      ev.data.gameMaker.equals(DESIRED_CREATOR) &&
      ev.data.maxPlayers === DESIRED_MAX_PLAYERS
    )
  }, [events])

  return (
    <Container>
      <Header><h3>Recent Games</h3></Header>
      <List>
        <AnimatePresence initial={false}>
          {filtered.length > 0 ? (
            filtered.map(ev => {
              const { gameId, totalWager, payouts, winnerWagers } =
                ev.data
              const potSOL = toNum(totalWager) / LAMPORTS_PER_SOL

              let mul = 0
              if (winnerWagers?.[0] && payouts?.[0]) {
                const bet = toNum(winnerWagers[0]) / LAMPORTS_PER_SOL
                const pay = toNum(payouts[0])      / LAMPORTS_PER_SOL
                mul = bet > 0 ? pay / bet : 0
              }

              return (
                <GameItem
                  key={ev.signature}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit   ={ { opacity: 0, y: -8 } }
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                >
                  <GameId>#{toStr(gameId)}</GameId>
                  <PotSize>{fmt2(potSOL)} SOL</PotSize>
                  <Multiplier>×{fmt2(mul)}</Multiplier>
                </GameItem>
              )
            })
          ) : (
            <EmptyState>
              {loading ? 'Loading…' : 'No recent games'}
            </EmptyState>
          )}
        </AnimatePresence>
      </List>
      <Fade />
    </Container>
  )
}

export default RecentGames
