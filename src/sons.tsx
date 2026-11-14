import React, { useEffect, useRef } from 'react';
import { View, Text, Pressable, ScrollView, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { C, TRACKS, fmt } from './theme';
export const AMB = '#E99A42', LUM = '#FFB45C', ESP = '#1E0F0C';
export const SERIF = 'Fraunces_600SemiBold', SANS = 'Manrope_500Medium';
const G: [string, string][] = [['#2D6BFF', '#1B3A8A'], ['#4D8DFF', '#1B3A8A'], ['#4D8DFF', '#2D6BFF'], ['#1B3A8A', '#050A1A']];
export function Pochette({ t, i, s, img }: { t: string; i: number; s: number; img?: boolean }) {
  if (img) return (
    <View style={{ width: s, height: s, borderRadius: s / 2, overflow: 'hidden', borderWidth: 1, borderColor: '#2D6BFF' }}>
      <Animated.Image source={require('../assets/lecteur.png')} style={{ position: 'absolute', width: s * 1.7, height: s * 1.7, left: -s * 0.214, top: -s * 0.435 }} />
    </View>
  );
  return (
    <LinearGradient colors={G[i % 4]} style={{ width: s, height: s, borderRadius: s / 2, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#2D6BFF' }}>
      <Text style={{ color: '#EAF1FF', fontFamily: SERIF, fontSize: s * 0.42 }}>{(t[0] || '?').toUpperCase()}</Text>
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
  const ap = React.useRef(new Animated.Value(0)).current;
  const pu = React.useRef(new Animated.Value(0)).current;
  React.useEffect(() => { Animated.timing(ap, { toValue: 1, duration: 420, delay: Math.min(i, 8) * 70, useNativeDriver: true }).start(); }, []);
  React.useEffect(() => { if (!on) { pu.setValue(0); return; } const l = Animated.loop(Animated.sequence([Animated.timing(pu, { toValue: 1, duration: 1200, useNativeDriver: true }), Animated.timing(pu, { toValue: 0, duration: 1200, useNativeDriver: true })])); l.start(); return () => l.stop(); }, [on]);
  return (
    <Animated.View style={{ opacity: ap, transform: [{ translateY: ap.interpolate({ inputRange: [0, 1], outputRange: [24, 0] }) }] }}>
      {on && <Animated.View pointerEvents="none" style={{ position: 'absolute', left: 14, right: 14, top: 0, bottom: 12, borderRadius: 30, backgroundColor: '#FFB45C', opacity: pu.interpolate({ inputRange: [0, 1], outputRange: [0.03, 0.2] }) }} />}
    <Pressable onPress={() => onPick(i)} style={{ marginHorizontal: 14, marginBottom: 12 }}>
      <LinearGradient colors={on ? ['#7A2E1D', '#1E0F0C'] : ['#2A1612', '#1E0F0C']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ minHeight: 108, flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 30, borderWidth: on ? 1.5 : 1, borderColor: on ? LUM : 'rgba(201,119,59,0.25)' }}>
        {on && <View style={{ position: 'absolute', left: -34, top: -21 }}><Disque on={on} playing={playing} /></View>}
        <View style={{ marginLeft: on ? 58 : 0 }}><Pochette t={t.t} i={i} s={84} img={on} /></View>
        <View style={{ flex: 1, marginLeft: 14 }}>
          <Text numberOfLines={1} style={{ color: C.cream, fontFamily: SERIF, fontSize: 22 }}>{t.t}</Text>
          <Text style={{ color: C.grey, fontFamily: SANS, fontSize: 16 }}>Artiste inconnu</Text>
        </View>
        <Text style={{ color: C.cream, fontFamily: SANS, fontSize: 16 }}>{fmt(t.d)}</Text>
        {on && <View style={{ position: 'absolute', left: 150, bottom: 6 }}><Egaliseur playing={playing} /></View>}
      </LinearGradient>
    </Pressable>
    </Animated.View>
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
    <LinearGradient colors={['#1E0F0C', '#3A1A10', '#7A2E1D']} style={{ flex: 1 }}>
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
    </LinearGradient>
  );
}
export function MiniLecteur({ t, i, playing, time, toggle, next, open }: any) {
  const p = t.d ? Math.min(1, time / t.d) : 0;
  return (
    <Pressable onPress={open} style={{ position: 'absolute', left: 12, right: 12, bottom: 140 }}>
      <LinearGradient colors={['#16306B', '#050A1A']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ height: 100, borderRadius: 42, borderWidth: 1, borderColor: '#2D6BFF', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14 }}>
        <Pochette t={t.t} i={i} s={64} />
        <View style={{ flex: 1, marginHorizontal: 12 }}>
          <Text numberOfLines={1} style={{ color: '#EAF1FF', fontFamily: SERIF, fontSize: 18 }}>{t.t}</Text>
          <Text style={{ color: '#8899BB', fontFamily: SANS, fontSize: 13 }}>Artiste inconnu · {fmt(time)}</Text>
          <View style={{ height: 4, borderRadius: 2, backgroundColor: 'rgba(77,141,255,0.25)', marginTop: 8 }}><View style={{ width: `${Math.round(p * 100)}%` as any, height: 4, borderRadius: 2, backgroundColor: '#4D8DFF' }} /></View>
        </View>
        <Pressable onPress={toggle}><LinearGradient colors={['#2D6BFF', '#4D8DFF']} style={{ width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: '#EAF1FF', fontSize: 20 }}>{playing ? '❚❚' : '▶'}</Text></LinearGradient></Pressable>
        <Pressable onPress={next} style={{ marginLeft: 12 }}><Text style={{ color: '#EAF1FF', fontSize: 22 }}>⏭</Text></Pressable>
      </LinearGradient>
    </Pressable>
  );
}
export function BarreBas({ tabs, active, go }: any) {
  return (
    <LinearGradient colors={['#0B1533', '#050A1A']} style={{ flexDirection: 'row', marginHorizontal: 10, marginBottom: 40, paddingTop: 10, paddingBottom: 12, borderRadius: 30, borderWidth: 1, borderColor: 'rgba(45,107,255,0.4)' }}>
      {tabs.map(([k, l, g]: string[]) => (
        <Pressable key={k} onPress={() => go(k)} style={{ flex: 1, alignItems: 'center' }}>
          <Text style={{ color: active === k ? '#4D8DFF' : C.grey, fontSize: 22 }}>{g}</Text>
          <Text style={{ color: active === k ? '#EAF1FF' : C.grey, fontFamily: SANS, fontSize: 12 }}>{l}</Text>
          {active === k && <View style={{ width: 22, height: 3, borderRadius: 2, backgroundColor: '#2D6BFF', marginTop: 4 }} />}
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
export function LecteurNeuf({ eff, setEff, cur, playing, time, toggle, next, prev, back, goRank, loop, setLoop, shuf, setShuf }: any) {
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
        <View pointerEvents="none" style={{ position: 'absolute', left: 300, top: -70, width: 20, height: 240, transform: [{ rotate: (8 + p * 20) + 'deg' }] }}>
          <View style={{ position: 'absolute', left: 7, top: 120, width: 6, height: 150, borderRadius: 3, backgroundColor: '#E99A42' }} />
          <View style={{ position: 'absolute', left: 3, top: 262, width: 14, height: 26, borderRadius: 4, backgroundColor: '#FFB45C' }} />
          <View style={{ position: 'absolute', left: 0, top: 110, width: 20, height: 20, borderRadius: 10, backgroundColor: '#C9773B' }} />
        </View>
        <Effets eff={eff} setEff={setEff} />
      </View>
      <Text numberOfLines={1} style={{ color: C.cream, fontFamily: SERIF, fontSize: 34, marginTop: 10 }}>{t ? t.t : ''}</Text>
      <Text style={{ color: C.grey, fontFamily: SERIF, fontSize: 18 }}>Artiste inconnu</Text>
      <View style={{ width: '88%', height: 6, borderRadius: 3, backgroundColor: 'rgba(242,230,208,0.2)', marginTop: 22 }}><LinearGradient colors={['#C9773B', '#FFB45C']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ width: `${Math.round(p * 100)}%` as any, height: 6, borderRadius: 3 }} /></View>
      <View style={{ width: '88%', flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}><Text style={{ color: C.cream, fontFamily: SANS }}>{fmt(time)}</Text><Text style={{ color: C.cream, fontFamily: SANS }}>{t ? fmt(t.d) : '0:00'}</Text></View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20, marginTop: 20 }}>
        <Pressable onPress={() => setShuf(!shuf)}><Text style={{ color: C.cream, fontSize: 26, opacity: shuf ? 1 : 0.4 }}>⇄</Text></Pressable>
        <Pressable onPress={prev}><Text style={{ color: C.cream, fontSize: 32 }}>⏮</Text></Pressable>
        <Pressable onPress={toggle}><LinearGradient colors={['#C9773B', '#E99A42']} style={{ width: 84, height: 84, borderRadius: 42, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: C.copper }}><Text style={{ color: ESP, fontSize: 30 }}>{playing ? '❚❚' : '▶'}</Text></LinearGradient></Pressable>
        <Pressable onPress={next}><Text style={{ color: C.cream, fontSize: 32 }}>⏭</Text></Pressable>
        <Pressable onPress={() => setLoop(!loop)}><Text style={{ color: C.cream, fontSize: 26, opacity: loop ? 1 : 0.4 }}>↻</Text></Pressable>
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
