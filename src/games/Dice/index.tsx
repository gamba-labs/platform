import React from 'react'
import { BPS_PER_WHOLE } from 'gamba-core-v2'
import { GambaUi, TokenValue, useCurrentPool, useSound, useWagerInput } from 'gamba-react-ui-v2'
import { useGamba } from 'gamba-react-v2'
import Slider from './Slider'
import { SOUND_LOSE, SOUND_PLAY, SOUND_TICK, SOUND_WIN } from './constants'
import { Container, Result, RollUnder, Stats } from './styles'

const DICE_SIDES = 100

const calculateOutcomes = (length: number, multiplierCallback: (resultIndex: number) => number) => {
  const payoutArray = Array.from({ length }, (_, resultIndex) => multiplierCallback(resultIndex))
  const totalValue = payoutArray.reduce((p, x) => p + x, 0)
  return payoutArray.map((x) => Number(BigInt(x * BPS_PER_WHOLE) / BigInt(totalValue || 1) * BigInt(length)) / BPS_PER_WHOLE)
}

export default function Dice() {
  const gamba = useGamba()
  const [wager, setWager] = useWagerInput()
  const pool = useCurrentPool()
  const [gameState, setGameState] = React.useState({
    resultIndex: -1,
    rollUnderIndex: Math.floor(DICE_SIDES / 2),
    consecutiveWins: 0,
    isDoubleOrNothing: false,
  })
  const sounds = useSound({
    win: SOUND_WIN,
    play: SOUND_PLAY,
    lose: SOUND_LOSE,
    tick: SOUND_TICK,
  })

  const getMultiplier = React.useCallback((index: number) => {
    let baseMultiplier = Number(BigInt(DICE_SIDES * BPS_PER_WHOLE) / BigInt(index)) / BPS_PER_WHOLE
    baseMultiplier *= (1 + gameState.consecutiveWins * 0.1)
    if (index === 7 || index === 77) {
      baseMultiplier *= 2
    }
    return baseMultiplier
  }, [gameState.consecutiveWins])

  const multiplier = getMultiplier(gameState.rollUnderIndex)

  const bet = React.useMemo(() => calculateOutcomes(
    DICE_SIDES,
    (resultIndex) => resultIndex < gameState.rollUnderIndex ? getMultiplier(gameState.rollUnderIndex) : 0
  ), [gameState.rollUnderIndex, getMultiplier])

  const maxWin = multiplier * wager

  const game = GambaUi.useGame()

  const play = React.useCallback(async () => {
    try {
      sounds.play('play')
      const playWager = gameState.isDoubleOrNothing ? wager * 2 : wager

      await game.play({ wager: playWager, bet })
      const result = await game.result()

      setGameState(prevState => {
        const newState = { ...prevState, resultIndex: result.resultIndex, isDoubleOrNothing: false }
        if (result.resultIndex < prevState.rollUnderIndex) {
          sounds.play('win')
          newState.consecutiveWins = prevState.consecutiveWins + 1
        } else {
          sounds.play('lose')
          newState.consecutiveWins = 0
        }
        return newState
      })
    } catch (error) {
      console.error("Error during play:", error)
      // Handle error (e.g., show error message to user)
    }
  }, [game, wager, bet, gameState.isDoubleOrNothing, sounds])

  const handleDoubleOrNothing = React.useCallback(() => {
    setGameState(prevState => ({
      ...prevState,
      isDoubleOrNothing: true,
      rollUnderIndex: Math.max(prevState.rollUnderIndex - 10, 1)
    }))
  }, [])

  const handleSliderChange = React.useCallback((value: number) => {
    setGameState(prevState => ({ ...prevState, rollUnderIndex: value }))
    sounds.play('tick')
  }, [sounds])

  return (
    <>
      <GambaUi.Portal target="screen">
        <GambaUi.Responsive>
          <Container>
            <RollUnder>
              <div>
                <div>{gameState.rollUnderIndex + 1}</div>
                <div>Roll Under</div>
              </div>
            </RollUnder>
            <Stats>
              <div>
                <div>{(gameState.rollUnderIndex / DICE_SIDES * 100).toFixed(0)}%</div>
                <div>Win Chance</div>
              </div>
              <div>
                <div>{multiplier.toFixed(2)}x</div>
                <div>Multiplier</div>
              </div>
              <div>
                {maxWin > pool.maxPayout ? (
                  <div style={{ color: 'red' }}>Too high</div>
                ) : (
                  <div><TokenValue suffix="" amount={maxWin} /></div>
                )}
                <div>Payout</div>
              </div>
              <div>
                <div>{gameState.consecutiveWins}</div>
                <div>Win Streak</div>
              </div>
            </Stats>
            <div style={{ position: 'relative' }}>
              {gameState.resultIndex > -1 && (
                <Result style={{ left: `${gameState.resultIndex / DICE_SIDES * 100}%` }}>
                  <div key={gameState.resultIndex}>{gameState.resultIndex + 1}</div>
                </Result>
              )}
              <Slider
                disabled={gamba.isPlaying}
                range={[0, DICE_SIDES]}
                min={1}
                max={DICE_SIDES - 5}
                value={gameState.rollUnderIndex}
                onChange={handleSliderChange}
              />
            </div>
          </Container>
        </GambaUi.Responsive>
      </GambaUi.Portal>
      <GambaUi.Portal target="controls">
        <GambaUi.WagerInput value={wager} onChange={setWager} />
        <GambaUi.PlayButton onClick={play} disabled={gamba.isPlaying}>
          {gameState.isDoubleOrNothing ? 'Double or Nothing!' : 'Roll'}
        </GambaUi.PlayButton>
        {gameState.resultIndex > -1 && gameState.resultIndex < gameState.rollUnderIndex && !gameState.isDoubleOrNothing && (
          <GambaUi.Button onClick={handleDoubleOrNothing} disabled={gamba.isPlaying}>
            Double or Nothing
          </GambaUi.Button>
        )}
      </GambaUi.Portal>
    </>
  )
}
