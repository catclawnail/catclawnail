import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useVideoTexture } from '@react-three/drei';
import * as THREE from 'three';

const VERT = /* glsl */ `
  varying vec2 vUv;
  varying float vDist;
  void main() {
    vUv = uv;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vDist = -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;

const FRAG = /* glsl */ `
  uniform sampler2D uTex;
  varying vec2 vUv;
  varying float vDist;
  void main() {
    vec4 c = texture2D(uTex, vUv);
    vec2 uvc = vUv - 0.5;
    c.rgb *= 1.0 - dot(uvc, uvc) * 0.85;
    float fade = smoothstep(13.5, 8.5, vDist) * smoothstep(0.6, 2.4, vDist);
    gl_FragColor = vec4(c.rgb, fade);
  }
`;

export default function VideoPlane({ url, width = 1.6, height = 2.1, ...props }) {
  const tex = useVideoTexture(url, { muted: true, loop: true, start: true });
  const mesh = useRef();

  const uniforms = useMemo(() => {
    tex.colorSpace = THREE.SRGBColorSpace;
    return { uTex: { value: tex } };
  }, [tex]);

  useFrame(({ clock }) => {
    if (mesh.current) {
      mesh.current.position.y =
        mesh.current.userData.y0 + Math.sin(clock.getElapsedTime() * 0.45) * 0.06;
    }
  });

  return (
    <mesh
      ref={(m) => {
        mesh.current = m;
        if (m && m.userData.y0 === undefined) m.userData.y0 = m.position.y;
      }}
      {...props}
    >
      <planeGeometry args={[width, height]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={VERT}
        fragmentShader={FRAG}
        transparent
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
