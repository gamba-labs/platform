// src/components/DebugGameScreen.tsx
import React, { useState, useCallback, useEffect } from 'react';
import styled from 'styled-components';
import { Keypair, PublicKey } from '@solana/web3.js';
import { GambaUi, useSound }  from 'gamba-react-ui-v2';
import Board                  from '../board/Board';
import lobbymusicSnd          from '../sounds/lobby.mp3';
import actionSnd              from '../sounds/action.mp3';
import {
  musicManager,
  attachMusic,
  stopAndDispose,
} from '../musicManager';

function randomPk(): PublicKey {
  return Keypair.generate().publicKey;
}

const Page = styled.div`
  width: 100%;
  max-width: 960px;
  margin: 0 auto;
  padding: 16px;
  box-sizing: border-box;
`

const Panel = styled.div`
  background: #11151f;
  border: 1px solid #202533;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 6px 24px rgba(0,0,0,0.25);
`

const PanelHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
  h2 { margin: 0; font-size: 18px; }
`

const FormGrid = styled.div`
  display: grid;
  gap: 12px;
  grid-template-columns: 1fr 1fr;
  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`

const Field = styled.label`
  display: grid;
  gap: 8px;
  font-size: 14px;
`

const Input = styled.input`
  appearance: none;
  width: 100%;
  box-sizing: border-box;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid #2a3142;
  background: #0d1118;
  color: #e8eefc;
  outline: none;
  font-size: 14px;
  &:focus {
    border-color: #5e47ff;
    box-shadow: 0 0 0 3px rgba(94,71,255,0.2);
  }
`

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  justify-content: flex-end;
  margin-top: 8px;
`

const Helper = styled.div`
  color: #9aa7bd;
  font-size: 12px;
`

export default function DebugGameScreen({
  onBack,
}: {
  onBack: () => void;
}) {
  const [count,  setCount ] = useState(5);
  const [winner, setWinner] = useState(0);
  const [you,    setYou   ] = useState(0);        // which ball is “you”
  const [players,   setPlayers]   = useState<PublicKey[]>([]);
  const [winnerIdx, setWinnerIdx] = useState<number | null>(null);

  const [seedInput, setSeedInput] = useState('');
  const [gamePk,    setGamePk]    = useState<string | null>(null);

  const [gameOver, setGameOver] = useState(false);

  const waiting = players.length === 0;

  useEffect(() => {
    // cancel any pending stop
    clearTimeout(musicManager.timer);
    // bump claim count
    musicManager.count += 1;
    return () => {
      musicManager.count -= 1;
      if (musicManager.count === 0) {
        musicManager.timer = setTimeout(stopAndDispose, 200);
      }
    };
  }, []);

  const { play: playLobby, sounds: lobbySounds } = useSound(
    { lobby: lobbymusicSnd },
    { disposeOnUnmount: false },
  );
  useEffect(() => {
    if (!musicManager.sound) {
      const snd = lobbySounds.lobby;
      if (snd) {
        snd.player.loop = true;
        const startWhenReady = () => {
          if (snd.ready) {
            playLobby('lobby');
            attachMusic(snd);
          } else {
            setTimeout(startWhenReady, 100);
          }
        };
        startWhenReady();
      }
    }
  }, [lobbySounds, playLobby]);

  const { play: playAction, sounds: actionSounds } = useSound(
    { action: actionSnd },
    { disposeOnUnmount: false },
  );
  useEffect(() => {
    if (!waiting) {
      try { musicManager.sound?.player.stop(); } catch {}
      const snd = actionSounds.action;
      if (snd) {
        snd.player.loop = true;
        const startWhenReady = () => {
          if (snd.ready) {
            playAction('action');
            attachMusic(snd);
          } else {
            setTimeout(startWhenReady, 100);
          }
        };
        startWhenReady();
      }
    }
  }, [waiting, actionSounds, playAction]);

  const start = useCallback(() => {
    const n = Math.max(1, Math.min(20, count));
    const youClamped = Math.max(0, Math.min(n - 1, you));
    setYou(youClamped);

    setPlayers(Array.from({ length: n }, randomPk));
    setWinnerIdx(Math.max(0, Math.min(n - 1, winner)));

    const seed = seedInput.trim() || Keypair.generate().publicKey.toBase58();
    setGamePk(seed);

    setGameOver(false);
  }, [count, winner, you, seedInput]);

  return (
    <>
      {players.length === 0 && (
        <Page>
        <Panel>
          <PanelHeader>
            <h2>🐞 Debug Simulator</h2>
          </PanelHeader>
          <FormGrid>
            <Field>
              <span>Balls</span>
              <Input
                type="number"
                min={1}
                max={20}
                step={1}
                inputMode="numeric"
                value={count}
                onChange={e => setCount(+e.target.value)}
              />
              <Helper>How many players (1–20)</Helper>
            </Field>

            <Field>
              <span>Winner index</span>
              <Input
                type="number"
                min={0}
                step={1}
                inputMode="numeric"
                value={winner}
                onChange={e => setWinner(+e.target.value)}
              />
              <Helper>Zero‑based index of the winner</Helper>
            </Field>

            <Field>
              <span>Your index</span>
              <Input
                type="number"
                min={0}
                max={Math.max(0, count - 1)}
                step={1}
                inputMode="numeric"
                value={you}
                onChange={e => setYou(+e.target.value)}
              />
              <Helper>Which ball is “you” (0…{Math.max(0, count - 1)})</Helper>
            </Field>

            <Field>
              <span>Seed (optional)</span>
              <Input
                type="text"
                placeholder="Base58 seed or leave empty"
                value={seedInput}
                onChange={e => setSeedInput(e.target.value)}
              />
              <Helper>Leave empty to use a random seed</Helper>
            </Field>
          </FormGrid>

          <Actions>
            <GambaUi.Button main onClick={start}>Run race</GambaUi.Button>
          </Actions>
        </Panel>
        </Page>
      )}

      {players.length > 0 && gamePk && (
        <Board
          players          ={players}
          winnerIdx        ={winnerIdx}
          youIndexOverride ={you}
          gamePk           ={gamePk}
          onFinished       ={() => setGameOver(true)}
        />
      )}

      <GambaUi.Portal target="controls">
        {players.length > 0 && gameOver && (
          <GambaUi.Button onClick={onBack}>
            ← Back to lobby
          </GambaUi.Button>
        )}
      </GambaUi.Portal>
    </>
  );
}
