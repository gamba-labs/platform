// src/components/LobbyBackground.tsx
import React, { useEffect, useRef } from 'react'
import Matter, { Bodies, Composite, Body } from 'matter-js'
import { PhysicsWorld } from '../engine/PhysicsWorld'
import { GambaUi } from 'gamba-react-ui-v2'
import {
  WIDTH,
  HEIGHT,
  BALL_RADIUS,
  PEG_RADIUS,
  BUCKET_HEIGHT,
  BUCKET_DEFS,
} from '../engine/constants'

const SPAWN_INTERVAL = 300
const BALL_COLORS = ['#ff9aa2','#ffb7b2','#ffdac1','#e2f0cb','#b5ead7','#c7ceea']

export default function LobbyBackground() {
  const worldRef      = useRef<PhysicsWorld>()
  const ballsRef      = useRef<Body[]>([])
  const lastSpawn     = useRef(0)
  const bucketHitsRef = useRef<Record<number, number>>({})

  useEffect(() => {
    const w = new PhysicsWorld()
    worldRef.current = w
    return () => w.cleanup()
  }, [])

  useEffect(() => {
    let raf: number
    const step = (time: number) => {
      const w = worldRef.current!
      // spawn a new ball
      if (time - lastSpawn.current > SPAWN_INTERVAL) {
        lastSpawn.current = time
        const x = WIDTH/2 + (Math.random()*200 - 100)
        const color = BALL_COLORS[Math.floor(Math.random()*BALL_COLORS.length)]
        const ball = Bodies.circle(x, -BALL_RADIUS, BALL_RADIUS, {
          restitution: 0.4,
          label: 'Ball',
          plugin: { color },
        })
        ballsRef.current.push(ball)
        Composite.add(w.world, ball)
      }
      // advance physics
      w.tick(16)
      // remove fallen balls
      ballsRef.current = ballsRef.current.filter(b => {
        if (b.position.y > HEIGHT + 80) {
          Composite.remove(w.world, b)
          return false
        }
        return true
      })
      raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <GambaUi.Canvas
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        background: 'transparent',   // ensure the canvas itself is transparent
      }}
      render={({ ctx, size }) => {
        const w = worldRef.current
        if (!w) return

        const scale = Math.min(size.width / WIDTH, size.height / HEIGHT)
        ctx.clearRect(0, 0, size.width, size.height)
        ctx.save()
        ctx.translate(
          (size.width  - WIDTH  * scale) / 2,
          (size.height - HEIGHT * scale) / 2
        )
        ctx.scale(scale, scale)

        // transparent background
        // draw pegs
        const bodies = w.getBodies()
        const pegs   = bodies.filter(b => b.label === 'Peg')
        ctx.fillStyle = '#555'
        pegs.forEach(p => {
          ctx.beginPath()
          ctx.arc(p.position.x, p.position.y, PEG_RADIUS, 0, 2*Math.PI)
          ctx.fill()
        })

        // draw barriers
        const barriers = bodies.filter(b => b.label === 'Barrier')
        ctx.fillStyle = '#333'
        barriers.forEach(b => {
          ctx.beginPath()
          b.vertices.forEach((v,i) =>
            i ? ctx.lineTo(v.x,v.y) : ctx.moveTo(v.x,v.y)
          )
          ctx.closePath()
          ctx.fill()
        })

        // bucket hit detection
        const now   = performance.now()
        const balls = bodies.filter(b => b.label === 'Ball')
        const count = BUCKET_DEFS.length
        const bw    = WIDTH / count
        balls.forEach(ball => {
          const bx = ball.position.x
          const by = ball.position.y + BALL_RADIUS
          if (by >= HEIGHT - BUCKET_HEIGHT) {
            const idx = Math.floor(bx / bw)
            if (idx >= 0 && idx < count) {
              bucketHitsRef.current[idx] = now
            }
          }
        })

        // draw buckets with colored bases and upward glow
        for (let i = 0; i < count; i++) {
          const x0   = i * bw
          const y0   = HEIGHT - BUCKET_HEIGHT
          const hit  = bucketHitsRef.current[i] || 0
          const age  = now - hit
          const glow = Math.max(0, 1 - age / 250) // 250ms fade

          // pick a hue per bucket (rainbow spread)
          const hue = (i / count) * 360

          // bucket base (semi-transparent color)
          ctx.fillStyle = `hsla(${hue}, 70%, 50%, 0.5)`
          ctx.fillRect(x0, y0, bw, BUCKET_HEIGHT)

          // upward glow gradient
          if (glow > 0) {
            const g = ctx.createLinearGradient(0, y0, 0, y0 - BUCKET_HEIGHT * 3)
            g.addColorStop(0, `hsla(${hue}, 80%, 70%, ${0.4 * glow})`)
            g.addColorStop(1, 'rgba(0,0,0,0)')
            ctx.fillStyle = g
            ctx.fillRect(x0, y0 - BUCKET_HEIGHT * 3, bw, BUCKET_HEIGHT * 3)
          }
        }

        // draw balls with randomized colors
        balls.forEach(b => {
          const col = (b as any).plugin.color || '#ffb74d'
          ctx.fillStyle = col
          ctx.beginPath()
          ctx.arc(b.position.x, b.position.y, BALL_RADIUS, 0, 2*Math.PI)
          ctx.fill()
        })

        ctx.restore()
      }}
    />
  )
}
