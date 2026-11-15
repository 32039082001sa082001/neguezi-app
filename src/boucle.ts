import { getTime, getMeta, isPlaying, seekTo } from './studio';
import { analyser } from './rythme';
let beats: number[] | null = null;
let uri = '';
let a = -1;
let b = -1;
let id: any = null;
export function boucleActive() { return a >= 0; }
export function boucleLibere() { a = -1; b = -1; }
export function boucleVerrouille(n: number) {
  if (!beats || !beats.length) return false;
  const t = getTime();
  let i = 0;
  while (i < beats.length - 1 && beats[i + 1] <= t) i++;
  const j = Math.min(beats.length - 1, i + n);
  if (j <= i) return false;
  a = beats[i]; b = beats[j];
  return true;
}
export function boucleDemarre() {
  if (id) return;
  id = setInterval(() => {
    try {
      const m = getMeta();
      if (m && m.uri && m.uri !== uri) {
        uri = m.uri; beats = null; a = -1; b = -1;
        const u = m.uri;
        analyser(u, m.d).then((r: any) => { if (uri === u) beats = r && r.length ? r : null; });
      }
      if (a < 0 || !isPlaying()) return;
      if (getTime() >= b - 0.08) seekTo(a);
    } catch (e) {}
  }, 10);
}
