import { Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { useProgress } from '@react-three/drei';
import { EffectComposer, Bloom, Noise, Vignette, ChromaticAberration } from '@react-three/postprocessing';
import { useStore } from '../store';
import Atmosphere from './Atmosphere';
import PigmentField from './PigmentField';
import LiquidGold from './LiquidGold';
import CameraRig from './CameraRig';
import World from './World';

/* Bridges drei's loading progress out to the DOM loader */
function LoadBridge() {
  const { progress, active } = useProgress();
  const setLoadProgress = useStore((s) => s.setLoadProgress);
  useEffect(() => {
    setLoadProgress(active ? progress : 100);
  }, [progress, active, setLoadProgress]);
  return null;
}

export default function Experience() {
  return (
    <div className="gl-stage">
      <Canvas
        camera={{ fov: 50, near: 0.1, far: 120, position: [0, 0, 4] }}
        dpr={[1, 1.6]}
        gl={{ antialias: false, powerPreference: 'high-performance' }}
      >
        <Atmosphere />
        <PigmentField />
        <LiquidGold />
        <CameraRig />
        <Suspense fallback={null}>
          <World />
        </Suspense>
        <LoadBridge />
        <EffectComposer multisampling={0}>
          <Bloom intensity={0.3} luminanceThreshold={0.78} mipmapBlur />
          <ChromaticAberration offset={[0.0007, 0.0004]} />
          <Noise opacity={0.055} />
          <Vignette eskil={false} offset={0.16} darkness={0.9} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
