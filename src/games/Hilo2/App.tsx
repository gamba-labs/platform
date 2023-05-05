import { Canvas, useFrame } from '@react-three/fiber'
import { solToLamports } from 'gamba'
import { UNSAFE_useInlineSession } from 'gamba/react'
import { ActionBar, Button } from 'gamba/react-ui'
import React, { useRef, useState } from 'react'
import { DoubleSide, Group } from 'three'
import * as Tone from 'tone'
import playSrc from './play.wav'
import winSrc from './win.wav'

import card from './card.png'
import { useTexture } from '@react-three/drei'

const createSound = (url: string) =>
  new Tone.Player({ url }).toDestination()

const soundPlay = createSound(playSrc)
const soundWin = createSound(winSrc)

function Scene({ onClick }: {onClick: () => void}) {
  const group = useRef<Group>(null!)
  const [hover, setHover] = useState(false)
  const fuck = useTexture(card)

  useFrame(() => {
    group.current.scale.x += ((hover ? 1.1 : 1) - group.current.scale.x) * .1
    group.current.scale.y = group.current.scale.z = group.current.scale.x
  })

  return (
    <>
      <mesh castShadow receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshToonMaterial side={DoubleSide} color="#ff0066" />
      </mesh>
      <group
        ref={group}
        position-z={1}
        onClick={onClick}
        onPointerOver={() => setHover(true)}
        onPointerLeave={() => setHover(false)}
      >
        <mesh castShadow receiveShadow>
          <planeGeometry args={[1, 1.3]} />
          <meshToonMaterial side={DoubleSide} transparent map={fuck} />
        </mesh>
      </group>
      <ambientLight color="#ffffff" intensity={.2} />
      <directionalLight shadow-bias={-.0001} castShadow position={[10, 10, 50]} intensity={.5} />
      <hemisphereLight color="black" groundColor="red" intensity={1} />
    </>
  )
}

export default function App() {
  const rapid = UNSAFE_useInlineSession()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<number>()
  const [creatingRapid, setCreatingRapid] = useState(false)

  const startRapid = async () => {
    try {
      setCreatingRapid(true)
      const rapidSession = await rapid.create(solToLamports(.1))
    } catch (err) {
      console.error(err)
    } finally {
      //
      setCreatingRapid(false)
    }
  }

  const play = async () => {
    try {
      if (!rapid.session) throw new Error('BOO')
      setLoading(true)
      soundPlay.start()
      const req = await rapid.play([2, 0], solToLamports(.005))
      const result = await req.result()
      setResult(result.resultIndex)
      if (result.payout > 0)
        soundWin.start()
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const withdraw = async () => {
    try {
      if (!rapid.session) throw new Error('BOO')
      setLoading(true)
      await rapid.withdraw()
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Canvas shadows={{ enabled: true }}>
        <Scene onClick={play} />
      </Canvas>
      <ActionBar>
        <Button disabled={!!rapid.session} loading={creatingRapid} onClick={startRapid}>
          Start
        </Button>
        <Button disabled={!rapid.session || loading} onClick={withdraw}>
          End
        </Button>
      </ActionBar>
    </>
  )
}
