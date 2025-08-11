// src/engine/constants.ts
export const WIDTH  = 700;
export const HEIGHT = 700;

export const PEG_RADIUS   = 5;
export const BALL_RADIUS  = 13;
export const GRAVITY      = 0.9;
export const RESTITUTION  = 0.6;
export const ROWS         = 14;
export const TIME_SCALE   = 4;   // 4× realtime
export const SPEED_FACTOR = 4;   // sim‑steps per UI frame (for replay timing)

export enum BucketType {
  Blank       = 'blank',       // does nothing, ball just respawns
  Score       = 'score',       // awards fixed points   (value = points)
  Multiplier  = 'mult',        // multiplies next score (value = multiplier)
  ExtraBall   = 'extraBall',   // spawns an extra ball  (no value)
  Kill        = 'kill',        // removes ball forever (no value)
  Deduct      = 'deduct',      // deducts fixed points  (value = points)
  Dynamic     = 'dynamic',     // placeholder – cycles through MODES below
}

export interface BucketDef {
  type  : BucketType;
  value?: number;      // used by Score / Multiplier
}

export const BUCKET_DEFS: BucketDef[] = [
  { type: BucketType.Dynamic },                    // left dynamic (index 0)
  { type: BucketType.Score,      value: 10 },
  { type: BucketType.Multiplier, value: 2.5  },
  { type: BucketType.Score,      value: 6 },
  { type: BucketType.Multiplier, value: 1.5  },
  { type: BucketType.Score,      value: 3  },

  { type: BucketType.Dynamic },                    // center dynamic

  { type: BucketType.Score,      value: 3  },
  { type: BucketType.Multiplier, value: 1.5  },
  { type: BucketType.Score,      value: 6 },
  { type: BucketType.Multiplier, value: 2.5  },
  { type: BucketType.Score,      value: 10  },
  { type: BucketType.Dynamic },                    // right dynamic (last)
];

export const DYNAMIC_SEQUENCE: BucketType[] = [
  BucketType.Blank,
  BucketType.ExtraBall,
  BucketType.Multiplier,        // 5×
  BucketType.Deduct,            // -5 points
];
export const DYNAMIC_EXTRA_MULT = 5;       // value when in Multiplier mode
export const DYNAMIC_DEDUCT_POINTS = 5;    // points to deduct in Deduct mode

export const BUCKET_HEIGHT = 60;
export const CENTER_BUCKET = BUCKET_DEFS.findIndex(b => b.type === BucketType.Dynamic);

export const DYNAMIC_CYCLE_FRAMES = 180;
