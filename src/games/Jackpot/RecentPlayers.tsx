import React, { useMemo } from 'react'
import styled from 'styled-components'
import { AnimatePresence, motion } from 'framer-motion'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import type { IdlAccounts } from '@coral-xyz/anchor'
import type { Multiplayer } from '@gamba-labs/multiplayer-sdk'

const Container = styled.div`
  background: #23233b;
  border-radius: 15px;
  padding: 15px;

  min-height: 120px;
`

const Title = styled.h3`
  margin: 0 0 10px 0;
  color: #fff;
  font-size: 1rem;
  text-align: center;
`

const List = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 10px; /* For scrollbar spacing */

  &::-webkit-scrollbar {
    height: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: #4a4a7c;
    border-radius: 2px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }

  & > li {
    background: #2c2c54;
    padding: 8px;
    border-radius: 10px;
    border: 1px solid #4a4a7c;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 130px;
  }
`

const Avatar = styled.div`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #4a4a7c;
  flex-shrink: 0;
`

const PlayerInfo = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
`

const PlayerAddress = styled.div`
  font-size: 0.8rem;
  color: #e0e0e0;
  font-family: monospace;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`

const PlayerWager = styled.div`
  font-size: 0.75rem;
  color: #2ecc71;
  font-weight: bold;
`

type Player = IdlAccounts<Multiplayer>['game']['players'][number]

interface RecentPlayersProps {
  players: Player[]
}

export function RecentPlayers({ players }: RecentPlayersProps) {
  const recentPlayers = useMemo(() => {
    return [...players].reverse()
  }, [players])

  const shorten = (str: string) => `${str.slice(0, 4)}...`

  return (
    <Container>
      <Title>Recent Players</Title>
      <List>
        <AnimatePresence initial={false}>
          {recentPlayers.map((player) => (
            <motion.li
              key={player.user.toBase58()}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            >
              <Avatar />
              <PlayerInfo>
                <PlayerAddress>
                  {shorten(player.user.toBase58())}
                </PlayerAddress>
                <PlayerWager>
                  {(player.wager.toNumber() / LAMPORTS_PER_SOL).toFixed(2)} SOL
                </PlayerWager>
              </PlayerInfo>
            </motion.li>
          ))}
        </AnimatePresence>
      </List>
    </Container>
  )
}
