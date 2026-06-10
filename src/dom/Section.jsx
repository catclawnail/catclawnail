import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { world } from '../store';
import { seg } from '../chapters';

/* A fixed full-screen chapter of copy, scrubbed by global progress.
   Children tagged [data-r] cascade in; [data-count] elements count up. */
export default function Section({ a, b, id, className = '', children }) {
  const ref = useRef();

  useEffect(() => {
    const el = ref.current;
    const items = Array.from(el.querySelectorAll('[data-r]'));
    const counts = Array.from(el.querySelectorAll('[data-count]'));

    const tick = () => {
      const p = seg(world.progress, a, b);
      const inP = a <= 0 ? 1 : seg(p, 0.04, 0.3);
      const outP = b >= 1 ? 0 : seg(p, 0.82, 1);
      const o = inP * (1 - outP);

      el.style.opacity = o;
      el.style.visibility = o <= 0.002 ? 'hidden' : 'visible';
      el.style.transform = `translate3d(0, ${-outP * 70}px, 0)`;

      items.forEach((it, i) => {
        const d = seg(inP, i * 0.07, i * 0.07 + 0.45);
        const e = 1 - Math.pow(1 - d, 3);
        it.style.opacity = e;
        it.style.transform = `translate3d(0, ${(1 - e) * 52}px, 0)`;
      });

      const cp = seg(inP, 0.5, 1);
      counts.forEach((c) => {
        c.textContent = Math.round(Number(c.dataset.count) * (1 - Math.pow(1 - cp, 2)));
      });
    };

    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, [a, b]);

  return (
    <section ref={ref} id={id} className={`ch ${className}`} aria-hidden="false">
      {children}
    </section>
  );
}
