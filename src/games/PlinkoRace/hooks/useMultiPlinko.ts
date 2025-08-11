import { useEffect, useState, useCallback } from 'react';
import { SimulationEngine }   from '../engine/SimulationEngine';
import { RecordedRace } from '../engine/types';
import { PlayerInfo }                       from '../engine/types';

export function useMultiPlinko(
  players: PlayerInfo[],
  seed?: string,
) {
  const [engine, setEngine] = useState<SimulationEngine | null>(null);

  useEffect(() => {
    const sim = new SimulationEngine(players, seed);
    setEngine(sim);
    return () => sim.cleanup();
  }, [players.map(p => p.id).join(','), seed]);

  const recordRace = useCallback(
    (winnerIdx: number, target?: number): RecordedRace => {
      if (!engine) throw new Error('Engine not ready');
      return engine.recordRace(winnerIdx, target);
    },
    [engine],
  );

  const replayRace = useCallback(
    (rec: RecordedRace, onFrame?: (f: number) => void) => {
      if (!engine) throw new Error('Engine not ready');
      engine.replayRace(rec, onFrame);
    },
    [engine],
  );

  return { engine, recordRace, replayRace };
}
