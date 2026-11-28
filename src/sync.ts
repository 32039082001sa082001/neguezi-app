export let bpm1 = 0;
export let bpm2 = 0;
export function setBpm1(v: number) { bpm1 = v > 0 ? v : 0; }
export function setBpm2(v: number) { bpm2 = v > 0 ? v : 0; }
export function calcSync(): { r: number; warn: boolean } | null {
  if (!bpm1 || !bpm2) return null;
  const raw = bpm1 / bpm2;
  const r = Math.max(0.94, Math.min(1.06, raw));
  return { r, warn: raw !== r };
}
