import React, { useState, useEffect, useCallback } from 'react';
import { GambaUi, useWagerInput, useSound, TokenValue, useCurrentPool } from 'gamba-react-ui-v2';
import { useGamba } from 'gamba-react-v2';
import { signal, computed } from '@preact/signals-react';

const RACE_LENGTH = 10;
const WAGER_OPTIONS = [1, 5, 10, 50, 100];
const RACERS = ['🚗', '🏎️', '🚙', '🚓'];
const BET_ARRAY = [0, 0, 0, 4];
const BETTING_WINDOW = 30000; // 30 seconds
const RACE_DURATION = 20000; // 20 seconds
const COOLDOWN = 10000; // 10 seconds
const TOTAL_CYCLE = BETTING_WINDOW + RACE_DURATION + COOLDOWN;

// Signals for reactive state management
const gamePhase = signal('betting');
const timeLeft = signal(BETTING_WINDOW);
const raceProgress = signal(Array(RACERS.length).fill(0));
const winner = signal(null);
const playerBet = signal(null);
const logs = signal([]);

// Logging function
const log = (message, data = {}) => {
  const logEntry = `[${new Date().toISOString()}] ${message} ${JSON.stringify(data)}`;
  logs.value = [logEntry, ...logs.value.slice(0, 9)]; // Keep only the last 10 logs
};

const LogDisplay = () => (
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
    {logs.value.map((logEntry, index) => (
      <div key={index}>{logEntry}</div>
    ))}
  </div>
);

const RacingGame = () => {
  const [wager, setWager] = useWagerInput();
  const [selectedRacer, setSelectedRacer] = useState(0);
  const game = GambaUi.useGame();
  const gamba = useGamba();
  const pool = useCurrentPool();

  log('Component rendered', { wager, selectedRacer });

  const sounds = useSound({
    win: '/path/to/win-sound.mp3',
    lose: '/path/to/lose-sound.mp3',
    play: '/path/to/play-sound.mp3',
  });

  const updateGameState = useCallback(() => {
    const now = Date.now();
    const cyclePosition = now % TOTAL_CYCLE;
    
    log('Updating game state', { now, cyclePosition });

    if (cyclePosition < BETTING_WINDOW) {
      gamePhase.value = 'betting';
      timeLeft.value = BETTING_WINDOW - cyclePosition;
      log('Entered betting phase', { timeLeft: timeLeft.value });
    } else if (cyclePosition < BETTING_WINDOW + RACE_DURATION) {
      if (gamePhase.value !== 'racing') {
        gamePhase.value = 'racing';
        log('Entered racing phase, calling runRace');
        runRace();
      }
      timeLeft.value = BETTING_WINDOW + RACE_DURATION - cyclePosition;
    } else {
      gamePhase.value = 'cooldown';
      timeLeft.value = TOTAL_CYCLE - cyclePosition;
      log('Entered cooldown phase', { timeLeft: timeLeft.value });
    }
  }, []);

  useEffect(() => {
    log('Setting up game loop');
    const gameLoop = setInterval(updateGameState, 1000);
    updateGameState(); // Initial update
    return () => {
      log('Clearing game loop');
      clearInterval(gameLoop);
    };
  }, [updateGameState]);

  const placeBet = async () => {
    log('Attempting to place bet', { gamePhase: gamePhase.value, playerBet: playerBet.value });
    if (gamePhase.value !== 'betting' || playerBet.value) return;
    
    try {
      log('Playing bet sound');
      sounds.play('play');
      log('Calling game.play', { bet: BET_ARRAY, wager, selectedRacer });
      await game.play({
        bet: BET_ARRAY,
        wager,
        metadata: [selectedRacer],
      });
      playerBet.value = { racer: selectedRacer, wager };
      log('Bet placed successfully', playerBet.value);
    } catch (error) {
      log('Error placing bet', { error: error.message });
      console.error('Bet error:', error);
    }
  };

  const runRace = useCallback(async () => {
    log('runRace called');
    raceProgress.value = Array(RACERS.length).fill(0);
    winner.value = null;
    log('Race progress and winner reset', { raceProgress: raceProgress.value, winner: winner.value });

    log('Awaiting game result');
    const result = await game.result();
    log('Game result received', result);
    const raceWinner = result.resultIndex;

    const animateRace = (step) => {
      log('animateRace called', { step });
      if (step >= RACE_LENGTH) {
        winner.value = raceWinner;
        log('Race finished', { winner: winner.value });
        if (playerBet.value && playerBet.value.racer === raceWinner) {
          log('Player won', { playerBet: playerBet.value, payout: result.payout });
          sounds.play('win');
        } else if (playerBet.value) {
          log('Player lost', { playerBet: playerBet.value });
          sounds.play('lose');
        }
        return;
      }

      raceProgress.value = raceProgress.value.map((progress, index) => {
        if (index === raceWinner) return step + 1;
        return Math.min(progress + (Math.random() < 0.7 ? 1 : 0), step);
      });
      log('Race progress updated', { raceProgress: raceProgress.value });

      log('Scheduling next animation step');
      setTimeout(() => animateRace(step + 1), RACE_DURATION / RACE_LENGTH);
    };

    log('Starting race animation');
    animateRace(0);
  }, [game, sounds]);

  useEffect(() => {
    log('Game phase changed', { gamePhase: gamePhase.value });
    if (gamePhase.value === 'betting') {
      raceProgress.value = Array(RACERS.length).fill(0);
      winner.value = null;
      playerBet.value = null;
      log('Reset for new betting round', { raceProgress: raceProgress.value, winner: winner.value, playerBet: playerBet.value });
    }
  }, [gamePhase.value]);

  const maxPayout = computed(() => wager * Math.max(...BET_ARRAY));
  const isMaxPayoutExceeded = computed(() => maxPayout.value > pool.maxPayout);

  log('Computed values updated', { maxPayout: maxPayout.value, isMaxPayoutExceeded: isMaxPayoutExceeded.value });

  return (
    <>
      <GambaUi.Portal target="screen">
        <div style={{ fontFamily: 'monospace', fontSize: '20px', textAlign: 'center' }}>
          <h2>🏁 Racing Game 🏁</h2>
          <div>Phase: {gamePhase.value} | Time left: {Math.ceil(timeLeft.value / 1000)}s</div>
          {RACERS.map((racer, index) => (
            <div key={index} style={{ margin: '10px 0' }}>
              {racer} {'-'.repeat(raceProgress.value[index])} {index === winner.value && '🏆'}
            </div>
          ))}
          {playerBet.value && (
            <div>Your bet: {RACERS[playerBet.value.racer]} (<TokenValue amount={playerBet.value.wager} />)</div>
          )}
          {winner.value !== null && playerBet.value && (
            <div style={{ color: playerBet.value.racer === winner.value ? 'green' : 'red' }}>
              {playerBet.value.racer === winner.value ? 'You won! 🎉' : 'You lost! 😢'}
            </div>
          )}
        </div>
        <LogDisplay />
      </GambaUi.Portal>
      <GambaUi.Portal target="controls">
        <GambaUi.WagerInput
          options={WAGER_OPTIONS}
          value={wager}
          onChange={(newWager) => {
            log('Wager changed', { oldWager: wager, newWager });
            setWager(newWager);
          }}
          disabled={gamePhase.value !== 'betting' || playerBet.value !== null}
        />
        <GambaUi.Button
          disabled={gamePhase.value !== 'betting' || playerBet.value !== null}
          onClick={() => {
            const newSelectedRacer = (selectedRacer + 1) % RACERS.length;
            log('Selected racer changed', { oldRacer: selectedRacer, newRacer: newSelectedRacer });
            setSelectedRacer(newSelectedRacer);
          }}
        >
          Selected: {RACERS[selectedRacer]}
        </GambaUi.Button>
        <GambaUi.PlayButton
          onClick={placeBet}
          disabled={
            gamePhase.value !== 'betting' ||
            playerBet.value !== null ||
            gamba.isPlaying ||
            isMaxPayoutExceeded.value
          }
        >
          Place Bet
        </GambaUi.PlayButton>
      </GambaUi.Portal>
    </>
  );
};

export default RacingGame;
