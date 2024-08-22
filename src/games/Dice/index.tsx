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

const RacingGame = () => {
  const [wager, setWager] = useWagerInput();
  const [selectedRacer, setSelectedRacer] = useState(0);
  const [raceProgress, setRaceProgress] = useState(Array(RACERS.length).fill(0));
  const [gamePhase, setGamePhase] = useState('betting');
  const [timeLeft, setTimeLeft] = useState(BETTING_WINDOW);
  const [playerBet, setPlayerBet] = useState(null);
  const [isPlacingBet, setIsPlacingBet] = useState(false);
  const [debugLog, setDebugLog] = useState([]);
  const [error, setError] = useState(null);

  const [resultIndex, setResultIndex] = useState(null);
  const [win, setWin] = useState(null);

  const game = GambaUi.useGame();
  const gamba = useGamba();
  const gameLoopRef = useRef(null);
  const isRaceRunningRef = useRef(false);

  const log = useCallback((message) => {
    const timestamp = new Date().toISOString();
    console.log(`${timestamp}: ${message}`);
    setDebugLog(prev => [...prev, `${timestamp}: ${message}`]);
  }, []);

  const updateGameState = useCallback(() => {
    const now = Date.now();
    const cyclePosition = now % TOTAL_CYCLE;
    
    if (cyclePosition < BETTING_WINDOW) {
      setGamePhase(prev => {
        if (prev !== 'betting') log('Transitioning to betting phase');
        return 'betting';
      });
      setTimeLeft(BETTING_WINDOW - cyclePosition);
    } else if (cyclePosition < BETTING_WINDOW + RACE_DURATION) {
      setGamePhase(prev => {
        if (prev !== 'racing') {
          log('Transitioning to racing phase');
        }
        return 'racing';
      });
      setTimeLeft(BETTING_WINDOW + RACE_DURATION - cyclePosition);
    } else {
      setGamePhase(prev => {
        if (prev !== 'cooldown') log('Transitioning to cooldown phase');
        return 'cooldown';
      });
      setTimeLeft(TOTAL_CYCLE - cyclePosition);
    }
  }, [log]);

  useEffect(() => {
    updateGameState();
    gameLoopRef.current = setInterval(updateGameState, 1000);
    return () => {
      clearInterval(gameLoopRef.current);
    };
  }, [updateGameState]);

  const placeBet = async () => {
    if (gamePhase !== 'betting' || playerBet || isPlacingBet) return;
    
    setIsPlacingBet(true);
    try {
      log('Placing bet...');
      const result = await game.play({
        bet: BET_ARRAY,
        wager,
        metadata: [selectedRacer],
      });
      log(`Bet placed. Result received.`);
      setPlayerBet({ racer: selectedRacer, wager });
      
      setResultIndex(result.resultIndex);
      const didWin = result.payout > 0;
      setWin(didWin);
      
      log(`Result index: ${result.resultIndex}, Win: ${didWin}`);
      
      if (didWin) {
        log('You won! 🎉');
        // sounds.play('win')  // Uncomment if you have a sound system implemented
      } else {
        log('You lost! 😢');
        // sounds.play('lose')  // Uncomment if you have a sound system implemented
      }
    } catch (error) {
      log(`Bet error: ${error.message}`);
      setError(`Bet error: ${error.message}`);
    } finally {
      setIsPlacingBet(false);
    }
  };

  const runRace = useCallback(async () => {
    if (isRaceRunningRef.current || resultIndex === null) {
      log('Race cannot start. Either it\'s already running or no result is available.');
      return;
    }

    isRaceRunningRef.current = true;
    log(`Starting race animation. Winner index: ${resultIndex}`);

    try {
      for (let step = 0; step <= RACE_LENGTH; step++) {
        setRaceProgress(prev => {
          const newProgress = [...prev];
          const maxProgressThisStep = step;
          newProgress[resultIndex] = maxProgressThisStep;
          for (let i = 0; i < newProgress.length; i++) {
            if (i !== resultIndex) {
              newProgress[i] = Math.min(
                newProgress[i] + (Math.random() < 0.7 ? 1 : 0),
                maxProgressThisStep - 1
              );
            }
          }
          return newProgress;
        });

        await new Promise(resolve => setTimeout(resolve, RACE_DURATION / RACE_LENGTH));
      }

      log(`Race finished. Winner: ${RACERS[resultIndex]}`);
    } catch (error) {
      log(`Error during race: ${error.message}`);
      setError(`Race error: ${error.message}`);
    } finally {
      isRaceRunningRef.current = false;
    }
  }, [resultIndex, log]);

  useEffect(() => {
    if (gamePhase === 'racing' && resultIndex !== null && !isRaceRunningRef.current) {
      log('Conditions met to start the race. Triggering runRace.');
      runRace().catch(error => {
        log(`Unhandled error in runRace: ${error.message}`);
        setError(`Unhandled race error: ${error.message}`);
      });
    }
  }, [gamePhase, resultIndex, runRace]);

  useEffect(() => {
    if (gamePhase === 'betting') {
      log('Resetting game state for new betting phase');
      setRaceProgress(Array(RACERS.length).fill(0));
      setPlayerBet(null);
      setResultIndex(null);
      setWin(null);
      log('Game state reset');
      isRaceRunningRef.current = false;
      setError(null);
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
              {racer} {'-'.repeat(raceProgress[index])} {index === resultIndex && gamePhase === 'cooldown' && '🏆'}
            </div>
          ))}
          {playerBet && <div>Your bet: {RACERS[playerBet.racer]} ({playerBet.wager})</div>}
          {win !== null && (
            <div style={{ color: win ? 'green' : 'red' }}>
              {win ? 'You won! 🎉' : 'You lost! 😢'}
            </div>
          )}
          {error && <div style={{ color: 'red' }}>Error: {error}</div>}
          <div style={{ marginTop: '20px', textAlign: 'left', fontSize: '12px', maxHeight: '200px', overflowY: 'auto' }}>
            Debug Log:
            {debugLog.map((log, index) => (
              <div key={index}>{log}</div>
            ))}
          </div>
        </div>
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
