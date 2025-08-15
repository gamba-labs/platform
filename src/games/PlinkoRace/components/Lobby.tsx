// src/components/Lobby.tsx
import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { useSpecificGames } from 'gamba-react-v2'
import { useSound } from 'gamba-react-ui-v2'
import CreateGameModal from './CreateGameModal'
import lobbymusicSnd from '../sounds/lobby.mp3'
import LobbyBackground from './LobbyBackground'
import {
  musicManager,
  attachMusic,
  stopAndDispose,
  toggleMuted,
} from '../musicManager'

const sol = (lamports: number) => lamports / LAMPORTS_PER_SOL
const shorten = (pk: PublicKey) =>
  pk.toBase58().slice(0, 4) + '...'
const formatDuration = (ms: number) => {
  const total = Math.ceil(ms / 1000)
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${s.toString().padStart(2,'0')}`
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  border: 1px solid #202533;
  border-radius: 12px;
  padding: 16px;
`
const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`
const Button = styled.button`
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
`
const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`
const TH = styled.th`
  text-align: left;
  padding: 8px 12px;
  font-weight: 600;
  font-size: 0.9rem;
  text-transform: uppercase;
  border-bottom: 1px solid #333;
`
const TR = styled.tr<{ $clickable?: boolean }>`
  &:hover {
    background: ${({ $clickable }) => ($clickable ? '#a2a2a26c' : 'inherit')};
  }
  cursor: ${({ $clickable }) => ($clickable ? 'pointer' : 'default')};
`
const TD = styled.td`
  padding: 10px 12px;
  font-size: 0.95rem;
  border-bottom: 3px solid #222;
`

export default function Lobby({
  onSelect,
  onDebug,
}: {
  onSelect(pk: PublicKey): void
  onDebug(): void
}) {
  const { games, loading, refresh } = useSpecificGames({ winnersTarget: 1 }, 0)

  const { play, sounds } = useSound(
    { lobby: lobbymusicSnd },
    { disposeOnUnmount: false }
  )

  useEffect(() => {
    const snd = sounds.lobby

    clearTimeout(musicManager.timer)

    musicManager.count += 1

    if (!musicManager.sound) {
      snd.player.loop = true
      const startWhenReady = () => {
        if (snd.ready) {
          play('lobby')
          attachMusic(snd)
        } else {
          setTimeout(startWhenReady, 100)
        }
      }
      startWhenReady()
    }

    return () => {
      musicManager.count -= 1
      if (musicManager.count === 0) {
        musicManager.timer = setTimeout(stopAndDispose, 200)
      }
    }
  }, [play, sounds])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div style={{ position:'relative', width:'100%', height:'100%' }}>
      <LobbyBackground />

      <Wrapper style={{ position:'relative', zIndex:1 }}>
        <Header>
          <Button onClick={() => setIsModalOpen(true)}>
            ＋ Create Game
          </Button>
          <Button onClick={refresh}>
            {loading ? 'Loading…' : 'Refresh'}
          </Button>
        </Header>

        <Table>
          <thead>
            <tr>
              <TH>ID</TH>
              <TH>Maker</TH>
              <TH>Players</TH>
              <TH>Bet</TH>
              <TH>Starts In</TH>
            </tr>
          </thead>
          <tbody>
            {games.map(g => {
              const {
                gameId,
                gameMaker,
                players,
                maxPlayers,
                wagerType,
                wager,
                minBet,
                maxBet,
                softExpirationTimestamp,
                state,
              } = g.account as any

              let betLabel: string
              if ('sameWager' in wagerType) {
                betLabel = `${sol(wager.toNumber()).toFixed(2)} SOL`
              } else if ('customWager' in wagerType) {
                betLabel = 'Unlimited'
              } else {
                betLabel = `${sol(minBet.toNumber()).toFixed(2)} – ${sol(
                  maxBet.toNumber()
                ).toFixed(2)} SOL`
              }

              const startMs = Number(softExpirationTimestamp) * 1000
              const msLeft = startMs - now
                const startsIn = state.waiting
                ? msLeft > 0
                  ? (
                    <span style={{ color: '#FFD700', fontWeight: 'bold' }}>
                    {formatDuration(msLeft)}
                    </span>
                  )
                  : (
                    <span style={{ color: '#00FF99', fontWeight: 'bold' }}>
                    Ready to start
                    </span>
                  )
                : (
                  <span style={{ color: '#FF5555', fontWeight: 'bold' }}>
                    Started
                  </span>
                  )

              return (
                <TR
                  key={g.publicKey.toBase58()}
                  $clickable
                  onClick={() => onSelect(g.publicKey)}
                >
                  <TD>#{gameId.toString()}</TD>
                  <TD>{shorten(gameMaker)}</TD>
                  <TD>
                    {players.length} / {maxPlayers}
                  </TD>
                  <TD>{betLabel}</TD>
                  <TD>{startsIn}</TD>
                </TR>
              )
            })}

            <TR $clickable onClick={onDebug}>
              <TD colSpan={5} style={{ textAlign:'center', fontStyle:'italic' }}>
                🐞 Debug Simulator
              </TD>
            </TR>

            {!loading && games.length === 0 && (
              <TR>
                <TD colSpan={5} style={{ textAlign:'center', opacity:0.8 }}>
                  No live games – create one!
                </TD>
              </TR>
            )}
          </tbody>
        </Table>

        <CreateGameModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </Wrapper>

      {/* Bottom-right Music Mute Button (music only, not SFX) */}
      <button
        onClick={toggleMuted}
        style={{
          position:'absolute', right:12, bottom:12, zIndex:999,
          padding:'8px 12px', fontWeight:600,
          background: musicManager.muted ? '#444' : '#222', color:'#fff',
          border:'none', borderRadius:6, cursor:'pointer', opacity:0.9,
        }}
        title={musicManager.muted ? 'Unmute music' : 'Mute music'}
      >
        {musicManager.muted ? 'Unmute Music' : 'Mute Music'}
      </button>
    </div>
  )
}
