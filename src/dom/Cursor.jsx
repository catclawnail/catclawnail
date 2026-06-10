import { useEffect, useRef } from 'react';
import { world } from '../store';

/* A single magnetic dot — the artist's point of contact.
   The viscous trail it leaves lives in BrushCanvas. */
export default function Cursor() {
  const dot = useRef();

  useEffect(() => {
    if (matchMedia('(pointer: coarse)').matches) return;
    document.body.classList.add('has-cursor');

    let dx = innerWidth / 2, dy = innerHeight / 2, x = dx, y = dy, raf;

    const onMove = (e) => {
      dx = e.clientX; dy = e.clientY;
      world.mouse.x = (e.clientX / innerWidth - 0.5) * 2;
      world.mouse.y = -(e.clientY / innerHeight - 0.5) * 2;
    };

    /* slight magnetic lag — the dot is drawn through the gel */
    const loop = () => {
      x += (dx - x) * 0.28;
      y += (dy - y) * 0.28;
      if (dot.current)
        dot.current.style.transform = `translate(${x}px,${y}px) translate(-50%,-50%)`;
      raf = requestAnimationFrame(loop);
    };

    const onOver = (e) => {
      if (e.target.closest('a, button'))
        document.body.classList.add('cursor-hover');
    };
    const onOut = (e) => {
      if (e.target.closest('a, button'))
        document.body.classList.remove('cursor-hover');
    };

    window.addEventListener('mousemove', onMove);
    document.addEventListener('mouseover', onOver);
    document.addEventListener('mouseout', onOut);
    raf = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseover', onOver);
      document.removeEventListener('mouseout', onOut);
      cancelAnimationFrame(raf);
      document.body.classList.remove('has-cursor');
    };
  }, []);

  return (
    <div id="cursor" aria-hidden="true">
      <div className="c-dot" ref={dot} />
    </div>
  );
}
