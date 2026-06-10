import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { world } from '../store';
import { CHAPTERS } from '../chapters';
import { anchor, PATH } from './path';
import ImagePlane from './ImagePlane';
import VideoPlane from './VideoPlane';

/* Every chapter's matter hangs at its window's end, so it floats
   fully resolved a few meters ahead while the copy is on screen. */
const T = {
  hero: CHAPTERS.hero.b,
  about: CHAPTERS.about.b,
  vip: CHAPTERS.vip.b,
  flash: CHAPTERS.flash.b,
  transform: CHAPTERS.transform.b,
  contact: CHAPTERS.contact.b,
};

/* Portfolio constellation — r1..r6 + depois scattered around the spline */
const GALLERY = [
  { url: '/assets/r1.jpg', w: 1.35, h: 1.9,  t: 0.662, dx: -2.5, dy:  1.0, ry:  0.20 },
  { url: '/assets/r2.jpg', w: 1.8,  h: 1.25, t: 0.680, dx:  2.4, dy:  1.4, ry: -0.18 },
  { url: '/assets/r3.jpg', w: 1.35, h: 1.9,  t: 0.700, dx: -2.2, dy: -1.1, ry:  0.16 },
  { url: '/assets/r4.jpg', w: 1.55, h: 1.1,  t: 0.718, dx:  2.6, dy: -0.8, ry: -0.22 },
  { url: '/assets/r5.jpg', w: 1.35, h: 1.9,  t: 0.738, dx: -2.7, dy:  0.3, ry:  0.24 },
  { url: '/assets/r6.jpg', w: 1.35, h: 1.85, t: 0.756, dx:  2.3, dy:  0.6, ry: -0.20 },
  { url: '/assets/depois.jpg', w: 1.5, h: 1.5, t: 0.776, dx: 0.0, dy: -0.1, ry: 0.0 },
];

/* A pool of warm light behind each exhibited piece — vitrine glow */
function Halo({ position, scale = 3 }) {
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);
  useFrame(({ clock }) => { uniforms.uTime.value = clock.getElapsedTime(); });
  return (
    <mesh position={position} scale={scale}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={uniforms}
        vertexShader={`varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`}
        fragmentShader={`
          uniform float uTime;
          varying vec2 vUv;
          void main(){
            float d = length(vUv - 0.5);
            float breath = 0.85 + 0.15 * sin(uTime * 0.6);
            float g = pow(max(0.0, 1.0 - d * 2.0), 2.6) * 0.16 * breath;
            gl_FragColor = vec4(vec3(0.83, 0.66, 0.28) * g, g);
          }
        `}
      />
    </mesh>
  );
}

function GalleryDrift({ center, children }) {
  const g = useRef();
  useFrame(() => {
    if (!g.current) return;
    g.current.rotation.y += (world.mouse.x * 0.05 - g.current.rotation.y) * 0.04;
    g.current.rotation.x += (-world.mouse.y * 0.03 - g.current.rotation.x) * 0.04;
  });
  /* pivot at the constellation's own heart, not the world origin */
  return <group position={center} ref={g}>{children}</group>;
}

export default function World() {
  return (
    <group>
      {/* ── 01 HERO — Sabrina and her art flank the entrance ── */}
      <ImagePlane url="/assets/ensaio.jpg" width={1.9} height={2.55}
        position={anchor(T.hero, -2.85, 0.1, 2.4)} rotation={[0, 0.32, 0]} phase={0.4} />
      <ImagePlane url="/assets/sabrina1.png" width={2.0} height={2.65}
        position={anchor(T.hero, 2.85, -0.1, 1.6)} rotation={[0, -0.3, 0]} phase={1.7} />

      {/* ── 03 CHI È SABRINA — her portrait, monumental ── */}
      <ImagePlane url="/assets/sabrina-principal.jpg" width={2.4} height={3.2}
        position={anchor(T.about, -1.7, 0, -1.2)} rotation={[0, 0.34, 0]} phase={2.3} />
      <ImagePlane url="/assets/black-cherry.jpg" width={1.1} height={1.45}
        position={anchor(T.about, 3.6, -1.5, -2.6)} rotation={[0, -0.4, 0]} phase={3.1} />

      {/* ── 04 ATELIER VIP — triptych ── */}
      <ImagePlane url="/assets/ensaio.jpg" width={1.3} height={1.75}
        position={anchor(T.vip, -2.3, 0.1, -1.4)} rotation={[0, 0.36, 0]} phase={0.9} />
      <ImagePlane url="/assets/inspiracao.jpg" width={1.45} height={1.9}
        position={anchor(T.vip, 0, 0.25, -2.2)} rotation={[0, 0, 0]} phase={1.4} />
      <ImagePlane url="/assets/r6.jpg" width={1.3} height={1.75}
        position={anchor(T.vip, 2.3, -0.1, -1.4)} rotation={[0, -0.36, 0]} phase={2.0} />

      {/* ── 05 FLASHUNGHIE — the Milano studio ── */}
      <ImagePlane url="/assets/flashunghie.jpg" width={2.2} height={2.9}
        position={anchor(T.flash, 1.9, 0, -1.6)} rotation={[0, -0.32, 0]} phase={0.6} />
      <VideoPlane url="/assets/efeito-maos.mp4" width={1.35} height={1.0}
        position={anchor(T.flash, -2.4, -0.8, -2.8)} rotation={[0, 0.42, 0]} />

      {/* ── 06 PORTFOLIO — constellation ── */}
      <GalleryDrift center={anchor(0.71)}>
        {GALLERY.map((g, i) => {
          const c = anchor(0.71);
          const a = anchor(g.t, g.dx, g.dy, 0);
          const pos = [a[0] - c[0], a[1] - c[1], a[2] - c[2]];
          return (
            <group key={g.url + i}>
              <Halo position={[pos[0], pos[1], pos[2] - 0.55]} scale={Math.max(g.w, g.h) * 2.6} />
              <ImagePlane url={g.url} width={g.w} height={g.h}
                position={pos} rotation={[0, g.ry, 0]} phase={i * 0.8} framed />
            </group>
          );
        })}
      </GalleryDrift>

      {/* ── 07 LA TRASFORMAZIONE — prima / dopo ── */}
      <VideoPlane url="/assets/video-antes.mp4" width={1.7} height={2.25}
        position={anchor(T.transform, -1.6, 0, -1.5)} rotation={[0, 0.3, 0]} />
      <ImagePlane url="/assets/depois.jpg" width={1.9} height={1.9}
        position={anchor(T.transform, 1.7, 0, -1.5)} rotation={[0, -0.3, 0]} phase={1.1} />
    </group>
  );
}
