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

  const runRace = (winningLane) => {
    setIsRacing(true)
    const startTime = Date.now()
    const interval = setInterval(() => {
      const elapsedTime = Date.now() - startTime
      const progress = Math.min(elapsedTime / RACE_DURATION, 1)
      
      setRaceProgress(prevProgress => prevProgress.map((_, index) => {
        if (index === winningLane) return progress
        if (index === (winningLane + 1) % LANES) return Math.min(progress, 0.75)
        if (index === (winningLane + 2) % LANES) return Math.min(progress, 0.5)
        return Math.min(progress, 0.25)
      }))

      if (progress >= 1) {
        clearInterval(interval)
        setIsRacing(false)
      }
    }, 50)
  }

  const play = async () => {
    sounds.play('play')
    setResultIndex(-1)
    setRaceProgress(Array(LANES).fill(0))

    await game.play({
      wager,
      bet,
    })

    const result = await game.result()
    runRace(result.resultIndex)

    setTimeout(() => {
      setResultIndex(result.resultIndex)
      if (result.resultIndex === selectedLane) {
        sounds.play('win')
      } else {
        sounds.play('lose')
      }
    }, RACE_DURATION)
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
      <GambaUi.WagerInput value={wager} onChange={setWager} />
      <GambaUi.PlayButton onClick={play} disabled={gamba.isPlaying || isRacing}>
        Start Race
      </GambaUi.PlayButton>
    </CompactContainer>
  )
}

export default RacingGame
