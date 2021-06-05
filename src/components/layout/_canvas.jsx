import { Canvas } from '@react-three/fiber'
import { Preload } from '@react-three/drei'
import { A11yUserPreferences } from '@react-three/a11y'
import useStore from '@/helpers/store'
import { Perf } from 'r3f-perf'

import Dots from '../../components/canvas/Dots'
import Effects from '../canvas/post-processing/Effects'

const LCanvas = ({ children }) => {
  const dom = useStore((state) => state.dom)
  return (
    <Canvas
      mode='concurrent'
      style={{
        position: 'absolute',
        top: 0,
      }}
      onCreated={(state) => state.events.connect(dom.current)}
      orthographic
      camera={{ zoom: 20 }}
    >
      <Perf />
      <A11yUserPreferences>
        <Preload all />
        {children}
      </A11yUserPreferences>
      <Effects />
      <Dots />
      <color attach='background' args={['black']} />
    </Canvas>
  )
}

export default LCanvas
