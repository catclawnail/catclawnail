import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { world } from '../store';

/* ════════════════════════════════════════════════════════════════
   LIQUID GOLD — Sabrina's signature material.
   A sea of molten gold breathing beneath the whole journey.
   Slow. Reflective. Alive. It feels the cursor pass above it.
   ════════════════════════════════════════════════════════════════ */

const VERT = /* glsl */ `
  uniform float uTime;
  uniform vec2  uRipple;   /* world x,z of the cursor's touch */
  uniform float uRippleStrength;
  varying vec3 vWorld;
  varying vec3 vNormal;
  varying float vH;

  /* the surface — long, slow interfering waves: breath, not turbulence */
  float wave(vec2 p, float t) {
    float h = 0.0;
    h += sin(p.x * 0.32 + t * 0.30) * 0.34;
    h += sin(p.y * 0.21 - t * 0.22) * 0.42;
    h += sin((p.x + p.y) * 0.16 + t * 0.16) * 0.30;
    h += sin(p.x * 0.83 - t * 0.42 + sin(p.y * 0.45 + t * 0.25) * 1.6) * 0.14;
    h += sin(p.y * 1.35 + t * 0.34) * sin(p.x * 1.1 - t * 0.27) * 0.07;

    /* the cursor disturbs the gold — rings dying away slowly */
    float d = distance(p, uRipple);
    h += sin(d * 2.6 - t * 1.9) * exp(-d * 0.42) * 0.22 * uRippleStrength;
    return h;
  }

  void main() {
    vec3 pos = position;             /* plane local: x, y(depth after rotation), z=height */
    vec2 p = pos.xy;
    float t = uTime;

    float h  = wave(p, t);
    float hx = wave(p + vec2(0.22, 0.0), t);
    float hy = wave(p + vec2(0.0, 0.22), t);
    pos.z += h;

    vNormal = normalize(vec3(-(hx - h) / 0.22, -(hy - h) / 0.22, 1.0));
    vH = h;

    vec4 w = modelMatrix * vec4(pos, 1.0);
    vWorld = w.xyz;
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`;

const FRAG = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform vec3  uCamPos;
  varying vec3 vWorld;
  varying vec3 vNormal;
  varying float vH;

  void main() {
    /* rotate plane normal into world (plane is rotated -90° around X) */
    vec3 N = normalize(vec3(vNormal.x, vNormal.z, -vNormal.y));
    vec3 V = normalize(uCamPos - vWorld);

    /* key light — high, slightly behind camera, like a studio softbox */
    vec3 L = normalize(vec3(0.35, 1.0, 0.55));
    vec3 H = normalize(L + V);

    float ndl  = max(dot(N, L), 0.0);
    float spec = pow(max(dot(N, H), 0.0), 90.0);
    float fres = pow(1.0 - max(dot(N, V), 0.0), 2.6);

    /* molten gold ramp — deep bronze shadow to champagne highlight */
    vec3 deep  = vec3(0.043, 0.027, 0.010);
    vec3 base  = vec3(0.196, 0.129, 0.039);
    vec3 gold  = vec3(0.624, 0.471, 0.157);
    vec3 flare = vec3(1.0, 0.894, 0.627);

    vec3 col = mix(deep, base, ndl);
    col = mix(col, gold, fres * 0.85);
    col += flare * spec * 0.85;

    /* a slow sweep of reflected light traveling the surface */
    float sweep = pow(max(0.0, sin(vWorld.z * 0.11 + vWorld.x * 0.05 + uTime * 0.14)), 18.0);
    col += gold * sweep * 0.25;

    /* crest shimmer — ridges catch the light */
    col += flare * smoothstep(0.55, 1.0, vH) * 0.10;

    /* dissolve into the dark well before the horizon —
       a pool of living gold beneath the visitor, not a landscape */
    float dist = length(uCamPos - vWorld);
    float fade = smoothstep(21.0, 6.0, dist);

    gl_FragColor = vec4(col * 0.82, fade * 0.88);
  }
`;

export default function LiquidGold() {
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uRipple: { value: new THREE.Vector2(0, 0) },
      uRippleStrength: { value: 0 },
      uCamPos: { value: new THREE.Vector3() },
    }),
    []
  );
  const ripple = useRef({ s: 0 });

  useFrame(({ clock, camera }) => {
    const u = uniforms;
    u.uTime.value = clock.getElapsedTime();
    u.uCamPos.value.copy(camera.position);

    /* the cursor's touch, projected onto the gold — plane local x,y = world x,-z */
    const wx = camera.position.x + world.mouse.x * 5.0;
    const wz = camera.position.z - 7.0 + world.mouse.y * 3.0;
    u.uRipple.value.lerp(new THREE.Vector2(wx, -wz), 0.03);

    const moving = Math.min(1, Math.abs(world.mouse.x) + Math.abs(world.mouse.y));
    ripple.current.s += ((moving > 0.04 ? 1 : 0.25) - ripple.current.s) * 0.02;
    u.uRippleStrength.value = ripple.current.s;
  });

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3.4, -42]} frustumCulled={false}>
      <planeGeometry args={[44, 130, 200, 110]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={VERT}
        fragmentShader={FRAG}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}
