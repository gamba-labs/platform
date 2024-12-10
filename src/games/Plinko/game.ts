import Matter from 'matter-js'

const WIDTH = 700
const HEIGHT = 700

const SIMULATIONS = 100
export const PLINKO_RAIUS = 9
export const PEG_RADIUS = 11
const RESTISTUTION = .4
const GRAVITY = 1
const SPAWN_OFFSET_RANGE = 10

export const bucketWallHeight = 60
export const bucketHeight = bucketWallHeight
export const barrierHeight = bucketWallHeight * 1.2
export const barrierWidth = 4

interface PlinkoContactEvent {
  plinko?: Matter.Body
  peg?: Matter.Body
  bucket?: Matter.Body
  barrier?: Matter.Body
}

export interface PlinkoProps {
  multipliers: number[]
  onContact: (contact: PlinkoContactEvent) => void
  rows: number
}

interface SimulationResult {
  bucketIndex: number
  plinkoIndex: number
  path: {x:number,y:number}[]
  collisions: { frame: number, event: PlinkoContactEvent }[]
}

export class Plinko {
  width = WIDTH
  height = HEIGHT

  private engine = Matter.Engine.create({
    gravity: { y: GRAVITY },
    timing: { timeScale: 1 },
  })

  private runner = Matter.Runner.create()
  private props: PlinkoProps
  private ballComposite = Matter.Composite.create()
  private bucketComposite = Matter.Composite.create()
  private startPositions: number[]
  private currentPath: {x:number,y:number}[] | null = null
  private replayCollisions: { frame: number, event: PlinkoContactEvent }[] = []
  private currentFrame: number = 0
  private replayBall: Matter.Body | null = null
  private animationId: number | null = null
  private visualizePath: boolean = false

  setVisualizePath(enabled: boolean) {
    this.visualizePath = enabled
  }

  private makeBuckets() {
    const unique = Array.from(new Set(this.props.multipliers))
    const secondHalf = [...unique].slice(1)
    const firstHalf = [...secondHalf].reverse()
    const center = [unique[0], unique[0], unique[0]]
    const buckets = [...firstHalf, ...center, ...secondHalf]
    const numBuckets = buckets.length
    const bucketWidth = this.width / numBuckets
    const barriers = Array.from({ length: numBuckets + 1 }).map((_, i) => {
      const x = i * bucketWidth
      return Matter.Bodies.rectangle(x, this.height - barrierHeight / 2, barrierWidth, barrierHeight, {
        isStatic: true,
        label: 'Barrier',
        chamfer: { radius: 2 },
      })
    })
    const sensors = buckets.map((bucketMultiplier, bucketIndex) => {
      const x = bucketIndex * bucketWidth + bucketWidth / 2
      return Matter.Bodies.rectangle(x, this.height - bucketHeight / 2, bucketWidth - barrierWidth, bucketHeight, {
        isStatic: true,
        isSensor: true,
        label: 'Bucket',
        plugin: {
          bucketIndex,
          bucketMultiplier,
        },
      })
    })

    return [...sensors, ...barriers]
  }

  private makePlinko = (offsetX: number, index: number) => {
    const x = this.width / 2 + offsetX
    const y = -10
    return Matter.Bodies.circle(x, y, PLINKO_RAIUS, {
      restitution: RESTISTUTION,
      collisionFilter: { group: -6969 },
      label: 'Plinko',
      plugin: { startPositionIndex: index },
    })
  }

  single() {
    Matter.Events.off(this.engine, 'collisionStart', this.collisionHandler)
    Matter.Runner.stop(this.runner)
    Matter.Events.on(this.engine, 'collisionStart', this.collisionHandler)
    Matter.Composite.add(
      this.ballComposite,
      this.makePlinko(Matter.Common.random(-SPAWN_OFFSET_RANGE, SPAWN_OFFSET_RANGE), 0),
    )
    Matter.Runner.run(this.runner, this.engine)
  }

  cleanup() {
    Matter.World.clear(this.engine.world, false)
    Matter.Engine.clear(this.engine)
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId)
      this.animationId = null
    }
  }

  private makePlinkos() {
    return this.startPositions.map(this.makePlinko)
  }

  getBodies() {
    return Matter.Composite.allBodies(this.engine.world)
  }

  constructor(props: PlinkoProps) {
    this.props = props
    this.startPositions = Array.from({ length: SIMULATIONS }).map(() => Matter.Common.random(-SPAWN_OFFSET_RANGE / 2, SPAWN_OFFSET_RANGE / 2))

    const rowSize = this.height / (this.props.rows + 2)
    const pegs = Array.from({ length: this.props.rows })
      .flatMap((_, row, jarr) => {
        const cols = (1 + row)
        const rowWidth = this.width * (row / (jarr.length - 1))
        const colSpacing = cols === 1 ? 0 : rowWidth / (cols - 1)
        return Array.from({ length: cols })
          .map((_, column, arr) => {
            const x = this.width / 2 - rowWidth / 2 + colSpacing * column
            const y = rowSize * row + rowSize / 2
            return Matter.Bodies.circle(x, y, PEG_RADIUS, {
              isStatic: true,
              label: 'Peg',
              plugin: { pegIndex: row * arr.length + column },
            })
          })
      }).slice(1)

    Matter.Composite.add(
      this.bucketComposite,
      this.makeBuckets(),
    )

    Matter.Composite.add(this.engine.world, [
      ...pegs,
      this.ballComposite,
      this.bucketComposite,
    ])
  }

  reset() {
    Matter.Runner.stop(this.runner)
    Matter.Composite.clear(this.ballComposite, false)
    Matter.Composite.add(this.ballComposite, this.makePlinkos())
  }

  private recordContactEvent(event: Matter.IEventCollision<Matter.Engine>, frame: number, collisions: { frame: number, event: PlinkoContactEvent }[]) {
    for (const pair of event.pairs) {
      const contactEvent: PlinkoContactEvent = {}
      const assignBody = (key: keyof PlinkoContactEvent, label: string) => {
        if (pair.bodyA.label === label) contactEvent[key] = pair.bodyA
        if (pair.bodyB.label === label) contactEvent[key] = pair.bodyB
      }
      assignBody('peg', 'Peg')
      assignBody('bucket', 'Bucket')
      assignBody('barrier', 'Barrier')
      assignBody('plinko', 'Plinko')

      if (contactEvent.peg || contactEvent.bucket || contactEvent.barrier || contactEvent.plinko) {
        collisions.push({ frame, event: contactEvent })
      }
    }
  }

  simulate(desiredBucketIndex: number) {
    const results: Omit<SimulationResult, 'collisions'>[] = []
    const paths: {x:number,y:number}[][] = this.startPositions.map(() => [])
    const allCollisions: { frame: number, event: PlinkoContactEvent }[] = []

    let simFrame = 0
    const simHandler = (ev: Matter.IEventCollision<Matter.Engine>) => {
      this.recordContactEvent(ev, simFrame, allCollisions)
    }

    Matter.Events.on(this.engine, 'collisionStart', simHandler)
    this.reset()

    for (let i = 0; i < 1000; i++) {
      simFrame = i
      Matter.Runner.tick(this.runner, this.engine, 1)
      const bodies = Matter.Composite.allBodies(this.ballComposite)
      bodies.forEach((b) => {
        if (b.label === 'Plinko') {
          const idx = b.plugin.startPositionIndex
          paths[idx].push({ x: b.position.x, y: b.position.y })
        }
      })
    }

    Matter.Events.off(this.engine, 'collisionStart', simHandler)
    Matter.Runner.stop(this.runner)
    Matter.Composite.clear(this.ballComposite, false)

    const bucketHits: { [plinkoIndex: number]: number } = {}
    allCollisions.forEach(({frame, event}) => {
      if (event.plinko && event.bucket) {
        const plinkoIndex = event.plinko.plugin.startPositionIndex
        if (bucketHits[plinkoIndex] === undefined) {
          bucketHits[plinkoIndex] = event.bucket.plugin.bucketIndex
        }
      }
    })

    const finalResults = []
    for (let i=0; i<this.startPositions.length; i++) {
      if (bucketHits[i] !== undefined) {
        finalResults.push({
          bucketIndex: bucketHits[i],
          plinkoIndex: i,
          path: paths[i],
          collisions: allCollisions
        })
      }
    }

    return finalResults.filter(({ bucketIndex }) => bucketIndex === desiredBucketIndex)
  }

  collisionHandler = (event: Matter.IEventCollision<Matter.Engine>) => {
    const contactEvent: PlinkoContactEvent = {}
    for (const pair of event.pairs) {
      const assignBody = (key: keyof PlinkoContactEvent, label: string) => {
        if (pair.bodyA.label === label) contactEvent[key] = pair.bodyA
        if (pair.bodyB.label === label) contactEvent[key] = pair.bodyB
      }
      assignBody('peg', 'Peg')
      assignBody('bucket', 'Bucket')
      assignBody('barrier', 'Barrier')
      assignBody('plinko', 'Plinko')
    }
    this.props.onContact && this.props.onContact(contactEvent)
  }

  runAll() {
    Matter.Events.off(this.engine, 'collisionStart', this.collisionHandler)
    Matter.Runner.stop(this.runner)
    Matter.Composite.clear(this.ballComposite, false)
    Matter.Events.on(this.engine, 'collisionStart', this.collisionHandler)
    Matter.Composite.add(
      this.ballComposite,
      this.makePlinkos(),
    )
    Matter.Runner.run(this.runner, this.engine)
  }

  run(desiredMultiplier: number) {
    Matter.Events.off(this.engine, 'collisionStart', this.collisionHandler)
    const bucket = Matter.Common.choose(
      this.bucketComposite.bodies.filter((x) => x.plugin.bucketMultiplier === desiredMultiplier),
    )
    const candidates = this.simulate(bucket.plugin.bucketIndex)
    if (!candidates.length) throw new Error('Failed to simulate desired outcome')

    const chosen = Matter.Common.choose(candidates)

    if (this.visualizePath) {
      console.log("Chosen path:", chosen.path)
    }

    this.currentPath = chosen.path
    this.currentFrame = 0

    const chosenIndex = chosen.plinkoIndex
    const chosenCollisions = chosen.collisions.filter(({event}) => {
      return event.plinko && event.plinko.plugin.startPositionIndex === chosenIndex
    })
    this.replayCollisions = chosenCollisions

    const ball = this.makePlinko(this.startPositions[chosenIndex], chosenIndex)
    Matter.Composite.add(this.ballComposite, ball)
    this.replayBall = ball

    Matter.Runner.stop(this.runner)
    this.startReplayAnimation()
  }

  private startReplayAnimation() {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId)
    }
    const animate = () => {
      if (!this.currentPath || !this.replayBall) return
      if (this.currentFrame >= this.currentPath.length) {
        return
      }
      const pos = this.currentPath[this.currentFrame]
      Matter.Body.setPosition(this.replayBall, { x: pos.x, y: pos.y })

      const frameCollisions = this.replayCollisions.filter(c => c.frame === this.currentFrame)
      frameCollisions.forEach(({event}) => {
        this.props.onContact(event)
      })

      this.currentFrame++
      this.animationId = requestAnimationFrame(animate)
    }
    this.animationId = requestAnimationFrame(animate)
  }
}
