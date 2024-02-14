import Matter from 'matter-js'

const WIDTH = 700
const HEIGHT = 700

// How many plinkos to simulate to find desired result. More is slower but more likely to yield desired result
const SIMULATIONS = 100
// Size of the plinko
export const PLINKO_RAIUS = 9
export const PEG_RADIUS = 11
const RESTISTUTION = .4
const GRAVITY = 1
// How far from the center plinkos can spawn
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

  private makeBuckets() {
    const unique = Array.from(new Set(this.props.multipliers))

    const secondHalf = [...unique].slice(1)
    const firstHalf = [...secondHalf].reverse()
    const center = [unique[0], unique[0], unique[0]]
    const buckets = [
      ...firstHalf,
      ...center,
      ...secondHalf,
    ]
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
    const sensors = buckets.map(
      (bucketMultiplier, bucketIndex) => {
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
  }

  private makePlinkos() {
    return this.startPositions.map(this.makePlinko)
  }

  getBodies() {
    return Matter.Composite.allBodies(this.engine.world)
  }

  constructor(props: PlinkoProps) {
    this.props = props
    this.startPositions = Array.from({ length: SIMULATIONS }).map((_, i) => Matter.Common.random(-SPAWN_OFFSET_RANGE / 2, SPAWN_OFFSET_RANGE / 2))

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

  simulate(desiredBucketIndex: number) {
    const results = this.startPositions.map((_, i) => -1)

    const handleCollision = (plinko: Matter.Body, bucket: Matter.Body) => {
      results[plinko.plugin.startPositionIndex] = bucket.plugin.bucketIndex
    }

    const handler = (event: Matter.IEventCollision<Matter.Engine>) => {
      event.pairs.forEach((pair) => {
        if (pair.bodyA.label === 'Bucket' && pair.bodyB.label === 'Plinko') {
          handleCollision(pair.bodyB, pair.bodyA)
        }
        if (pair.bodyA.label === 'Plinko' && pair.bodyB.label === 'Bucket') {
          handleCollision(pair.bodyA, pair.bodyB)
        }
      })
    }

    Matter.Events.on(this.engine, 'collisionStart', handler)

    // 1. Simulate
    this.reset()

    for (let i = 0; i < 1000; i++) {
      Matter.Runner.tick(this.runner, this.engine, 1)
    }

    Matter.Events.off(this.engine, 'collisionStart', handler)

    Matter.Runner.stop(this.runner)
    Matter.Composite.clear(this.ballComposite, false)

    const desiredResults = results
      .map((bucketIndex, plinkoIndex) => ({ bucketIndex, plinkoIndex }))
      .filter(({ bucketIndex }) => bucketIndex === desiredBucketIndex)

    return desiredResults
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
    // 1. Simulate
    const candidates = this.simulate(bucket.plugin.bucketIndex)

    if (!candidates.length) throw new Error('Failed to simulate')

    console.log(candidates)

    const chosen = Matter.Common.choose(candidates)
    // 2. Run simulation with desired outcome
    Matter.Events.on(this.engine, 'collisionStart', this.collisionHandler)
    Matter.Composite.add(
      this.ballComposite,
      this.makePlinko(this.startPositions[chosen.plinkoIndex], chosen.plinkoIndex),
    )

    Matter.Runner.run(this.runner, this.engine)
  }
}
