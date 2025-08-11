// src/engine/SimulationEngine.ts
import Matter, { Composite, Bodies, Body } from 'matter-js';
import { PhysicsWorld } from './PhysicsWorld';
import {
  WIDTH, HEIGHT, BALL_RADIUS, BUCKET_HEIGHT,
  BUCKET_DEFS, BucketType,
  DYNAMIC_SEQUENCE, DYNAMIC_EXTRA_MULT,
  DYNAMIC_CYCLE_FRAMES, DYNAMIC_DEDUCT_POINTS,
} from './constants';
import { makeRng } from './deterministic';
import {
  PlayerInfo,
  RecordedRace,
  RecordedRaceEvent,
} from './types';

const MAX_FRAMES    = 200_000;
const MAX_ATTEMPTS  = 150;
const TARGET_POINTS = 100;
const SPEED_FACTOR  = 4;
const TELEPORT_DY   = HEIGHT * 0.5;

export class SimulationEngine {
  private players     : PlayerInfo[];
  private rng         : () => number;
  private staticWorld = new PhysicsWorld();
  private replayWorld?: PhysicsWorld;

  constructor(players: PlayerInfo[], seed?: string) {
    this.players = players;
    this.rng     = seed ? makeRng(seed) : Math.random;
  }

  recordRace(winnerIdx:number, target=TARGET_POINTS): RecordedRace {
    if (this.players.length === 0) {
      return {
        winnerIndex:-1, paths:[], offsets:[], pathOwners:[],
        events:[], totalFrames:0,
      };
    }

    for (let n=1; n<=MAX_ATTEMPTS; n++) {
      const rec = this.runSingleAttempt(winnerIdx, target);
      if (rec) {
        try {
          console.log(
            `[PlinkoRace] recordRace: success on attempt ${n}/${MAX_ATTEMPTS} (players=${this.players.length}, winnerIdx=${winnerIdx}, frames=${rec.totalFrames})`
          );
        } catch {}
        return rec;                         // success
      }
    }
    try {
      console.warn(
        `[PlinkoRace] recordRace: failed to find a valid run after ${MAX_ATTEMPTS} attempts (players=${this.players.length}, winnerIdx=${winnerIdx})`
      );
    } catch {}
    throw new Error('No valid run found');
  }

  /*──────────────── SINGLE ATTEMPT ─────────────*/
  private runSingleAttempt(win:number, target:number): RecordedRace|null {
    const sim   = new PhysicsWorld();
    const layer = Composite.create();             // balls only
    Composite.add(sim.world, layer);

    const randSpawn = () => WIDTH/2 + (this.rng()*16 - 8);

    /* dynamic, because ExtraBall can push more */
    const offsets    : number[]   = [];
    const pathOwners : number[]   = [];
    const paths      : number[][] = [];
    const balls      : Body[]     = [];

    const scores = new Float32Array(this.players.length);
    // Use float multipliers to preserve fractional values like 1.5×
    const mults  = new Float32Array(this.players.length).fill(1);
    const events : RecordedRaceEvent[] = [];

    /* initial balls */
    this.players.forEach((_,i) => {
      offsets   [i] = randSpawn();
      pathOwners[i] = i;
      paths     [i] = [];
      const b = Bodies.circle(offsets[i], -10, BALL_RADIUS, {
        restitution:0.4, collisionFilter:{group:-1},
        label:'Ball', plugin:{ playerIndex:i },
      });
      balls[i] = b;
      Composite.add(layer, b);
    });

    /* dynamic buckets: shared timer, per-bucket patterns (deterministic) */
    const dynamicBucketIndexes = BUCKET_DEFS
      .map((b,i) => b.type === BucketType.Dynamic ? i : -1)
      .filter(i => i >= 0);
    const blankIdx = DYNAMIC_SEQUENCE.findIndex(t => t === BucketType.Blank);
    const nonBlankIdxs = DYNAMIC_SEQUENCE.map((_,i)=>i).filter(i => i !== blankIdx);
    const patternOffsets = dynamicBucketIndexes.map(() =>
      Math.floor(this.rng() * nonBlankIdxs.length)
    );
    // emit deterministic pattern offsets so UI can mirror exactly from frame 0
    dynamicBucketIndexes.forEach((bucketIndex, di) => {
      events.push({ frame: 0, player: -1, kind: 'bucketPattern', value: patternOffsets[di], bucket: bucketIndex })
    })
    const currentModeIdx = new Array<number>(BUCKET_DEFS.length).fill(blankIdx);
    let dynTick = 0; // 0 => Blank; 1.. => non-blank modes

    const respawn = (b:Body, idx:number) => {
      Matter.Body.setPosition(b, {x:offsets[idx], y:-10});
      Matter.Body.setVelocity(b, {x:0, y:0});
    };

    let totalFrames = 0;
outer:
    for (let frame=0; frame<MAX_FRAMES; frame++) {
      // time-based dynamic cycling: shared tick for all dynamic buckets
      if (dynamicBucketIndexes.length && frame>0 && frame % DYNAMIC_CYCLE_FRAMES === 0) {
        dynTick++;
        for (let di = 0; di < dynamicBucketIndexes.length; di++) {
          const bucketIndex = dynamicBucketIndexes[di];
          const seqIdx = dynTick === 0
            ? blankIdx
            : nonBlankIdxs[(dynTick - 1 + patternOffsets[di]) % nonBlankIdxs.length];
          currentModeIdx[bucketIndex] = seqIdx;
          events.push({ frame, player:-1, kind:'bucketMode', value:seqIdx, bucket: bucketIndex });
        }
      }
      sim.tick();

      for (let bi=0; bi<balls.length; bi++) {
        const body   = balls[bi];
        const player = pathOwners[bi];

        /* record path sample */
        paths[bi].push(body.position.x, body.position.y);

        /* OOB guard */
        if (body.position.x<0 || body.position.x>WIDTH || body.position.y>HEIGHT){
          respawn(body, bi);
          continue;
        }

        /* bucket? */
        if (body.position.y >= HEIGHT - BUCKET_HEIGHT) {
          const bucketW = WIDTH / BUCKET_DEFS.length;
          const idx     = Math.floor(body.position.x / bucketW);

          this.handleBucketHit({
            bucket      : BUCKET_DEFS[idx],
            bucketIndex : idx,
            dynModeIdx  : currentModeIdx[idx] ?? blankIdx,
            ballBody    : body,
            ballPathIx  : bi,
            playerIx    : player,
            frame,
            events, balls, paths, offsets, pathOwners, mults, scores, layer,
          });

          /* (removed) hit-based dynamic cycles – now time-based only */
          respawn(body, bi);
        }

        /* win / reject checks */
        if (player!==win && scores[player]>=target) {
          sim.cleanup(); return null;             // someone else wins
        }
        if (player===win && scores[player]>=target &&
            Array.from(scores).every((s,j)=> j===win || s<target)) {
          totalFrames = frame+1;
          break outer;
        }
      }
    }

    sim.cleanup();
    if (!totalFrames) return null;

    /* trim & stretch */
    paths .forEach(p => { p.length = totalFrames*2; });
    events.forEach(e =>  e.frame *= SPEED_FACTOR);

    return {
      winnerIndex : win,
      paths       : paths.map(p=>new Float32Array(p)),
      offsets,
      pathOwners,
      events,
      totalFrames : totalFrames * SPEED_FACTOR,
    };
  }

  /*──────────────── BUCKET‑HIT HANDLER ─────────*/
  private handleBucketHit(opts:{
    bucket     : {type:BucketType,value?:number};
    bucketIndex: number;
    dynModeIdx : number;
    ballBody   : Body;
    ballPathIx : number;
    playerIx   : number;
    frame      : number;

    events     : RecordedRaceEvent[];
    balls      : Body[];
    paths      : number[][];
    offsets    : number[];
    pathOwners : number[];
    mults      : Float32Array;
    scores     : Float32Array;
    layer      : Composite;
  }) {
    const {
      bucket, bucketIndex, dynModeIdx,
      ballBody, ballPathIx, playerIx, frame,
      events, balls, paths, offsets, pathOwners, mults, scores, layer,
    } = opts;

    /* resolve dynamic placeholder */
    const t = DYNAMIC_SEQUENCE[dynModeIdx]
    const def = bucket.type === BucketType.Dynamic
      ? {
          type : t,
          value: t===BucketType.Multiplier
                   ? DYNAMIC_EXTRA_MULT
                   : (t===BucketType.Deduct ? DYNAMIC_DEDUCT_POINTS : bucket.value),
        }
      : bucket;

    switch (def.type) {

      /* ─── no‑op ───────────────────────────── */
      case BucketType.Blank:
        break;

      /* ─── score bucket ────────────────────── */
      case BucketType.Score: {
        const pts = (def.value ?? 0) * mults[playerIx];
        scores[playerIx] += pts;
        events.push({
          frame, player:playerIx, kind:'score',
          value:pts, bucket:bucketIndex,
        });
        mults[playerIx] = 1;
      } break;

      /* ─── multiplier bucket ───────────────── */
      case BucketType.Multiplier: {
        const m = def.value ?? 1;
        const current = mults[playerIx];
        // Additive stacking with baseline 1 preserved
        const next = Math.min((current === 1 ? 0 : current) + m, 64);
        mults[playerIx] = next;
        events.push({
          frame, player:playerIx, kind:'mult',
          value:m, bucket:bucketIndex,
        });
      } break;

      /* ─── deduction bucket ────────────────── */
      case BucketType.Deduct: {
        const base = def.value ?? 0;
        const applied = base * mults[playerIx];
        scores[playerIx] = Math.max(0, scores[playerIx] - applied);
        events.push({
          frame, player:playerIx, kind:'deduct',
          value:applied, bucket:bucketIndex,
        });
        // Consume multiplier on deduction
        mults[playerIx] = 1;
      } break;

      /* ─── extra‑ball bucket ───────────────── */
      case BucketType.ExtraBall: {
        events.push({
          frame, player:playerIx, kind:'extraBall',
          bucket:bucketIndex,
        });

        /* spawn extra ball immediately */
        const spawnX = Math.min(Math.max(
          offsets[ballPathIx] + (this.rng()*30 - 15),
          BALL_RADIUS), WIDTH - BALL_RADIUS);

        const extra = Bodies.circle(spawnX, -10, BALL_RADIUS, {
          restitution:0.4, collisionFilter:{group:-1},
          label:'Ball', plugin:{ playerIndex:playerIx },
        });
        balls.push(extra);
        Composite.add(layer, extra);

        offsets   .push(spawnX);
        pathOwners.push(playerIx);

        /* pre‑fill its path up to current frame */
        const samples = frame + 1;
        const p: number[] = [];
        for (let f=0; f<samples; f++) p.push(spawnX, -10);
        paths.push(p);
      } break;

      /* ─── kill bucket ─────────────────────── */
      case BucketType.Kill: {
        events.push({
          frame, player:playerIx, kind:'ballKill',
          bucket:bucketIndex,
        });
        Composite.remove(layer, ballBody);
        balls[ballPathIx] = Bodies.circle(-999,-999,1,{isStatic:true});
      } break;
    }
  }

  /*──────────────── REPLAY (vsync‑independent) ─────────*/
  replayRace(rec:RecordedRace,onFrame?:(f:number)=>void) {
    this.replayWorld?.cleanup();
    const world = new PhysicsWorld();
    this.replayWorld = world;

    const bodies: Body[] = [];
    const spawnBody = (pathIdx:number) => {
      const owner = rec.pathOwners[pathIdx];
      const body  = Bodies.circle(rec.offsets[pathIdx], -10, BALL_RADIUS,{
        isStatic:true, label:'Ball', plugin:{ playerIndex:owner },
      });
      bodies[pathIdx] = body;
      Composite.add(world.world, body);
    };

    /* initial bodies = one per player */
    this.players.forEach((_,i)=> spawnBody(i));

    let f = 0;
    const N = rec.totalFrames;
    const targetFps = 60;                   // UI playback rate
    const frameMs   = 1000 / targetFps;
    let lastTs = performance.now();
    let accMs  = 0;

    const advanceOneFrame = () => {
      // spawn extra balls at their UI frame
      rec.events.forEach(e => {
        if (e.kind==='extraBall' && e.frame===f) spawnBody(bodies.length);
      });

      const coarse = Math.floor(f / SPEED_FACTOR);
      const alpha  = (f % SPEED_FACTOR) / SPEED_FACTOR;

      bodies.forEach((b,i) => {
        const arr = rec.paths[i];
        if (arr.length < 2) return;
        const len = arr.length/2 - 1;
        const i0  = Math.min(coarse, len);
        const i1  = Math.min(i0+1, len);
        const x0 = arr[i0*2], y0 = arr[i0*2+1];
        const x1 = arr[i1*2], y1 = arr[i1*2+1];

        const [x,y] = (y0 - y1 > TELEPORT_DY)
          ? (alpha===0 ? [x0,y0] : [x1,y1])
          : [x0*(1-alpha)+x1*alpha, y0*(1-alpha)+y1*alpha];

        Matter.Body.setPosition(b, {x,y});
      });

      onFrame?.(f);
      f++;
    };

    const step = (now:number) => {
      accMs += now - lastTs;
      lastTs = now;
      while (accMs >= frameMs && f < N) {
        advanceOneFrame();
        accMs -= frameMs;
      }
      if (f < N) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  /* utils */
  getBodies() {
    return [
      ...this.staticWorld.getBodies(),
      ...(this.replayWorld ? this.replayWorld.getBodies() : []),
    ];
  }
  cleanup() {
    this.staticWorld.cleanup();
    this.replayWorld?.cleanup();
  }
}
