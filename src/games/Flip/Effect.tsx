import { useFrame } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import React from 'react'
import * as THREE from 'three'

import TEXTURE_STAR from './star.png'

const tmp = new THREE.Object3D

const STARS = 10

export const Effect = ({ color }: {color: string}) => {
  const texture = useTexture(TEXTURE_STAR)
  const mesh = React.useRef<THREE.InstancedMesh>(null!)
  const animation = React.useRef(0)

  useFrame(() => {
    for (let i = 0; i < STARS; i ++) {
      const angle = i / STARS * Math.PI * 2
      const ssss = .5 + (1 + Math.cos(i)) * 2
      tmp.rotation.z = i + Date.now() * .001
      tmp.scale.setScalar(ssss * animation.current * 1 * (1 - animation.current))
      const len = 1 + 2 * animation.current
      tmp.position.set(
        Math.cos(angle) * len,
        Math.sin(angle) * len,
        0,
      )
      tmp.updateMatrix()
      mesh.current.setMatrixAt(i, tmp.matrix)
    }
    mesh.current.instanceMatrix.needsUpdate = true
    animation.current += (1 - animation.current) * .1
  })

  return (
    <instancedMesh
      ref={mesh}
      args={[undefined, undefined, STARS]}
      position-z={-1}
    >
      <planeGeometry />
      <meshBasicMaterial transparent map={texture} color={color} />
    </instancedMesh>
  )
}
