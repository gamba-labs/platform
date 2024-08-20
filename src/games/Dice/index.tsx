import React from 'react'
import { GambaUi } from 'gamba-react-ui-v2'
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

function MinimalRacingGame() {
  const game = GambaUi.useGame()
  const gamba = useGamba()
  const [wager, setWager] = React.useState(WAGER_OPTIONS[0])
  const [selectedLane, setSelectedLane] = React.useState(0)
  const [result, setResult] = React.useState(null)

  const play = async () => {
    try {
      setResult(null)
      await game.play({
        bet: BETS[selectedLane.toString()],
        wager,
      })
      const gameResult = await game.result()
      setResult(gameResult)
    } catch (error) {
      console.error("Error during play:", error)
    }
  }

  return (
    <div>
      <h2>Minimal Racing Game</h2>
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
      <GambaUi.WagerInput
        options={WAGER_OPTIONS}
        value={wager}
        onChange={setWager}
      />
      <GambaUi.PlayButton onClick={play}>
        Play
      </GambaUi.PlayButton>
      {result && (
        <div>
          Result: {result.payout > 0 ? 'Win!' : 'Lose'} 
          (Lane: {result.resultIndex + 1})
        </div>
      )}
    </div>
  )
}

export default MinimalRacingGame
