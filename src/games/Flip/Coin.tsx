import { useGLTF, useTexture } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import React, { useEffect, useRef } from 'react'
import { BufferGeometry, Group, MeshStandardMaterial } from 'three'
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader'
import assetModel from './Coin.glb'
import headsSrc from './heads.png'
import tailsSrc from './tails.png'

const COIN_COLOR = '#ffd630'

type GLTFResult = GLTF & {
  nodes: {
    Coin: THREE.Mesh<BufferGeometry, MeshStandardMaterial>
  }
}

function CoinModel() {
  const coin = useGLTF(assetModel) as GLTFResult
  const [heads, tails] = useTexture([headsSrc, tailsSrc])
  return (
    <>
      <primitive object={coin.nodes.Coin}>
        <meshToonMaterial
          color={COIN_COLOR}
          emissive={COIN_COLOR}
          emissiveIntensity={.1}
          normalMap={coin.nodes.Coin.material.normalMap}
          map={coin.nodes.Coin.material.map}
        />
      </primitive>
      <mesh position-z={.26}>
        <planeGeometry args={[1.3, 1.3, 1.3]} />
        <meshBasicMaterial transparent map={heads} />
      </mesh>
      <group rotation-y={Math.PI}>
        <mesh position-z={.26}>
          <planeGeometry args={[1.3, 1.3, 1.3]} />
          <meshBasicMaterial transparent map={tails} />
        </mesh>
      </group>
    </>
  )
}

interface CoinFlipProps {
  flipping: boolean
  result: number | null
}

export function Coin({ flipping, result }: CoinFlipProps) {
  const group = useRef<Group>(null!)
  const target = useRef(0)
  const transition = useRef(0)

  useEffect(() => {
    if (!flipping && result !== null) {
      const fullTurns = Math.floor(group.current.rotation.y / (Math.PI * 2))
      target.current = (fullTurns + 1) * Math.PI * 2 + result * Math.PI
    }
  }, [flipping, result])

  useFrame((_, dt) => {
    if (flipping) {
      group.current.rotation.y += 25 * dt
    } else if (result !== null) {
      group.current.rotation.y += (target.current - group.current.rotation.y) * .1
    }
    group.current.scale.y += ((flipping ? 1.25 : 1) - group.current.scale.y) * .1
    group.current.scale.setScalar(group.current.scale.y * transition.current)
    transition.current += (1 - transition.current) * .1
  })

  return (
    <group ref={group}>
      <CoinModel />
    </group>
  )
}
