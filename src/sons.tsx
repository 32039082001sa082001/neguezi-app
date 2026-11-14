import React, { useEffect, useRef } from 'react';
import { View, Text, Pressable, ScrollView, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { C, TRACKS, fmt } from './theme';
export const AMB = '#E99A42', LUM = '#FFB45C', ESP = '#1E0F0C';
export const SERIF = 'Fraunces_600SemiBold', SANS = 'Manrope_500Medium';
const G: [string, string][] = [['#C9773B', '#7A2E1D'], ['#E99A42', '#7A2E1D'], ['#FFB45C', '#C9773B'], ['#7A2E1D', '#1E0F0C']];
export function Pochette({ t, i, s }: { t: string; i: number; s: number }) {
  return (
    <LinearGradient colors={G[i % 4]} style={{ width: s, height: s, borderRadius: s / 2, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.copper }}>
      <Text style={{ color: C.cream, fontFamily: SERIF, fontSize: s * 0.42 }}>{(t[0] || '?').toUpperCase()}</Text>
    </LinearGradient>
  );
}
export function Disque({ on, playing }: { on: boolean; playing: boolean }) {
  const r = useRef(new Animated.Value(0)).current;
  const a = useRef<Animated.CompositeAnimation | null>(null);
  useEffect(() => {
    a.current?.stop();
    if (!(on && playing)) return;
    r.setValue(0);
    a.current = Animated.loop(Animated.timing(r, { toValue: 1, duration: 6000, easing: Easing.linear, useNativeDriver: true }));
    a.current.start();
    return () => a.current?.stop();
  }, [on, playing]);
  const rot = r.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  return <Animated.Image source={require('../assets/disque.png')} style={{ width: 150, height: 150, transform: [{ rotate: rot }] }} />;
}
export function Egaliseur({ playing }: { playing: boolean }) {
  const v = useRef(Array.from({ length: 22 }, () => new Animated.Value(0.3))).current;
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => v.forEach((x) => Animated.timing(x, { toValue: 0.15 + Math.random() * 0.85, duration: 220, useNativeDriver: true }).start()), 240);
    return () => clearInterval(id);
  }, [playing]);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 22, gap: 3 }}>
      {v.map((x, k) => <Animated.View key={k} style={{ width: 3, height: 22, borderRadius: 2, backgroundColor: k % 3 ? AMB : LUM, transform: [{ scaleY: x }] }} />)}
    </View>
  );
}
export function Ligne({ t, i, on, playing, onPick }: { t: any; i: number; on: boolean; playing: boolean; onPick: (i: number) => void }) {
  return (
    <Pressable onPress={() => onPick(i)} style={{ marginHorizontal: 14, marginBottom: 12 }}>
      <LinearGradient colors={on ? ['#7A2E1D', '#1E0F0C'] : ['#2A1612', '#1E0F0C']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ minHeight: 108, flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 30, borderWidth: on ? 1.5 : 1, borderColor: on ? LUM : 'rgba(201,119,59,0.25)' }}>
        {on && <View style={{ position: 'absolute', left: -34, top: -21 }}><Disque on={on} playing={playing} /></View>}
        <View style={{ marginLeft: on ? 58 : 0 }}><Pochette t={t.t} i={i} s={84} /></View>
        <View style={{ flex: 1, marginLeft: 14 }}>
          <Text numberOfLines={1} style={{ color: C.cream, fontFamily: SERIF, fontSize: 22 }}>{t.t}</Text>
          <Text style={{ color: C.grey, fontFamily: SANS, fontSize: 16 }}>Artiste inconnu</Text>
        </View>
        <Text style={{ color: C.cream, fontFamily: SANS, fontSize: 16 }}>{fmt(t.d)}</Text>
        {on && <View style={{ position: 'absolute', left: 150, bottom: 6 }}><Egaliseur playing={playing} /></View>}
      </LinearGradient>
    </Pressable>
  );
}
import Svg, { Circle, Ellipse, Path } from 'react-native-svg';
export function Entete({ n }: { n: number }) {
  return (
    <View style={{ height: 180 }}>
      <Svg width="100%" height={180} viewBox="0 0 400 180" style={{ position: 'absolute' }}>
        <Circle cx="290" cy="105" r="46" fill={AMB} opacity={0.55} />
        <Path d="M0 150 Q140 110 400 140 L400 180 L0 180Z" fill="#7A2E1D" opacity={0.6} />
        <Path d="M290 150 L290 112" stroke={ESP} strokeWidth={5} />
        <Ellipse cx="290" cy="104" rx="62" ry="13" fill={ESP} />
      </Svg>
      <Text style={{ position: 'absolute', left: 28, top: 58, color: C.cream, fontFamily: SERIF, fontSize: 44 }}>Mes sons</Text>
      <Text style={{ position: 'absolute', right: 28, top: 52, color: C.cream, fontFamily: SERIF, fontSize: 30, textAlign: 'right' }}>{n}{'\n'}<Text style={{ fontSize: 14, fontFamily: SANS, color: C.grey }}>sons</Text></Text>
    </View>
  );
}
export function SonsNeuf({ cur, playing, onPick, onAsk }: { cur: number; playing: boolean; onPick: (i: number) => void; onAsk: () => void }) {
  const [tab, setTab] = React.useState('Sons');
  if (TRACKS.length === 0) return (
    <View style={{ flex: 1, padding: 28, justifyContent: 'center' }}>
      <Text style={{ color: C.cream, fontFamily: SERIF, fontSize: 24 }}>Aucun son trouvé</Text>
      <Text style={{ color: C.grey, fontFamily: SANS, marginTop: 8 }}>NEGUEZI lit la musique de ton téléphone. Autorise l'accès pour la voir ici.</Text>
      <Pressable onPress={onAsk} style={{ marginTop: 18, backgroundColor: C.copper, borderRadius: 26, padding: 14, alignItems: 'center' }}><Text style={{ color: ESP, fontFamily: SERIF }}>Autoriser</Text></Pressable>
    </View>
  );
  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 260 }}>
      <Entete n={TRACKS.length} />
      <View style={{ flexDirection: 'row', marginHorizontal: 14, marginBottom: 18, borderRadius: 32, borderWidth: 1, borderColor: 'rgba(201,119,59,0.5)', overflow: 'hidden' }}>
        {['Sons', 'Albums', 'Pistes'].map((x) => (
          <Pressable key={x} onPress={() => setTab(x)} style={{ flex: 1 }}>
            <LinearGradient colors={tab === x ? ['#C9773B', '#E99A42'] : ['#2A1612', '#1E0F0C']} style={{ height: 62, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: tab === x ? ESP : C.cream, fontFamily: SANS, fontSize: 16 }}>{x}</Text>
            </LinearGradient>
          </Pressable>
        ))}
      </View>
      {tab === 'Albums' ? <Text style={{ color: C.cream, fontFamily: SERIF, fontSize: 20, marginHorizontal: 28 }}>Mes ajouts · {TRACKS.length} sons</Text>
        : TRACKS.map((t, i) => <Ligne key={t.t + i} t={t} i={i} on={i === cur} playing={playing} onPick={onPick} />)}
    </ScrollView>
  );
}
export function MiniLecteur({ t, i, playing, time, toggle, next, open }: any) {
  const p = t.d ? Math.min(1, time / t.d) : 0;
  return (
    <Pressable onPress={open} style={{ position: 'absolute', left: 12, right: 12, bottom: 140 }}>
      <LinearGradient colors={['#7A2E1D', '#1E0F0C']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ height: 100, borderRadius: 42, borderWidth: 1, borderColor: C.copper, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14 }}>
        <Pochette t={t.t} i={i} s={64} />
        <View style={{ flex: 1, marginHorizontal: 12 }}>
          <Text numberOfLines={1} style={{ color: C.cream, fontFamily: SERIF, fontSize: 18 }}>{t.t}</Text>
          <Text style={{ color: C.grey, fontFamily: SANS, fontSize: 13 }}>Artiste inconnu · {fmt(time)}</Text>
          <View style={{ height: 4, borderRadius: 2, backgroundColor: 'rgba(242,230,208,0.2)', marginTop: 8 }}><View style={{ width: `${Math.round(p * 100)}%` as any, height: 4, borderRadius: 2, backgroundColor: AMB }} /></View>
        </View>
        <Pressable onPress={toggle}><LinearGradient colors={['#C9773B', '#E99A42']} style={{ width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: ESP, fontSize: 20 }}>{playing ? '❚❚' : '▶'}</Text></LinearGradient></Pressable>
        <Pressable onPress={next} style={{ marginLeft: 12 }}><Text style={{ color: C.cream, fontSize: 22 }}>⏭</Text></Pressable>
      </LinearGradient>
    </Pressable>
  );
}
export function BarreBas({ tabs, active, go }: any) {
  return (
    <LinearGradient colors={['#2A1612', '#1E0F0C']} style={{ flexDirection: 'row', marginHorizontal: 10, marginBottom: 40, paddingTop: 10, paddingBottom: 12, borderRadius: 30, borderWidth: 1, borderColor: 'rgba(201,119,59,0.4)' }}>
      {tabs.map(([k, l, g]: string[]) => (
        <Pressable key={k} onPress={() => go(k)} style={{ flex: 1, alignItems: 'center' }}>
          <Text style={{ color: active === k ? AMB : C.grey, fontSize: 22 }}>{g}</Text>
          <Text style={{ color: active === k ? C.cream : C.grey, fontFamily: SANS, fontSize: 12 }}>{l}</Text>
          {active === k && <View style={{ width: 22, height: 3, borderRadius: 2, backgroundColor: C.copper, marginTop: 4 }} />}
        </Pressable>
      ))}
    </LinearGradient>
  );
}
export function Ouverture() {
  const r = useRef(new Animated.Value(0)).current;
  useEffect(() => { Animated.loop(Animated.timing(r, { toValue: 1, duration: 1800, easing: Easing.linear, useNativeDriver: true })).start(); }, []);
  const rot = r.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  return (
    <View style={{ width: 300, height: 300 }}>
      <Animated.Image source={require('../assets/platine.png')} style={{ width: 300, height: 300 }} />
      <Animated.Image source={require('../assets/disque.png')} style={{ position: 'absolute', left: 12, top: 23, width: 237, height: 237, transform: [{ rotate: rot }] }} />
    </View>
  );
}
export function LecteurNeuf({ eff, setEff, cur, playing, time, toggle, next, prev, back, goRank }: any) {
  const t = TRACKS[cur]; const p = t && t.d ? Math.min(1, time / t.d) : 0;
  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 200, alignItems: 'center' }}>
      <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between', padding: 20 }}>
        <Pressable onPress={back}><Text style={{ color: C.cream, fontSize: 30 }}>‹</Text></Pressable>
        <Text style={{ color: C.cream, fontFamily: SERIF, fontSize: 24 }}>En lecture</Text>
        <Text style={{ color: C.cream, fontSize: 26 }}>⋮</Text>
      </View>
      <View style={{ width: 340, height: 340 }}>
        <Animated.Image source={require('../assets/lecteur.png')} style={{ width: 340, height: 340 }} />
        <Effets eff={eff} setEff={setEff} />
      </View>
      <Text numberOfLines={1} style={{ color: C.cream, fontFamily: SERIF, fontSize: 34, marginTop: 10 }}>{t ? t.t : ''}</Text>
      <Text style={{ color: C.grey, fontFamily: SERIF, fontSize: 18 }}>Artiste inconnu</Text>
      <View style={{ width: '88%', height: 6, borderRadius: 3, backgroundColor: 'rgba(242,230,208,0.2)', marginTop: 22 }}><LinearGradient colors={['#C9773B', '#FFB45C']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ width: `${Math.round(p * 100)}%` as any, height: 6, borderRadius: 3 }} /></View>
      <View style={{ width: '88%', flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}><Text style={{ color: C.cream, fontFamily: SANS }}>{fmt(time)}</Text><Text style={{ color: C.cream, fontFamily: SANS }}>{t ? fmt(t.d) : '0:00'}</Text></View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 36, marginTop: 20 }}>
        <Pressable onPress={prev}><Text style={{ color: C.cream, fontSize: 32 }}>⏮</Text></Pressable>
        <Pressable onPress={toggle}><LinearGradient colors={['#C9773B', '#E99A42']} style={{ width: 84, height: 84, borderRadius: 42, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: C.copper }}><Text style={{ color: ESP, fontSize: 30 }}>{playing ? '❚❚' : '▶'}</Text></LinearGradient></Pressable>
        <Pressable onPress={next}><Text style={{ color: C.cream, fontSize: 32 }}>⏭</Text></Pressable>
      </View>
      <LinearGradient colors={['#2A1612', '#1E0F0C']} style={{ width: '92%', borderRadius: 26, borderWidth: 1, borderColor: 'rgba(201,119,59,0.4)', padding: 16, marginTop: 26 }}>
        <Text style={{ color: C.cream, fontFamily: SERIF, fontSize: 22, marginBottom: 10 }}>Les plus écoutés</Text>
        {TRACKS.slice(0, 3).map((x, k) => (
          <Pressable key={x.t + k} onPress={goRank} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8 }}><Pochette t={x.t} i={k} s={52} /><Text numberOfLines={1} style={{ flex: 1, color: C.cream, fontFamily: SERIF, fontSize: 18, marginLeft: 14 }}>{x.t}</Text><Text style={{ color: C.grey, fontFamily: SANS }}>{fmt(x.d)}</Text></Pressable>
        ))}
      </LinearGradient>
    </ScrollView>
  );
}
export function Effets({ eff, setEff }: { eff: string; setEff: (k: string) => void }) {
  const L: [string, string][] = [['ralenti', 'Lent'], ['vitesse', 'Rapide'], ['enfant', 'Enfant'], ['grave', 'Grave'], ['ambiance', 'Ambiance']];
  return (
    <View style={{ position: 'absolute', left: 276, top: 36 }}>
      {eff === 'ambiance' && <View style={{ position: 'absolute', left: -276, top: -36, width: 340, height: 340, borderRadius: 170, borderWidth: 3, borderColor: LUM, opacity: 0.6 }} />}
      {L.map(([k, l]) => (
        <Pressable key={k} onPress={() => setEff(k)} style={{ marginBottom: 6 }}>
          <LinearGradient colors={eff === k ? ['#C9773B', '#FFB45C'] : ['#2A1612', '#1E0F0C']} style={{ width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.copper }}>
            <Text style={{ color: eff === k ? ESP : C.cream, fontFamily: SANS, fontSize: 9 }}>{l}</Text>
          </LinearGradient>
        </Pressable>
      ))}
    </View>
  );
}
