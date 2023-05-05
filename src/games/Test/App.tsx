import { Text } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { solToLamports } from 'gamba'
import { UNSAFE_useInlineSession } from 'gamba/react'
import { ActionBar, Button, formatLamports } from 'gamba/react-ui'
import React, { useRef, useState } from 'react'
import { Group } from 'three'
import * as Tone from 'tone'
import { Treasure } from './Treasure'
import playSrc from './play.wav'
import winSrc from './win.wav'
const createSound = (url: string) =>
  new Tone.Player({ url }).toDestination()

const soundPlay = createSound(playSrc)
const soundWin = createSound(winSrc)

function Scene({ onClick }: {onClick: () => void}) {
  const group = useRef<Group>(null!)
  const [hover, setHover] = useState(false)

  useFrame(() => {
    group.current.scale.x += ((hover ? 1.1 : 1) - group.current.scale.x) * .1
    group.current.scale.y = group.current.scale.z = group.current.scale.x
  })

  return (
    <group
      ref={group}
      position-y={-1}
      onClick={onClick}
      onPointerOver={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
    >
      <Treasure />
    </group>
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
      <Canvas style={{ background: 'linear-gradient(rgba(36,237,255,1) 0%, rgba(69,77,252,1) 100%)' }}>
        <Scene onClick={play} />
        <Text fontSize={1} position-y={2}>
          {loading ? '...' : typeof result === 'number' ? (['x2', 'x0'][result]) : '--'}
        </Text>
        <Text fontSize={.5} position-y={.5}>
          {formatLamports(rapid.session?.user.info?.lamports ?? 0)}
        </Text>
        {/* <Text fontSize={.5}>
          {formatLamports(rapid.session?.wallet.info?.lamports ?? 0)}
        </Text> */}
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
