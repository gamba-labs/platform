import { useGamba } from 'gamba/react'
import { GameUi, formatLamports } from 'gamba/react-ui'
import React from 'react'
import styles from './App.module.css'
import Slider from './Slider'

import SOUND_LOSE from './lose.mp3'
import SOUND_PLAY from './play.mp3'
import SOUND_TICK from './tick.mp3'
import SOUND_WIN from './win.mp3'

const DICE_SIDES = 100

export default function Dice() {
  const gamba = useGamba()
  const [wager, setWager] = React.useState(0)
  const [rolling, setRolling] = React.useState(false)
  const [resultIndex, setResultIndex] = React.useState(-1)
  const [rollUnderIndex, setRollUnderIndex] = React.useState(Math.floor(DICE_SIDES / 2))

  const sounds = GameUi.useSounds({
    win: SOUND_WIN,
    dice: SOUND_PLAY,
    lose: SOUND_LOSE,
    tick: SOUND_TICK,
  })

  const bet = React.useMemo(
    () => Array
      .from({ length: DICE_SIDES })
      .map((_, i) => i >= rollUnderIndex ? 0 : +(DICE_SIDES / rollUnderIndex).toFixed(4)),
    [rollUnderIndex],
  )

  const multiplier = DICE_SIDES / rollUnderIndex
  const winChange = rollUnderIndex / DICE_SIDES

  const play = async () => {
    try {
      setRolling(true)
      sounds.dice.play()

      const res = await gamba.play({
        bet,
        wager,
      })

      const result = await res.result()
      setResultIndex(result.resultIndex)

      const win = result.payout > 0
      if (win) {
        sounds.win.play()
      } else {
        sounds.lose.play()
      }
    } finally {
      setRolling(false)
    }
  }

  return (
    <GameUi.Fullscreen maxScale={1.5}>
      <GameUi.Controls disabled={rolling}>
        <GameUi.WagerInput
          bet={bet}
          wager={wager}
          onChange={setWager}
        />
        <GameUi.Button variant="primary" onClick={play}>
          Roll
        </GameUi.Button>
      </GameUi.Controls>

      <div className={styles.container}>
        <div className={styles.rollUnder}>
          <div>{rollUnderIndex + 1}</div>
          <div>Roll Under</div>
        </div>
        <div className={styles.stats}>
          <div>
            <div>{(winChange * 100).toFixed(1)}%</div>
            <div>Win Chance</div>
          </div>
          <div>
            <div>{multiplier.toFixed(2)}x</div>
            <div>Multiplier</div>
          </div>
          <div>
            <div>{formatLamports(wager * multiplier - wager)}</div>
            <div>Payout</div>
          </div>
        </div>
        <div className={styles.sliderContainer}>
          {resultIndex > -1 &&
            <div className={styles.result} style={{ left: `${resultIndex}%` }}>
              <div key={resultIndex}>
                {resultIndex + 1}
              </div>
            </div>
          }
          <Slider
            disabled={rolling}
            range={[0, DICE_SIDES]}
            min={1}
            max={DICE_SIDES - 5}
            value={rollUnderIndex}
            onChange={
              (value) => {
                setRollUnderIndex(value)
                sounds.tick.play()
              }
            }
          />
        </div>
      </div>
    </GameUi.Fullscreen>
  )
}
