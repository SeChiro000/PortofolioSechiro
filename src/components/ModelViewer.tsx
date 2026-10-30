'use client'

import React, { useRef, useState, useEffect } from 'react'

// Polyfill React internals before @react-three/fiber imports to fix Next.js 15 App Router compatibility
if (typeof window !== 'undefined') {
  const reactAny = React as any
  const internals = reactAny.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED || reactAny.__CLIENT_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED || {}
  if (!internals.ReactCurrentOwner) {
    internals.ReactCurrentOwner = { current: null }
  }
  if (!reactAny.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED) {
    reactAny.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = internals
  }
}

import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, useGLTF, Center, Bounds } from '@react-three/drei'
import * as THREE from 'three'
import type { MotionValue } from 'framer-motion'

function BananaMilkModel({ scrollSpin, onModelReady }: { scrollSpin: MotionValue<number>; onModelReady: () => void }) {
  const groupRef = useRef<THREE.Group>(null)
  const { scene } = useGLTF('/Bananav2.glb')
  
  const clonedScene = React.useMemo(() => scene.clone(), [scene])

  React.useEffect(() => {
    if (onModelReady) onModelReady()
  }, [onModelReady])

  const processedScene = React.useMemo(() => {
    clonedScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh
        if (mesh.getObjectByName('inverse-hull-outline')) return

        mesh.material = new THREE.MeshBasicMaterial({
          color: new THREE.Color('#ffffff'),
          toneMapped: false,
        })

        const outlineMaterial = new THREE.MeshBasicMaterial({
          color: new THREE.Color('#28558a'),
          side: THREE.BackSide,
          toneMapped: false,
        })
        const outlineMesh = new THREE.Mesh(mesh.geometry, outlineMaterial)
        outlineMesh.name = 'inverse-hull-outline'
        outlineMesh.scale.setScalar(1.03)
        outlineMesh.renderOrder = -1
        mesh.add(outlineMesh)
      }
    })
    return clonedScene
  }, [clonedScene])

  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.getElapsedTime()
      const loopRotation = Math.sin(time * 0.5) * 0.5
      groupRef.current.position.set(0, 0, 0)
      groupRef.current.rotation.y = scrollSpin.get() + loopRotation
      groupRef.current.rotation.x = 0
      groupRef.current.rotation.z = 0
    }
  })

  return (
    <group ref={groupRef}>
      <Bounds fit clip observe margin={0.82}>
        <Center>
          <primitive object={processedScene} />
        </Center>
      </Bounds>
    </group>
  )
}

export default function ModelViewer({ scrollSpin, onModelReady }: { scrollSpin: MotionValue<number>; onModelReady: () => void }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="model-loading">Preparing the little banana…</div>
  }

  return (
    <div className="w-full h-full relative cursor-grab active:cursor-grabbing">
      <Canvas
        camera={{ position: [0, 0, 4], fov: 42 }}
        gl={{ antialias: true, alpha: true }}
      >
        <BananaMilkModel scrollSpin={scrollSpin} onModelReady={onModelReady} />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          enableDamping
          dampingFactor={0.08}
          maxPolarAngle={Math.PI / 1.5}
          minPolarAngle={Math.PI / 3}
        />
      </Canvas>
    </div>
  )
}

useGLTF.preload('/Bananav2.glb')
