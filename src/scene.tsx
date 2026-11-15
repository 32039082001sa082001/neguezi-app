import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, Image, Dimensions, Animated, Easing, PanResponder } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useKeepAwake } from 'expo-keep-awake';
import { TRACKS, fmt } from './theme';

type R = { name: string; pub: boolean; code?: string; mine?: boolean; n: number };
type P = { room: R; cur: number; playing: boolean; time: number; toggle: () => void; next: () => void; prev: () => void; back: () => void };

const W = Dimensions.get('window').width;
const H = (W * 1672) / 941;
const AMB = '#FF9A1F';
const TXT = '#FFE9D0';
const DIM = '#E8B98A';
const CARD = 'rgba(50,20,6,0.85)';
const LINE = '#C0651A';
const DS = Math.min(124, (W - 48) * 0.36);
const SW = W - 48;
const PADS = ['Kick', 'Snare', 'Hat', 'Clap', 'Basse', 'Cloche', 'Sirène', 'Voix'];
const PW = (W - 32 - 24) / 4;

function Disc({ size, spin }: { size: number; spin: boolean }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!spin) return undefined;
    const a = Animated.loop(Animated.timing(v, { toValue: 1, duration: 2600, easing: Easing.linear, useNativeDriver: true }));
    a.start();
    return () => a.stop();
  }, [spin]);
  const rot = v.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  return (
    <Animated.View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: '#120904', borderWidth: 3, borderColor: LINE, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: rot }] }}>
      <View style={{ position: 'absolute', width: size * 0.82, height: size * 0.82, borderRadius: size * 0.41, borderWidth: 1, borderColor: '#4a2810' }} />
      <View style={{ position: 'absolute', width: size * 0.58, height: size * 0.58, borderRadius: size * 0.29, borderWidth: 1, borderColor: '#4a2810' }} />
      <View style={{ width: size * 0.32, height: size * 0.32, borderRadius: size * 0.16, backgroundColor: AMB, alignItems: 'center' }}>
        <View style={{ width: 4, height: size * 0.11, backgroundColor: '#1A0A04', marginTop: 3, borderRadius: 2 }} />
      </View>
    </Animated.View>
  );
}

function Dj({ label }: { label: string }) {
  return (
    <View style={{ alignItems: 'center' }}>
      <View style={{ width: 62, height: 62, borderRadius: 31, borderWidth: 2, borderColor: AMB, backgroundColor: 'rgba(40,16,4,0.75)', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 26 }}>🎧</Text>
      </View>
      <Text style={{ color: TXT, fontWeight: '700', marginTop: 3 }}>{label}</Text>
    </View>
  );
}

function Title({ children }: { children: string }) {
  return <Text style={{ color: TXT, textAlign: 'center', letterSpacing: 3, marginTop: 18, marginBottom: 8, fontWeight: '700', fontSize: 13 }}>{children}</Text>;
}

export function Scene({ room, cur, playing, time, toggle, next, prev, back }: P) {
  useKeepAwake();
  const [fx, setFx] = useState<string[]>([]);
  const [snd, setSnd] = useState<string[]>([]);
  const [loop, setLoop] = useState(1);
  const [ins, setIns] = useState<string | null>(null);
  const [voi, setVoi] = useState<string | null>(null);
  const [lit, setLit] = useState<string | null>(null);
  const [rec, setRec] = useState(false);
  const [secs, setSecs] = useState(0);
  const [fond, setFond] = useState(0.5);
  const fRef = useRef(0.5);
  const st = useRef(0.5);
  const pr = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => { st.current = fRef.current; },
      onPanResponderMove: (_e, g) => {
        const v = Math.max(0, Math.min(1, st.current + g.dx / (SW - 40)));
        fRef.current = v;
        setFond(v);
      },
    })
  ).current;
  useEffect(() => {
    if (!rec) { setSecs(0); return undefined; }
    const i = setInterval(() => setSecs((s) => s + 1), 1000);
    return () => clearInterval(i);
  }, [rec]);
  const t: any = TRACKS[cur];
  const title = t ? t.title || t.name || t.n || '' : '';
  const d = t && t.d ? t.d : 0;
  const pct = d ? Math.min(1, time / d) : 0;
  const buzz = () => { try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch (e) {} };
  const tog = (arr: string[], set: (a: string[]) => void, k: string) => { buzz(); set(arr.includes(k) ? arr.filter((x) => x !== k) : [...arr, k]); };
  const chip = (k: string, arr: string[], set: (a: string[]) => void) => (
    <Pressable key={k} onPress={() => tog(arr, set, k)} style={{ flex: 1, alignItems: 'center', paddingVertical: 11, borderRadius: 14, borderWidth: 1, borderColor: arr.includes(k) ? AMB : LINE, backgroundColor: arr.includes(k) ? 'rgba(255,154,31,0.35)' : CARD }}>
      <Text style={{ color: TXT, fontWeight: '600', fontSize: 12 }}>{k}</Text>
    </Pressable>
  );
  const track = (name: string, v: string | null, set: (x: string | null) => void) => (
    <View style={{ flex: 1, padding: 10, borderRadius: 16, backgroundColor: CARD, borderWidth: 1, borderColor: LINE }}>
      <Text style={{ color: TXT, fontWeight: '800', textAlign: 'center', marginBottom: 8 }}>{name}</Text>
      <View style={{ flexDirection: 'row', gap: 6 }}>
        <Pressable onPress={() => { buzz(); set(v === 'cut' ? null : 'cut'); }} style={{ flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 12, backgroundColor: v === 'cut' ? '#E8421A' : '#7A2A10' }}>
          <Text style={{ color: TXT, fontWeight: '700', fontSize: 12 }}>COUPER</Text>
        </Pressable>
        <Pressable onPress={() => { buzz(); set(v === 'solo' ? null : 'solo'); }} style={{ flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 12, backgroundColor: v === 'solo' ? AMB : '#7A5A10' }}>
          <Text style={{ color: v === 'solo' ? '#1A0A04' : TXT, fontWeight: '700', fontSize: 12 }}>SEUL</Text>
        </Pressable>
      </View>
    </View>
  );
  return (
    <View style={{ flex: 1, backgroundColor: '#8F430F' }}>
      <Image source={require('../assets/studio.png')} style={{ position: 'absolute', top: 0, left: 0, width: W, height: H }} />
      <ScrollView contentContainerStyle={{ paddingBottom: 230 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 40, paddingHorizontal: 16 }}>
          <Pressable onPress={back} style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14, backgroundColor: CARD }}>
            <Text style={{ color: TXT, fontSize: 20 }}>‹</Text>
          </Pressable>
          <Text style={{ color: TXT, fontSize: 20, fontWeight: '700' }}>{room.name}</Text>
          <View style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 14, backgroundColor: CARD, borderWidth: 1, borderColor: LINE }}>
            <Text style={{ color: TXT, fontWeight: '600' }}>0/6</Text>
          </View>
        </View>
        <View style={{ marginTop: H * 0.1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 22 }}>
          <Dj label="DJ 1" />
          <View style={{ alignItems: 'center' }}>
            <Pressable onPress={() => { buzz(); setRec(!rec); }} style={{ width: 68, height: 68, borderRadius: 34, backgroundColor: '#E8421A', borderWidth: 3, borderColor: AMB, alignItems: 'center', justifyContent: 'center' }}>
              {rec ? <View style={{ width: 22, height: 22, borderRadius: 4, backgroundColor: '#FFE9D0' }} /> : <Text style={{ fontSize: 28 }}>🎙️</Text>}
            </Pressable>
            <Text style={{ color: TXT, fontWeight: '700', marginTop: 3, fontSize: 12 }}>{rec ? fmt(secs) : 'ENREGISTRER'}</Text>
          </View>
          <Dj label="DJ 2" />
        </View>
        <View style={{ marginTop: H * 0.035, marginHorizontal: 12, padding: 12, borderRadius: 24, backgroundColor: CARD, borderWidth: 1, borderColor: LINE }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ alignItems: 'center', width: DS }}>
              <Disc size={DS} spin={playing} />
              <Text style={{ color: TXT, fontSize: 11, marginTop: 6, textAlign: 'center' }} numberOfLines={2}>{title}</Text>
            </View>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Pressable onPress={toggle} style={{ width: 58, height: 58, borderRadius: 29, backgroundColor: AMB, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: '#1A0A04', fontSize: 22 }}>{playing ? '❚❚' : '▶'}</Text>
              </Pressable>
              <View style={{ flexDirection: 'row', gap: 22, marginTop: 8 }}>
                <Pressable onPress={prev}><Text style={{ color: TXT, fontSize: 26 }}>⏮</Text></Pressable>
                <Pressable onPress={next}><Text style={{ color: TXT, fontSize: 26 }}>⏭</Text></Pressable>
              </View>
              <Text style={{ color: DIM, fontSize: 12, marginTop: 6 }}>{fmt(time)}{d ? ' / ' + fmt(d) : ''}</Text>
            </View>
            <View style={{ alignItems: 'center', width: DS }}>
              <Disc size={DS} spin={false} />
              <Text style={{ color: DIM, fontSize: 11, marginTop: 6 }}>Son 2</Text>
            </View>
          </View>
          <View style={{ height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.18)', marginTop: 12 }}>
            <View style={{ height: 5, borderRadius: 3, width: `${pct * 100}%`, backgroundColor: AMB }} />
          </View>
          <Text style={{ color: TXT, textAlign: 'center', fontWeight: '800', letterSpacing: 2, marginTop: 14 }}>FONDU</Text>
          <View style={{ height: 44, justifyContent: 'center', marginTop: 4 }} {...pr.panHandlers}>
            <View style={{ height: 8, borderRadius: 4, backgroundColor: '#2A1006', borderWidth: 1, borderColor: LINE }} />
            <View style={{ position: 'absolute', left: fond * (SW - 40), width: 40, height: 40, borderRadius: 10, backgroundColor: AMB, borderWidth: 2, borderColor: '#FFE9D0' }} />
          </View>
        </View>
        <View style={{ flexDirection: 'row', gap: 8, marginHorizontal: 12, marginTop: 12 }}>
          {track('INSTRU', ins, setIns)}
          <View style={{ flex: 1, padding: 10, borderRadius: 16, backgroundColor: CARD, borderWidth: 1, borderColor: LINE }}>
            <Text style={{ color: TXT, fontWeight: '800', textAlign: 'center', marginBottom: 8 }}>BOUCLE</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              {[1, 2, 4].map((k) => (
                <Pressable key={k} onPress={() => { buzz(); setLoop(k); }} style={{ width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: loop === k ? AMB : '#3A1A08', borderWidth: 1, borderColor: LINE }}>
                  <Text style={{ color: loop === k ? '#1A0A04' : TXT, fontWeight: '800' }}>{k}</Text>
                </Pressable>
              ))}
            </View>
          </View>
          {track('VOIX', voi, setVoi)}
        </View>
        <Title>PADS BEATMAKER</Title>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginHorizontal: 16 }}>
          {PADS.map((k) => (
            <Pressable key={k} onPressIn={() => { buzz(); setLit(k); }} onPressOut={() => setLit(null)} style={{ width: PW, height: PW * 0.85, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: lit === k ? '#FFD08A' : AMB, borderWidth: 2, borderColor: '#FFE9D0' }}>
              <Text style={{ color: '#1A0A04', fontWeight: '800', fontSize: 13 }}>{k}</Text>
            </Pressable>
          ))}
        </View>
        <Title>EFFETS DE SON</Title>
        <View style={{ flexDirection: 'row', gap: 8, marginHorizontal: 16 }}>{['Écho', 'Salle', 'Radio', 'Boucle'].map((k) => chip(k, snd, setSnd))}</View>
        <Title>EFFETS DE LUMIÈRE</Title>
        <View style={{ flexDirection: 'row', gap: 8, marginHorizontal: 16 }}>{['Lasers', 'Flash', 'Fumée', 'Confettis'].map((k) => chip(k, fx, setFx))}</View>
        <Title>SPECTATEURS · 0/4</Title>
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 14 }}>
          {[0, 1, 2, 3].map((k) => (
            <View key={k} style={{ width: 54, height: 54, borderRadius: 27, borderWidth: 2, borderStyle: 'dashed', borderColor: LINE, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: AMB, fontSize: 24 }}>+</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
