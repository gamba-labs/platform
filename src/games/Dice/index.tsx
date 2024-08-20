import React from 'react'
import { useGamba } from 'gamba-react-v2'

const LANES = 4
const SYMBOLS = ['!', '?', '$', '%']
const WAGER_OPTIONS = [1, 5, 10, 50, 100]

const BETS = {
  '0': [3.5, 0, 0, 0],
  '1': [0, 3.5, 0, 0],
  '2': [0, 0, 3.5, 0],
  '3': [0, 0, 0, 3.5],
}

function BasicRacingGame() {
  const gamba = useGamba()
  const [wager, setWager] = React.useState(WAGER_OPTIONS[0])
  const [selectedLane, setSelectedLane] = React.useState(0)
  const [result, setResult] = React.useState(null)
  const [error, setError] = React.useState(null)

  const play = async () => {
    try {
      setError(null)
      setResult(null)
      const result = await gamba.play({
        bet: BETS[selectedLane.toString()],
        wager,
      })
      setResult(result)
    } catch (err) {
      console.error("Error during play:", err)
      setError(err.message)
    }
  }

  return (
    <div>
      <h2>Basic Racing Game</h2>
      <div>
        {SYMBOLS.map((symbol, index) => (
          <button 
            key={index}
            onClick={() => setSelectedLane(index)}
            style={{backgroundColor: selectedLane === index ? 'lightblue' : 'white'}}
          >
            {symbol}
          </button>
        ))}
      </div>
      <div>Selected: {SYMBOLS[selectedLane]}</div>
      <div>Balance: {gamba.balance.toString()}</div>
      <select value={wager} onChange={(e) => setWager(Number(e.target.value))}>
        {WAGER_OPTIONS.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
      <button onClick={play} disabled={gamba.isPlaying}>
        Play
      </button>
      {result && (
        <div>
          Result: {result.payout > 0 ? 'Win!' : 'Lose'} 
          (Lane: {result.resultIndex + 1})
        </div>
      )}
      {error && <div style={{color: 'red'}}>Error: {error}</div>}
    </div>
  )
}

export default BasicRacingGame
