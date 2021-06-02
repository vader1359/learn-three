import { useLayoutEffect, useRef } from 'react'
import * as THREE from 'three'

const Dots = () => {
  const ref = useRef()
  useLayoutEffect(() => {
    // Set THREE.Matrix4 defaults to an identity matrix
    const transform = new THREE.Matrix4()

    for (let i = 0; i < 10000; ++i) {
      const x = (i % 100) - 50
      const y = Math.floor(i / 100) - 50
      transform.setPosition(x, y, 0)
      ref.current.setMatrixAt(i, transform)
    }

    // Apply the transform to the first instance
    // ref.current.setMatrixAt(0, transform)
  })
  return (
    <instancedMesh ref={ref} args={[null, null, 10000]}>
      <circleBufferGeometry args={[0.15]} />
      <meshBasicMaterial />
    </instancedMesh>
  )
}

export default Dots
