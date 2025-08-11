// src/components/CreateGameModal.tsx
import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '@solana/wallet-adapter-react';
import { useMultiplayer } from 'gamba-react-v2';
import { NATIVE_MINT } from '@solana/spl-token';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { GambaUi } from 'gamba-react-ui-v2';

const Backdrop = styled(motion.div)`
  position: absolute;  /* inside canvas */
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const Modal = styled(motion.div)`
  background: #1c1c1c;
  padding: 24px;
  border-radius: 8px;
  width: 92%;
  max-width: 420px;
  color: #fff;
  border: 1px solid #333;
  box-shadow: 0 12px 36px rgba(0,0,0,0.5);
`;

const Title = styled.h2`
  margin: 0 0 16px;
  font-size: 1.4rem;
  font-weight: 700;
`;

const Field = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  font-size: 0.9rem;
  margin-bottom: 6px;
  color: #a9a9b8;
`;

const ToggleGroup = styled.div`
  display: flex;
  gap: 8px;
`;

const ToggleButton = styled.button<{ active: boolean }>`
  flex: 1;
  padding: 10px;
  border: 1px solid ${({ active }) => (active ? '#fff' : '#333')};
  border-radius: 6px;
  background: ${({ active }) => (active ? '#fff' : '#222')};
  color: ${({ active }) => (active ? '#111' : '#fff')};
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease;
  &:hover:not(:disabled) {
    background: ${({ active }) => (active ? '#eee' : '#333')};
  }
`;

const Input = styled.input`
  box-sizing: border-box;
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #333;
  border-radius: 6px;
  background: #222;
  color: #fff;
  font-size: 1rem;
  transition: border-color 0.2s ease;
  &:focus {
    outline: none;
    border-color: #555;
  }
`;

const PresetGroup = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 8px;
`;

const PresetButton = styled.button`
  flex: 1;
  padding: 8px;
  border: 1px solid #333;
  border-radius: 6px;
  background: #222;
  color: #fff;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.2s ease;
  &:hover {
    background: #333;
  }
`;

const RangeRow = styled.div`
  display: flex;
  gap: 12px;
`;

const HalfField = styled(Field)`
  flex: 1;
  margin-bottom: 0;
`;

const Warning = styled.p`
  font-size: 0.85rem;
  color: #bbb;
  margin: 12px 0 0;
  line-height: 1.3;
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 18px;
`;

const Button = styled.button<{ variant?: 'primary' }>`
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: background 0.2s ease;
  background: ${({ variant }) => (variant === 'primary' ? '#fff' : '#333')};
  color: ${({ variant }) => (variant === 'primary' ? '#111' : '#fff')};
  &:hover:not(:disabled) {
    background: ${({ variant }) => (variant === 'primary' ? '#eee' : '#444')};
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.p`
  color: #e74c3c;
  margin: 10px 0 0;
  text-align: center;
  font-size: 0.9rem;
`;

export default function CreateGameModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { publicKey } = useWallet();
  const { createGame } = useMultiplayer();

  const [maxPlayers, setMaxPlayers] = useState(10);
  const [wagerType, setWagerType] = useState<
    'sameWager' | 'customWager' | 'betRange'
  >('sameWager');
  const [fixedWager, setFixedWager] = useState<number>(1);
  const [minBet, setMinBet] = useState<number>(0.1);
  const [maxBet, setMaxBet] = useState<number>(5);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!publicKey) return setError('Connect wallet first');
    setSubmitting(true);
    setError(null);

    const softDuration = 60;
    const preAlloc = Math.min(maxPlayers, 5);
    const winnersTarget = 1;

    const opts: any = {
      mint: NATIVE_MINT,
      creatorAddress: publicKey,
      maxPlayers,
      softDuration,
      preAllocPlayers: preAlloc,
      winnersTarget,
      wagerType: ['sameWager', 'customWager', 'betRange'].indexOf(
        wagerType
      ),
      payoutType: 0,
    };

    if (wagerType === 'sameWager') {
      const lam = Math.floor(fixedWager * LAMPORTS_PER_SOL);
      opts.wager = lam;
      opts.minBet = lam;
      opts.maxBet = lam;
    } else if (wagerType === 'customWager') {
      opts.wager = 0;
      opts.minBet = 0;
      opts.maxBet = 0;
    } else {
      const minLam = Math.floor(minBet * LAMPORTS_PER_SOL);
      const maxLam = Math.floor(maxBet * LAMPORTS_PER_SOL);
      opts.wager = minLam;
      opts.minBet = minLam;
      opts.maxBet = maxLam;
    }

    try {
      await createGame(opts);
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to create game');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <GambaUi.Portal target="screen">
      <AnimatePresence>
        {isOpen && (
          <Backdrop
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Modal
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
            <Title>Create Plinko Race</Title>

            <Field>
              <Label>Max Players</Label>
              <Input
                type="number"
                min={2}
                max={1000}
                value={maxPlayers}
                onChange={(e) => setMaxPlayers(Number(e.target.value))}
              />
            </Field>

            <Field>
              <Label>Wager Type</Label>
              <ToggleGroup>
                <ToggleButton
                  active={wagerType === 'sameWager'}
                  onClick={() => setWagerType('sameWager')}
                >
                  Same
                </ToggleButton>
                <ToggleButton
                  active={wagerType === 'betRange'}
                  onClick={() => setWagerType('betRange')}
                >
                  Range
                </ToggleButton>
                <ToggleButton
                  active={wagerType === 'customWager'}
                  onClick={() => setWagerType('customWager')}
                >
                  Unlimited
                </ToggleButton>
              </ToggleGroup>
            </Field>

            {wagerType === 'sameWager' && (
              <Field>
                <Label>Wager (SOL)</Label>
                <Input
                  type="number"
                  lang="en-US"
                  inputMode="decimal"
                  min={0.05}
                  step={0.01}
                  value={fixedWager}
                  onChange={(e) =>
                    setFixedWager(Number(e.target.value))
                  }
                />
                <PresetGroup>
                  {[0.1, 0.5, 1].map((v) => (
                    <PresetButton
                      key={v}
                      onClick={() => setFixedWager(v)}
                    >
                      {v} SOL
                    </PresetButton>
                  ))}
                </PresetGroup>
              </Field>
            )}

            {wagerType === 'betRange' && (
              <RangeRow>
                <HalfField>
                  <Label>Min Bet (SOL)</Label>
                  <Input
                    type="number"
                    min={0.01}
                    step={0.01}
                    value={minBet}
                    onChange={(e) =>
                      setMinBet(Number(e.target.value))
                    }
                  />
                </HalfField>
                <HalfField>
                  <Label>Max Bet (SOL)</Label>
                  <Input
                    type="number"
                    min={minBet}
                    step={0.01}
                    value={maxBet}
                    onChange={(e) =>
                      setMaxBet(Number(e.target.value))
                    }
                  />
                </HalfField>
              </RangeRow>
            )}

            {/* rent-explanation warning */}
            <Warning>
              ⚠️Creating a game requires paying refundable
              “rent” to cover on-chain storage. You’ll get it back
              automatically once the game ends.
            </Warning>

            {error && <ErrorMessage>{error}</ErrorMessage>}

            <ButtonRow>
              <Button onClick={onClose} disabled={submitting}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? 'Creating…' : 'Create'}
              </Button>
            </ButtonRow>
            </Modal>
          </Backdrop>
        )}
      </AnimatePresence>
    </GambaUi.Portal>
  );
}
