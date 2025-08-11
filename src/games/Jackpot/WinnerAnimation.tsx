import React, {
  useState,
  useEffect,
  useLayoutEffect,
  useRef,
} from 'react'
import styled, { keyframes, css } from 'styled-components'
import { motion, AnimatePresence } from 'framer-motion'
import type { IdlAccounts } from '@coral-xyz/anchor'
import type { Multiplayer }  from '@gamba-labs/multiplayer-sdk'
import type { PublicKey }    from '@solana/web3.js'
import { useSound } from 'gamba-react-ui-v2'
import tickSnd from './sounds/tick.mp3'
import winSnd  from './sounds/win.mp3'

const winnerGlow = keyframes`
  0%,100%{box-shadow:0 0 15px 5px rgba(46,204,113,.7);transform:scale(1.1)}
  50%    {box-shadow:0 0 30px 10px rgba(46,204,113,1);transform:scale(1.15)}
`

const Wrapper = styled(motion.div)`
  position:absolute;inset:0;
  display:flex;flex-direction:column;justify-content:center;align-items:center;
  background:rgba(26,26,46,.9);backdrop-filter:blur(5px);z-index:100;
`

const ReelContainer = styled.div`
  position:relative;
  width:100%;
  max-width:80vw;

  overflow-x:hidden;     /* hide left / right bleed */
  overflow-y:visible;    /* BUT let the glow breathe vertically */

  padding:40px 0;        /* extra headroom above + below cards */

  mask-image:linear-gradient(
    to right,
    transparent,
    black 20%,
    black 80%,
    transparent
  );
`

const Pointer = styled.div`
  position:absolute;top:40px;left:50%;transform:translateX(-50%);
  width:4px;height:calc(100% - 80px);     /* compensate for 40 px padding */
  background:#f39c12;box-shadow:0 0 10px #f39c12;border-radius:2px;z-index:2;
`

const PlayerReel = styled(motion.div)`display:flex;`

const PlayerCard = styled.div<{ $isWinner:boolean;$isYou:boolean }>`
  position:relative;flex-shrink:0;
  width:100px;height:120px;margin:0 5px;
  display:flex;flex-direction:column;align-items:center;justify-content:center;

  background:#2c2c54;border:2px solid #4a4a7c;border-radius:10px;transition:.3s;

  ${({$isYou,$isWinner})=>$isYou&&!$isWinner&&css`
      border-color:#3498db;box-shadow:0 0 10px 2px rgba(52,152,219,.6);`}

  ${({$isWinner})=>$isWinner&&css`
      border-color:#2ecc71;animation:${winnerGlow} 1.5s ease-in-out infinite;`}
`

const YouBadge      = styled.div`position:absolute;top:-10px;padding:2px 8px;font-size:.7rem;font-weight:700;color:#fff;background:#3498db;border-radius:6px;`
const Avatar        = styled.div`width:50px;height:50px;border-radius:50%;background:#4a4a7c;margin-bottom:10px;`
const PlayerAddress = styled.div`font-size:.8rem;color:#e0e0e0;font-family:monospace;`
const BottomBar     = styled.div`height:3rem;display:flex;align-items:center;justify-content:center;`
const WinnerText    = styled(motion.div)`font-size:1.5rem;color:#fff;font-weight:bold;text-shadow:0 0 10px #2ecc71;`

type Player = IdlAccounts<Multiplayer>['game']['players'][number]

const TARGET = 100
const short  = (s:string)=>`${s.slice(0,4)}…`

function buildReel(players:Player[], winnerIdx:number):Player[]{
  if(!players.length) return []

  const total   = players.reduce((s,p)=>s+p.wager.toNumber(),0)
  const TICKETS = 40
  const pool:Player[]=[]
  players.forEach(p=>{
    const share = p.wager.toNumber()/total
    const cnt   = Math.max(1,Math.round(share*TICKETS))
    for(let i=0;i<cnt;i++) pool.push(p)
  })

  for(let i=pool.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1))
    ;[pool[i],pool[j]]=[pool[j],pool[i]]
  }

  const reel:Player[]=Array.from({length:TARGET*2},(_,i)=>pool[i%pool.length])
  reel[TARGET]=players[winnerIdx]||players[0]
  return reel
}

export const WinnerAnimation:React.FC<{
  players:Player[];winnerIndexes:number[];
  currentUser?:PublicKey|null;
  onClose?:()=>void;
}> = ({ players, winnerIndexes, currentUser, onClose }) => {
  if(!players.length||!winnerIndexes.length) return null
  const winnerIdx = winnerIndexes[0]

  const frozenPlayers=useRef<Player[]>([])
  const frozenReel   =useRef<Player[]>([])
  if(!frozenReel.current.length){
    frozenPlayers.current=[...players]
    frozenReel.current   =buildReel(frozenPlayers.current,winnerIdx)
  }

  const reel=frozenReel.current
  const snap=frozenPlayers.current

  const [closing,setClosing]=useState(false)
  const [spinDone,setSpinDone]=useState(false)
  const [winner,setWinner]=useState<Player|null>(null)
  const [offset,setOffset]=useState(0)
  const reelEl=useRef<HTMLDivElement>(null)
  const centersRef = useRef<number[]>([])
  const lastTickIndexRef = useRef<number | null>(null)

  useLayoutEffect(()=>{
    const el=reelEl.current
    if(!el) return
    const card = el.children[TARGET] as HTMLElement|undefined
    if(card) setOffset(-(card.offsetLeft+card.offsetWidth/2 - el.clientWidth/2))

    // precompute card center positions for ticking
    const centers: number[] = []
    for (let i = 0; i < el.children.length; i++) {
      const c = el.children[i] as HTMLElement
      centers.push(c.offsetLeft + c.offsetWidth / 2)
    }
    centersRef.current = centers
    // initialize last tick index at starting position
    const pointerX = el.clientWidth / 2
    let nearest = 0, best = Infinity
    centers.forEach((cx, idx) => {
      const d = Math.abs(cx - pointerX)
      if (d < best) { best = d; nearest = idx }
    })
    lastTickIndexRef.current = nearest
  },[])

  useEffect(()=>{
    if(!spinDone) return
    const t=setTimeout(()=>setWinner(snap[winnerIdx]),1500)
    return()=>clearTimeout(t)
  },[spinDone,snap,winnerIdx])

  useEffect(()=>{
    if(!winner) return
    const t=setTimeout(()=>setClosing(true),3000)
    return()=>clearTimeout(t)
  },[winner])

  // tick & win sounds
  const { play: playSfx, sounds: sfx } = useSound({ tick: tickSnd, win: winSnd })

  // play win SFX if the connected wallet is the winner
  useEffect(()=>{
    if (!winner || !currentUser) return
    if (winner.user.equals(currentUser)) {
      try { if (sfx.win?.ready) playSfx('win') } catch {}
    }
  },[winner, currentUser, sfx, playSfx])

  useEffect(()=>{if(closing) onClose?.()},[closing,onClose])

  const winnerPk=winner?.user.toBase58()??''
  const mePk    =currentUser?.toBase58()??''

  // tick sound handled via onUpdate

  return(
    <AnimatePresence>
      {!closing&&(
        <Wrapper
          initial={{opacity:0}}
          animate={{opacity:1}}
          exit={{opacity:0}}
        >
          <ReelContainer>
            <Pointer/>
            <PlayerReel
              ref={reelEl}
              initial={{x:0}}
              animate={{x:offset}}
              transition={{duration:6,ease:[0.22,1,0.36,1],delay:1}}
              onUpdate={({ x }) => {
                const el = reelEl.current
                if (!el || typeof x !== 'number') return
                const pointerX = -x + el.clientWidth / 2
                const centers = centersRef.current
                if (!centers.length) return
                let nearest = 0, best = Infinity
                for (let i = 0; i < centers.length; i++) {
                  const d = Math.abs(centers[i] - pointerX)
                  if (d < best) { best = d; nearest = i }
                }
                if (nearest !== lastTickIndexRef.current) {
                  lastTickIndexRef.current = nearest
                  if (sfx.tick?.ready) playSfx('tick')
                }
              }}
              onAnimationComplete={()=>setSpinDone(true)}
            >
              {reel.map((p,i)=>{
                const addr = p.user.toBase58()
                const win  = addr===winnerPk && i===TARGET
                const you  = addr===mePk
                return(
                  <PlayerCard key={`${addr}-${i}`} $isWinner={win} $isYou={you}>
                    {you&&!win&&<YouBadge>YOU</YouBadge>}
                    <Avatar/>
                    <PlayerAddress>{short(addr)}</PlayerAddress>
                  </PlayerCard>
                )
              })}
            </PlayerReel>
          </ReelContainer>

          <BottomBar>
            <AnimatePresence>
              {winner&&(
                <WinnerText
                  initial={{opacity:0,y:20}}
                  animate={{opacity:1,y:0}}
                  exit={{opacity:0}}
                  transition={{delay:.2}}
                >
                  Winner: {short(winnerPk)}
                </WinnerText>
              )}
            </AnimatePresence>
          </BottomBar>
        </Wrapper>
      )}
    </AnimatePresence>
  )
}

export default WinnerAnimation
