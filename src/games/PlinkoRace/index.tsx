import React, { useState, useCallback } from 'react';
import { GambaUi }                       from 'gamba-react-ui-v2';
import type { PublicKey }                from '@solana/web3.js';

import Lobby            from './components/Lobby';
import GameScreen       from './components/GameScreen';
import DebugGameScreen  from './components/DebugGameScreen';

export default function PlinkoRace() {
  const [selectedGame, setSelectedGame] = useState<PublicKey | null>(null);
  const [debugMode,    setDebugMode]    = useState(false);

  const handleBack = useCallback(() => {
    setSelectedGame(null);
    setDebugMode(false);
  }, []);

  return (
    <GambaUi.Portal target="screen">
      {debugMode ? (
        <DebugGameScreen onBack={() => setDebugMode(false)} />
      ) : selectedGame ? (
        <GameScreen pk={selectedGame} onBack={handleBack} />
      ) : (
        <Lobby
          onSelect={setSelectedGame}
          onDebug ={() => setDebugMode(true)}
        />
      )}
    </GambaUi.Portal>
  );
}
