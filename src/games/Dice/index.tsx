import React from 'react'
import { GambaUi, useSound } from 'gamba-react-ui-v2'
import { useGamba } from 'gamba-react-v2'
import styled from 'styled-components'
import { SOUND_LOSE, SOUND_PLAY, SOUND_WIN } from './constants'

const LANES = 4
const SYMBOLS = ['!', '?', '$', '%']
const RACE_DURATION = 4000 // 4 seconds in milliseconds
const MULTIPLIER = 3.5

// Correct bet array as per Gamba documentation
const BET_ARRAY = [3.5, 0, 0, 0]

const Container = styled.div`
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
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

const Result = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0,0,0,0.7);
  color: white;
  font-size: 24px;
`

function RacingGame() {
  const game = GambaUi.useGame()
  const gamba = useGamba()
  const [wager, setWager] = React.useState(1)
  const [selectedLane, setSelectedLane] = React.useState(0)
  const [raceProgress, setRaceProgress] = React.useState(Array(LANES).fill(0))
  const [isRacing, setIsRacing] = React.useState(false)
  const [resultIndex, setResultIndex] = React.useState(-1)
  const [win, setWin] = React.useState(false)
  
  const sounds = useSound({
    play: SOUND_PLAY,
    win: SOUND_WIN,
    lose: SOUND_LOSE,
  })

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
    try {
      setWin(false)
      setIsRacing(true)
      setResultIndex(-1)
      setRaceProgress(Array(LANES).fill(0))
      sounds.play('play')

      // Use the correct bet array and adjust it based on the selected lane
      const adjustedBetArray = [...BET_ARRAY]
      if (selectedLane !== 0) {
        adjustedBetArray.unshift(...adjustedBetArray.splice(selectedLane))
      }

      await game.play({
        bet: adjustedBetArray,
        wager,
      })

      const result = await game.result()
      runRace(result.resultIndex)

      setTimeout(() => {
        setResultIndex(result.resultIndex)
        const win = result.payout > 0
        setWin(win)
        if (win) {
          sounds.play('win')
        } else {
          sounds.play('lose')
        }
      }, RACE_DURATION)
    } catch (error) {
      console.error("Error during play:", error)
    } finally {
      setIsRacing(false)
    }
  }

  return (
    <Container>
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
          <Result>
            {win ? 'You Won!' : 'You Lost'}
          </Result>
        )}
      </RaceTrack>
      <div>Balance: {gamba.balance.toString()}</div>
      <div>Selected: {SYMBOLS[selectedLane]}</div>
      <div>Potential Win: {(wager * MULTIPLIER).toFixed(2)}</div>
      <GambaUi.WagerInput
        value={wager}
        onChange={setWager}
      />
      <GambaUi.Button 
        disabled={isRacing} 
        onClick={() => setSelectedLane((selectedLane + 1) % LANES)}
      >
        Change Lane
      </GambaUi.Button>
      <GambaUi.PlayButton onClick={play} disabled={gamba.isPlaying || isRacing}>
        Start Race
      </GambaUi.PlayButton>
    </Container>
  )
}

export default RacingGame
