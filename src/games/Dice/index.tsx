import React, { useState, useEffect, useCallback } from 'react';
import { GambaUi, useWagerInput } from 'gamba-react-ui-v2';
import { useGamba } from 'gamba-react-v2';

const RACE_LENGTH = 10;
const WAGER_OPTIONS = [1, 5, 10, 50, 100];
const RACERS = ['🚗', '🏎️', '🚙', '🚓'];
const BET_ARRAY = [0, 0, 0, 4];

type Racer = 0 | 1 | 2 | 3;

function RacingGame() {
  const game = GambaUi.useGame();
  const gamba = useGamba();
  const [wager, setWager] = useWagerInput();
  
  const [racing, setRacing] = useState(false);
  const [win, setWin] = useState<boolean | null>(null);
  const [resultIndex, setResultIndex] = useState<number | null>(null);
  const [selectedRacer, setSelectedRacer] = useState<Racer>(0);
  const [raceProgress, setRaceProgress] = useState(Array(RACERS.length).fill(0));

  const log = useCallback((message: string) => {
    console.log(`${new Date().toISOString()}: ${message}`);
  }, []);

  const placeBet = async () => {
    if (racing) return;
    
    setRacing(true);
    try {
      log('Placing bet...');
      const result = await game.play({
        bet: BET_ARRAY,
        wager,
        metadata: [selectedRacer],
      });
      log(`Bet placed. Result: ${JSON.stringify(result)}`);
      
      setResultIndex(result.resultIndex);
      setWin(result.payout > 0);
      
      log(`Result index: ${result.resultIndex}, Win: ${result.payout > 0}`);
      
      await runRace(result.resultIndex);
    } catch (error) {
      log(`Bet error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setRacing(false);
    }
  };

  const runRace = async (winnerIndex: number) => {
    log(`Starting race animation. Winner index: ${winnerIndex}`);

    for (let step = 0; step <= RACE_LENGTH; step++) {
      setRaceProgress(prev => {
        const newProgress = [...prev];
        const maxProgressThisStep = step;
        newProgress[winnerIndex] = maxProgressThisStep;
        for (let i = 0; i < newProgress.length; i++) {
          if (i !== winnerIndex) {
            newProgress[i] = Math.min(
              newProgress[i] + (Math.random() < 0.7 ? 1 : 0),
              maxProgressThisStep - 1
            );
          }
        }
        return newProgress;
      });

      await new Promise(resolve => setTimeout(resolve, 2000 / RACE_LENGTH));
    }

    log(`Race finished. Winner: ${RACERS[winnerIndex]}`);
  };

  useEffect(() => {
    if (!racing) {
      setRaceProgress(Array(RACERS.length).fill(0));
    }
  }, [racing]);

  return (
    <>
      <GambaUi.Portal target="screen">
        <div style={{ fontFamily: 'monospace', fontSize: '20px', textAlign: 'center' }}>
          <h2>🏁 Racing Game 🏁</h2>
          {RACERS.map((racer, index) => (
            <div key={index} style={{ margin: '10px 0' }}>
              {racer} {'-'.repeat(raceProgress[index])} {index === resultIndex && !racing && '🏆'}
            </div>
          ))}
          {win !== null && !racing && (
            <div style={{ color: win ? 'green' : 'red' }}>
              {win ? 'You won! 🎉' : 'You lost! 😢'}
            </div>
          )}
        </div>
      </GambaUi.Portal>
      <GambaUi.Portal target="controls">
        <GambaUi.WagerInput
          options={WAGER_OPTIONS}
          value={wager}
          onChange={setWager}
          disabled={racing}
        />
        <GambaUi.Button
          disabled={racing}
          onClick={() => setSelectedRacer((selectedRacer + 1) % RACERS.length as Racer)}
        >
          Selected: {RACERS[selectedRacer]}
        </GambaUi.Button>
        <GambaUi.PlayButton
          onClick={placeBet}
          disabled={racing || gamba.isPlaying}
        >
          {racing ? 'Racing...' : 'Start Race'}
        </GambaUi.PlayButton>
      </GambaUi.Portal>
    </>
  );
}

export default RacingGame;
