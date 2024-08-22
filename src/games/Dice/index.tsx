import React, { useState, useEffect } from 'react';
import { GambaUi, useWagerInput } from 'gamba-react-ui-v2';
import { useGamba } from 'gamba-react-v2';

const RACE_LENGTH = 10;
const WAGER_OPTIONS = [1, 5, 10, 50, 100];
const RACERS = ['🚗', '🏎️', '🚙', '🚓'];
const BET_ARRAY = [0, 0, 0, 4];
const BETTING_WINDOW = 30000; // 30 seconds
const RACE_DURATION = 20000; // 20 seconds
const COOLDOWN = 10000; // 10 seconds
const TOTAL_CYCLE = BETTING_WINDOW + RACE_DURATION + COOLDOWN;

const getWorldTime = async () => {
  try {
    const response = await fetch("http://worldtimeapi.org/api/timezone/America/Los_Angeles");
    const data = await response.json();
    return data.unixtime * 1000; // Convert to milliseconds
  } catch (error) {
    console.error("Error fetching world time:", error);
    return Date.now(); // Fallback to local time if API fails
  }
};

const RacingGame = () => {
  const [wager, setWager] = useWagerInput();
  const [selectedRacer, setSelectedRacer] = useState(0);
  const [raceProgress, setRaceProgress] = useState(Array(RACERS.length).fill(0));
  const [gamePhase, setGamePhase] = useState('betting');
  const [winner, setWinner] = useState(null);
  const [timeLeft, setTimeLeft] = useState(BETTING_WINDOW);
  const [playerBet, setPlayerBet] = useState(null);
  const [worldTimeOffset, setWorldTimeOffset] = useState(0);

  const game = GambaUi.useGame();
  const gamba = useGamba();

  useEffect(() => {
    const syncTime = async () => {
      const worldTime = await getWorldTime();
      const localTime = Date.now();
      setWorldTimeOffset(worldTime - localTime);
    };

    syncTime();
    const syncInterval = setInterval(syncTime, 60000); // Sync every minute

    return () => clearInterval(syncInterval);
  }, []);

  useEffect(() => {
    const updateGameState = () => {
      const now = Date.now() + worldTimeOffset;
      const cyclePosition = now % TOTAL_CYCLE;
      
      if (cyclePosition < BETTING_WINDOW) {
        setGamePhase('betting');
        setTimeLeft(BETTING_WINDOW - cyclePosition);
      } else if (cyclePosition < BETTING_WINDOW + RACE_DURATION) {
        setGamePhase('racing');
        setTimeLeft(BETTING_WINDOW + RACE_DURATION - cyclePosition);
        if (gamePhase !== 'racing') {
          runRace();
        }
      } else {
        setGamePhase('cooldown');
        setTimeLeft(TOTAL_CYCLE - cyclePosition);
      }
    };

    const gameLoop = setInterval(updateGameState, 1000);
    updateGameState(); // Initial update

    return () => clearInterval(gameLoop);
  }, [worldTimeOffset, gamePhase]);

  const placeBet = async () => {
    if (gamePhase !== 'betting' || playerBet) return;
    
    try {
      await game.play({
        bet: BET_ARRAY,
        wager,
        metadata: [selectedRacer],
      });
      setPlayerBet({ racer: selectedRacer, wager });
    } catch (error) {
      console.error('Bet error:', error);
    }
  };

  const runRace = async () => {
    const result = await game.result();
    const raceWinner = result.resultIndex;

    for (let step = 0; step < RACE_LENGTH; step++) {
      await new Promise(resolve => setTimeout(resolve, RACE_DURATION / RACE_LENGTH));
      setRaceProgress(prev => {
        const newProgress = [...prev];
        const maxProgressThisStep = step + 1;
        newProgress[raceWinner] = maxProgressThisStep;
        for (let i = 0; i < newProgress.length; i++) {
          if (i !== raceWinner) {
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

    if (playerBet && playerBet.racer === raceWinner) {
      console.log('You won!', result.payout);
    } else if (playerBet) {
      console.log('You lost!');
    }
  };

  useEffect(() => {
    if (gamePhase === 'betting') {
      setRaceProgress(Array(RACERS.length).fill(0));
      setWinner(null);
      setPlayerBet(null);
    }
  }, [gamePhase]);

  return (
    <>
      <GambaUi.Portal target="screen">
        <div style={{ fontFamily: 'monospace', fontSize: '20px', textAlign: 'center' }}>
          <h2>🏁 Racing Game 🏁</h2>
          <div>Phase: {gamePhase} | Time left: {Math.ceil(timeLeft / 1000)}s</div>
          {RACERS.map((racer, index) => (
            <div key={index} style={{ margin: '10px 0' }}>
              {racer} {'-'.repeat(raceProgress[index])} {index === winner && '🏆'}
            </div>
          ))}
          {playerBet && <div>Your bet: {RACERS[playerBet.racer]} ({playerBet.wager})</div>}
          {winner !== null && playerBet && (
            <div style={{ color: playerBet.racer === winner ? 'green' : 'red' }}>
              {playerBet.racer === winner ? 'You won! 🎉' : 'You lost! 😢'}
            </div>
          )}
        </div>
      </GambaUi.Portal>
      <GambaUi.Portal target="controls">
        <GambaUi.WagerInput
          options={WAGER_OPTIONS}
          value={wager}
          onChange={setWager}
          disabled={gamePhase !== 'betting' || playerBet !== null}
        />
        <GambaUi.Button
          disabled={gamePhase !== 'betting' || playerBet !== null}
          onClick={() => setSelectedRacer((selectedRacer + 1) % RACERS.length)}
        >
          Selected: {RACERS[selectedRacer]}
        </GambaUi.Button>
        <GambaUi.PlayButton
          onClick={placeBet}
          disabled={gamePhase !== 'betting' || playerBet !== null || gamba.isPlaying}
        >
          Place Bet
        </GambaUi.PlayButton>
      </GambaUi.Portal>
    </>
  );
};

export default RacingGame;
