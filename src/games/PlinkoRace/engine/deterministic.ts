// src/engine/deterministic.ts
function seedFromString(str: string): number {
  const encoder = new TextEncoder();
  const bytes  = encoder.encode(str);
  return bytes.reduce((seed, b) => ((seed << 5) - seed + b) >>> 0, 0);
}

function mulberry32(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t += 0x6D2B79F5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export function makeRng(seedString: string): () => number {
  const seed = seedFromString(seedString);
  return mulberry32(seed);
}
