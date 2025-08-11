import Matter from "matter-js";

const WIDTH = 700;
const HEIGHT = 700;
const SIMULATIONS = 50;

export const PLINKO_RAIUS = 9;
export const PEG_RADIUS = 11;
const RESTITUTION = 0.4;
const GRAVITY = 1;
const SPAWN_OFFSET_RANGE = 10;

export const bucketWallHeight = 60;
export const bucketHeight = bucketWallHeight;
export const barrierHeight = bucketWallHeight * 1.2;
export const barrierWidth = 4;

interface PlinkoContactEvent {
  plinko?: Matter.Body;
  peg?: Matter.Body;
  bucket?: Matter.Body;
  barrier?: Matter.Body;
}

export interface PlinkoProps {
  multipliers: number[];
  onContact: (contact: PlinkoContactEvent) => void;
  rows: number;
}

interface SimulationResult {
  bucketIndex: number;
  plinkoIndex: number;
  path: Float32Array;                                      // dense [x0,y0,x1,y1…]
  collisions: { frame: number; event: PlinkoContactEvent }[];
}

export class Plinko {
  width = WIDTH;
  height = HEIGHT;

  private engine = Matter.Engine.create({
    gravity: { y: GRAVITY },
    timing: { timeScale: 1 },
  });

  // keep isFixed:true so tick(engine,1) is deterministic
  private runner = Matter.Runner.create({ isFixed: true });

  private props: PlinkoProps;
  private ballComposite = Matter.Composite.create();
  private bucketComposite = Matter.Composite.create();
  private startPositions: number[];
  private currentPath: Float32Array | null = null;
  private replayCollisions: { frame: number; event: PlinkoContactEvent }[] = [];
  private currentFrame = 0;
  private replayBall: Matter.Body | null = null;
  private animationId: number | null = null;
  private visualizePath = false;

  setVisualizePath(on: boolean) {
    this.visualizePath = on;
  }

  constructor(props: PlinkoProps) {
    this.props = props;
    // pre-compute 50 random X-offsets in ±5px
    this.startPositions = Array.from({ length: SIMULATIONS }).map(() =>
      Matter.Common.random(-SPAWN_OFFSET_RANGE / 2, SPAWN_OFFSET_RANGE / 2)
    );

    // build peg grid
    const rowSize = this.height / (props.rows + 2);
    const pegs = Array.from({ length: props.rows })
      .flatMap((_, row, all) => {
        const cols = row + 1;
        const rowW = (this.width * row) / (all.length - 1);
        const spacing = cols === 1 ? 0 : rowW / (cols - 1);
        return Array.from({ length: cols }).map((_, col) => {
          const x = this.width / 2 - rowW / 2 + spacing * col;
          const y = rowSize * row + rowSize / 2;
          return Matter.Bodies.circle(x, y, PEG_RADIUS, {
            isStatic: true,
            label: "Peg",
            plugin: { pegIndex: row * cols + col },
          });
        });
      })
      .slice(1);

    Matter.Composite.add(this.bucketComposite, this.makeBuckets());
    Matter.Composite.add(this.engine.world, [
      ...pegs,
      this.ballComposite,
      this.bucketComposite,
    ]);
  }

  private makeBuckets() {
    const unique = Array.from(new Set(this.props.multipliers));
    const secondHalf = unique.slice(1);
    const firstHalf = [...secondHalf].reverse();
    const center = [unique[0], unique[0], unique[0]];
    const layout = [...firstHalf, ...center, ...secondHalf];
    const w = this.width / layout.length;

    const barriers = Array.from({ length: layout.length + 1 }).map((_, i) =>
      Matter.Bodies.rectangle(i * w, this.height - barrierHeight / 2, barrierWidth, barrierHeight, {
        isStatic: true,
        label: "Barrier",
        chamfer: { radius: 2 },
      })
    );

    const sensors = layout.map((m, idx) =>
      Matter.Bodies.rectangle(
        idx * w + w / 2,
        this.height - bucketHeight / 2,
        w - barrierWidth,
        bucketHeight,
        {
          isStatic: true,
          isSensor: true,
          label: "Bucket",
          plugin: { bucketIndex: idx, bucketMultiplier: m },
        }
      )
    );

    return [...sensors, ...barriers];
  }

  private makePlinko = (offsetX: number, index: number) =>
    Matter.Bodies.circle(this.width / 2 + offsetX, -10, PLINKO_RAIUS, {
      restitution: RESTITUTION,
      collisionFilter: { group: -6969 },
      label: "Plinko",
      plugin: { startPositionIndex: index },
    });

  getBodies() {
    return Matter.Composite.allBodies(this.engine.world);
  }

  single() {
    Matter.Events.off(this.engine, "collisionStart", this.collisionHandler);
    Matter.Runner.stop(this.runner);
    Matter.Events.on(this.engine, "collisionStart", this.collisionHandler);
    Matter.Composite.add(
      this.ballComposite,
      this.makePlinko(Matter.Common.random(-SPAWN_OFFSET_RANGE, SPAWN_OFFSET_RANGE), 0)
    );
    Matter.Runner.run(this.runner, this.engine);
  }

  cleanup() {
    Matter.World.clear(this.engine.world, false);
    Matter.Engine.clear(this.engine);
    if (this.animationId !== null) cancelAnimationFrame(this.animationId);
    this.animationId = null;
  }

  reset() {
    Matter.Runner.stop(this.runner);
    Matter.Composite.clear(this.ballComposite, false);
    Matter.Composite.add(
      this.ballComposite,
      this.startPositions.map(this.makePlinko)
    );
  }

  /** Simulate up to 1 000 steps, recording *all* paths until the very first
    * ball hits the target bucket, then stop. */
  private simulate(desiredBucketIndex: number): SimulationResult | null {
    this.reset();

    // per-ball path buffers
    const paths: number[][] = this.startPositions.map(() => []);
    // all collisions, to be filtered
    const allCollisions: { frame: number; event: PlinkoContactEvent }[] = [];
    let chosenIndex: number | null = null;
    let frame = 0;

    const simHandler = (ev: Matter.IEventCollision<Matter.Engine>) => {
      // record every collision
      this.recordContactEvent(ev, frame, allCollisions);

      // detect the *first* bucket hit
      for (const p of ev.pairs) {
        const A = p.bodyA, B = p.bodyB;
        if (
          (A.label === "Plinko" && B.label === "Bucket" && B.plugin.bucketIndex === desiredBucketIndex) ||
          (B.label === "Plinko" && A.label === "Bucket" && A.plugin.bucketIndex === desiredBucketIndex)
        ) {
          chosenIndex = (A.label === "Plinko" ? A : B).plugin.startPositionIndex;
          break;
        }
      }
    };

    Matter.Events.on(this.engine, "collisionStart", simHandler);

    // run up to 1 000 ms-ticks or until chosen ball leaves bottom
    for (; frame < 1000; frame++) {
      Matter.Runner.tick(this.runner, this.engine, 1);

      // record position for every ball this frame
      for (const b of this.ballComposite.bodies) {
        if (b.label === "Plinko") {
          const idx = b.plugin.startPositionIndex;
          paths[idx].push(b.position.x, b.position.y);
        }
      }

      // once we know which ball and it has dropped below view, stop
      if (chosenIndex !== null) {
        const winBall = this.ballComposite.bodies.find(
          (b) => b.plugin.startPositionIndex === chosenIndex
        )!;
        if (winBall.position.y > this.height) {
          frame++;
          break;
        }
      }
    }

    Matter.Events.off(this.engine, "collisionStart", simHandler);
    Matter.Runner.stop(this.runner);
    Matter.Composite.clear(this.ballComposite, false);

    if (chosenIndex === null) return null;

    // build a typed array for the winner’s full path
    const winnerPath = new Float32Array(paths[chosenIndex]);

    // filter out only this ball’s collisions
    const winnerCollisions = allCollisions.filter(
      (c) => c.event.plinko?.plugin.startPositionIndex === chosenIndex
    );

    return {
      bucketIndex: desiredBucketIndex,
      plinkoIndex: chosenIndex,
      path: winnerPath,
      collisions: winnerCollisions,
    };
  }

  private recordContactEvent(
    ev: Matter.IEventCollision<Matter.Engine>,
    frame: number,
    list: { frame: number; event: PlinkoContactEvent }[],
    onlyForPlinko?: number
  ) {
    for (const p of ev.pairs) {
      const evt: PlinkoContactEvent = {};
      const tag = (k: keyof PlinkoContactEvent, lbl: string) => {
        if (p.bodyA.label === lbl) evt[k] = p.bodyA;
        if (p.bodyB.label === lbl) evt[k] = p.bodyB;
      };
      tag("peg", "Peg");
      tag("barrier", "Barrier");
      tag("bucket", "Bucket");
      tag("plinko", "Plinko");

      if (
        evt.plinko &&
        (onlyForPlinko === undefined ||
          evt.plinko.plugin.startPositionIndex === onlyForPlinko)
      ) {
        list.push({ frame, event: evt });
      }
    }
  }

  run(desiredMultiplier: number) {
    // pick a bucket with matching multiplier
    const bucket = Matter.Common.choose(
      this.bucketComposite.bodies.filter(
        (b) => b.plugin.bucketMultiplier === desiredMultiplier
      )
    );
    const sim = this.simulate(bucket.plugin.bucketIndex);
    if (!sim) throw new Error("Failed to simulate desired outcome");

    if (this.visualizePath) {
      console.log("Simulation frames:", sim.path.length / 2);
    }

    this.currentPath = sim.path;
    this.currentFrame = 0;
    this.replayCollisions = sim.collisions;

    // spawn the live ball at the same start offset
    const liveBall = this.makePlinko(
      this.startPositions[sim.plinkoIndex],
      sim.plinkoIndex
    );
    Matter.Composite.add(this.ballComposite, liveBall);
    this.replayBall = liveBall;

    // purely positional replay—no physics
    this.startReplayAnimation();
  }

  private startReplayAnimation() {
    if (this.animationId !== null) cancelAnimationFrame(this.animationId);

    const step = () => {
      if (!this.currentPath || !this.replayBall) return;
      const totalFrames = this.currentPath.length / 2;
      if (this.currentFrame >= totalFrames) return;

      const x = this.currentPath[this.currentFrame * 2];
      const y = this.currentPath[this.currentFrame * 2 + 1];
      Matter.Body.setPosition(this.replayBall, { x, y });

      // fire any collisions for this frame
      this.replayCollisions
        .filter((c) => c.frame === this.currentFrame)
        .forEach(({ event }) => this.props.onContact(event));

      this.currentFrame++;
      this.animationId = requestAnimationFrame(step);
    };

    this.animationId = requestAnimationFrame(step);
  }

  collisionHandler = (ev: Matter.IEventCollision<Matter.Engine>) => {
    const evt: PlinkoContactEvent = {};
    for (const p of ev.pairs) {
      const tag = (k: keyof PlinkoContactEvent, lbl: string) => {
        if (p.bodyA.label === lbl) evt[k] = p.bodyA;
        if (p.bodyB.label === lbl) evt[k] = p.bodyB;
      };
      tag("peg", "Peg");
      tag("barrier", "Barrier");
      tag("bucket", "Bucket");
      tag("plinko", "Plinko");
    }
    this.props.onContact(evt);
  };

  runAll() {
    Matter.Events.off(this.engine, "collisionStart", this.collisionHandler);
    Matter.Runner.stop(this.runner);
    Matter.Composite.clear(this.ballComposite, false);
    Matter.Events.on(this.engine, "collisionStart", this.collisionHandler);
    Matter.Composite.add(
      this.ballComposite,
      this.startPositions.map(this.makePlinko)
    );
    Matter.Runner.run(this.runner, this.engine);
  }
}
