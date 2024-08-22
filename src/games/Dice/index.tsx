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

const RacingGame = () => {
  const [wager, setWager] = useWagerInput();
  const [selectedRacer, setSelectedRacer] = useState(0);
  const game = GambaUi.useGame();
  const gamba = useGamba();
  const pool = useCurrentPool();

  const sounds = useSound({
    win: '/path/to/win-sound.mp3',
    lose: '/path/to/lose-sound.mp3',
    play: '/path/to/play-sound.mp3',
  });

  const updateGameState = useCallback(() => {
    const now = Date.now();
    const cyclePosition = now % TOTAL_CYCLE;
    
    if (cyclePosition < BETTING_WINDOW) {
      gamePhase.value = 'betting';
      timeLeft.value = BETTING_WINDOW - cyclePosition;
    } else if (cyclePosition < BETTING_WINDOW + RACE_DURATION) {
      if (gamePhase.value !== 'racing') {
        gamePhase.value = 'racing';
        runRace();
      }
      timeLeft.value = BETTING_WINDOW + RACE_DURATION - cyclePosition;
    } else {
      gamePhase.value = 'cooldown';
      timeLeft.value = TOTAL_CYCLE - cyclePosition;
    }
  }, []);

  useEffect(() => {
    const gameLoop = setInterval(updateGameState, 1000);
    updateGameState(); // Initial update
    return () => clearInterval(gameLoop);
  }, [updateGameState]);

  const placeBet = async () => {
    if (gamePhase.value !== 'betting' || playerBet.value) return;
    
    try {
      sounds.play('play');
      await game.play({
        bet: BET_ARRAY,
        wager,
        metadata: [selectedRacer],
      });
      playerBet.value = { racer: selectedRacer, wager };
    } catch (error) {
      console.error('Bet error:', error);
    }
  };

  const runRace = useCallback(async () => {
    raceProgress.value = Array(RACERS.length).fill(0);
    winner.value = null;

    const result = await game.result();
    const raceWinner = result.resultIndex;

    const animateRace = (step) => {
      if (step >= RACE_LENGTH) {
        winner.value = raceWinner;
        if (playerBet.value && playerBet.value.racer === raceWinner) {
          sounds.play('win');
          console.log('You won!', result.payout);
        } else if (playerBet.value) {
          sounds.play('lose');
          console.log('You lost!');
        }
        return;
      }

      raceProgress.value = raceProgress.value.map((progress, index) => {
        if (index === raceWinner) return step + 1;
        return Math.min(progress + (Math.random() < 0.7 ? 1 : 0), step);
      });

      setTimeout(() => animateRace(step + 1), RACE_DURATION / RACE_LENGTH);
    };

    animateRace(0);
  }, [game, sounds]);

  useEffect(() => {
    if (gamePhase.value === 'betting') {
      raceProgress.value = Array(RACERS.length).fill(0);
      winner.value = null;
      playerBet.value = null;
    }
  }, [gamePhase.value]);

  const maxPayout = computed(() => wager * Math.max(...BET_ARRAY));
  const isMaxPayoutExceeded = computed(() => maxPayout.value > pool.maxPayout);

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
      </GambaUi.Portal>
      <GambaUi.Portal target="controls">
        <GambaUi.WagerInput
          options={WAGER_OPTIONS}
          value={wager}
          onChange={setWager}
          disabled={gamePhase.value !== 'betting' || playerBet.value !== null}
        />
        <GambaUi.Button
          disabled={gamePhase.value !== 'betting' || playerBet.value !== null}
          onClick={() => setSelectedRacer((selectedRacer + 1) % RACERS.length)}
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
