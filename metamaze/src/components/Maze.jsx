import { useEffect, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'

// Sample content with direct image URLs
const SAMPLE_CONTENT = [
  {
    url: 'https://images.pexels.com/photos/3225517/pexels-photo-3225517.jpeg?auto=compress&cs=tinysrgb&w=800',
    title: 'Nature View',
    likes: '2.3K'
  },
  {
    url: 'https://images.pexels.com/photos/1619317/pexels-photo-1619317.jpeg?auto=compress&cs=tinysrgb&w=800',
    title: 'City Life',
    likes: '1.8K'
  },
  {
    url: 'https://images.pexels.com/photos/1366919/pexels-photo-1366919.jpeg?auto=compress&cs=tinysrgb&w=800',
    title: 'Mountain Peak',
    likes: '3.1K'
  },
  {
    url: 'https://images.pexels.com/photos/1001682/pexels-photo-1001682.jpeg?auto=compress&cs=tinysrgb&w=800',
    title: 'Ocean Waves',
    likes: '2.7K'
  }
]

const COLORS = {
  frame: ['#ff00ff', '#00ffff', '#ff3366', '#33ff33', '#ff9900'],
  emissive: ['#ff00ff', '#00ffff', '#ff0066', '#00ff66', '#ffcc00']
}

export function Maze() {
  const mazeRef = useRef()
  const wallsRef = useRef([])
  const textureLoader = useRef(new THREE.TextureLoader())
  const [texturesLoaded, setTexturesLoaded] = useState(false)
  const loadedTextures = useRef({})
  const [hoveredWall, setHoveredWall] = useState(null)
  const [selectedWall, setSelectedWall] = useState(null)

  useEffect(() => {
    const loadTextures = async () => {
      try {
        const texturePromises = SAMPLE_CONTENT.map(content => 
          new Promise((resolve, reject) => {
            textureLoader.current.load(
              content.url,
              (texture) => {
                loadedTextures.current[content.url] = texture
                resolve(texture)
              },
              undefined,
              reject
            )
          })
        )

        await Promise.all(texturePromises)
        setTexturesLoaded(true)
      } catch (error) {
        console.error('Error loading textures:', error)
      }
    }

    loadTextures()
  }, [])

  useEffect(() => {
    if (texturesLoaded) {
      generateMaze()
    }
  }, [texturesLoaded])

  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    wallsRef.current.forEach((wall, index) => {
      if (wall) {
        wall.position.y = Math.sin(time + index * 0.5) * 0.2 + 2
        wall.rotation.y += Math.sin(time * 0.1 + index) * 0.001
        const scale = 1 + Math.sin(time * 0.5 + index) * 0.02
        wall.scale.set(scale, scale * 1.2, scale)
      }
    })
  })

  const generateMaze = () => {
    const size = 3
    const spacing = 6

    // Clear existing walls
    wallsRef.current.forEach(wall => {
      if (wall && mazeRef.current) {
        mazeRef.current.remove(wall)
      }
    })
    wallsRef.current = []

    for (let x = -size; x <= size; x++) {
      for (let z = -size; z <= size; z++) {
        if (Math.random() > 0.5) {
          const content = SAMPLE_CONTENT[Math.floor(Math.random() * SAMPLE_CONTENT.length)]
          const geometry = new THREE.BoxGeometry(3, 4, 0.1)
          const colorIndex = Math.floor(Math.random() * COLORS.frame.length)
          const texture = loadedTextures.current[content.url]

          const materials = [
            new THREE.MeshStandardMaterial({
              color: new THREE.Color(COLORS.frame[colorIndex]),
              emissive: new THREE.Color(COLORS.emissive[colorIndex]),
              emissiveIntensity: 0.5,
            }),
            new THREE.MeshStandardMaterial({
              color: new THREE.Color(COLORS.frame[colorIndex]),
              emissive: new THREE.Color(COLORS.emissive[colorIndex]),
              emissiveIntensity: 0.5,
            }),
            new THREE.MeshStandardMaterial({
              color: new THREE.Color(COLORS.frame[colorIndex]),
              emissive: new THREE.Color(COLORS.emissive[colorIndex]),
              emissiveIntensity: 0.5,
            }),
            new THREE.MeshStandardMaterial({
              color: new THREE.Color(COLORS.frame[colorIndex]),
              emissive: new THREE.Color(COLORS.emissive[colorIndex]),
              emissiveIntensity: 0.5,
            }),
            new THREE.MeshStandardMaterial({
              map: texture,
              emissiveMap: texture,
              emissiveIntensity: 0.5,
            }),
            new THREE.MeshStandardMaterial({
              color: new THREE.Color(COLORS.frame[colorIndex]),
              emissive: new THREE.Color(COLORS.emissive[colorIndex]),
              emissiveIntensity: 0.5,
            }),
          ]

          const wall = new THREE.Mesh(geometry, materials)
          wall.position.set(
            x * spacing + (Math.random() - 0.5),
            2,
            z * spacing + (Math.random() - 0.5)
          )
          wall.rotation.y = Math.PI * (Math.floor(Math.random() * 4) / 2)
          wall.userData.content = content

          // Add event handlers
          wall.userData.onPointerOver = () => {
            setHoveredWall(wall)
            document.body.style.cursor = 'pointer'
          }
          wall.userData.onPointerOut = () => {
            setHoveredWall(null)
            document.body.style.cursor = 'default'
          }
          wall.userData.onClick = () => {
            setSelectedWall(wall === selectedWall ? null : wall)
          }

          wallsRef.current.push(wall)
          mazeRef.current.add(wall)
        }
      }
    }

    // Add floor
    const floorGeometry = new THREE.PlaneGeometry(size * spacing * 2.5, size * spacing * 2.5)
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: '#000000',
      metalness: 0.9,
      roughness: 0.1,
      emissive: '#000066',
      emissiveIntensity: 0.2
    })
    
    const floor = new THREE.Mesh(floorGeometry, floorMaterial)
    floor.rotation.x = -Math.PI / 2
    floor.position.y = -0.5
    mazeRef.current.add(floor)

    const gridHelper = new THREE.GridHelper(
      size * spacing * 2.5,
      size * 5,
      '#0066ff',
      '#003366'
    )
    gridHelper.position.y = -0.4
    mazeRef.current.add(gridHelper)
  }

  return (
    <>
      <group 
        ref={mazeRef}
        onPointerMove={(e) => {
          e.stopPropagation()
          const wall = e.object
          if (wall && wall.userData.onPointerOver) {
            wall.userData.onPointerOver()
          }
        }}
        onPointerOut={(e) => {
          e.stopPropagation()
          const wall = e.object
          if (wall && wall.userData.onPointerOut) {
            wall.userData.onPointerOut()
          }
        }}
        onClick={(e) => {
          e.stopPropagation()
          const wall = e.object
          if (wall && wall.userData.onClick) {
            wall.userData.onClick()
          }
        }}
      />
      {(hoveredWall || selectedWall) && (
        <Html position={[0, 0, 0]} style={{ pointerEvents: 'none' }}>
          <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: 'rgba(0, 0, 0, 0.8)',
            padding: '15px',
            borderRadius: '10px',
            color: 'white',
            fontFamily: 'Arial, sans-serif',
            backdropFilter: 'blur(4px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            transition: 'all 0.3s ease',
            transform: 'scale(1)',
            opacity: 1,
          }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>
              {(hoveredWall || selectedWall).userData.content.title}
            </h3>
            <p style={{ margin: '0', fontSize: '16px' }}>
              ❤️ {(hoveredWall || selectedWall).userData.content.likes}
            </p>
          </div>
        </Html>
      )}
    </>
  )
}
