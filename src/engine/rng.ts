// مولد تصادفی قطعی (seeded) — mulberry32
export function nextRandom(state: number): { value: number; state: number } {
  let t = (state + 0x6d2b79f5) | 0;
  let r = Math.imul(t ^ (t >>> 15), 1 | t);
  r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
  const value = ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  return { value, state: t };
}
export const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
export const round2 = (v: number) => Math.round(v * 100) / 100;
