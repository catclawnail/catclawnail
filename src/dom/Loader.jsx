import { useEffect, useRef, useState } from 'react';
import { useStore, world } from '../store';

/* Real asset progress (drei loading manager) eased toward 100,
   with a minimum dwell so the ritual is never skipped. */
export default function Loader() {
  const loadProgress = useStore((s) => s.loadProgress);
  const setReady = useStore((s) => s.setReady);
  const [shown, setShown] = useState(0);
  const [out, setOut] = useState(false);
  const start = useRef(performance.now());

  useEffect(() => {
    let raf;
    let prev = performance.now();
    const tick = (now) => {
      const dt = Math.min(1.5, (now - prev) / 1000);
      prev = now;
      setShown((v) => {
        /* time-based easing — converges even in throttled tabs */
        const next = v + (loadProgress - v) * Math.min(1, dt * 3.2);
        return next > 99.2 ? 100 : next;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [loadProgress]);

  useEffect(() => {
    if (shown >= 100 && !out) {
      const dwell = Math.max(0, 2200 - (performance.now() - start.current));
      const t = setTimeout(() => {
        setOut(true);
        setReady(true);
        /* imperative belt-and-braces — the experience must open
           even if a state subscription is dropped */
        document.body.classList.add('ready');
        world.lenis?.start();
      }, dwell + 400);
      return () => clearTimeout(t);
    }
  }, [shown, out, setReady]);

  return (
    <div id="loader" className={out ? 'out' : ''} aria-hidden={out}>
      <div className="ld-logo">
        <span className="ld-cat">CAT</span>
        <span className="ld-claw">CLAW</span>
      </div>
      <div className="ld-sub">ARTE DA INDOSSARE · MILANO</div>
      <div className="ld-track"><div className="ld-fill" style={{ width: `${shown}%` }} /></div>
      <div className="ld-pct">{Math.round(shown)}</div>
    </div>
  );
}
