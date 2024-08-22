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
  const [winner, setWinner] = useState(null);
  
  const game = GambaUi.useGame();
  const gamba = useGamba();

  const startRace = async () => {
    try {
      setRaceStatus('racing');
      setRaceProgress(Array(RACERS.length).fill(0));
      setWinner(null);

      await game.play({
        bet: BET_ARRAY,
        wager,
        metadata: [selectedRacer],
      });

      const result = await game.result();
      const raceWinner = result.resultIndex;

      // Simulate race progress based on the smart contract result
      for (let step = 0; step < RACE_LENGTH; step++) {
        await new Promise(resolve => setTimeout(resolve, 500));
        setRaceProgress(prev => {
          const newProgress = [...prev];
          const maxProgressThisStep = step + 1;

          // Ensure the winner is always in the lead or tied for the lead
          newProgress[raceWinner] = maxProgressThisStep;

          // Update other racers
          for (let i = 0; i < newProgress.length; i++) {
            if (i !== raceWinner) {
              // Other racers progress randomly but never surpass the winner
              newProgress[i] = Math.min(
                newProgress[i] + (Math.random() < 0.7 ? 1 : 0),
                maxProgressThisStep - 1
              );
            }
          }

          return newProgress;
        });
      }

      setWinner(raceWinner);
      setRaceStatus(result.payout > 0 ? 'won' : 'lost');
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
              {index === winner && '🏆'}
            </div>
          ))}
          {raceStatus === 'won' && <div style={{ color: 'green' }}>You won! 🎉</div>}
          {raceStatus === 'lost' && <div style={{ color: 'red' }}>You lost! 😢</div>}
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
