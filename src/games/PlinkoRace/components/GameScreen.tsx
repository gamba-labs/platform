// src/components/GameScreen.tsx
import React, { useEffect, useState } from 'react'
import { PublicKey } from '@solana/web3.js'
import { useWallet } from '@solana/wallet-adapter-react'
import { useGame } from 'gamba-react-v2'
import { GambaUi, Multiplayer } from 'gamba-react-ui-v2'
import {
  PLATFORM_CREATOR_ADDRESS,
  MULTIPLAYER_FEE,
  PLATFORM_REFERRAL_FEE, // ← add this
} from '../../../constants'
import { BPS_PER_WHOLE } from 'gamba-core-v2'
import Board from '../board/Board'
import { musicManager, stopAndDispose, attachMusic } from '../musicManager'
import actionSnd from '../sounds/action.mp3'
import { useSound } from 'gamba-react-ui-v2'

export default function GameScreen({
  pk,
  onBack,
}: {
  pk: PublicKey
  onBack: () => void
}) {
  const { game: chainGame, metadata } = useGame(pk, { fetchMetadata: true })
  const { publicKey } = useWallet()

  const [snapPlayers, setSnapPlayers] = useState<PublicKey[] | null>(null)
  const [snapWinner, setSnapWinner]   = useState<number | null>(null)
  const [snapPayouts, setSnapPayouts] = useState<number[] | null>(null)
  const [replayDone, setReplayDone]   = useState(false)

  useEffect(() => {
    if (!chainGame?.state.settled || snapPlayers) return
    const w = Number(chainGame.winnerIndexes[0])
    setSnapPlayers(chainGame.players.map(p => p.user))
    setSnapWinner(w)
    setSnapPayouts(
      chainGame.players.map(p =>
        Number((p as any).pendingPayout ?? (p as any).pending_payout ?? 0),
      ),
    )
  }, [chainGame, snapPlayers])

  useEffect(() => {
    if (snapPlayers && snapPlayers.length === 0) {
      setReplayDone(true)
    }
  }, [snapPlayers])

  const [timeLeft, setTimeLeft] = useState(0)
  useEffect(() => {
    if (!chainGame?.softExpirationTimestamp) return
    const end = Number(chainGame.softExpirationTimestamp) * 1000
    const tick = () => setTimeLeft(Math.max(end - Date.now(), 0))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [chainGame?.softExpirationTimestamp])

  const waiting        = snapPlayers === null
  const boardPlayers   = waiting
    ? (chainGame?.players.map(p => p.user) || [])
    : snapPlayers!
  const boardWinnerIdx = waiting ? null : snapWinner
  const boardPayouts   = waiting ? undefined : snapPayouts!

  const formatTime = (ms: number) => {
    const tot = Math.ceil(ms / 1000)
    const m   = Math.floor(tot / 60)
    const s   = tot % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  useEffect(() => {
    clearTimeout(musicManager.timer)
    musicManager.count += 1

    return () => {
      musicManager.count -= 1
      if (musicManager.count === 0) {
        musicManager.timer = setTimeout(stopAndDispose, 200)
      }
    }
  }, [])

  const { play: playAction, sounds: actionSounds } = useSound(
    { action: actionSnd },
    { disposeOnUnmount: false }
  )
  useEffect(() => {
    if (!waiting) {
      // stop lobby immediately
      try { musicManager.sound?.player.stop() } catch {}
      // start action loop and attach for volume control
      const snd = actionSounds.action
      if (snd) {
        snd.player.loop = true
        const startWhenReady = () => {
          if (snd.ready) {
            playAction('action')
            attachMusic(snd)
            // re-apply mute state after attaching
            try { snd.gain.set({ gain: musicManager.muted ? 0 : snd.gain.get().gain }) } catch {}
          } else {
            setTimeout(startWhenReady, 100)
          }
        }
        startWhenReady()
      }
    }
  }, [waiting, playAction, actionSounds])

  return (
    <>
      {/* ► Always render the board */}
      <Board
        players={boardPlayers}
        winnerIdx={boardWinnerIdx}
        gamePk={pk.toBase58()}
        payouts={boardPayouts}
        metadata={metadata}
        onFinished={!waiting ? () => setReplayDone(true) : undefined}
      />

      {/* ► Top-right status + countdown */}
      <div style={{
        position: 'absolute',
        top: 12,
        right: 12,
        zIndex: 200,
        textAlign: 'right',
      }}>
        <div style={{
          display: 'inline-block',
          background: 'rgba(0,0,0,0.6)',
          color: '#fff',
          padding: '4px 8px',
          borderRadius: 4,
          fontSize: 12,
          textTransform: 'uppercase',
        }}>
          {waiting ? 'Waiting' : (!replayDone ? 'Playing' : 'Settled')}
        </div>
        {waiting && timeLeft > 0 && (
          <div style={{ marginTop: 4, color: '#fff', fontSize: 12 }}>
            Starts in {formatTime(timeLeft)}
          </div>
        )}
      </div>

      {/* ► Gamba controls bar */}
      <GambaUi.Portal target="controls">
        {/* ← Back to Lobby button */}
        <button
          onClick={onBack}
          style={{
            padding: '8px 16px',
            marginRight: 12,
            fontWeight: 600,
            background: '#222',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
          }}
        >
          ← Lobby
        </button>

        {/* Conditional game controls */}
        {waiting && chainGame?.state.waiting ? (
          publicKey && !chainGame.players.some(p => p.user.equals(publicKey)) ? (
            <Multiplayer.JoinGame
              pubkey={pk}
              account={chainGame}
              creatorAddress={PLATFORM_CREATOR_ADDRESS}
              creatorFeeBps={Math.round(MULTIPLAYER_FEE * BPS_PER_WHOLE)}
              referralFee={PLATFORM_REFERRAL_FEE}     // ← pass platform referral %
              enableMetadata
              onTx={() => {}}
            />
          ) : (
            <Multiplayer.EditBet
              pubkey={pk}
              account={chainGame}
              creatorAddress={PLATFORM_CREATOR_ADDRESS}
              creatorFeeBps={Math.round(MULTIPLAYER_FEE * BPS_PER_WHOLE)}
              onComplete={() => {}}
            />
          )
        ) : null}
      </GambaUi.Portal>
    </>
  )
}
