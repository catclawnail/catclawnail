import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { world } from '../store';

/* Abyssal black with breathing gold vapor — drawn behind everything
   in clip space, hue drifting as the journey deepens. */

const VERT = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = vec4(position.xy, 1.0, 1.0); }
`;

const FRAG = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform vec2  uMouse;
  uniform float uJourney;
  uniform float uInk;
  varying vec2  vUv;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x),
               mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
  }
  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 5; i++) { v += a * noise(p); p = p * 2.1 + vec2(1.7, 9.2); a *= 0.5; }
    return v;
  }

  void main() {
    float t = uTime * 0.06;
    vec2  q = vec2(fbm(vUv * 1.4 + t * 0.8), fbm(vUv * 1.4 + vec2(5.2, 1.3) + t));
    float f = fbm(vUv * 1.4 + 3.4 * q + uJourney * 2.0);

    /* journey pulse — vapor breathes brighter mid-chapters */
    float pulse = 0.45 + 0.55 * sin(uJourney * 25.13) * sin(uJourney * 25.13);

    /* volumetric darkness — a second, far layer drifting slower */
    float far = fbm(vUv * 0.7 + t * 0.3 + uJourney * 0.8);

    vec3 col = vec3(0.016, 0.014, 0.012);
    col = mix(col, vec3(0.045, 0.036, 0.014), far * 0.5);
    col = mix(col, vec3(0.075, 0.058, 0.016), f * 0.5);
    col = mix(col, vec3(0.21, 0.165, 0.046), pow(f, 2.8) * 0.38 * pulse);

    /* deep wine undertone arriving in the second half — Black Cherry */
    col = mix(col, vec3(0.10, 0.022, 0.035), pow(f, 2.0) * 0.3 * smoothstep(0.45, 0.85, uJourney));

    /* a single high key light — faint shaft from above, museum dark */
    float shaft = smoothstep(0.9, 0.0, abs(vUv.x - 0.5 - sin(uJourney * 6.0) * 0.12));
    col += vec3(0.10, 0.082, 0.040) * shaft * smoothstep(0.2, 1.0, vUv.y) * (0.35 + far * 0.4);

    /* metallic ink diffusion — chapter transitions bleed liquid gold */
    float vein = fbm(vUv * 2.6 + q * 2.0 - t * 0.4);
    float inkMask = smoothstep(1.05 - uInk * 1.15, 1.35 - uInk * 1.15, vein + f * 0.4);
    col = mix(col, vec3(0.55, 0.42, 0.13) * (0.6 + vein), inkMask * uInk * 0.55);

    /* gold halo following the cursor — controlled, not a torch */
    float d = distance(vUv, uMouse * 0.5 + 0.5);
    col += vec3(0.831, 0.686, 0.216) * smoothstep(0.42, 0.0, d) * 0.045;

    /* film grain */
    col += (hash(vUv * 900.0 + fract(uTime) * 100.0) - 0.5) * 0.02;

    /* cinematic vignette */
    vec2 vc = vUv - 0.5;
    col *= 1.0 - dot(vc, vc) * 1.5;

    gl_FragColor = vec4(col, 1.0);
  }
`;

export default function Atmosphere() {
  const mat = useRef();
  const uniforms = useRef({
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(0, 0) },
    uJourney: { value: 0 },
    uInk: { value: 0 },
  });

  useFrame(({ clock }) => {
    const u = uniforms.current;
    u.uTime.value = clock.getElapsedTime();
    u.uMouse.value.set(world.mouse.x, world.mouse.y);
    u.uJourney.value += (world.progress - u.uJourney.value) * 0.06;
    u.uInk.value = world.ink;
  });

  return (
    <mesh frustumCulled={false} renderOrder={-10}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={mat}
        uniforms={uniforms.current}
        vertexShader={VERT}
        fragmentShader={FRAG}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
}
