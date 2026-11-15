import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, Animated, Easing, ScrollView, Share, Dimensions } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useKeepAwake } from 'expo-keep-awake';
import { TRACKS, fmt } from './theme';

type R = { name: string; pub: boolean; code?: string; mine?: boolean; n: number };
type P = { room: R; cur: number; playing: boolean; time: number; toggle: () => void; next: () => void; prev: () => void; back: () => void };

const W = Dimensions.get('window').width;
const BG = '#1A0A04';
const CARD = 'rgba(70,30,10,0.75)';
const AMB = '#FF9A1F';
const TXT = '#FFE9D0';
const DIM = '#C79A78';
const LINE = '#7A3D14';

function Beam({ x, phase, on }: { x: number; phase: number; on: boolean }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const a = Animated.loop(Animated.sequence([
      Animated.timing(v, { toValue: 1, duration: 2200 + phase * 400, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      Animated.timing(v, { toValue: 0, duration: 2200 + phase * 400, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
    ]));
    a.start();
    return () => a.stop();
  }, []);
  const rot = v.interpolate({ inputRange: [0, 1], outputRange: ['-18deg', '18deg'] });
  return <Animated.View style={{ position: 'absolute', top: -20, left: x, width: 44, height: 260, backgroundColor: AMB, opacity: on ? 0.3 : 0.1, borderBottomLeftRadius: 40, borderBottomRightRadius: 40, transform: [{ rotate: rot }] }} />;
}

const DOTS = Array.from({ length: 22 }, (_, i) => ({ x: (i * 37) % (W - 10), c: ['#FF9A1F', '#FFD08A', '#FF5A1F', '#FFF1D6'][i % 4], d: (i % 5) * 80 }));

export function Scene({ room, cur, playing, time, toggle, next, prev, back }: P) {
  useKeepAwake();
  const t = TRACKS[cur];
  const [fx, setFx] = useState<string | null>(null);
  const [lasers, setLasers] = useState(true);
  const [snd, setSnd] = useState<string[]>([]);
  const [asked, setAsked] = useState(false);
  const fxv = useRef(new Animated.Value(0)).current;
  const prog = t && t.d ? Math.min(1, time / t.d) : 0;
  const code = room.code || '------';

  function runFx(n: string) {
    if (n === 'Lasers') { setLasers(!lasers); return; }
    if (fx) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    setFx(n); fxv.setValue(1);
    Animated.timing(fxv, { toValue: 0, duration: n === 'Flash' ? 700 : 2400, easing: Easing.out(Easing.quad), useNativeDriver: true }).start(() => setFx(null));
  }
  function tog(n: string) { setSnd(snd.includes(n) ? snd.filter((x) => x !== n) : [...snd, n]); }
  const btn = (on: boolean) => ({ flex: 1, alignItems: 'center' as const, paddingVertical: 12, borderRadius: 16, borderWidth: 1, borderColor: on ? AMB : LINE, backgroundColor: on ? 'rgba(255,154,31,0.22)' : CARD });

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 260, overflow: 'hidden' }}>
        {[0, 1, 2, 3, 4, 5].map((k) => <Beam key={k} x={10 + k * ((W - 60) / 5)} phase={k % 3} on={lasers} />)}
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 44, paddingBottom: 60 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Pressable onPress={back} hitSlop={16}><Text style={{ color: TXT, fontSize: 28 }}>‹</Text></Pressable>
          <Text style={{ color: TXT, fontSize: 20, fontWeight: '700', flex: 1, marginLeft: 12 }} numberOfLines={1}>{room.name || 'Ma salle'}</Text>
          <View style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14, borderWidth: 1, borderColor: LINE, backgroundColor: CARD }}><Text style={{ color: TXT }}>{room.mine ? 1 : 0}/6 présents</Text></View>
        </View>

        <Text style={{ color: DIM, textAlign: 'center', marginTop: 110, letterSpacing: 4, fontSize: 11 }}>SCÈNE · 2 DJ</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 28, marginTop: 10 }}>
          {[room.mine ? 'Moi' : 'DJ 1', 'Libre'].map((n, k) => (
            <View key={k} style={{ alignItems: 'center' }}>
              <View style={{ width: 70, height: 70, borderRadius: 35, borderWidth: 2, borderColor: k === 0 ? AMB : LINE, borderStyle: k === 0 ? 'solid' : 'dashed', alignItems: 'center', justifyContent: 'center', backgroundColor: CARD }}>
                <Text style={{ color: AMB, fontSize: 28 }}>{k === 0 ? '🎧' : '+'}</Text>
              </View>
              <Text style={{ color: TXT, marginTop: 4, fontSize: 12 }}>{n}</Text>
            </View>
          ))}
        </View>

        <View style={{ marginTop: 18, padding: 14, borderRadius: 20, borderWidth: 1, borderColor: LINE, backgroundColor: CARD }}>
          <Text style={{ color: TXT, fontSize: 20, fontWeight: '700' }} numberOfLines={1}>{t ? t.t : 'Aucune musique'}</Text>
          <View style={{ height: 4, borderRadius: 2, backgroundColor: LINE, marginTop: 12 }}><View style={{ width: `${Math.round(prog * 100)}%` as any, height: 4, borderRadius: 2, backgroundColor: AMB }} /></View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
            <Text style={{ color: DIM, fontSize: 12 }}>{fmt(time)}</Text><Text style={{ color: DIM, fontSize: 12 }}>{t && t.d ? fmt(t.d) : ''}</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 26, marginTop: 8 }}>
            <Pressable onPress={prev} hitSlop={12}><Text style={{ color: TXT, fontSize: 30 }}>⏮</Text></Pressable>
            <Pressable onPress={toggle} style={{ width: 70, height: 70, borderRadius: 35, backgroundColor: AMB, alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontSize: 30, color: BG }}>{playing ? '⏸' : '▶'}</Text></Pressable>
            <Pressable onPress={next} hitSlop={12}><Text style={{ color: TXT, fontSize: 30 }}>⏭</Text></Pressable>
          </View>
        </View>

        <Text style={{ color: DIM, textAlign: 'center', marginTop: 18, letterSpacing: 3, fontSize: 11 }}>EFFETS DE SON</Text>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
          {['Écho', 'Salle', 'Radio', 'Boucle'].map((n) => <Pressable key={n} onPress={() => tog(n)} style={btn(snd.includes(n))}><Text style={{ color: TXT }}>{n}</Text></Pressable>)}
        </View>

        <Text style={{ color: DIM, textAlign: 'center', marginTop: 18, letterSpacing: 3, fontSize: 11 }}>EFFETS DE LUMIÈRE</Text>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
          {['Lasers', 'Flash', 'Fumée', 'Confettis'].map((n) => <Pressable key={n} onPress={() => runFx(n)} style={btn(n === 'Lasers' ? lasers : fx === n)}><Text style={{ color: TXT, fontSize: 13 }}>{n}</Text></Pressable>)}
        </View>

        <Text style={{ color: DIM, textAlign: 'center', marginTop: 18, letterSpacing: 3, fontSize: 11 }}>SPECTATEURS · 0/4</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 14, marginTop: 8 }}>
          {[0, 1, 2, 3].map((k) => <View key={k} style={{ width: 52, height: 52, borderRadius: 26, borderWidth: 1, borderColor: LINE, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: DIM, fontSize: 22 }}>+</Text></View>)}
        </View>

        <View style={{ flexDirection: 'row', gap: 10, marginTop: 20 }}>
          <Pressable onPress={() => setAsked(!asked)} style={{ flex: 1.4, paddingVertical: 15, borderRadius: 26, backgroundColor: asked ? LINE : AMB, alignItems: 'center' }}><Text style={{ color: asked ? TXT : BG, fontWeight: '700', fontSize: 15 }}>{asked ? 'Main demandée' : 'Demander la main'}</Text></Pressable>
          <Pressable onPress={() => Share.share({ message: 'Rejoins ma salle NEGUEZI, code : ' + code }).catch(() => {})} style={{ flex: 1, paddingVertical: 15, borderRadius: 26, borderWidth: 1, borderColor: LINE, backgroundColor: CARD, alignItems: 'center' }}><Text style={{ color: TXT, fontSize: 14 }}>Inviter · {code}</Text></Pressable>
        </View>
      </ScrollView>

      {fx === 'Flash' ? <Animated.View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#FFF1D6', opacity: fxv }} /> : null}
      {fx === 'Fumée' ? <Animated.View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#C9722A', opacity: fxv.interpolate({ inputRange: [0, 1], outputRange: [0, 0.4] }) }} /> : null}
      {fx === 'Confettis' ? DOTS.map((d, k) => <Animated.View key={k} pointerEvents="none" style={{ position: 'absolute', top: 0, left: d.x, width: 8, height: 8, borderRadius: 2, backgroundColor: d.c, opacity: fxv, transform: [{ translateY: fxv.interpolate({ inputRange: [0, 1], outputRange: [900 + d.d, 0] }) }] }} />) : null}
    </View>
  );
}
