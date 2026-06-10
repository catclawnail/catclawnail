import { create } from 'zustand';

/* React state — coarse, re-render-safe */
export const useStore = create((set) => ({
  ready: false,
  setReady: (v) => set({ ready: v }),
  loadProgress: 0,
  setLoadProgress: (v) => set({ loadProgress: v }),
}));

/* Transient world state — read every frame, never triggers React */
export const world = {
  progress: 0,            // global scroll progress 0..1
  velocity: 0,
  mouse: { x: 0, y: 0 },  // normalized -1..1
  ink: 0,                 // metallic ink diffusion pulse (chapter crossings)
  lenis: null,
};

if (typeof window !== 'undefined') {
  window.__world = world;
  window.__store = useStore;
  /* dev drive — lets tooling steer every open instance in sync */
  if (import.meta.env.DEV) {
    new BroadcastChannel('catclaw-dev').onmessage = (e) => {
      const { p } = e.data || {};
      if (typeof p === 'number' && world.lenis) {
        world.lenis.scrollTo(world.lenis.limit * p, { immediate: true });
      }
    };
  }
}
