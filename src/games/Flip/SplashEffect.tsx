import { useFrame } from '@react-three/fiber'
import React, { useMemo, useRef } from 'react'
import { InstancedMesh, Object3D } from 'three'

const Trail = ({ color }: {color: string}) => {
  const mesh = useRef<InstancedMesh>(null!)
  const animation = useRef(0)
  const angle = useMemo(() => Math.random() * Math.PI * 2, [])
  const dots = useRef(Array.from({ length: 10 }).map((x, i) => ({ len: i / 10, size: i / 10 })))
  const llll  = useMemo(() => Math.random() * 2 + 1, [])

  useFrame((_) => {
    dots.current.forEach(({ len, size }, i) => {
      const tmp = new Object3D
      tmp.scale.setScalar(animation.current * .1 * size * (1 - animation.current))
      tmp.rotation.z = angle
      tmp.position.set(
        Math.cos(angle) * ((.5 + llll * animation.current) + len),
        Math.sin(angle) * ((.5 + llll * animation.current) + len),
        0,
      )
      tmp.updateMatrix()
      mesh.current.setMatrixAt(i, tmp.matrix)
    })
    mesh.current.instanceMatrix.needsUpdate = true
    animation.current += (1 - animation.current) * .1
  })

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, 10]}>
      <sphereGeometry args={[5]} />
      <meshBasicMaterial color={color} />
    </instancedMesh>
  )
}

export const SplashEffect = ({ color }: {color: string}) => {
  return (
    <>
      {Array.from({ length: 10 }).map((_, i) => <Trail color={color} key={i} />)}
    </>
  )
}
