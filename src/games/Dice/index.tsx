import React, { useState, useEffect, useCallback, useRef } from 'react';
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

const LogDisplay = ({ logs }) => (
  <div style={{ 
    position: 'fixed', 
    bottom: '10px', 
    left: '10px', 
    right: '10px', 
    background: 'rgba(0,0,0,0.8)', 
    color: 'white', 
    padding: '10px', 
    fontFamily: 'monospace', 
    fontSize: '12px', 
    maxHeight: '200px', 
    overflowY: 'auto' 
  }}>
    {logs.map((log, index) => (
      <div key={index}>{log}</div>
    ))}
  </div>
);

const RacingGame = () => {
  const [wager, setWager] = useWagerInput();
  const [selectedRacer, setSelectedRacer] = useState(0);
  const [raceProgress, setRaceProgress] = useState(Array(RACERS.length).fill(0));
  const [gamePhase, setGamePhase] = useState('betting');
  const [winner, setWinner] = useState(null);
  const [timeLeft, setTimeLeft] = useState(BETTING_WINDOW);
  const [playerBet, setPlayerBet] = useState(null);
  const [worldTimeOffset, setWorldTimeOffset] = useState(0);
  const [isPlacingBet, setIsPlacingBet] = useState(false);
  const [logs, setLogs] = useState([]);

  const game = GambaUi.useGame();
  const gamba = useGamba();
  const raceAnimationRef = useRef(null);

  const log = (message) => {
    setLogs(prevLogs => [`[${new Date().toISOString()}] ${message}`, ...prevLogs.slice(0, 9)]);
  };

  const syncTime = useCallback(async () => {
    const worldTime = await getWorldTime();
    const localTime = Date.now();
    setWorldTimeOffset(worldTime - localTime);
    log(`Time synced. Offset: ${worldTime - localTime}ms`);
  }, []);

  useEffect(() => {
    syncTime();
    const syncInterval = setInterval(syncTime, 60000); // Sync every minute
    return () => clearInterval(syncInterval);
  }, [syncTime]);

  const updateGameState = useCallback(() => {
    const now = Date.now() + worldTimeOffset;
    const cyclePosition = now % TOTAL_CYCLE;
    
    if (cyclePosition < BETTING_WINDOW) {
      setGamePhase('betting');
      setTimeLeft(BETTING_WINDOW - cyclePosition);
      log(`Entered betting phase. Time left: ${Math.ceil((BETTING_WINDOW - cyclePosition) / 1000)}s`);
    } else if (cyclePosition < BETTING_WINDOW + RACE_DURATION) {
      if (gamePhase !== 'racing') {
        setGamePhase('racing');
        log('Entered racing phase. Starting race...');
      }
      setTimeLeft(BETTING_WINDOW + RACE_DURATION - cyclePosition);
    } else {
      setGamePhase('cooldown');
      setTimeLeft(TOTAL_CYCLE - cyclePosition);
      log(`Entered cooldown phase. Time left: ${Math.ceil((TOTAL_CYCLE - cyclePosition) / 1000)}s`);
    }
  }, [worldTimeOffset, gamePhase]);

  useEffect(() => {
    const gameLoop = setInterval(updateGameState, 1000);
    updateGameState(); // Initial update
    return () => clearInterval(gameLoop);
  }, [updateGameState]);

  const placeBet = async () => {
    if (gamePhase !== 'betting' || playerBet || isPlacingBet) return;
    
    setIsPlacingBet(true);
    log(`Attempting to place bet on racer ${selectedRacer}`);
    try {
      await game.play({
        bet: BET_ARRAY,
        wager,
        metadata: [selectedRacer],
      });
      setPlayerBet({ racer: selectedRacer, wager });
      log(`Bet placed successfully on racer ${selectedRacer}`);
    } catch (error) {
      log(`Error placing bet: ${error.message}`);
      console.error('Bet error:', error);
    } finally {
      setIsPlacingBet(false);
    }
  };

  const runRace = useCallback(async () => {
    if (raceAnimationRef.current) {
      clearTimeout(raceAnimationRef.current);
    }

    setRaceProgress(Array(RACERS.length).fill(0));
    setWinner(null);
    log('Race started. Waiting for result...');

    try {
      const result = await game.result();
      const raceWinner = result.resultIndex;
      log(`Race result received. Winner: Racer ${raceWinner}`);

      const animateRace = (step) => {
        log(`Animating race step ${step}`);
        if (step >= RACE_LENGTH) {
          setWinner(raceWinner);
          log(`Race finished. Winner: Racer ${raceWinner}`);
          if (playerBet && playerBet.racer === raceWinner) {
            log(`Player won! Payout: ${result.payout}`);
          } else if (playerBet) {
            log('Player lost.');
          }
          return;
        }

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

        raceAnimationRef.current = setTimeout(() => animateRace(step + 1), RACE_DURATION / RACE_LENGTH);
      };

      log('Starting race animation');
      animateRace(0);
    } catch (error) {
      log(`Error during race: ${error.message}`);
      console.error('Race error:', error);
    }
  }, [game, playerBet]);

  useEffect(() => {
    if (gamePhase === 'racing') {
      log('Game phase changed to racing, calling runRace');
      runRace();
    }
  }, [gamePhase, runRace]);

  useEffect(() => {
    if (gamePhase === 'betting') {
      setRaceProgress(Array(RACERS.length).fill(0));
      setWinner(null);
      setPlayerBet(null);
      log('Reset for new betting round');
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
        <LogDisplay logs={logs} />
      </GambaUi.Portal>
      <GambaUi.Portal target="controls">
        <GambaUi.WagerInput
          options={WAGER_OPTIONS}
          value={wager}
          onChange={setWager}
          disabled={gamePhase !== 'betting' || playerBet !== null || isPlacingBet}
        />
        <GambaUi.Button
          disabled={gamePhase !== 'betting' || playerBet !== null || isPlacingBet}
          onClick={() => setSelectedRacer((selectedRacer + 1) % RACERS.length)}
        >
          Selected: {RACERS[selectedRacer]}
        </GambaUi.Button>
        <GambaUi.PlayButton
          onClick={placeBet}
          disabled={gamePhase !== 'betting' || playerBet !== null || isPlacingBet || gamba.isPlaying}
        >
          {isPlacingBet ? 'Placing Bet...' : 'Place Bet'}
        </GambaUi.PlayButton>
      </GambaUi.Portal>
    </>
  );
};

export default RacingGame;
