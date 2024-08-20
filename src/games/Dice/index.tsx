import React from 'react'
import { BPS_PER_WHOLE } from 'gamba-core-v2'
import { GambaUi, TokenValue, useCurrentPool, useSound, useWagerInput } from 'gamba-react-ui-v2'
import { useGamba } from 'gamba-react-v2'
import { SOUND_LOSE, SOUND_PLAY, SOUND_WIN } from './constants'
import styled from 'styled-components'

const LANES = 4
const MULTIPLIER = 3.5 // Fixed multiplier for simplicity
const RACE_DURATION = 4000 // 4 seconds in milliseconds
const SYMBOLS = ['!', '?', '$', '%']

const CompactContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 400px;
  margin: 0 auto;
`

const RaceTrack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 20px 0;
  position: relative;
`

const Lane = styled.div`
  height: 50px;
  background-color: ${props => props.selected ? '#4CAF50' : '#ddd'};
  position: relative;
  cursor: pointer;
  transition: background-color 0.3s;
`

const Symbol = styled.div`
  position: absolute;
  left: ${props => props.progress * 100}%;
  top: 50%;
  transform: translate(-50%, -50%);
  font-size: 24px;
  transition: left 0.05s linear;
`

const Stats = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
`

const StatItem = styled.div`
  text-align: center;
`

const calculateOutcomes = () => {
  const winProbability = 1 / LANES
  const loseProbability = 1 - winProbability
  
  return Array(LANES).fill(0).map((_, index) => {
    if (index === 0) {
      // Winning outcome
      return Number((BigInt(MULTIPLIER * BPS_PER_WHOLE) * BigInt(winProbability * BPS_PER_WHOLE)) / BigInt(BPS_PER_WHOLE))
    } else {
      // Losing outcomes
      return Number((BigInt(loseProbability * BPS_PER_WHOLE) / BigInt(LANES - 1)))
    }
  })
}

function RacingGame() {
  const gamba = useGamba()
  const [wager, setWager] = useWagerInput()
  const pool = useCurrentPool()
  const [resultIndex, setResultIndex] = React.useState(-1)
  const [selectedLane, setSelectedLane] = React.useState(0)
  const [raceProgress, setRaceProgress] = React.useState(Array(LANES).fill(0))
  const [isRacing, setIsRacing] = React.useState(false)
  const sounds = useSound({
    win: SOUND_WIN,
    play: SOUND_PLAY,
    lose: SOUND_LOSE,
  })

  const bet = React.useMemo(() => calculateOutcomes(), [])

  const maxWin = MULTIPLIER * wager

  const game = GambaUi.useGame()

  // ... [Keep the runRace function from the previous version] ...

  const play = async () => {
    sounds.play('play')
    setResultIndex(-1)
    setRaceProgress(Array(LANES).fill(0))

    console.log("Current balance before bet:", gamba.balance)
    console.log("Wager amount:", wager)
    console.log("Bet array:", bet)

    try {
      await game.play({
        wager,
        bet,
      })

      const result = await game.result()
      console.log("Game result:", result)
      
      runRace(result.resultIndex)

      setTimeout(() => {
        setResultIndex(result.resultIndex)
        if (result.resultIndex === selectedLane) {
          sounds.play('win')
          console.log("You won! Payout:", result.payout)
        } else {
          sounds.play('lose')
          console.log("You lost.")
        }
        console.log("New balance after bet:", gamba.balance)
      }, RACE_DURATION)
    } catch (error) {
      console.error("Error during play:", error)
    }
  }

  return (
    <CompactContainer>
      <h2>Symbol Racing Game</h2>
      <RaceTrack>
        {[0, 1, 2, 3].map((lane) => (
          <Lane
            key={lane}
            selected={selectedLane === lane}
            onClick={() => !isRacing && setSelectedLane(lane)}
          >
            <Symbol progress={raceProgress[lane]}>
              {SYMBOLS[lane]}
            </Symbol>
          </Lane>
        ))}
        {resultIndex > -1 && !isRacing && (
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: '100%',
              height: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgba(0,0,0,0.7)',
              color: 'white',
              fontSize: '24px',
            }}
          >
            {resultIndex === selectedLane ? 'You Won!' : 'You Lost'}
          </div>
        )}
      </RaceTrack>
      <Stats>
        <StatItem>
          <div>25%</div>
          <div>Win Chance</div>
        </StatItem>
        <StatItem>
          <div>{MULTIPLIER}x</div>
          <div>Multiplier</div>
        </StatItem>
        <StatItem>
          {maxWin > pool.maxPayout ? (
            <div style={{ color: 'red' }}>Too high</div>
          ) : (
            <div><TokenValue suffix="" amount={maxWin} /></div>
          )}
          <div>Potential Win</div>
        </StatItem>
      </Stats>
      <div>Balance: <TokenValue amount={gamba.balance} /></div>
      <GambaUi.WagerInput value={wager} onChange={setWager} />
      <GambaUi.PlayButton onClick={play} disabled={gamba.isPlaying || isRacing}>
        Start Race
      </GambaUi.PlayButton>
    </CompactContainer>
  )
}

export default RacingGame
