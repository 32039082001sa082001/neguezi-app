import { Alert } from 'react-native';
import { createAudioPlayer } from 'expo-audio';
import { getCtx, getMode } from './studio';
let p: any = null;
export function deck2Load(uri: string) {
  try {
    if (!p) p = createAudioPlayer({ uri });
    else p.replace({ uri });
    p.volume = 1; dec2(uri);
  } catch (e: any) { Alert.alert('Disque 2', String(e)); }
}
export function deck2Play() { try { if (p) p.play(); } catch (e: any) { Alert.alert('Disque 2 lecture', String(e)); } }
export function deck2Pause() { eng2stop(); try { if (p) p.pause(); } catch (e) {} }
export function deck2Vol(v: number) { v2 = Math.max(0, Math.min(1, v)); try { if (g2) g2.gain.value = v2; } catch (e) {} try { if (p) p.volume = Math.max(0, Math.min(1, v)); } catch (e) {} }
export function deck2Stop() { eng2stop(); try { if (p) { p.pause(); p.remove && p.remove(); } } catch (e) {} p = null; }

export function deck2Ready(cb: () => void) {
  if (eng2go(cb)) return;
  try { if (p) p.play(); } catch (e: any) { Alert.alert('Disque 2 lecture', String(e)); }
  let n = 0;
  const id = setInterval(() => { n++; let ok = false; try { ok = !p || !!p.playing; } catch (e) { ok = true; } if (ok || n > 40) { clearInterval(id); cb(); } }, 25);
}

let buf2: any = null; let g2: any = null; let src2: any = null; let v2 = 1; let cx2: any = null;
async function dec2(uri: string) {
  try { const c = getCtx(); if (!c) return; if (cx2 !== c) { cx2 = c; g2 = c.createGain(); g2.connect(c.destination); } g2.gain.value = v2; buf2 = null; buf2 = await c.decodeAudioData(uri); } catch (e) { buf2 = null; }
}
function eng2stop() { try { if (src2) src2.stop(); } catch (e) {} src2 = null; }
function eng2go(cb: () => void): boolean {
  let s: any = null; let c: any = null;
  try { c = getCtx(); if (!c || !buf2 || cx2 !== c || getMode() !== 'st') return false; eng2stop(); try { c.resume(); } catch (e) {} s = c.createBufferSource(); s.buffer = buf2; s.connect(g2); g2.gain.value = v2; } catch (e) { return false; }
  cb(); try { s.start(0, 0); src2 = s; } catch (e) {}
  return true;
}
