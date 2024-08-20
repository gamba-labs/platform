import React, { useState, useEffect } from 'react';
import { GambaUi, useWagerInput } from 'gamba-react-ui-v2';
import { useGamba } from 'gamba-react-v2';

const RACE_LENGTH = 10;
const WAGER_OPTIONS = [1, 5, 10, 50, 100];
const RACERS = ['🚗', '🏎️', '🚙', '🚓'];
const BET_ARRAY = [0, 0, 0, 4];
const RACE_INTERVAL = 5 * 60 * 1000; // 5 minutes in milliseconds

const RacingGame = () => {
  const [wager, setWager] = useWagerInput();
  const [selectedRacer, setSelectedRacer] = useState(0);
  const [raceProgress, setRaceProgress] = useState(Array(RACERS.length).fill(0));
  const [raceStatus, setRaceStatus] = useState('waiting');
  const [winner, setWinner] = useState(null);
  const [nextRaceTime, setNextRaceTime] = useState(0);
  const [bets, setBets] = useState(Array(RACERS.length).fill(0));
  
  const game = GambaUi.useGame();
  const gamba = useGamba();

  useEffect(() => {
    const now = Date.now();
    const nextRace = Math.ceil(now / RACE_INTERVAL) * RACE_INTERVAL;
    setNextRaceTime(nextRace);

    const timer = setInterval(() => {
      const timeLeft = nextRace - Date.now();
      if (timeLeft <= 0) {
        clearInterval(timer);
        startRace();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [raceStatus]);

  const placeBet = async () => {
    try {
      await game.play({
        bet: BET_ARRAY,
        wager,
        metadata: [selectedRacer],
      });
      setBets(prev => {
        const newBets = [...prev];
        newBets[selectedRacer] += wager;
        return newBets;
      });
    } catch (error) {
      console.error('Bet error:', error);
    }
  };

  const startRace = async () => {
    setRaceStatus('racing');
    setRaceProgress(Array(RACERS.length).fill(0));
    setWinner(null);

    const result = await game.result();
    const raceWinner = result.resultIndex;

    for (let i = 0; i < RACE_LENGTH; i++) {
      await new Promise(resolve => setTimeout(resolve, 500));
      setRaceProgress(prev => prev.map((p, idx) => 
        idx === raceWinner ? Math.min(p + 2, RACE_LENGTH) : Math.min(p + Math.random(), RACE_LENGTH)
      ));
    }

    setWinner(raceWinner);
    setRaceStatus(result.payout > 0 ? 'won' : 'lost');
    
    // Reset for next race
    setTimeout(() => {
      setRaceStatus('waiting');
      setBets(Array(RACERS.length).fill(0));
      const nextRace = Math.ceil(Date.now() / RACE_INTERVAL) * RACE_INTERVAL;
      setNextRaceTime(nextRace);
    }, 5000);
  };

  return (
    <>
      <GambaUi.Portal target="screen">
        <div style={{ fontFamily: 'monospace', fontSize: '20px', textAlign: 'center' }}>
          <h2>🏁 Racing Game 🏁</h2>
          {raceStatus === 'waiting' && (
            <div>Next race in: {Math.floor((nextRaceTime - Date.now()) / 1000)} seconds</div>
          )}
          {RACERS.map((racer, index) => (
            <div key={index} style={{ margin: '10px 0' }}>
              {racer} {'-'.repeat(raceProgress[index])}
              {raceProgress[index] === RACE_LENGTH && '🏆'}
              <span style={{ marginLeft: '10px' }}>Bets: {bets[index]}</span>
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
          disabled={gamba.isPlaying || raceStatus === 'racing'} 
          onClick={() => setSelectedRacer((selectedRacer + 1) % RACERS.length)}
        >
          Selected: {RACERS[selectedRacer]}
        </GambaUi.Button>
        <GambaUi.PlayButton onClick={placeBet} disabled={raceStatus === 'racing'}>
          Place Bet
        </GambaUi.PlayButton>
      </GambaUi.Portal>
    </>
  );
};

export default RacingGame;
