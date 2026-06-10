import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/* ════════════════════════════════════════════════════════════════
   PIGMENT FIELD — the air of the atelier.
   Suspended nail-art matter over the golden atmosphere:
     type 0 — aquamarine pigment (semi-translucent gemstone breath)
     type 1 — silver rhinestones (sharp diamond-white star glints)
     type 2 — aquamarine gems (larger, slow tiffany-mint glow)
     type 3 — silver pins (rare, intense crystal points)
   ════════════════════════════════════════════════════════════════ */

const VERT = /* glsl */ `
  attribute float aSize;
  attribute vec3  aColor;
  attribute float aPhase;
  attribute float aType;
  uniform float uTime;
  varying vec3  vCol;
  varying float vA;
  varying float vType;
  varying float vPhase;
  void main() {
    vCol = aColor;
    vType = aType;
    vPhase = aPhase;
    vec3 p = position;

    /* suspension drift — pigment settles, foil tumbles wider */
    float drift = aType > 1.5 ? 1.8 : 1.0;
    p.y += sin(uTime * 0.22 + aPhase) * 0.5 * drift;
    p.x += cos(uTime * 0.15 + aPhase * 1.7) * 0.4 * drift;
    p.z += sin(uTime * 0.11 + aPhase * 0.9) * 0.3;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    float dist = -mv.z;
    gl_PointSize = aSize * (160.0 / max(dist, 0.1));
    gl_Position = projectionMatrix * mv;
    vA = smoothstep(26.0, 12.0, dist) * smoothstep(1.5, 5.0, dist);
  }
`;

const FRAG = /* glsl */ `
  precision highp float;
  uniform float uTime;
  varying vec3  vCol;
  varying float vA;
  varying float vType;
  varying float vPhase;

  void main() {
    vec2 p = gl_PointCoord - 0.5;
    float a = 0.0;
    vec3 col = vCol;

    if (vType < 0.5) {
      /* aquamarine pigment — semi-translucent gemstone breath */
      float r = length(p);
      float core = pow(max(0.0, 1.0 - r * 3.4), 2.0) * 0.5;
      float glow = (1.0 - smoothstep(0.14, 0.5, r)) * 0.20;
      float breathe = 0.7 + 0.3 * sin(uTime * 0.7 + vPhase * 4.0);
      a = (core + glow) * breathe;

    } else if (vType < 1.5) {
      /* silver rhinestone — sharp diamond facet, white glint */
      float r = length(p);
      float star = pow(max(0.0, 1.0 - r * 2.4), 3.0);
      star += pow(max(0.0, 1.0 - abs(p.x) * 11.0), 5.0) * pow(max(0.0, 1.0 - abs(p.y) * 2.4), 2.0) * 0.9;
      star += pow(max(0.0, 1.0 - abs(p.y) * 11.0), 5.0) * pow(max(0.0, 1.0 - abs(p.x) * 2.4), 2.0) * 0.9;
      /* diagonal facets — a cut stone, not a sprite */
      star += pow(max(0.0, 1.0 - abs(p.x + p.y) * 9.0), 5.0) * pow(max(0.0, 1.0 - r * 2.0), 2.0) * 0.35;
      star += pow(max(0.0, 1.0 - abs(p.x - p.y) * 9.0), 5.0) * pow(max(0.0, 1.0 - r * 2.0), 2.0) * 0.35;
      float tw = 0.10 + 0.90 * smoothstep(0.82, 1.0, sin(uTime * 2.6 + vPhase * 7.0) * 0.5 + 0.5);
      a = star * tw;
      col = mix(col, vec3(1.0), tw * 0.85);

    } else if (vType < 2.5) {
      /* aquamarine gem — slow tiffany-mint halo with a facet glint */
      float r = length(p);
      float glow = pow(max(0.0, 1.0 - r * 2.0), 2.4) * 0.30;
      float facet = pow(max(0.0, 1.0 - abs(p.x * 0.6 + p.y) * 7.0), 4.0) * pow(max(0.0, 1.0 - r * 2.2), 2.0);
      float pulse = 0.6 + 0.4 * sin(uTime * 0.45 + vPhase * 3.0);
      a = glow * pulse + facet * 0.25 * pulse;
      col = mix(col, vec3(0.78, 1.0, 0.95), facet * 0.6);

    } else {
      /* silver pin — rare, intense crystal point */
      float r = length(p);
      a = pow(max(0.0, 1.0 - r * 2.8), 4.0) * (0.35 + 0.65 * smoothstep(0.7, 1.0, sin(uTime * 1.8 + vPhase * 9.0) * 0.5 + 0.5));
      col = vec3(0.96, 0.97, 1.0);
    }

    gl_FragColor = vec4(col, a * vA);
  }
`;

export default function PigmentField({ count = 760 }) {
  const uniforms = useRef({ uTime: { value: 0 } });

  const geo = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const size = new Float32Array(count);
    const col = new Float32Array(count * 3);
    const phase = new Float32Array(count);
    const type = new Float32Array(count);

    /* two stones over the gold: aquamarine and diamond-silver */
    const aquas = [
      [0.49, 0.88, 0.80],  // seafoam
      [0.36, 0.80, 0.74],  // tiffany
      [0.58, 0.93, 0.84],  // mint light
    ];
    const silvers = [
      [0.90, 0.93, 0.98],  // cool silver
      [0.97, 0.97, 1.00],  // diamond white
      [0.82, 0.86, 0.93],  // platinum shadow
    ];

    for (let i = 0; i < count; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 26;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 15;
      pos[i * 3 + 2] = 6 - Math.random() * 100;

      const r = Math.random();
      let ty;
      if (r < 0.50) ty = 0;        // aquamarine pigment — the body of the air
      else if (r < 0.82) ty = 1;   // silver rhinestones
      else if (r < 0.95) ty = 2;   // aquamarine gems
      else ty = 3;                 // silver pins — rare
      type[i] = ty;

      size[i] =
        ty === 0 ? Math.random() * 0.9 + 0.25 :
        ty === 1 ? Math.random() * 1.5 + 0.6 :
        ty === 2 ? Math.random() * 2.2 + 1.3 :
                   Math.random() * 0.7 + 0.4;

      const palette = (ty === 1 || ty === 3) ? silvers : aquas;
      const g = palette[Math.floor(Math.random() * palette.length)];
      const v = 0.8 + Math.random() * 0.3;
      col[i * 3] = g[0] * v; col[i * 3 + 1] = g[1] * v; col[i * 3 + 2] = g[2] * v;
      phase[i] = Math.random() * Math.PI * 2;
    }

    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
    g.setAttribute('aColor', new THREE.BufferAttribute(col, 3));
    g.setAttribute('aPhase', new THREE.BufferAttribute(phase, 1));
    g.setAttribute('aType', new THREE.BufferAttribute(type, 1));
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
