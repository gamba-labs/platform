import { GameResult } from 'gamba-core-v2'
import { EffectTest, GambaUi, TokenValue, useCurrentPool, useSound, useWagerInput } from 'gamba-react-ui-v2'
import React, { useEffect, useRef } from 'react'
import { ItemPreview } from './ItemPreview'
import { Slot } from './Slot'
import { StyledSlots } from './Slots.styles'
import {
  FINAL_DELAY,
  LEGENDARY_THRESHOLD,
  NUM_SLOTS,
  REVEAL_SLOT_DELAY,
  SLOT_ITEMS,
  SOUND_LOSE,
  SOUND_PLAY,
  SOUND_REVEAL,
  SOUND_REVEAL_LEGENDARY,
  SOUND_SPIN,
  SOUND_WIN,
  SPIN_DELAY,
  SlotItem,
} from './constants'
import { generateBetArray, getSlotCombination } from './utils'

function Messages({ messages }: {messages: string[]}) {
  const [messageIndex, setMessageIndex] = React.useState(0)
  React.useEffect(
    () => {
      const timeout = setInterval(() => {
        setMessageIndex((x) => (x + 1) % messages.length)
      }, 2500)
      return () => clearInterval(timeout)
    },
    [messages],
  )
  return (
    <>
      {messages[messageIndex]}
    </>
  )
}

export default function Slots() {
  const gamba = GambaUi.useGame()
  const game = GambaUi.useGame()
  const pool = useCurrentPool()
  const [spinning, setSpinning] = React.useState(false)
  const [result, setResult] = React.useState<GameResult>()
  const [good, setGood] = React.useState(false)
  const [revealedSlots, setRevealedSlots] = React.useState(NUM_SLOTS)
  const [wager, setWager] = useWagerInput()
  const [combination, setCombination] = React.useState(
    Array.from({ length: NUM_SLOTS }).map(() => SLOT_ITEMS[0]),
  )
  const sounds = useSound({
    win: SOUND_WIN,
    lose: SOUND_LOSE,
    reveal: SOUND_REVEAL,
    revealLegendary: SOUND_REVEAL_LEGENDARY,
    spin: SOUND_SPIN,
    play: SOUND_PLAY,
  })
  const bet = React.useMemo(
    () => generateBetArray(pool.maxPayout, wager),
    [pool.maxPayout, wager],
  )
  const timeout = useRef<any>()

  const isValid = bet.some((x) => x > 1)

  useEffect(
    () => {
      // Clear timeout when user leaves
      return () => {
        timeout.current && clearTimeout(timeout.current)
      }
    },
    [],
  )

  const revealSlot = (combination: SlotItem[], slot = 0) => {
    sounds.play('reveal', { playbackRate: 1.1 })

    const allSame = combination.slice(0, slot + 1).every((item, index, arr) => !index || item === arr[index - 1])

    if (combination[slot].multiplier >= LEGENDARY_THRESHOLD) {
      if (allSame) {
        sounds.play('revealLegendary')
      }
    }

    setRevealedSlots(slot + 1)

    if (slot < NUM_SLOTS - 1) {
      // Reveal next slot
      timeout.current = setTimeout(
        () => revealSlot(combination, slot + 1),
        REVEAL_SLOT_DELAY,
      )
    } else if (slot === NUM_SLOTS - 1) {
      // Show final results
      sounds.sounds.spin.player.stop()
      timeout.current = setTimeout(() => {
        setSpinning(false)
        if (allSame) {
          setGood(true)
          sounds.play('win')
        } else {
          sounds.play('lose')
        }
      }, FINAL_DELAY)
    }
  }

  const play = async () => {
    try {
      setSpinning(true)
      setResult(undefined)

      await game.play({
        wager,
        bet,
      })

      sounds.play('play')

      setRevealedSlots(0)
      setGood(false)

      const startTime = Date.now()

      sounds.play('spin', { playbackRate: .5 })

      const result = await gamba.result()

      // Make sure we wait a minimum time of SPIN_DELAY before slots are revealed:
      const resultDelay = Date.now() - startTime
      const revealDelay = Math.max(0, SPIN_DELAY - resultDelay)

      const combination = getSlotCombination(NUM_SLOTS, result.multiplier, bet)

      setCombination(combination)

      setResult(result)

      timeout.current = setTimeout(() => revealSlot(combination), revealDelay)
    } catch (err) {
      // Reset if there's an error
      setSpinning(false)
      setRevealedSlots(NUM_SLOTS)
      throw err
    }
  }

  return (
    <>
      <GambaUi.Portal target="screen">
        {good && <EffectTest src={combination[0].image} />}
        <GambaUi.Responsive>
          <StyledSlots>
            <div>
              <ItemPreview betArray={bet} />
              <div className={'slots'}>
                {combination.map((slot, i) => (
                  <Slot
                    key={i}
                    index={i}
                    revealed={revealedSlots > i}
                    item={slot}
                    good={good}
                  />
                ))}
              </div>
              <div className="result" data-good={good}>
                {spinning ? (
                  <Messages
                    messages={[
                      'Spinning!',
                      'Good luck',
                    ]}
                  />
                ) : result ? (
                  <>
                    Payout: <TokenValue mint={result.token} amount={result.payout} />
                  </>
                ) : isValid ? (
                  <Messages
                    messages={[
                      'SPIN ME!',
                      'FEELING LUCKY?',
                    ]}
                  />
                ) : (
                  <>
                    ❌ Choose a lower wager!
                  </>
                )}
              </div>
            </div>
          </StyledSlots>
        </GambaUi.Responsive>
      </GambaUi.Portal>
      <GambaUi.Portal target="controls">
        <GambaUi.WagerInput value={wager} onChange={setWager} />
        <GambaUi.PlayButton disabled={!isValid} onClick={play}>
          Spin
        </GambaUi.PlayButton>
      </GambaUi.Portal>
    </>
  )
}
