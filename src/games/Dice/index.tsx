import React, { useState, useCallback } from 'react';
import { GambaUi, useWagerInput, useSound } from 'gamba-react-ui-v2';
import { useGamba } from 'gamba-react-v2';

const RACE_LENGTH = 10;
const WAGER_OPTIONS = [1, 5, 10, 50, 100];
const RACERS = ['🚗', '🏎️', '🚙', '🚓'];
const BET_ARRAY = [0, 2]; // 2x payout for winning

const SOUND_PLAY = '/path/to/play-sound.mp3';
const SOUND_WIN = '/path/to/win-sound.mp3';
const SOUND_LOSE = '/path/to/lose-sound.mp3';

const LogDisplay = ({ logs }) => (
  <div style={{ position: 'fixed', bottom: '10px', left: '10px', right: '10px', background: 'rgba(0,0,0,0.8)', color: 'white', padding: '10px', fontFamily: 'monospace', fontSize: '12px', maxHeight: '200px', overflowY: 'auto' }}>
    {logs.map((log, index) => (
      <div key={index}>{log}</div>
    ))}
  </div>
);

const RacingGame = () => {
  const [wager, setWager] = useWagerInput();
  const [selectedRacer, setSelectedRacer] = useState(0);
  const [raceProgress, setRaceProgress] = useState(0);
  const [isRacing, setIsRacing] = useState(false);
  const [winner, setWinner] = useState(null);
  const [logs, setLogs] = useState([]);

  const game = GambaUi.useGame();
  const gamba = useGamba();
  
  const sounds = useSound({
    play: SOUND_PLAY,
    win: SOUND_WIN,
    lose: SOUND_LOSE,
  });

  const addLog = useCallback((message) => {
    setLogs(prevLogs => [...prevLogs, `${new Date().toLocaleTimeString()}: ${message}`]);
  }, []);

  const play = async () => {
    if (isRacing) return;

    setIsRacing(true);
    setRaceProgress(0);
    setWinner(null);
    addLog(`Race started with ${RACERS[selectedRacer]} and wager of ${wager}`);

    sounds.play('play');
    addLog('Play sound played');

    try {
      await game.play({
        bet: BET_ARRAY,
        wager,
        metadata: [selectedRacer],
      });
      addLog('Bet placed');

      const result = await game.result();
      const hasWon = result.payout > 0;
      addLog(`Result received. Won: ${hasWon}, Payout: ${result.payout}`);

      animateRace(hasWon);

      if (hasWon) {
        sounds.play('win');
        addLog('Win sound played');
      } else {
        sounds.play('lose');
        addLog('Lose sound played');
      }
    } catch (error) {
      console.error('Race error:', error);
      addLog(`Error occurred: ${error.message}`);
      setIsRacing(false);
    }
  };

  const animateRace = (hasWon) => {
    let step = 0;
    const interval = setInterval(() => {
      step++;
      setRaceProgress(step);
      addLog(`Race progress: ${step}/${RACE_LENGTH}`);
      
      if (step >= RACE_LENGTH) {
        clearInterval(interval);
        setIsRacing(false);
        setWinner(hasWon);
        addLog(`Race finished. Winner: ${hasWon ? 'Player' : 'House'}`);
      }
    }, 200);
  };

  const handleRacerChange = () => {
    const newRacer = (selectedRacer + 1) % RACERS.length;
    setSelectedRacer(newRacer);
    addLog(`Selected racer changed to ${RACERS[newRacer]}`);
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
        <LogDisplay logs={logs} />
      </GambaUi.Portal>
      <GambaUi.Portal target="controls">
        <GambaUi.WagerInput
          options={WAGER_OPTIONS}
          value={wager}
          onChange={(newWager) => {
            setWager(newWager);
            addLog(`Wager changed to ${newWager}`);
          }}
          disabled={isRacing}
        />
        <GambaUi.Button
          disabled={isRacing}
          onClick={handleRacerChange}
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
