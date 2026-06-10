import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';
import { world, useStore } from '../store';
import { PATH } from './path';

const _pos = new THREE.Vector3();
const _look = new THREE.Vector3();

export default function CameraRig() {
  const smooth = useRef({ p: 0, mx: 0, my: 0, intro: 4 });
  const ready = useStore((s) => s.ready);

  /* dolly-in when the loader lifts */
  useEffect(() => {
    if (ready) gsap.to(smooth.current, { intro: 0, duration: 2.6, ease: 'expo.out' });
  }, [ready]);

  useFrame(({ camera }, dt) => {
    const s = smooth.current;
    const k = 1 - Math.pow(0.0001, dt); // framerate-independent damping
    s.p += (world.progress - s.p) * k * 0.55;
    s.mx += (world.mouse.x - s.mx) * k * 0.4;
    s.my += (world.mouse.y - s.my) * k * 0.4;

    const t = Math.min(0.999, Math.max(0, s.p));
    PATH.getPoint(t, _pos);
    /* look along the tangent — stable even at the journey's end */
    PATH.getTangent(t, _look);
    _look.multiplyScalar(3.5).add(_pos);

    camera.position.set(
      _pos.x + s.mx * 0.45,
      _pos.y + s.my * 0.3,
      _pos.z + s.intro
    );
    camera.lookAt(_look.x + s.mx * 0.9, _look.y + s.my * 0.55, _look.z);

    /* breathing roll — the room is alive */
    camera.rotation.z = Math.sin(performance.now() * 0.00012) * 0.012 + s.mx * -0.018;
  });

  return null;
}
