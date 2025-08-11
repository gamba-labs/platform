import React, { useEffect, useMemo, useRef, useState } from 'react'
import { LAMPORTS_PER_SOL }            from '@solana/web3.js'
import { GambaUi, Multiplayer }        from 'gamba-react-ui-v2'
import { useGame, useSpecificGames }   from 'gamba-react-v2'
import { useWallet }                   from '@solana/wallet-adapter-react'
import { BPS_PER_WHOLE }               from 'gamba-core-v2'

import { Countdown }       from './Countdown'
import { Pot }             from './Pot'
import { WinnerAnimation } from './WinnerAnimation'
import { Coinfalls }       from './Coinfall'
import { TopPlayers }      from './TopPlayers'
import { RecentPlayers }   from './RecentPlayers'
import { RecentGames }     from './RecentGames'
import { Waiting }         from './Waiting'
import { MyStats }         from './MyStats'

import { DESIRED_CREATOR, DESIRED_MAX_PLAYERS, DESIRED_WINNERS_TARGET, DESIRED_MINT } from './config'
import {
  PLATFORM_CREATOR_ADDRESS,
  MULTIPLAYER_FEE,
  PLATFORM_REFERRAL_FEE,            // referral %
} from '../../constants'
import * as S from './Jackpot.styles'

// Responsive media query hook
const useMediaQuery = (q: string) => {
  const [m, setM] = useState(matchMedia(q).matches)
  useEffect(() => {
    const mm = matchMedia(q)
    const h = () => setM(mm.matches)
    mm.addEventListener('change', h)
    return () => mm.removeEventListener('change', h)
  }, [q])
  return m
}

// Component
export default function Jackpot() {
  const isSmall                  = useMediaQuery('(max-width: 900px)')
  const { publicKey: walletKey } = useWallet()

  // Discover games (no auto polling)
  const {
    games, loading: gamesLoading, refresh: refreshGames,
  } = useSpecificGames({
    creator: DESIRED_CREATOR,
    maxPlayers: DESIRED_MAX_PLAYERS,
    winnersTarget: DESIRED_WINNERS_TARGET,
    mint: DESIRED_MINT,
  } as any, 0)

  // Track last consumed gameId
  const lastGameIdRef = useRef<number | null>(null)

  // Use first fresh game (skip previously consumed)
  const freshGames = games.filter(
    g => g.account.gameId.toNumber() !== lastGameIdRef.current,
  )
  const topGame = freshGames[0] ?? null

  // Live subscription
  const liveGame = useGame(topGame?.publicKey ?? null).game

  // Phase handling
  type Phase = 'playing' | 'animation' | 'waiting'
  const   [phase, setPhase] = useState<Phase>('waiting')

  // Set phase based on on-chain state
  useEffect(() => {
    if (liveGame && liveGame.state.waiting)   setPhase('playing')
    if (liveGame && liveGame.state.playing)   setPhase('playing')
    if (liveGame && liveGame.state.settled)   setPhase('animation')
  }, [liveGame])

  // Poll while waiting only
  useEffect(() => {
    if (phase !== 'waiting') return
    refreshGames()                                    // kick off immediately
    const id = setInterval(refreshGames, 5000)
    return () => clearInterval(id)
  }, [phase, refreshGames])

  // After animation, mark game as consumed
  const handleAnimationDone = () => {
    if (liveGame) lastGameIdRef.current = liveGame.gameId.toNumber()
    setPhase('waiting')
  }

  // Derived helpers
  const players          = liveGame?.players ?? []
  const totalPotLamports = players.reduce((s, p) => s + p.wager.toNumber(), 0)
  const waitingForPlayers= !!liveGame?.state.waiting
  const settled          = !!liveGame?.state.settled

  const youJoined = useMemo(
    () => !!walletKey && players.some(p => p.user.equals(walletKey)),
    [walletKey, players],
  )
  const myEntry       = players.find(p => walletKey && p.user.equals(walletKey))
  const myBetLamports = myEntry?.wager.toNumber() ?? 0
  const myChancePct   = totalPotLamports
    ? (myBetLamports / totalPotLamports) * 100
    : 0

  // Timestamps for progress bar
  const creationMs = liveGame ? Number(liveGame.creationTimestamp) * 1e3 : 0
  const softMs     = liveGame ? Number(liveGame.softExpirationTimestamp) * 1e3 : 0
  const totalDur   = Math.max(softMs - creationMs, 0)

  // Render
  return (
    <>
      <GambaUi.Portal target="screen">
        <S.ScreenLayout>
          <S.PageLayout>

            {!isSmall && (
              <S.TopPlayersSidebar>
                <TopPlayers players={players} totalPot={totalPotLamports} />
              </S.TopPlayersSidebar>
            )}

            <S.GameContainer>

              {liveGame && <Coinfalls players={players} />}

              {isSmall && players.length > 0 && (
                <S.TopPlayersOverlay>
                  <TopPlayers players={players} totalPot={totalPotLamports} $isOverlay />
                </S.TopPlayersOverlay>
              )}

              <S.MainContent>
                {!liveGame && (
                  <S.CenterBlock layout>
                    <Waiting />
                  </S.CenterBlock>
                )}

                {liveGame && (
                  <>
                    <S.Header>
                      <S.Title>Game #{liveGame.gameId.toString()}</S.Title>
                      <S.Badge
                        status={
                          waitingForPlayers ? 'waiting'
                          : settled         ? 'settled'
                                            : 'live'
                        }
                      >
                        {waitingForPlayers ? 'Waiting'
                        : settled          ? 'Settled'
                                           : 'Live'}
                      </S.Badge>
                    </S.Header>

                    {totalDur > 0 && (
                      <Countdown
                        creationTimestamp={creationMs}
                        softExpiration={softMs}
                        onComplete={() => {}}
                      />
                    )}

                    <S.CenterBlock layout>

                      {phase === 'animation' && (
                        <WinnerAnimation
                          players={players}
                          winnerIndexes={liveGame.winnerIndexes.map(Number)}
                          currentUser={walletKey}
                          onClose={handleAnimationDone}
                        />
                      )}

                      <Pot totalPot={totalPotLamports / LAMPORTS_PER_SOL} />

                      {myEntry && (
                        <MyStats
                          betSOL={myBetLamports / LAMPORTS_PER_SOL}
                          chancePct={myChancePct}
                        />
                      )}
                    </S.CenterBlock>
                  </>
                )}
              </S.MainContent>
            </S.GameContainer>

            {!isSmall && (
              <S.RecentGamesSidebar>
                <RecentGames />
              </S.RecentGamesSidebar>
            )}
          </S.PageLayout>

          <S.RecentPlayersContainer>
            <RecentPlayers players={players} />
          </S.RecentPlayersContainer>
        </S.ScreenLayout>
      </GambaUi.Portal>

      <GambaUi.Portal target="controls">
        {phase === 'playing' && waitingForPlayers && !youJoined && topGame && (
          <Multiplayer.JoinGame
            pubkey={topGame.publicKey}
            account={liveGame!}
            creatorAddress={PLATFORM_CREATOR_ADDRESS}
            creatorFeeBps={Math.round(MULTIPLAYER_FEE * BPS_PER_WHOLE)}
            referralFee={PLATFORM_REFERRAL_FEE}         
            onTx={refreshGames}
          />
        )}
        {phase === 'playing' && waitingForPlayers && youJoined && topGame && (
          <Multiplayer.EditBet
            pubkey={topGame.publicKey}
            account={liveGame!}
            creatorAddress={PLATFORM_CREATOR_ADDRESS}
            creatorFeeBps={Math.round(MULTIPLAYER_FEE * BPS_PER_WHOLE)}
            onComplete={refreshGames}
          />
        )}
      </GambaUi.Portal>
    </>
  )
}
