import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { TRACKS } from './theme';
export const BL = { fond: '#050A1A', elec: '#2D6BFF', lum: '#4D8DFF', tour: '#1B3A8A', txt: '#EAF1FF', sec: '#8899BB' };
const SF = 'Fraunces_600SemiBold';
export function SkylineSons({ cur, onPick }: { cur: number; onPick: (i: number) => void }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ alignItems: 'flex-end', paddingHorizontal: 20, paddingTop: 40 }}>
      {TRACKS.map((t, i) => {
        const on = i === cur;
        const h = on ? 300 : 90 + ((i * 53) % 120);
        return (
          <Pressable key={t.t + i} onPress={() => onPick(i)} style={{ alignItems: 'center', marginHorizontal: 4, width: on ? 58 : 38 }}>
            <Text numberOfLines={2} style={{ color: BL.txt, fontFamily: SF, fontSize: on ? 16 : 11, textAlign: 'center', marginBottom: 6, opacity: on || i % 3 === 0 ? 1 : 0 }}>{t.t}</Text>
            <View style={{ width: '100%', height: h, backgroundColor: on ? BL.elec : BL.tour, borderTopLeftRadius: 3, borderTopRightRadius: 3, elevation: on ? 12 : 0 }} />
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
import { Animated } from 'react-native';
import { useEffect, useRef } from 'react';
export function SkylineLecture({ playing }: { playing: boolean }) {
  const bars = useRef(Array.from({ length: 28 }, () => new Animated.Value(30))).current;
  useEffect(() => {
    if (!playing) { bars.forEach((b) => b.setValue(30)); return undefined; }
    let on = true;
    const go = (b: Animated.Value) => { if (!on) return; Animated.timing(b, { toValue: 20 + Math.random() * 150, duration: 250 + Math.random() * 350, useNativeDriver: false }).start(() => go(b)); };
    bars.forEach((b) => go(b));
    return () => { on = false; bars.forEach((b) => b.stopAnimation()); };
  }, [playing]);
  return (
    <View style={{ height: 190, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', gap: 4 }}>
      {bars.map((b, i) => <Animated.View key={i} style={{ width: 9, height: b, backgroundColor: i % 5 === 0 ? BL.lum : BL.elec, borderTopLeftRadius: 2, borderTopRightRadius: 2 }} />)}
    </View>
  );
}
import Svg, { Line, Circle } from 'react-native-svg';
import { useWindowDimensions } from 'react-native';
export function ConstellationSons({ cur, onPick }: { cur: number; onPick: (i: number) => void }) {
  const { width } = useWindowDimensions();
  const n = TRACKS.length;
  const s0 = Math.max(0, Math.min(cur - 15, n - 30));
  const ids = TRACKS.slice(s0, s0 + 30).map((_, k) => s0 + k);
  const pt = (i: number) => ({ x: 24 + (((i * 7919) % 1000) / 1000) * (width - 48), y: 30 + (((i * 6151) % 1000) / 1000) * 330 });
  return (
    <Svg width={width} height={400}>
      {ids.slice(1).map((i, k) => { const a = pt(ids[k]); const b = pt(i); return <Line key={'l' + i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={BL.tour} strokeWidth={1} />; })}
      {ids.map((i) => {
        const p = pt(i); const on = i === cur;
        return (
          <React.Fragment key={i}>
            {on && <Circle cx={p.x} cy={p.y} r={26} fill={BL.elec} opacity={0.25} />}
            <Circle cx={p.x} cy={p.y} r={on ? 11 : 5} fill={on ? BL.lum : BL.txt} />
            <Circle cx={p.x} cy={p.y} r={18} fill="transparent" onPress={() => onPick(i)} />
          </React.Fragment>
        );
      })}
    </Svg>
  );
}
export function ConstellationLecture({ p }: { p: number }) {
  const { width } = useWindowDimensions();
  const N = 24;
  const pt = (i: number) => ({ x: 24 + (((i * 7919) % 1000) / 1000) * (width - 48), y: 20 + (((i * 6151) % 1000) / 1000) * 170 });
  const k = Math.floor(p * (N - 1));
  return (
    <Svg width={width} height={210}>
      {Array.from({ length: k }, (_, i) => { const a = pt(i); const b = pt(i + 1); return <Line key={'l' + i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={BL.elec} strokeWidth={1.5} />; })}
      {Array.from({ length: N }, (_, i) => { const q = pt(i); return <Circle key={i} cx={q.x} cy={q.y} r={i === k ? 9 : 4} fill={i <= k ? BL.lum : BL.tour} />; })}
    </Svg>
  );
}
export function MesSonsNuit({ cur, onPick, onAsk, uni, setUni }: any) {
  const t = TRACKS[cur];
  return (
    <View style={{ flex: 1, backgroundColor: BL.fond, paddingTop: 10 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24 }}>
        <Text style={{ color: BL.txt, fontFamily: SF, fontSize: 40 }}>Mes sons</Text>
        <Pressable onPress={() => setUni(uni === 'sky' ? 'cons' : 'sky')}><Text style={{ color: BL.lum, fontSize: 28 }}>{uni === 'sky' ? '✦' : '▥'}</Text></Pressable>
      </View>
      {TRACKS.length === 0 ? <Pressable onPress={onAsk}><Text style={{ color: BL.lum, fontFamily: SF, fontSize: 18, padding: 24 }}>Charger ma musique</Text></Pressable>
        : uni === 'sky' ? <SkylineSons cur={cur} onPick={onPick} /> : <ConstellationSons cur={cur} onPick={onPick} />}
      {uni === 'cons' && t ? <Text numberOfLines={1} style={{ color: BL.txt, fontFamily: SF, fontSize: 22, textAlign: 'center', marginTop: 8 }}>{t.t}</Text> : null}
    </View>
  );
}
import { fmt } from './theme';
import { Effets } from './sons';
export function LectureNuit({ eff, setEff, cur, playing, time, toggle, next, prev, back, loop, setLoop, shuf, setShuf, uni }: any) {
  const t = TRACKS[cur];
  const p = t && t.d ? Math.min(1, time / t.d) : 0;
  const ic = (on: boolean) => ({ color: BL.txt, fontSize: 26, opacity: on ? 1 : 0.45 });
  return (
    <ScrollView style={{ flex: 1, backgroundColor: BL.fond }} contentContainerStyle={{ paddingBottom: 200, alignItems: 'center' }}>
      <View style={{ width: '100%', padding: 20 }}><Pressable onPress={back}><Text style={{ color: BL.txt, fontSize: 30 }}>⌄</Text></Pressable></View>
      <Text numberOfLines={2} style={{ color: BL.txt, fontFamily: SF, fontSize: 28, textAlign: 'center', paddingHorizontal: 24 }}>{t ? t.t : ''}</Text>
      <Text style={{ color: BL.lum, fontFamily: SF, fontSize: 18, marginTop: 6, marginBottom: 20 }}>Artiste inconnu</Text>
      {uni === 'sky' ? <SkylineLecture playing={playing} /> : <ConstellationLecture p={p} />}
      <View style={{ width: '88%', height: 4, borderRadius: 2, backgroundColor: BL.tour, marginTop: 24 }}><View style={{ width: `${Math.round(p * 100)}%` as any, height: 4, borderRadius: 2, backgroundColor: BL.lum }} /></View>
      <View style={{ width: '88%', flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}><Text style={{ color: BL.sec }}>{fmt(time)}</Text><Text style={{ color: BL.sec }}>{t ? fmt(t.d) : '0:00'}</Text></View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 22, marginTop: 20 }}>
        <Pressable onPress={() => setShuf(!shuf)}><Text style={ic(shuf)}>⇄</Text></Pressable>
        <Pressable onPress={prev}><Text style={ic(true)}>⏮</Text></Pressable>
        <Pressable onPress={toggle} style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: BL.elec, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: BL.txt, fontSize: 30 }}>{playing ? '❚❚' : '▶'}</Text></Pressable>
        <Pressable onPress={next}><Text style={ic(true)}>⏭</Text></Pressable>
        <Pressable onPress={() => setLoop(!loop)}><Text style={ic(loop)}>↻</Text></Pressable>
      </View>
      <View style={{ marginTop: 24 }}><Effets eff={eff} setEff={setEff} /></View>
    </ScrollView>
  );
}
