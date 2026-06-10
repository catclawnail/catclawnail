import { useEffect } from 'react';
import gsap from 'gsap';
import Lenis from 'lenis';
import { world, useStore } from './store';
import { CHAPTERS } from './chapters';
import BrushCanvas from './dom/BrushCanvas';
import Experience from './webgl/Experience';
import Overlay from './dom/Overlay';
import Loader from './dom/Loader';
import Nav from './dom/Nav';
import Cursor from './dom/Cursor';

export default function App() {
  const ready = useStore((s) => s.ready);

  /* Lenis drives the journey; GSAP's ticker drives Lenis. */
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.7,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.85,
      touchMultiplier: 1.6,
    });
    world.lenis = lenis;

    lenis.on('scroll', (e) => {
      world.progress = e.limit > 0 ? e.scroll / e.limit : 0;
      world.velocity = e.velocity;
    });

    const raf = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    /* metallic ink diffusion — every chapter threshold is an artistic gesture */
    const bounds = Object.values(CHAPTERS).map((c) => c.a).filter((a) => a > 0);
    const inkObj = { v: 0 };
    let last = 0;
    let inkTween = null;
    const watch = () => {
      const p = world.progress;
      if (bounds.some((b) => (last - b) * (p - b) < 0)) {
        inkTween?.kill();
        inkObj.v = Math.max(inkObj.v, 0.0001);
        inkTween = gsap.timeline()
          .to(inkObj, { v: 1, duration: 0.9, ease: 'power2.out' })
          .to(inkObj, { v: 0, duration: 1.8, ease: 'power2.inOut' });
      }
      world.ink = inkObj.v;
      last = p;
    };
    gsap.ticker.add(watch);

    return () => {
      gsap.ticker.remove(watch);
      gsap.ticker.remove(raf);
      lenis.destroy();
      world.lenis = null;
    };
  }, []);

  /* Scroll is locked until the loader lifts */
  useEffect(() => {
    if (!ready) {
      world.lenis?.stop();
      document.body.classList.remove('ready');
    } else {
      world.lenis?.start();
      document.body.classList.add('ready');
    }
  }, [ready]);

  return (
    <>
      <Experience />
      <BrushCanvas />
      <Overlay />
      <Nav />
      <Cursor />
      <Loader />
      {/* scroll runway — the journey's length */}
      <div id="runway" aria-hidden="true" />
    </>
  );
}
