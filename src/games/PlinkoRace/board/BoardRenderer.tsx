// src/components/BoardRenderer.tsx
import React, { useEffect, useRef } from 'react'
import { GambaUi } from 'gamba-react-ui-v2'
import { toggleMuted, musicManager } from '../musicManager'
import {
  WIDTH, HEIGHT, PEG_RADIUS, BALL_RADIUS,
  BUCKET_DEFS, BUCKET_HEIGHT,
  BucketType, DYNAMIC_SEQUENCE, DYNAMIC_EXTRA_MULT, DYNAMIC_DEDUCT_POINTS,
  DYNAMIC_CYCLE_FRAMES, SPEED_FACTOR,
} from '../engine/constants'
import { useMultiPlinko } from '../hooks/useMultiPlinko'

const ARROW_W = 12, ARROW_H = 10
const HIT_DIST_SQ = (BALL_RADIUS + PEG_RADIUS) ** 2

type Particle   = { x:number; y:number; size:number; opacity:number; life:number; vx:number; vy:number }
type LerpState  = { px:number; py:number }

export interface BoardRendererProps {
  engine: ReturnType<typeof useMultiPlinko>['engine'] | null
  dynModes: number[]
  patternOffsets: number[]
  started: boolean
  bucketAnim: Record<number, number>
  pegAnim: Record<number, number>
  particles: Particle[]
  arrowPos: Map<number, LerpState>
  labelPos: Map<number, LerpState>
  mults: number[]
  roster: { id:string; color:string }[]
  metadata: Record<string,string>
  youIdx: number
  popups: { bucketIndex: number; value: number; life: number; y: number }[]
}

function bucketVisual(
  def:(typeof BUCKET_DEFS)[number],
  dynMode:number,
): { hue:number; label:string } {
  const r = def.type === BucketType.Dynamic
    ? {
        type : DYNAMIC_SEQUENCE[dynMode],
        value: DYNAMIC_SEQUENCE[dynMode] === BucketType.Multiplier
                 ? DYNAMIC_EXTRA_MULT
                 : (DYNAMIC_SEQUENCE[dynMode] === BucketType.Deduct
                    ? DYNAMIC_DEDUCT_POINTS
                    : def.value),
      }
    : def
  switch (r.type) {
    case BucketType.Score     : return { hue:220, label:`${r.value} ▲` }
    case BucketType.Multiplier: return { hue:120, label:`${r.value}×` }
    case BucketType.Deduct    : return { hue: 10, label:`-${r.value} ▼` }
    case BucketType.ExtraBall : return { hue: 60, label:'+1' }
    case BucketType.Kill      : return { hue:  0, label:'☠' }
    case BucketType.Blank     : return { hue: 30, label:'–' }
    default: return { hue: 30, label: '–' }
  }
}

function bucketNextVisual(
  def:(typeof BUCKET_DEFS)[number],
  dynMode:number,
  offset:number,
): { hue:number; label:string } | null {
  if (def.type !== BucketType.Dynamic) return null
  const blankIdx = DYNAMIC_SEQUENCE.findIndex(t => t === BucketType.Blank)
  const nonBlankIdxs = DYNAMIC_SEQUENCE.map((_,i)=>i).filter(i => i !== blankIdx)
  const nextIdx = (dynMode === blankIdx)
    ? nonBlankIdxs[(offset) % nonBlankIdxs.length]
    : nonBlankIdxs[((nonBlankIdxs.indexOf(dynMode) + 1) % nonBlankIdxs.length)]
  const nextType = DYNAMIC_SEQUENCE[nextIdx]
  const r = {
    type : nextType,
    value: nextType === BucketType.Multiplier
            ? DYNAMIC_EXTRA_MULT
            : (nextType === BucketType.Deduct ? DYNAMIC_DEDUCT_POINTS : def.value),
  }
  switch (r.type) {
    case BucketType.Score     : return { hue:220, label:`${r.value} ▼` }
    case BucketType.Multiplier: return { hue:120, label:`${r.value}×` }
    case BucketType.Deduct    : return { hue: 10, label:`-${r.value}` }
    case BucketType.ExtraBall : return { hue: 60, label:'+1' }
    case BucketType.Kill      : return { hue:  0, label:'☠' }
    case BucketType.Blank     : return { hue: 30, label:'–' }
    default: return { hue: 30, label: '–' }
  }
}

export default function BoardRenderer(props: BoardRendererProps) {
  const {
    engine, dynModes, patternOffsets, started, bucketAnim, pegAnim, particles,
    arrowPos, labelPos, mults, roster, metadata, youIdx, popups,
  } = props

  const lastChangeMsRef  = useRef<Record<number, number>>({})
  const prevDynModesRef  = useRef<number[]>(dynModes)
  if (prevDynModesRef.current !== dynModes) {
    BUCKET_DEFS.forEach((b,i) => {
      if (b.type !== BucketType.Dynamic) return
      const prev = prevDynModesRef.current[i] ?? 0
      const curr = dynModes[i] ?? 0
      if (prev !== curr) lastChangeMsRef.current[i] = performance.now()
    })
    prevDynModesRef.current = dynModes
  }

  if (started) {
    BUCKET_DEFS.forEach((b,i) => {
      if (b.type === BucketType.Dynamic && lastChangeMsRef.current[i] == null) {
        lastChangeMsRef.current[i] = performance.now()
      }
    })
  }
  const CYCLE_MS = (DYNAMIC_CYCLE_FRAMES * SPEED_FACTOR / 60) * 1000

  const canvasElRef = useRef<HTMLCanvasElement|null>(null)
  const btnRectRef  = useRef<{x:number;y:number;w:number;h:number}>({x:0,y:0,w:0,h:0})

  useEffect(() => {
    const onClick = (ev: MouseEvent) => {
      const canvas = canvasElRef.current
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      const x = ev.clientX - rect.left
      const y = ev.clientY - rect.top
      const { x:bx, y:by, w:btnW, h:btnH } = btnRectRef.current
      if (x>=bx && x<=bx+btnW && y>=by && y<=by+btnH) {
        toggleMuted()
        ev.stopPropagation()
        ev.preventDefault()
      }
    }
    window.addEventListener('click', onClick)
    return () => window.removeEventListener('click', onClick)
  }, [])

  return (
    <GambaUi.Canvas render={({ ctx, size, canvas }) => {
      if (!engine) return
      canvasElRef.current = canvas as HTMLCanvasElement

      /* ─── clear & scale canvas ─── */
      ctx.clearRect(0,0,size.width,size.height)
      ctx.fillStyle = '#0b0b13'
      ctx.fillRect(0,0,size.width,size.height)

      const scale = Math.min(size.width / WIDTH, size.height / HEIGHT)
      const ox = (size.width  - WIDTH * scale) / 2
      const oy = (size.height - HEIGHT * scale) / 2
      ctx.save()
      ctx.translate(ox, oy)
      ctx.scale(scale, scale)

      const bodies = engine.getBodies()
      const balls  = bodies.filter(b => b.label === 'Ball')
      const pegs   = bodies.filter(b => b.label === 'Peg')

      const mix   = (a:number, b:number, f:number) => a + (b - a) * f
      const lerpF = 0.15                         // smoothing for arrows & names

      /* ─── PEG‑HIT pulse detection ─── */
      balls.forEach(ball => {
        const { x:bx, y:by } = ball.position
        pegs.forEach(peg => {
          const { x:px, y:py } = peg.position
          const dx = bx - px, dy = by - py
          if (dx*dx + dy*dy < HIT_DIST_SQ) {
            const ix = (peg as any).plugin?.pegIndex ?? -1
            if (ix >= 0) pegAnim[ix] = 1
          }
        })
      })

      /* ─── PARTICLES update & draw ─── */
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        if (--p.life <= 0) { particles.splice(i,1); continue }
        p.x += p.vx; p.y += p.vy
        p.opacity *= 0.96; p.size *= 0.98
        ctx.fillStyle = `rgba(255,180,0,${p.opacity})`
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, 2*Math.PI); ctx.fill()
      }

      /* ─── BUCKETS ─── */
      const bw = WIDTH / BUCKET_DEFS.length
      BUCKET_DEFS.forEach((def,i) => {
        let a = bucketAnim[i] || 0
        if (a > 0) bucketAnim[i] = a * 0.85

        const x0 = i * bw
        const top = HEIGHT - BUCKET_HEIGHT
        const cx = x0 + bw/2
        const ly = top + BUCKET_HEIGHT/2
        const mode = dynModes[i] ?? 0
        const { hue, label } = bucketVisual(def, mode)
        // patternOffsets array maps to dynamic buckets in order of appearance
        const dynOrderIndex = BUCKET_DEFS.slice(0, i + 1).filter(b => b.type === BucketType.Dynamic).length - 1
        const nextVis = bucketNextVisual(def, mode, patternOffsets[dynOrderIndex] ?? 0)

        if (a > 0.02) {
          const h = BUCKET_HEIGHT * 3 * a
          const g = ctx.createLinearGradient(0, top, 0, top - h)
          g.addColorStop(0, `hsla(${hue},80%,70%,${0.4*a})`)
          g.addColorStop(1, 'rgba(0,0,0,0)')
          ctx.fillStyle = g
          ctx.fillRect(x0, top - h, bw, h)
        }

        ctx.fillStyle = `hsla(${hue},70%,50%,0.3)`
        ctx.fillRect(x0, top, bw, BUCKET_HEIGHT)

        ctx.font = 'bold 18px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.lineWidth = 3
        ctx.strokeStyle = `hsla(${hue},60%,20%,1)`
        ctx.strokeText(label, cx, ly)
        ctx.fillStyle = `hsla(${hue},80%,75%,1)`
        ctx.fillText(label, cx, ly)

        // floating score/deduct popups over this bucket
        for (let k = 0; k < popups.length; k++) {
          const pp = popups[k]
          if (pp.bucketIndex !== i) continue
          // update per-frame
          pp.life -= 1
          pp.y += 0.8
          const alpha = Math.max(0, Math.min(1, pp.life / 30))
          const positive = pp.value >= 0
          const text = `${positive ? '+' : ''}${Math.abs(pp.value).toFixed(1).replace(/\.0$/, '')}`
          const ty = top - 8 - pp.y
          ctx.font = 'bold 16px sans-serif'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.lineWidth = 4
          ctx.strokeStyle = `rgba(0,0,0,${0.5*alpha})`
          ctx.strokeText(text, cx, ty)
          ctx.fillStyle = positive
            ? `rgba(34,197,94,${alpha})`
            : `rgba(239,68,68,${alpha})`
          ctx.fillText(text, cx, ty)
        }

        // show NEXT icon/label preview for dynamic buckets
        if (nextVis) {
          ctx.font = '12px sans-serif'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'top'
          ctx.fillStyle = `hsla(${nextVis.hue},80%,75%,0.9)`
          ctx.fillText(nextVis.label, cx, top + 4)

          // countdown ring around current label
          const last = lastChangeMsRef.current[i] ?? performance.now()
          const elapsed = performance.now() - last
          const progress = Math.min(Math.max(elapsed / CYCLE_MS, 0), 1)
          const remain = 1 - progress
          const R = Math.min(bw, BUCKET_HEIGHT) * 0.45
          ctx.save()
          ctx.translate(cx, ly)
          ctx.beginPath()
          ctx.lineWidth = 3
          ctx.strokeStyle = `hsla(${hue},80%,70%,0.9)`
          const start = -Math.PI/2
          ctx.arc(0, 0, R, start, start + Math.PI*2*remain)
          ctx.stroke()
          ctx.restore()
        }
      })

      /* ─── BARRIERS & PEGS ─── */
      bodies.forEach(b => {
        if (b.label === 'Barrier') {
          ctx.beginPath()
          b.vertices.forEach((pt,j) => j ? ctx.lineTo(pt.x,pt.y) : ctx.moveTo(pt.x,pt.y))
          ctx.closePath()
          ctx.fillStyle = '#444'
          ctx.fill()
          return
        }
        if (b.label === 'Peg') {
          const ix = (b as any).plugin?.pegIndex ?? -1
          let a = pegAnim[ix] || 0
          if (a > 0) pegAnim[ix] = a * 0.9
          ctx.save()
          ctx.translate(b.position.x, b.position.y)
          ctx.scale(1 + a*0.4, 1 + a*0.4)
          const hue = (b.position.x + b.position.y + Date.now()*0.05) % 360
          ctx.fillStyle = `hsla(${hue},75%,60%,${(1+a*2)*0.2})`
          ctx.beginPath(); ctx.arc(0,0,PEG_RADIUS+4,0,2*Math.PI); ctx.fill()
          ctx.fillStyle = `hsla(${hue},85%,${75+a*25}%,1)`
          ctx.beginPath(); ctx.arc(0,0,PEG_RADIUS,0,2*Math.PI); ctx.fill()
          ctx.restore()
          return
        }
      })

      /* ─── BALLS / ARROWS / NAMES ─── */
      balls.forEach(b => {
        const idx = (b as any).plugin?.playerIndex as number
        const m   = mults[idx] ?? 1
        const { x, y } = b.position
        if (!Number.isFinite(x) || !Number.isFinite(y)) return
        const playerId = roster[idx].id
        const name     = metadata[playerId]

        /* multiplier glow */
        if (m > 1) {
          ctx.globalCompositeOperation = 'lighter'
          const r = BALL_RADIUS * 2
          const g = ctx.createRadialGradient(x,y,0,x,y,r)
          g.addColorStop(0,'rgba(255,255,200,0.5)')
          g.addColorStop(1,'rgba(255,255,200,0)')
          ctx.fillStyle = g
          ctx.beginPath(); ctx.arc(x,y,r,0,2*Math.PI); ctx.fill()
          ctx.globalCompositeOperation = 'source-over'
        }

        /* big flame for high multiplier */
        if (m >= 5 && particles.length < 200) {
          ctx.globalCompositeOperation = 'lighter'
          const base = BALL_RADIUS * 1.2
          const f = 0.8 + Math.random()*0.4
          const r1 = base * 2.3 * f
          const fg = ctx.createRadialGradient(x,y,0,x,y,r1)
          fg.addColorStop(0, `rgba(255,180,0,${0.6*f})`)
          fg.addColorStop(1, 'rgba(255,0,0,0)')
          ctx.fillStyle = fg
          ctx.beginPath(); ctx.arc(x,y,r1,0,2*Math.PI); ctx.fill()

          const r2 = base * 0.8 * f
          const ig = ctx.createRadialGradient(x,y,0,x,y,r2)
          ig.addColorStop(0,'rgba(255,255,220,1)')
          ig.addColorStop(1,'rgba(255,200,0,0)')
          ctx.fillStyle = ig
          ctx.beginPath(); ctx.arc(x,y,r2,0,2*Math.PI); ctx.fill()
          ctx.globalCompositeOperation = 'source-over'

          particles.push({
            x: x + (Math.random()-0.5)*5,
            y: y + (Math.random()-0.5)*5,
            size: 2 + Math.random()*2,
            opacity: 0.5 + Math.random()*0.5,
            life: 20 + Math.random()*10,
            vx: (Math.random()-0.5)*0.5,
            vy: (Math.random()-0.5)*0.5 - 0.5,
          } as Particle)
        }

        /* ball body */
        ctx.fillStyle = roster[idx % roster.length].color
        ctx.beginPath(); ctx.arc(x,y,BALL_RADIUS,0,2*Math.PI); ctx.fill()

        /* “you” arrow */
        if (idx === youIdx) {
          const destX = x, destY = y - BALL_RADIUS - 2
          const st = arrowPos.get(b.id) ?? { px:destX, py:destY }
          st.px = mix(st.px, destX, lerpF)
          st.py = mix(st.py, destY, lerpF)
          arrowPos.set(b.id, st)

          ctx.fillStyle = '#fff'
          ctx.beginPath(); ctx.moveTo(st.px,st.py)
          ctx.lineTo(st.px - ARROW_W/2, st.py - ARROW_H)
          ctx.lineTo(st.px + ARROW_W/2, st.py - ARROW_H)
          ctx.closePath(); ctx.fill()
        }

        /* name label */
        if (name) {
          const yOff = BALL_RADIUS + 6 + (idx===youIdx ? ARROW_H : 0)
          const destX = x, destY = y - yOff
          const st = labelPos.get(b.id) ?? { px:destX, py:destY }
          st.px = mix(st.px, destX, lerpF)
          st.py = mix(st.py, destY, lerpF)
          labelPos.set(b.id, st)

          ctx.font = '12px sans-serif'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'bottom'
          ctx.lineWidth = 3
          ctx.strokeStyle='rgba(0,0,0,0.7)'
          ctx.strokeText(name, st.px, st.py)
          ctx.fillStyle='#ffffff'
          ctx.fillText(name, st.px, st.py)
        }
      })

      /* ─── cleanup vanished bodies ─── */
      const ids = new Set(balls.map(b => b.id))
      arrowPos.forEach((_,id) => { if (!ids.has(id)) arrowPos.delete(id) })
      labelPos.forEach((_,id) => { if (!ids.has(id)) labelPos.delete(id) })

      ctx.restore()

      // draw music mute button bottom-right inside canvas
      const btnPad = 8
      const btnW = 130, btnH = 34
      const bx = size.width - btnW - btnPad
      const by = size.height - btnH - btnPad
      btnRectRef.current = { x: bx, y: by, w: btnW, h: btnH }
      // background
      ctx.fillStyle = 'rgba(0,0,0,0.6)'
      ctx.strokeStyle = 'rgba(255,255,255,0.2)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.roundRect(bx, by, btnW, btnH, 8 as any)
      ctx.fill(); ctx.stroke()
      // label
      ctx.font = '600 13px system-ui, sans-serif'
      ctx.fillStyle = '#fff'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(musicManager.muted ? 'Unmute Music' : 'Mute Music', bx + btnW/2, by + btnH/2)

      // interaction handled by a single global listener; nothing to attach per-frame here
    }}/>
  )
}
