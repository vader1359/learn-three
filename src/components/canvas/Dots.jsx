import { useFrame } from '@react-three/fiber'
import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'

// The frequency control the speed
// a control the strength
// t is time elapsed
// deltat control the snappy
const roundedSquareWave = (t, delta, a, f) => {
  return ((2 * a) / Math.PI) * Math.atan(Math.sin(2 * Math.PI * t * f) / delta)
}

const Dots = () => {
  const ref = useRef()
  // Here, we have a loop. We should store some information into cache before entering the loop.
  // These include the initial postions, but we will override this, so this is used with memo to save uncecessories calculation.
  // We need the Matrix4 in the loop, so we will save that
  // The initial position will be overrided so we will save the Vector3 of this as backup
  const { vec, transform, positions, distances } = useMemo(() => {
    const vec = new THREE.Vector3()
    const transform = new THREE.Matrix4()

    // This is used to create a 100 x 100 dots grid, the distance between dots is 50
    const positions = [...Array(10000)].map((_, i) => {
      const position = new THREE.Vector3()
      // Place in a grid
      position.x = (i % 100) - 50
      position.y = Math.floor(i / 100) - 50
      // Offset every other column (hexagonal pattern)
      position.y += (i % 2) * 0.5
      // Add some noise to make the dots random positioned
      position.x += Math.random() * 0.3
      position.y += Math.random() * 0.3
      return position
    })
    // This calculate the distaces of each ring of dots from the center.
    // We can shape the this ring by adjusting the distance.
    // For example, we can use angleTo to create duong gap khuc.
    // With 8 duong gap khuc then we will have an octagon

    // Precompute initial distances with octagonal offset
    const right = new THREE.Vector3(1, 0, 0)
    const distances = positions.map(
      (pos) => pos.length() + Math.cos(pos.angleTo(right) * 8) * 0.5
    )
    return { vec, transform, positions, distances }
  }, [])

  useFrame(({ clock }) => {
    for (let i = 0; i < 10000; ++i) {
      // So, we affect the time by distance to make the dots move at different speed
      // Using the time - the distace at each point
      const t = clock.elapsedTime - distances[i] / 100
      const wave = roundedSquareWave(t, 0.1, 1, 1 / 4)
      const scale = 1 + wave * 0.3
      vec.copy(positions[i]).multiplyScalar(scale)
      transform.setPosition(vec)
      ref.current.setMatrixAt(i, transform)
    }
    ref.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={ref} args={[null, null, 10000]}>
      <circleBufferGeometry args={[0.15]} />
      <meshBasicMaterial />
    </instancedMesh>
  )
}

export default Dots
