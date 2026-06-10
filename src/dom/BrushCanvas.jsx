import { useEffect, useRef } from 'react';

/* ════════════════════════════════════════════════════════════════
   VISCOUS TRAIL — a fresh stroke of champagne gel.
   The cursor draws one continuous ribbon: thick where the hand
   moves fast, thinning and dissipating as the gel settles.
   ════════════════════════════════════════════════════════════════ */
export default function BrushCanvas() {
  const ref = useRef();

  useEffect(() => {
    if (matchMedia('(pointer: coarse)').matches) return;
    const canvas = ref.current;
    const ctx = canvas.getContext('2d');
    let w, h, raf;
    const pts = []; /* { x, y, v, life } */
    let lx = -1, ly = -1;

    const resize = () => {
      w = canvas.width = innerWidth;
      h = canvas.height = innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const onMove = (e) => {
      const x = e.clientX, y = e.clientY;
      if (lx < 0) { lx = x; ly = y; return; }
      const v = Math.hypot(x - lx, y - ly);
      if (v < 1.5) return;
      pts.push({ x, y, v: Math.min(40, v), life: 1 });
      if (pts.length > 60) pts.shift();
      lx = x; ly = y;
    };
    window.addEventListener('mousemove', onMove);

    let prev = performance.now();
    const loop = (now) => {
      const dt = Math.min(0.1, (now - prev) / 1000);
      prev = now;
      ctx.clearRect(0, 0, w, h);

      /* the gel settles — slow, viscous dissipation */
      for (let i = pts.length - 1; i >= 0; i--) {
        pts[i].life -= dt * 0.55;
        if (pts[i].life <= 0) pts.splice(i, 1);
      }

      if (pts.length > 2) {
        ctx.globalCompositeOperation = 'lighter';
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        /* one smooth ribbon through the gesture, drawn in segments
           so width and opacity can taper with age and speed */
        for (let i = 1; i < pts.length - 1; i++) {
          const p0 = pts[i - 1], p1 = pts[i], p2 = pts[i + 1];
          const life = p1.life;
          if (life <= 0) continue;
          const e = life * life;
          const width = (2.2 + Math.min(14, p1.v * 0.45)) * e;
          const a = 0.075 * e;

          ctx.strokeStyle = `rgba(238, 215, 150, ${a})`;
          ctx.lineWidth = width;
          ctx.shadowColor = `rgba(212, 175, 55, ${a * 0.8})`;
          ctx.shadowBlur = width * 2.2;
          ctx.beginPath();
          ctx.moveTo((p0.x + p1.x) / 2, (p0.y + p1.y) / 2);
          ctx.quadraticCurveTo(p1.x, p1.y, (p1.x + p2.x) / 2, (p1.y + p2.y) / 2);
          ctx.stroke();
        }
        ctx.shadowBlur = 0;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return <canvas id="brush" ref={ref} aria-hidden="true" />;
}
