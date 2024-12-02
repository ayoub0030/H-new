import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars, PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'
import { Maze } from './Maze'

export function Scene() {
  return (
    <Canvas
      style={{ 
        width: '100vw', 
        height: '100vh',
        background: '#000000'
      }}
    >
      <PerspectiveCamera
        makeDefault
        position={[0, 5, 15]}
        fov={60}
      />

      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={0.8} color="#ff00ff" />
      <pointLight position={[-10, 10, -10]} intensity={0.8} color="#00ffff" />
      <spotLight
        position={[0, 15, 0]}
        angle={0.5}
        penumbra={1}
        intensity={0.8}
        color="#ffffff"
      />
      
      {/* Background effects */}
      <Stars 
        radius={100} 
        depth={50} 
        count={5000} 
        factor={4} 
        saturation={0} 
        fade 
        speed={1}
      />

      {/* Maze with social media content */}
      <Maze />

      {/* Controls */}
      <OrbitControls 
        enableZoom={true}
        enablePan={true}
        enableRotate={true}
        minDistance={5}
        maxDistance={30}
        maxPolarAngle={Math.PI / 2.1}
        target={[0, 2, 0]}
      />

      {/* Fog for depth effect */}
      <fog attach="fog" args={['#000000', 15, 50]} />
    </Canvas>
  )
}
