import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, TextInput, Image, Dimensions, Linking } from 'react-native';
import * as Haptics from 'expo-haptics';
import { creer } from './live';

const W = Dimensions.get('window').width;
const IH = (W * 1672) / 941;
const TXT = '#EAF2FF';
const DIM = '#9DBBFF';
const LINE = '#2A5BE0';
const BLUE = '#2D6BFF';
const CARD = 'rgba(8,24,70,0.78)';
const freq = (c: string) => c.slice(0, 3) + '.' + c.slice(3);
const mmss = (s: number) => Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');

export function Allumer({ onCreate, back }: { onCreate: (r: any) => void; back: () => void }) {
  const [pseudo, setPseudo] = useState('');
  const [nom, setNom] = useState('Nuit à Bamako');
  const [etat, setEtat] = useState<'pret' | 'charge' | 'on'>('pret');
  const [salle, setSalle] = useState<any>(null);
  const [reste, setReste] = useState(1800);
  const [err, setErr] = useState('');
  useEffect(() => {
    if (!salle) return undefined;
    const i = setInterval(() => setReste(Math.max(0, Math.floor((new Date(salle.fin).getTime() - Date.now()) / 1000))), 1000);
    return () => clearInterval(i);
  }, [salle]);

  async function allumer() {
    if (etat !== 'pret') return;
    if (pseudo.trim().length < 2) { setErr('Ton pseudo (2 lettres min.)'); return; }
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); } catch (e) {}
    setErr(''); setEtat('charge');
    const r = await creer(nom.trim() || 'Ma salle', pseudo.trim());
    if (r && r.salle) { setSalle({ ...r.salle, live: r }); setReste(1800); setEtat('on'); }
    else { setEtat('pret'); setErr((r && r.erreur) || 'Erreur'); }
  }

  const cx = W / 2; const cy = IH * 0.275; const R = W * 0.3;
  return (
    <View style={{ flex: 1, backgroundColor: '#050A1A' }}>
      <Image source={require('../assets/salle-fond.png')} style={{ position: 'absolute', top: 0, left: 0, width: W, height: IH }} />
      <Pressable onPress={back} hitSlop={16} style={{ position: 'absolute', top: 40, left: 16, width: 42, height: 42, borderRadius: 21, borderWidth: 1, borderColor: LINE, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: TXT, fontSize: 24 }}>‹</Text></Pressable>
      <View pointerEvents="none" style={{ position: 'absolute', left: cx - R, top: cy - R, width: R * 2, height: R * 2, borderRadius: R, borderWidth: 3, borderColor: BLUE, opacity: etat === 'on' ? 0.25 + 0.75 * (reste / 1800) : 0 }} />
      <Pressable onPress={allumer} style={{ position: 'absolute', left: cx - W * 0.22, top: cy - W * 0.22, width: W * 0.44, height: W * 0.44, borderRadius: W * 0.22 }} />

      <View style={{ position: 'absolute', left: 20, right: 20, top: IH * 0.5 }}>
        <Text style={{ color: DIM, textAlign: 'center', fontSize: 14 }}>{etat === 'on' ? 'FRÉQUENCE' : etat === 'charge' ? 'Allumage…' : 'Touche le cœur pour allumer'}</Text>
        {etat === 'on' && salle ? <View style={{ alignItems: 'center', marginTop: 6 }}><Text style={{ color: TXT, fontSize: 56, fontWeight: '700', letterSpacing: 4 }}>{freq(salle.code)}</Text><Text style={{ color: DIM, fontSize: 16 }}>{mmss(reste)} · 3 personnes max</Text></View> : null}
        {etat !== 'on' ? <TextInput value={pseudo} onChangeText={setPseudo} maxLength={20} placeholder="Ton pseudo" placeholderTextColor={DIM} style={{ color: TXT, fontSize: 18, textAlign: 'center', padding: 12, borderRadius: 22, borderWidth: 1, borderColor: LINE, backgroundColor: CARD, marginTop: 14 }} /> : null}
        {etat !== 'on' ? <TextInput value={nom} onChangeText={setNom} maxLength={20} placeholder="Nom de la salle" placeholderTextColor={DIM} style={{ color: TXT, fontSize: 18, textAlign: 'center', padding: 12, borderRadius: 22, borderWidth: 1, borderColor: LINE, backgroundColor: CARD, marginTop: 10 }} /> : null}
        {err ? <Text style={{ color: '#FF8A8A', textAlign: 'center', marginTop: 10 }}>{err}</Text> : null}
        {etat === 'on' && salle ? <Pressable onPress={() => onCreate({ name: salle.nom, pub: true, code: salle.code, mine: true, n: 1, live: salle.live })} style={{ marginTop: 22, backgroundColor: BLUE, borderRadius: 30, paddingVertical: 17, alignItems: 'center' }}><Text style={{ color: '#FFFFFF', fontSize: 20, fontWeight: '700' }}>Entrer dans ma salle</Text></Pressable> : null}
      </View>
    </View>
  );
}
