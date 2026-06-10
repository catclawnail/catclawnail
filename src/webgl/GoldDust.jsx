import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/* Gold dust suspended through the whole corridor — the air of the atelier. */

const VERT = /* glsl */ `
  attribute float aSize;
  attribute vec3  aColor;
  attribute float aPhase;
  uniform float uTime;
  varying vec3 vCol;
  varying float vA;
  void main() {
    vCol = aColor;
    vec3 p = position;
    p.y += sin(uTime * 0.35 + aPhase) * 0.45;
    p.x += cos(uTime * 0.22 + aPhase * 1.7) * 0.35;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    float dist = -mv.z;
    gl_PointSize = aSize * (150.0 / max(dist, 0.1));
    gl_Position = projectionMatrix * mv;
    vA = smoothstep(26.0, 12.0, dist) * smoothstep(1.5, 5.0, dist);
  }
`;

const FRAG = /* glsl */ `
  varying vec3 vCol;
  varying float vA;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float c = 1.0 - smoothstep(0.32, 0.5, d);
    gl_FragColor = vec4(vCol, vA * c * 0.32);
  }
`;

export default function GoldDust({ count = 650 }) {
  const uniforms = useRef({ uTime: { value: 0 } });

  const geo = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const size = new Float32Array(count);
    const col = new Float32Array(count * 3);
    const phase = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 24;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 14;
      pos[i * 3 + 2] = 6 - Math.random() * 98; // span the whole corridor
      size[i] = Math.random() * 1.1 + 0.25;
      const t = Math.random();
      col[i * 3]     = 0.831 * t + 0.32 * (1 - t);
      col[i * 3 + 1] = 0.686 * t + 0.24 * (1 - t);
      col[i * 3 + 2] = 0.216 * t + 0.11 * (1 - t);
      phase[i] = Math.random() * Math.PI * 2;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
    g.setAttribute('aColor', new THREE.BufferAttribute(col, 3));
    g.setAttribute('aPhase', new THREE.BufferAttribute(phase, 1));
    return g;
  }, [count]);

  useFrame(({ clock }) => {
    uniforms.current.uTime.value = clock.getElapsedTime();
  });

  return (
    <points geometry={geo} frustumCulled={false}>
      <shaderMaterial
        uniforms={uniforms.current}
        vertexShader={VERT}
        fragmentShader={FRAG}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
