let lib: any = null;
try { lib = require('react-native-audio-api'); } catch (e) { lib = null; }
const cache: any = {};
let msg = '';
export function statut(): string { return msg; }
const wait = () => new Promise((r) => setTimeout(r, 0));

async function decoder(uri: string): Promise<any> {
  const f = lib && lib.decodeAudioData;
  if (typeof f !== 'function') throw new Error('decodeAudioData absent');
  let p = uri.replace(/^file:\/\//, '');
  try { p = decodeURI(p); } catch (e) {}
  const essais = [
    () => f(uri, 11025),
    () => f(p, 11025),
    async () => { const r = await fetch(uri); return f(await r.arrayBuffer(), 11025); },
  ];
  let derniere: any = null;
  for (const e of essais) {
    try { const b = await e(); if (b) return b; } catch (x) { derniere = x; }
  }
  throw derniere || new Error('decodage vide');
}

export async function analyser(uri: string, d: number): Promise<number[] | null> {
  if (cache[uri]) { msg = cache[uri].length + ' battements'; return cache[uri]; }
  msg = "off"; return null;
  try {
    if (!uri) { msg = 'echec: pas de fichier'; return null; }
    const buf = await decoder(uri);
    if (buf.duration && buf.duration > 900) { msg = 'echec: trop long'; return null; }
    const ch = buf.getChannelData(0);
    const sr = buf.sampleRate || 11025;
    const hop = Math.max(1, Math.floor(sr / 50));
    const nF = Math.floor(ch.length / hop);
    const env = new Float32Array(nF);
    let lp = 0; let gmax = 0;
    for (let k = 0; k < nF; k++) {
      let s = 0; const o = k * hop;
      for (let i = 0; i < hop; i++) { lp += 0.08 * (ch[o + i] - lp); s += lp * lp; }
      const e = Math.sqrt(s / hop); env[k] = e; if (e > gmax) gmax = e;
      if (k % 300 === 299) await wait();
    }
    const out: number[] = []; let last = -1;
    for (let k = 3; k < nF - 1; k++) {
      const s0 = Math.max(0, k - 50); let m = 0;
      for (let j = s0; j < k; j++) m += env[j];
      m /= (k - s0);
      const t = (k * hop) / sr;
      if (env[k] > m * 1.35 && env[k] >= env[k - 1] && env[k] > env[k + 1] && env[k] > gmax * 0.18 && t - last > 0.3) { out.push(t); last = t; }
    }
    cache[uri] = out;
    msg = out.length ? out.length + ' battements' : 'aucun battement';
    return out;
  } catch (e: any) {
    msg = 'echec: ' + String((e && e.message) || e).slice(0, 60);
    return null;
  }
}
