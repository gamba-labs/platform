import { GameResult, lamportsToSol } from 'gamba'
import { useGamba, useGambaEvents } from 'gamba/react'
import { formatLamports } from 'gamba/react-ui'
import React from 'react'
import { Icon } from '../components/Icon'
import { Section } from '../components/Section'
import { cx } from '../utils'
import styles from './RecentPlays.module.css'

const VERIFY_URL = 'https://explorer.gamba.so/tx'

const TimeDiff: React.FC<{time: number}> = ({ time }) => {
  const diff = (Date.now() - time)
  return React.useMemo(() => {
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    if (hours >= 1) {
      return hours + 'h ago'
    }
    if (minutes >= 1) {
      return minutes + 'm ago'
    }
    return 'Just now'
  }, [diff])
}

interface RecentPlayProps {
  result: GameResult
  isSelf: boolean
  signature: string
  time: number
}

function RecentPlay({ time, signature, result, isSelf }: RecentPlayProps) {
  const wager = result.wager
  const multiplier = result.multiplier
  const payout = wager * multiplier
  const profit = wager * multiplier - wager
  const win = profit >= 0
  const isRekt = payout === 0
  const whaleScore = Math.log10(lamportsToSol(wager) / 0.1)
  const litScore = multiplier - 1

  return (
    <a className={styles.play} href={`${VERIFY_URL}/${signature}`} target="_blank" rel="noreferrer">
      <div>
        <span className={styles.who}>
          {isSelf ? 'You' : 'Someone'}
          {/* {result.player.toBase58()} */}
        </span>
        made
        <span>
          <span className={cx(styles.amount, win && styles.win)}>
            {formatLamports(payout)} from {formatLamports(wager)}
          </span>
        </span>
        <span className={styles.flares}>
          {whaleScore > 0 && '🐋'.repeat(whaleScore)}
          {isRekt && '💀'}
          {litScore > 0 && '🔥'.repeat(litScore)}
        </span>
      </div>
      <span>
        <TimeDiff time={time} /> <Icon.ExternalLink />
      </span>
    </a>
  )
}

export function RecentPlays() {
  const gamba = useGamba()
  const events = useGambaEvents()

  return (
    <Section title="Recent Plays">
      <div className={styles.container}>
        {events.map(({ signature, event, time }) => (
          <RecentPlay
            key={signature}
            time={time}
            signature={signature}
            result={event.gameResult}
            isSelf={event.gameResult.player.equals(gamba.wallet.publicKey)}
          />
        ))}
        {!events.length && Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className={styles.skeleton} />
        ))}
      </div>
    </Section>
  )
}
