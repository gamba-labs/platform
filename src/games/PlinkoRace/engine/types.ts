// src/engine/types.ts
import { BucketType } from './constants';

export interface PlayerInfo { id: string; color: string; }

export interface RecordedRaceEvent {
  frame  : number;
  player : number;              // -1 ⇒ global / no player
  kind   : 'score' | 'deduct' | 'mult' | 'extraBall' | 'ballKill' | 'bucketMode' | 'bucketPattern';
  value? : number;              // points, multiplier, next bucketMode index…
  bucket?: number;
}

export interface RecordedRace {
  winnerIndex: number;
  paths      : Float32Array[];
  offsets    : number[]; 
  pathOwners : number[];
  events     : RecordedRaceEvent[];
  totalFrames: number;
}
