import { useThree, useFrame, extend } from '@react-three/fiber'
import { EffectComposer } from 'three-stdlib/postprocessing/EffectComposer'
import { ShaderPass } from 'three-stdlib/postprocessing/ShaderPass'
import { SavePass } from 'three-stdlib/postprocessing/SavePass'
import { CopyShader } from 'three-stdlib/shaders/CopyShader'
import { FXAAShader } from 'three-stdlib/shaders/FXAAShader'
import { RenderPass } from 'three-stdlib/postprocessing/RenderPass'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'

import rgbVertexShader from '../../../shaders/rgb/vertex.glsl'
import rgbFragmentShader from '../../../shaders/rgb/fragment.glsl'

extend({ EffectComposer, ShaderPass, SavePass, RenderPass })

// Shader that composites the r, g, b channels of 3 textures, respectively
const triColorMix = {
  uniforms: {
    tDiffuse1: { value: null },
    tDiffuse2: { value: null },
    tDiffuse3: { value: null },
  },

  vertexShader: rgbVertexShader,
  fragmentShader: rgbFragmentShader,
}

// This is the way to create a custom effect render pass
// We need the composer and set its size. In this case, this will cover the whole Canvas. We will make the cover with useEffect,then render the composer.current in useGFrame. The composer here will be reference of the effectComposer
// The args of the effectComposer is gl
// Each renderPass will be put inside the effectComposer
// The attachArray = 'passes' This seems to be an keyword in shader
// The scene and camera will be gotten from useThree and attach to each pass

const Effects = () => {
  const composer = useRef()
  const savePass = useRef()
  const blendPass = useRef()
  // The useRef here is used to persist the value between renders
  const swap = useRef(false) // Whether to swap the delay buffers
  const { scene, gl, size, camera } = useThree()
  const { rtA, rtB } = useMemo(() => {
    const rtA = new THREE.WebGLRenderTarget(size.width, size.height)
    const rtB = new THREE.WebGLRenderTarget(size.width, size.height)
    return { rtA, rtB }
  }, [size])
  useEffect(
    () => void composer.current.setSize(size.width, size.height, [size])
  )
  useFrame(() => {
    // Swap render targets and update dependencies
    let delay1 = swap.current ? rtB : rtA
    let delay2 = swap.current ? rtA : rtB
    savePass.current.renderTarget = delay2
    blendPass.current.uniforms['tDiffuse2'].value = delay1.texture
    blendPass.current.uniforms['tDiffuse3'].value = delay2.texture
    swap.current = !swap.current
    composer.current.render()
  }, 1)
  const pixelRatio = gl.getPixelRatio()
  return (
    <effectComposer ref={composer} args={[gl]}>
      <renderPass attachArray='passes' scene={scene} camera={camera} />
      <shaderPass
        attachArray='passes'
        ref={blendPass}
        args={[triColorMix, 'tDiffuse1']}
        needsSwap={false}
      />
      <savePass attachArray='passes' ref={savePass} needsSwap={true} />
      <shaderPass
        attachArray='passes'
        args={[FXAAShader]}
        uniforms-resolution-value-x={1 / (size.width * pixelRatio)}
        uniforms-resolution-value-y={1 / (size.height * pixelRatio)}
      />
      <shaderPass attachArray='passes' args={[CopyShader]} />
    </effectComposer>
  )
}

export default Effects
