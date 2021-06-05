import { useThree, useFrame, extend } from 'react-three-fiber'
import { EffectComposer } from '@react-three/postprocessing'
// import { ShaderPass } from 'three-stdlib/postprocessing/ShaderPass'
// import { SavePass } from 'three-stdlib/postprocessing/SavePass'
// import { CopyShader } from 'three-stdlib/shaders/CopyShader'
// import { FXAAShader } from 'three-stdlib/shaders/FXAAShader'
// import { RenderPass } from 'three-stdlib/postprocessing/RenderPass'
import { useEffect, useMemo, useRef } from 'react'
import { Scene } from 'three'
import * as THREE from 'three'
import dynamic from 'next/dynamic'

const ShaderPass = dynamic(
  () => import('three-stdlib/postprocessing/ShaderPass'),
  { ssr: false }
)
const SavePass = dynamic(() => import('three-stdlib/postprocessing/SavePass'), {
  ssr: false,
})
const CopyShader = dynamic(() => import('three-stdlib/shaders/CopyShader'), {
  ssr: false,
})
const FXAAShader = dynamic(() => import('three-stdlib/shaders/FXAAShader'), {
  ssr: false,
})
const RenderPass = dynamic(
  () => import('three-stdlib/postprocessing/RenderPass'),
  {
    ssr: false,
  }
)

extend({ EffectComposer, ShaderPass, CopyShader, SavePass, RenderPass })

// Shader that composites the r, g, b channels of 3 textures, respectively
const triColorMix = {
  uniforms: {
    tDiffuse1: { value: null },
    tDiffuse2: { value: null },
    tDiffuse3: { value: null },
  },

  vertexShader: `varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1);
  },
  `,
  fragmentShader: `
  varying vec2 vUv;
  uniform sampler2D tDiffuse1;
  uniform sampler2D tDiffuse2;
  uniform sampler2D tDiffuse3;

  void main() {
    vec4 del0 = texture2D(tDiffuse1, vUv);
    vec4 del1 = texture2D(tDiffuse2, vUv);
    vec4 del2 = texture2D(tDiffuse3, vUv);
    float alpha = min(min(del0.a, del1.a),del2.a);
    gl_FragColor = vec4(del0.r, del1,g, del2.b, alpha)
  }
  `,
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
    () => void composer.current.setSize(size.width, size.height, [size]),
    [size]
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
      <shaderPass />
    </effectComposer>
  )
}

export default Effects
