import React, { useState, useEffect } from 'react';
import { GambaUi, useWagerInput } from 'gamba-react-ui-v2';
import { useGamba } from 'gamba-react-v2';

const RACE_LENGTH = 10;
const WAGER_OPTIONS = [1, 5, 10, 50, 100];
const RACERS = ['🚗', '🏎️', '🚙', '🚓'];
// Fair bet array with varied odds
const BET_ARRAY = [0, 0, 0, 4];

const RacingGame = () => {
  const [wager, setWager] = useWagerInput();
  const [selectedRacer, setSelectedRacer] = useState(0);
  const [raceProgress, setRaceProgress] = useState(Array(RACERS.length).fill(0));
  const [raceStatus, setRaceStatus] = useState('waiting');
  const [winners, setWinners] = useState([]);
  
  const game = GambaUi.useGame();
  const gamba = useGamba();

  const startRace = async () => {
    try {
      setRaceStatus('racing');
      setRaceProgress(Array(RACERS.length).fill(0));
      setWinners([]);

      await game.play({
        bet: BET_ARRAY,
        wager,
        metadata: [selectedRacer],
      });
      const result = await game.result();
      
      // Determine which cars finish based on the result
      const finishingCars = BET_ARRAY.map((bet, index) => bet > 0 && index <= result.resultIndex);

      // Simulate race progress
      for (let step = 0; step < RACE_LENGTH; step++) {
        await new Promise(resolve => setTimeout(resolve, 500));
        setRaceProgress(prev => {
          const newProgress = [...prev];
          for (let i = 0; i < newProgress.length; i++) {
            if (finishingCars[i]) {
              // Winning cars progress steadily
              newProgress[i] = Math.min(step + 1, RACE_LENGTH);
            } else {
              // Losing cars progress randomly but never finish
              newProgress[i] = Math.min(
                newProgress[i] + (Math.random() < 0.5 ? 1 : 0),
                RACE_LENGTH - 1
              );
            }
          }
          return newProgress;
        });
      }

      // Set winners
      setWinners(finishingCars.map((finished, index) => finished ? RACERS[index] : null).filter(Boolean));
      
      // Determine if the player won
      const playerWon = finishingCars[selectedRacer];
      setRaceStatus(playerWon ? 'won' : 'lost');
    } catch (error) {
      console.error('Race error:', error);
      setRaceStatus('error');
    }
  };

  return (
    <>
      <GambaUi.Portal target="screen">
        <div style={{ fontFamily: 'monospace', fontSize: '20px', textAlign: 'center' }}>
          <h2>🏁 Racing Game 🏁</h2>
          {RACERS.map((racer, index) => (
            <div key={index} style={{ margin: '10px 0' }}>
              {racer} {'-'.repeat(raceProgress[index])}
              {winners.includes(racer) && '🏆'}
            </div>
          ))}
          {raceStatus === 'won' && <div style={{ color: 'green' }}>You won! 🎉</div>}
          {raceStatus === 'lost' && <div style={{ color: 'red' }}>You lost! 😢</div>}
          {winners.length > 0 && <div>Winners: {winners.join(', ')}</div>}
        </div>
      </GambaUi.Portal>
      <GambaUi.Portal target="controls">
        <GambaUi.WagerInput
          options={WAGER_OPTIONS}
          value={wager}
          onChange={setWager}
        />
        <GambaUi.Button 
          disabled={gamba.isPlaying} 
          onClick={() => setSelectedRacer((selectedRacer + 1) % RACERS.length)}
        >
          Selected: {RACERS[selectedRacer]}
        </GambaUi.Button>
        <GambaUi.PlayButton onClick={startRace} disabled={raceStatus === 'racing'}>
          {raceStatus === 'racing' ? 'Racing...' : 'Start Race'}
        </GambaUi.PlayButton>
      </GambaUi.Portal>
    </>
  );
};

export default RacingGame;
