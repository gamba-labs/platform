import { useGLTF, useTexture } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import React from 'react'
import { Group } from 'three'
import { clamp } from 'three/src/math/MathUtils'

export const TEXTURE_HEADS = require('./heads.png')
export const TEXTURE_TAILS = require('./tails.png')
const MODEL_COIN = require('./Coin.glb')

function CoinModel() {
  const model = useGLTF(MODEL_COIN)
  const [heads, tails] = useTexture([TEXTURE_HEADS, TEXTURE_TAILS])
  return (
    <>
      <primitive object={model.nodes.Coin}>
      </primitive>
      <mesh position-z={.3}>
        <planeGeometry args={[1.3, 1.3, 1.3]} />
        <meshStandardMaterial transparent map={heads} />
      </mesh>
      <group rotation-y={Math.PI}>
        <mesh position-z={.3}>
          <planeGeometry args={[1.3, 1.3, 1.3]} />
          <meshStandardMaterial transparent map={tails} />
        </mesh>
      </group>
    </>
  )
}

interface CoinFlipProps {
  flipping: boolean
  result: number
}

export function Coin({ flipping, result }: CoinFlipProps) {
  const group = React.useRef<Group>(null!)
  const target = React.useRef(0)

  React.useEffect(() => {
    if (!flipping) {
      const fullTurns = Math.floor(group.current.rotation.y / (Math.PI * 2))
      target.current = (fullTurns + 1) * Math.PI * 2 + result * Math.PI
    }
  }, [flipping, result])

  useFrame((_, dt) => {
    if (flipping) {
      group.current.rotation.y += 25 * dt
    } else {
      group.current.rotation.y += clamp((target.current - group.current.rotation.y) * 10 * dt, 0, 1)
    }
    const scale = flipping ? 1.25 : 1
    group.current.scale.y += (scale - group.current.scale.y) * .1
    group.current.scale.setScalar(group.current.scale.y)
  })

  return (
    <group ref={group}>
      <CoinModel />
    </group>
  )
}
