import { useGLTF } from '@react-three/drei'
import React from 'react'
import * as THREE from 'three'
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader'
import chestModel from './treasure.glb'

type GLTFResult = GLTF & {
  nodes: {
    Box001: THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>
  }
}

export function Treasure() {
  const model = useGLTF(chestModel) as GLTFResult
  return (
    <mesh geometry={model.nodes.Box001.geometry}>
      <meshBasicMaterial map={model.nodes.Box001.material.map} />
    </mesh>
  )
}
