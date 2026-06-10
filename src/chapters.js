/* The journey — one continuous camera travel split into chapters.
   a/b are global-progress windows; the camera depth is mapped onto PATH. */

export const CHAPTERS = {
  hero:      { a: 0.000, b: 0.115 },
  manifesto: { a: 0.115, b: 0.235 },
  about:     { a: 0.235, b: 0.360 },
  vip:       { a: 0.360, b: 0.490 },
  flash:     { a: 0.490, b: 0.615 },
  gallery:   { a: 0.615, b: 0.780 },
  transform: { a: 0.780, b: 0.885 },
  contact:   { a: 0.885, b: 1.000 },
};

export const mid = (c) => (c.a + c.b) / 2;

/* clamp-remap helper */
export const seg = (p, a, b) => Math.min(1, Math.max(0, (p - a) / (b - a)));
