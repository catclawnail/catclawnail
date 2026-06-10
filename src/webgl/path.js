import * as THREE from 'three';

/* The camera glides along this spline through the whole installation.
   Depth runs 0 → -84 across the eight chapters. */
export const DEPTH = 84;

export const PATH = new THREE.CatmullRomCurve3(
  [
    new THREE.Vector3( 0.0,  0.00,   0),
    new THREE.Vector3( 0.9,  0.20, -12),
    new THREE.Vector3(-1.1, -0.30, -24),
    new THREE.Vector3( 0.8,  0.35, -36),
    new THREE.Vector3(-0.9, -0.20, -48),
    new THREE.Vector3( 0.6,  0.30, -60),
    new THREE.Vector3(-0.5, -0.25, -72),
    new THREE.Vector3( 0.0,  0.00, -84),
  ],
  false,
  'catmullrom',
  0.5
);

/* World-space anchor for a chapter midpoint (where its content lives) */
export function anchor(t, dx = 0, dy = 0, dz = 0) {
  const p = PATH.getPoint(t);
  return [p.x + dx, p.y + dy, p.z + dz];
}
