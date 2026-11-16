import { Dimensions } from 'react-native';
import { useState as useS } from 'react';
import { seekTo } from './studio';
import React from 'react';
import { View, Text, ImageBackground, Pressable } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import { TRACKS, fmt } from './theme';
import { Platine } from './boutons';
import { Ronds } from './ronds';
import { CoeurFx } from './animcoeur';
import { Folie } from './folie';

const L: string[][] = [['ralenti', 'Lent'], ['vitesse', 'Rapide'], ['enfant', 'Enfant'], ['grave', 'Grave'], ['ambiance', 'Ambiance']];
const B = (on: boolean) => (on ? '#4D8DFF' : '#8899BB');
function Ic({ n, c, s }: any) {
  const d: any = { prev: 'M6 5v14M19 5L9 12l10 7z', next: 'M18 5v14M5 5l10 7-10 7z', play: 'M7 4l13 8-13 8z', shuf: 'M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5', loop: 'M17 2l4 4-4 4M3 11V9a3 3 0 0 1 3-3h15M7 22l-4-4 4-4M21 13v2a3 3 0 0 1-3 3H3' };
  const f = n === 'play' || n === 'prev' || n === 'next' ? c : 'none';
  if (n === 'pause') return <Svg width={s} height={s} viewBox="0 0 24 24"><Rect x="6" y="4" width="4" height="16" rx="1" fill={c} /><Rect x="14" y="4" width="4" height="16" rx="1" fill={c} /></Svg>;
  return <Svg width={s} height={s} viewBox="0 0 24 24"><Path d={d[n]} stroke={c} strokeWidth={2} fill={f} strokeLinecap="round" strokeLinejoin="round" /></Svg>;
}
export function LectureVille({ eff, setEff, cur, playing, time, toggle, next, prev, back, loop, setLoop, shuf, setShuf }: any) {
  const t = TRACKS[cur];
  const [dr, setDr] = useS<number | null>(null);
  const fr = (x: number) => Math.max(0, Math.min(1, (x - 24) / (Dimensions.get('window').width - 48)));
  const p = dr !== null ? dr : (t && t.d ? Math.min(1, time / t.d) : 0);
  return (
    <ImageBackground source={require('../assets/egal.png')} resizeMode="cover" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}><Ronds /><CoeurFx /><Folie />
      <Pressable onPress={back} hitSlop={16} style={{ position: 'absolute', top: 18, left: 16 }}>
        <Svg width={30} height={30} viewBox="0 0 24 24"><Path d="M6 9l6 6 6-6" stroke="#EAF1FF" strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" /></Svg>
      </Pressable>
      <View style={{ position: 'absolute', top: '11%', left: 20, right: 20, alignItems: 'center' }}>
        <Text numberOfLines={2} style={{ color: '#EAF1FF', fontSize: 30, textAlign: 'center' }}>{t ? t.t : ''}</Text>
        <Text style={{ color: '#4D8DFF', fontSize: 17, marginTop: 6 }}>Artiste inconnu</Text>
      </View>
      <View style={{ position: 'absolute', left: 24, right: 24, bottom: 190, paddingVertical: 10 }} onStartShouldSetResponder={() => true} onResponderTerminationRequest={() => false} onResponderGrant={(e: any) => setDr(fr(e.nativeEvent.pageX))} onResponderMove={(e: any) => setDr(fr(e.nativeEvent.pageX))} onResponderRelease={(e: any) => { const f = fr(e.nativeEvent.pageX); setDr(null); if (t && t.d) seekTo(f * t.d); }}>
        <View style={{ height: 4, borderRadius: 2, backgroundColor: '#1B3A8A' }}>
          <View style={{ width: `${Math.round(p * 100)}%` as any, height: 4, borderRadius: 2, backgroundColor: '#4D8DFF' }} />
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
          <Text style={{ color: '#8899BB', fontSize: 13 }}>{fmt(time)}</Text><Text style={{ color: '#8899BB', fontSize: 13 }}>{t && t.d ? fmt(t.d) : ''}</Text>
        </View>
      </View>
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 100, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 26 }}>
        <Pressable onPress={() => setShuf(!shuf)}><Ic n="shuf" c={B(shuf)} s={24} /></Pressable>
        <Pressable onPress={prev}><Ic n="prev" c="#EAF1FF" s={30} /></Pressable>
        <Pressable onPress={toggle} style={{ width: 76, height: 76, borderRadius: 38, backgroundColor: '#2D6BFF', alignItems: 'center', justifyContent: 'center' }}><Ic n={playing ? 'pause' : 'play'} c="#EAF1FF" s={34} /></Pressable>
        <Pressable onPress={next}><Ic n="next" c="#EAF1FF" s={30} /></Pressable>
        <Pressable onPress={() => setLoop(!loop)}><Ic n="loop" c={B(loop)} s={24} /></Pressable>
      </View>
      <Platine />
    </ImageBackground>
  );
}
