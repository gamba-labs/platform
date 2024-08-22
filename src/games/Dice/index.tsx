import React, { useState } from 'react';
import { GambaUi, useWagerInput, useSound } from 'gamba-react-ui-v2';
import { useGamba } from 'gamba-react-v2';

const RACE_LENGTH = 10;
const WAGER_OPTIONS = [1, 5, 10, 50, 100];
const RACERS = ['🚗', '🏎️', '🚙', '🚓'];
const BET_ARRAY = [0, 2]; // 2x payout for winning

const SOUND_PLAY = '/path/to/play-sound.mp3';
const SOUND_WIN = '/path/to/win-sound.mp3';
const SOUND_LOSE = '/path/to/lose-sound.mp3';

const RacingGame = () => {
  const [wager, setWager] = useWagerInput();
  const [selectedRacer, setSelectedRacer] = useState(0);
  const [raceProgress, setRaceProgress] = useState(0);
  const [isRacing, setIsRacing] = useState(false);
  const [winner, setWinner] = useState(null);

  const game = GambaUi.useGame();
  const gamba = useGamba();
  
  const sounds = useSound({
    play: SOUND_PLAY,
    win: SOUND_WIN,
    lose: SOUND_LOSE,
  });

  const play = async () => {
    if (isRacing) return;

    setIsRacing(true);
    setRaceProgress(0);
    setWinner(null);

    sounds.play('play');

    try {
      await game.play({
        bet: BET_ARRAY,
        wager,
        metadata: [selectedRacer],
      });

      const result = await game.result();
      const hasWon = result.payout > 0;

      animateRace(hasWon);

      if (hasWon) {
        sounds.play('win');
      } else {
        sounds.play('lose');
      }
    } catch (error) {
      console.error('Race error:', error);
      setIsRacing(false);
    }
  };

  const animateRace = (hasWon) => {
    let step = 0;
    const interval = setInterval(() => {
      step++;
      setRaceProgress(step);
      
      if (step >= RACE_LENGTH) {
        clearInterval(interval);
        setIsRacing(false);
        setWinner(hasWon);
      }
    }, 200);
  };

  return (
    <>
      <GambaUi.Portal target="screen">
        <div style={{ fontFamily: 'monospace', fontSize: '20px', textAlign: 'center' }}>
          <h2>🏁 Racing Game 🏁</h2>
          <div style={{ margin: '20px 0' }}>
            {RACERS[selectedRacer]} {'-'.repeat(raceProgress)} {raceProgress === RACE_LENGTH && '🏁'}
          </div>
          {winner !== null && (
            <div style={{ color: winner ? 'green' : 'red', marginTop: '20px' }}>
              {winner ? 'You won! 🎉' : 'You lost! 😢'}
            </div>
          )}
        </div>
      </GambaUi.Portal>
      <GambaUi.Portal target="controls">
        <GambaUi.WagerInput
          options={WAGER_OPTIONS}
          value={wager}
          onChange={setWager}
          disabled={isRacing}
        />
        <GambaUi.Button
          disabled={isRacing}
          onClick={() => setSelectedRacer((selectedRacer + 1) % RACERS.length)}
        >
          Selected: {RACERS[selectedRacer]}
        </GambaUi.Button>
        <GambaUi.PlayButton
          onClick={play}
          disabled={isRacing || gamba.isPlaying}
        >
          {isRacing ? 'Racing...' : 'Start Race'}
        </GambaUi.PlayButton>
      </GambaUi.Portal>
    </>
  );
};

export default RacingGame;
