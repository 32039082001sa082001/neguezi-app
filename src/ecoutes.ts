import { useEffect, useState } from 'react';
import { TRACKS, DEMO } from './theme';
export const URL = 'https://guxhrnesdwysjwoopukh.supabase.co';
export const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1eGhybmVzZHd5c2p3b29wdWtoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ2MDU0ODcsImV4cCI6MjExMDE4MTQ4N30.AzL61bjSseTElj3NH_zS-ULRpfvqIwQpBRbTIM7xQY8';
const HD = { apikey: KEY, Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' };
async function compter(titre: string) {
  try { await fetch(URL + '/rest/v1/rpc/compter', { method: 'POST', headers: HD, body: JSON.stringify({ p_titre: titre }) }); } catch (e) {}
}
function lundi(): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
  return d.toISOString().slice(0, 10);
}
async function rafraichir(): Promise<boolean> {
  try {
    const r = await fetch(URL + '/rest/v1/ecoutes?select=titre,total&semaine=eq.' + lundi() + '&order=total.desc&limit=20', { headers: HD });
    if (!r.ok) return false;
    const j: any = await r.json();
    if (!Array.isArray(j)) return false;
    const out: any[] = j.map((x: any) => ({ t: String(x.titre), n: Number(x.total) }));
    while (out.length < 10) out.push({ t: '—', n: 0 });
    const a = DEMO as any[];
    a.splice(0, a.length, ...out);
    return true;
  } catch (e) { return false; }
}
export function useEcoutes(playing: boolean, cur: number) {
  const [, s] = useState(0);
  useEffect(() => {
    let ok = true;
    const go = async () => { if (await rafraichir() && ok) s((n) => n + 1); };
    go();
    const id = setInterval(go, 300000);
    return () => { ok = false; clearInterval(id); };
  }, []);
  useEffect(() => {
    if (!playing) return;
    const t = TRACKS[cur];
    if (!t) return;
    const id = setTimeout(async () => {
      await compter(t.t);
      if (await rafraichir()) s((n) => n + 1);
    }, 30000);
    return () => clearTimeout(id);
  }, [playing, cur]);
}
