import { createAudioPlayer } from 'expo-audio';
let p: any = null;
export function deck2Load(uri: string) {
  try {
    if (!p) p = createAudioPlayer({ uri });
    else p.replace({ uri });
    p.volume = 1;
  } catch (e) {}
}
export function deck2Play() { try { if (p) p.play(); } catch (e) {} }
export function deck2Pause() { try { if (p) p.pause(); } catch (e) {} }
export function deck2Vol(v: number) { try { if (p) p.volume = Math.max(0, Math.min(1, v)); } catch (e) {} }
export function deck2Stop() { try { if (p) { p.pause(); p.remove && p.remove(); } } catch (e) {} p = null; }
