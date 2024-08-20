import React from 'react'
import { BPS_PER_WHOLE } from 'gamba-core-v2'
import { GambaUi, TokenValue, useCurrentPool, useSound, useWagerInput } from 'gamba-react-ui-v2'
import { useGamba } from 'gamba-react-v2'
import { SOUND_LOSE, SOUND_PLAY, SOUND_WIN } from './constants'
import { Container, Result, Stats } from './styles'

const LANES = 4
const MULTIPLIER = 3.5 // Fixed multiplier for simplicity

const calculateOutcomes = () => {
  const payoutArray = Array(LANES).fill(MULTIPLIER)
  const totalValue = payoutArray.reduce((p, x) => p + x, 0)
  return payoutArray.map((x) => Number(BigInt(x * BPS_PER_WHOLE) / BigInt(totalValue) * BigInt(LANES)) / BPS_PER_WHOLE)
}

function RacingGame() {
  const gamba = useGamba()
  const [wager, setWager] = useWagerInput()
  const pool = useCurrentPool()
  const [resultIndex, setResultIndex] = React.useState(-1)
  const [selectedLane, setSelectedLane] = React.useState(0)
  const sounds = useSound({
    win: SOUND_WIN,
    play: SOUND_PLAY,
    lose: SOUND_LOSE,
  })

  const bet = React.useMemo(() => calculateOutcomes(), [])

  const maxWin = MULTIPLIER * wager

  const game = GambaUi.useGame()

  const play = async () => {
    sounds.play('play')

    await game.play({
      wager,
      bet,
    })

    const result = await game.result()

    setResultIndex(result.resultIndex)

    if (result.resultIndex === selectedLane) {
      sounds.play('win')
    } else {
      sounds.play('lose')
    }
  }

  return (
    <Container>
      <h2>Racing Game</h2>
      <div>Select your lane:</div>
      <div style={{ display: 'flex', justifyContent: 'space-around', margin: '20px 0' }}>
        {[1, 2, 3, 4].map((lane, index) => (
          <button
            key={lane}
            onClick={() => setSelectedLane(index)}
            style={{
              padding: '10px 20px',
              backgroundColor: selectedLane === index ? 'green' : 'gray',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Lane {lane}
          </button>
        ))}
      </div>
      <Stats>
        <div>
          <div>25%</div>
          <div>Win Chance</div>
        </div>
        <div>
          <div>{MULTIPLIER}x</div>
          <div>Multiplier</div>
        </div>
        <div>
          {maxWin > pool.maxPayout ? (
            <div style={{ color: 'red' }}>Too high</div>
          ) : (
            <div><TokenValue suffix="" amount={maxWin} /></div>
          )}
          <div>Potential Win</div>
        </div>
      </Stats>
      {resultIndex > -1 && (
        <Result>
          <div>
            {resultIndex === selectedLane ? 'You won!' : 'You lost.'}
            <div>Winning lane: {resultIndex + 1}</div>
          </div>
        </Result>
      )}
      <GambaUi.WagerInput value={wager} onChange={setWager} />
      <GambaUi.PlayButton onClick={play} disabled={gamba.isPlaying}>
        Start Race
      </GambaUi.PlayButton>
    </Container>
  )
}

export default RacingGame
