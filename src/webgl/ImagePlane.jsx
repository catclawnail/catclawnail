import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

/* A photograph hung in space. Cover-fit, liquid wave on hover,
   warm gold lift, melts in/out with camera distance. */

const VERT = /* glsl */ `
  uniform float uHover;
  uniform float uTime;
  varying vec2 vUv;
  varying float vDist;
  void main() {
    vUv = uv;
    vec3 p = position;
    p.z += sin(p.x * 3.2 + uTime * 1.6) * cos(p.y * 3.0 + uTime * 1.2) * 0.05 * uHover;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vDist = -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;

const FRAG = /* glsl */ `
  uniform sampler2D uTex;
  uniform float uHover;
  uniform vec2  uCover;   /* cover-fit scale */
  uniform float uOpacity;
  uniform float uFramed;  /* 1 = exhibited piece: gold rim + jewelry light */
  uniform float uTime;
  uniform float uPhase;
  uniform vec2  uPointer; /* last touch, in plane uv */
  varying vec2 vUv;
  varying float vDist;
  void main() {
    /* liquid gel distortion — the surface ripples away from the touch */
    float pd = distance(vUv, uPointer);
    float rip = sin(pd * 42.0 - uTime * 4.6) * exp(-pd * 6.5) * uHover;
    vec2 dir = (vUv - uPointer) / max(pd, 0.001);
    vec2 uv = (vUv + dir * rip * 0.014 - 0.5) * uCover + 0.5;
    vec4 c = texture2D(uTex, uv);

    /* wet sheen riding the ripple crest */
    c.rgb += vec3(1.0, 0.95, 0.8) * max(0.0, rip) * 0.9;

    c.rgb *= mix(0.78, 1.05, uHover);
    vec3 warm = vec3(1.09, 0.97, 0.74);
    c.rgb = mix(c.rgb, c.rgb * warm, uHover * 0.25);

    /* inner vignette — the piece sits in its own pool of light */
    vec2 uvc = vUv - 0.5;
    c.rgb *= 1.0 - dot(uvc, uvc) * (0.85 + uFramed * 0.25);

    /* jewelry lighting — a slow specular sweep crossing the surface */
    float band = sin((vUv.x + vUv.y) * 2.4 - uTime * 0.35 + uPhase);
    float sweep = pow(max(0.0, band), 28.0);
    c.rgb += vec3(1.0, 0.9, 0.62) * sweep * (0.10 + uHover * 0.16) * (0.4 + uFramed * 0.6);

    /* hairline gold rim — the frame of the exhibited work */
    float e = min(min(vUv.x, 1.0 - vUv.x), min(vUv.y, 1.0 - vUv.y));
    float rim = (smoothstep(0.018, 0.012, e) - smoothstep(0.006, 0.0, e)) * uFramed;
    c.rgb = mix(c.rgb, vec3(0.83, 0.69, 0.22) * (0.8 + sweep * 2.0), rim * 0.9);

    /* melt with distance — far fog, near pass-through */
    float fade = smoothstep(13.5, 8.5, vDist) * smoothstep(0.6, 2.4, vDist);
    gl_FragColor = vec4(c.rgb, c.a * fade * uOpacity);
  }
`;

export default function ImagePlane({
  url,
  width = 1.6,
  height = 2.1,
  float: floatAmp = 0.08,
  phase = 0,
  framed = false,
  ...props
}) {
  const tex = useTexture(url);
  const mesh = useRef();
  const hover = useRef(0);

  const uniforms = useMemo(() => {
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    const imgA = tex.image.width / tex.image.height;
    const plnA = width / height;
    const cover = imgA > plnA
      ? new THREE.Vector2(plnA / imgA, 1)
      : new THREE.Vector2(1, imgA / plnA);
    return {
      uTex: { value: tex },
      uHover: { value: 0 },
      uTime: { value: 0 },
      uCover: { value: cover },
      uOpacity: { value: 1 },
      uFramed: { value: framed ? 1 : 0 },
      uPhase: { value: phase },
      uPointer: { value: new THREE.Vector2(0.5, 0.5) },
    };
  }, [tex, width, height, framed, phase]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    uniforms.uTime.value = t;
    uniforms.uHover.value += (hover.current - uniforms.uHover.value) * 0.07;
    if (mesh.current) {
      mesh.current.position.y = mesh.current.userData.y0 + Math.sin(t * 0.5 + phase) * floatAmp;
      mesh.current.rotation.z = Math.sin(t * 0.3 + phase * 2.0) * 0.012;
    }
  });

  return (
    <mesh
      ref={(m) => {
        mesh.current = m;
        if (m && m.userData.y0 === undefined) m.userData.y0 = m.position.y;
      }}
      onPointerOver={() => (hover.current = 1)}
      onPointerMove={(e) => { if (e.uv) uniforms.uPointer.value.lerp(e.uv, 0.35); }}
      onPointerOut={() => (hover.current = 0)}
      {...props}
    >
      <planeGeometry args={[width, height, 28, 28]} />
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
