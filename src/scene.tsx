import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, Image, Dimensions, Animated, Easing, PanResponder } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useKeepAwake } from 'expo-keep-awake';
import { TRACKS, fmt } from './theme';
import { ListeSons } from './liste';
import { Lumieres } from './lumieres';
import { Effets } from './effets';
import { deck2Load, deck2Play, deck2Pause } from './deck2';

type R = { name: string; pub: boolean; code?: string; mine?: boolean; n: number };
type P = { pick?: (i: number) => void; room: R; cur: number; playing: boolean; time: number; toggle: () => void; next: () => void; prev: () => void; back: () => void };

const W = Dimensions.get('window').width;
const H = (W * 1672) / 941;
const AMB = '#FF9A1F';
const TXT = '#FFE9D0';
const DIM = '#E8B98A';
const CARD = 'rgba(40,16,4,0.78)';
const LINE = '#C0651A';
const DS = Math.min(120, (W - 60) * 0.33);
const SW = W - 40;
const PADS = ['Kick', 'Snare', 'Hat', 'Clap', 'Basse', 'Cloche', 'Sirène', 'Voix'];
const PW = (W - 32 - 24) / 4;
const buzz = () => { try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch (e) {} };

function Disc({ size, spin }: { size: number; spin: boolean }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!spin) return undefined;
    const a = Animated.loop(Animated.timing(v, { toValue: 1, duration: 2600, easing: Easing.linear, useNativeDriver: true }));
    a.start();
    return () => a.stop();
  }, [spin]);
  const rot = v.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  return <Animated.Image source={require('../assets/disque.png')} style={{ width: size, height: size, transform: [{ rotate: rot }] }} />;
}

function Heart({ size, on }: { size: number; on: boolean }) {
  const v = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (!on) { v.setValue(1); return undefined; }
    const a = Animated.loop(Animated.sequence([
      Animated.timing(v, { toValue: 1.14, duration: 200, useNativeDriver: true }),
      Animated.timing(v, { toValue: 1, duration: 280, useNativeDriver: true }),
    ]));
    a.start();
    return () => a.stop();
  }, [on]);
  return <Animated.Image source={require('../assets/coeur_or.png')} style={{ width: size, height: size * 0.97, transform: [{ scale: v }] }} />;
}

function Knob({ label }: { label: string }) {
  const [a, setA] = useState(0);
  const ar = useRef(0);
  const st = useRef(0);
  const pr = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => { st.current = ar.current; },
    onPanResponderMove: (_e, g) => {
      const v = Math.max(-135, Math.min(135, st.current - g.dy * 1.6));
      ar.current = v;
      setA(v);
    },
  })).current;
  return (
    <View style={{ alignItems: 'center', width: (W - 16) / 6 }} {...pr.panHandlers}>
      <Image source={require('../assets/molette.png')} style={{ width: 44, height: 44, transform: [{ rotate: a + 'deg' }] }} />
      <Text style={{ color: DIM, fontSize: 8, marginTop: 2 }}>{label}</Text>
    </View>
  );
}

function Dj({ label, left }: { label: string; left: number }) {
  return (
    <View style={{ position: 'absolute', left, top: H * 0.27, alignItems: 'center' }}>
      <View style={{ width: 58, height: 58, borderRadius: 29, borderWidth: 2, borderColor: AMB, backgroundColor: 'rgba(40,16,4,0.75)', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 24 }}>🎧</Text>
      </View>
      <Text style={{ color: TXT, fontWeight: '700', marginTop: 2, fontSize: 12 }}>{label}</Text>
    </View>
  );
}

function Title({ children }: { children: string }) {
  return <Text style={{ color: TXT, textAlign: 'center', letterSpacing: 3, marginTop: 18, marginBottom: 8, fontWeight: '700', fontSize: 13 }}>{children}</Text>;
}

export function Scene({ pick, room, cur, playing, time, toggle, next, prev, back }: P) {
  useKeepAwake();
  const [fx, setFx] = useState<string[]>([]);
  const [snd, setSnd] = useState<string[]>([]);
  const [loop, setLoop] = useState(1);
  const [ins, setIns] = useState<string | null>(null);
  const [voi, setVoi] = useState<string | null>(null);
  const [lit, setLit] = useState<string | null>(null);
  const [rec, setRec] = useState(false);
  const [tab, setTab] = useState(0);
  const [pk, setPk] = useState<number | null>(null);
  const [q, setQ] = useState("");
  const [s2, setS2] = useState<number | null>(null);
  const [s2p, setS2p] = useState(false);
  const [secs, setSecs] = useState(0);
  const [fond, setFond] = useState(0.5);
  const fRef = useRef(0.5);
  const st = useRef(0.5);
  const pr = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => { st.current = fRef.current; },
    onPanResponderMove: (_e, g) => {
      const v = Math.max(0, Math.min(1, st.current + g.dx / (SW - 60)));
      fRef.current = v;
      setFond(v);
    },
  })).current;
  useEffect(() => {
    if (!rec) { setSecs(0); return undefined; }
    const i = setInterval(() => setSecs((s) => s + 1), 1000);
    return () => clearInterval(i);
  }, [rec]);
  const t: any = TRACKS[cur];
  const title = t ? t.title || t.name || t.n || '' : '';
  const d = t && t.d ? t.d : 0;
  const tog = (arr: string[], set: (a: string[]) => void, k: string) => { buzz(); set(arr.includes(k) ? arr.filter((x) => x !== k) : [...arr, k]); };
  const chip = (k: string, arr: string[], set: (a: string[]) => void) => (
    <Pressable key={k} onPress={() => tog(arr, set, k)} style={{ flex: 1, alignItems: 'center', paddingVertical: 11, borderRadius: 14, borderWidth: 1, borderColor: arr.includes(k) ? AMB : LINE, backgroundColor: arr.includes(k) ? 'rgba(255,154,31,0.4)' : CARD }}>
      <Text style={{ color: TXT, fontWeight: '600', fontSize: 12 }}>{k}</Text>
    </Pressable>
  );
  const track = (name: string, v: string | null, set: (x: string | null) => void) => (
    <View style={{ flex: 1, padding: 8, borderRadius: 16, backgroundColor: CARD, borderWidth: 1, borderColor: LINE }}>
      <Text style={{ color: TXT, fontWeight: '800', textAlign: 'center', marginBottom: 8 }}>{name}</Text>
      <View style={{ flexDirection: 'row', gap: 5 }}>
        <Pressable onPress={() => { buzz(); set(v === 'cut' ? null : 'cut'); }} style={{ flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 12, backgroundColor: v === 'cut' ? '#E8421A' : '#7A2A10' }}>
          <Text style={{ color: TXT, fontWeight: '700', fontSize: 10 }}>COUPER</Text>
        </Pressable>
        <Pressable onPress={() => { buzz(); set(v === 'solo' ? null : 'solo'); }} style={{ flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 12, backgroundColor: v === 'solo' ? AMB : '#7A5A10' }}>
          <Text style={{ color: v === 'solo' ? '#1A0A04' : TXT, fontWeight: '700', fontSize: 10 }}>SEUL</Text>
        </Pressable>
      </View>
    </View>
  );
  return (
    <View style={{ flex: 1, backgroundColor: '#5A2608' }}>
      <Image source={require('../assets/studio2.png')} style={{ position: 'absolute', top: 0, left: 0, width: W, height: H }} />
      <Lumieres fx={fx} /><ScrollView contentContainerStyle={{ paddingBottom: 230 }}>
        <View style={{ height: H * 0.5 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 40, paddingHorizontal: 16 }}>
            <Pressable onPress={back} style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14, backgroundColor: CARD }}>
              <Text style={{ color: TXT, fontSize: 20 }}>‹</Text>
            </Pressable>
            <Text style={{ color: TXT, fontSize: 20, fontWeight: '700' }}>{room.name}</Text>
            <View style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 14, backgroundColor: CARD, borderWidth: 1, borderColor: LINE }}>
              <Text style={{ color: TXT, fontWeight: '600' }}>0/6</Text>
            </View>
          </View>
          <Dj label="DJ 1" left={W * 0.2} />
          <Dj label="DJ 2" left={W * 0.7} />
          <View style={{ position: 'absolute', left: 0, right: 0, top: H * 0.36, alignItems: 'center' }}>
            <Pressable onPress={() => { buzz(); setRec(!rec); }} style={{ width: 66, height: 66, borderRadius: 33, backgroundColor: '#E8421A', borderWidth: 3, borderColor: AMB, alignItems: 'center', justifyContent: 'center' }}>
              {rec ? <View style={{ width: 22, height: 22, borderRadius: 4, backgroundColor: '#FFE9D0' }} /> : <Text style={{ fontSize: 28 }}>🎙️</Text>}
            </Pressable>
            <Text style={{ color: TXT, fontWeight: '700', marginTop: 2, fontSize: 12 }}>{rec ? fmt(secs) : 'ENREGISTRER'}</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', gap: 10, marginHorizontal: 12, marginTop: 6 }}>{['TABLE', 'PADS'].map((n, k) => (<Pressable key={n} onPress={() => { buzz(); setTab(k); }} style={{ flex: 1, paddingVertical: 10, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: LINE, backgroundColor: tab === k ? AMB : CARD }}><Text style={{ color: tab === k ? '#1A0A04' : TXT, fontWeight: '800', letterSpacing: 2 }}>{n}</Text></Pressable>))}</View>
{tab === 0 ? (<>
        <View style={{ marginHorizontal: 8, padding: 10, borderRadius: 24, backgroundColor: CARD, borderWidth: 1, borderColor: LINE }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ alignItems: 'center', width: DS }}>
              <Pressable onPress={() => { buzz(); setPk(1); }}><Disc size={DS} spin={playing} /></Pressable>
              <Text style={{ color: TXT, fontSize: 11, marginTop: 4, textAlign: 'center' }} numberOfLines={2}>{title}</Text>
            </View>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Heart size={70} on={playing} />
              <Pressable onPress={toggle} style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: AMB, alignItems: 'center', justifyContent: 'center', marginTop: 4 }}>
                <Text style={{ color: '#1A0A04', fontSize: 20 }}>{playing ? '❚❚' : '▶'}</Text>
              </Pressable>
              <View style={{ flexDirection: 'row', gap: 18, marginTop: 2 }}>
                <Pressable onPress={prev}><Text style={{ color: TXT, fontSize: 22 }}>⏮</Text></Pressable>
                <Pressable onPress={next}><Text style={{ color: TXT, fontSize: 22 }}>⏭</Text></Pressable>
              </View>
              <Text style={{ color: DIM, fontSize: 11 }}>{fmt(time)}{d ? ' / ' + fmt(d) : ''}</Text>
            </View>
            <View style={{ alignItems: 'center', width: DS }}>
              <Pressable onPress={() => { buzz(); setPk(2); }} onLongPress={() => { buzz(); if (s2 === null) return; if (s2p) { deck2Pause(); setS2p(false); } else { deck2Play(); setS2p(true); } }}><Disc size={DS} spin={s2p} /></Pressable>
              <Text style={{ color: DIM, fontSize: 11, marginTop: 4 }}>{s2 !== null && TRACKS[s2] ? TRACKS[s2].t : 'Son 2'}</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 10 }}>
            <Knob label="GRAVES" /><Knob label="MÉDIUMS" /><Knob label="AIGUS" />
            <Knob label="GRAVES" /><Knob label="MÉDIUMS" /><Knob label="AIGUS" />
          </View>
          <Text style={{ color: TXT, textAlign: 'center', fontWeight: '800', letterSpacing: 2, marginTop: 10 }}>FONDU</Text>
          <View style={{ alignSelf: 'center', width: SW - 20, height: (SW - 20) / 4.52, marginTop: 4, justifyContent: 'center' }} {...pr.panHandlers}>
            <Image source={require('../assets/plaque.png')} style={{ position: 'absolute', width: SW - 20, height: (SW - 20) / 4.52 }} />
            <Image source={require('../assets/capuchon.png')} style={{ position: 'absolute', left: 14 + fond * (SW - 20 - 28 - 26), width: 26, height: 57 }} />
          </View>
        </View>
        <View style={{ flexDirection: 'row', gap: 8, marginHorizontal: 12, marginTop: 12 }}>
          {track('INSTRU', ins, setIns)}
          <View style={{ flex: 1, padding: 8, borderRadius: 16, backgroundColor: CARD, borderWidth: 1, borderColor: LINE }}>
            <Text style={{ color: TXT, fontWeight: '800', textAlign: 'center', marginBottom: 8 }}>BOUCLE</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
              {[1, 2, 4].map((k) => (
                <Pressable key={k} onPress={() => { buzz(); setLoop(k); }} style={{ width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: loop === k ? AMB : '#3A1A08', borderWidth: 1, borderColor: LINE }}>
                  <Text style={{ color: loop === k ? '#1A0A04' : TXT, fontWeight: '800' }}>{k}</Text>
                </Pressable>
              ))}
            </View>
          </View>
          {track('VOIX', voi, setVoi)}
        </View>
        </>) : null}
        {tab === 1 ? (<>
        <Title>PADS BEATMAKER</Title>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginHorizontal: 16 }}>
          {PADS.map((k) => (
            <Pressable key={k} onPressIn={() => { buzz(); setLit(k); }} onPressOut={() => setLit(null)} style={{ width: PW, height: PW, alignItems: 'center', justifyContent: 'center' }}>
              <Image source={require('../assets/pad.png')} style={{ position: 'absolute', width: PW, height: PW, opacity: lit === k ? 1 : 0.8 }} />
              <Text style={{ color: '#1A0A04', fontWeight: '800', fontSize: 13 }}>{k}</Text>
            </Pressable>
          ))}
        </View>
        <Title>EFFETS DE SON</Title>
        <Effets onDrop={() => setFx(['Flash'])} />
        <Title>EFFETS DE LUMIÈRE</Title>
        <View style={{ flexDirection: 'row', gap: 8, marginHorizontal: 16 }}>{['Lasers', 'Flash', 'Braises', 'Bogolan'].map((k) => chip(k, fx, setFx))}</View>
        </>) : null}
        <Title>SPECTATEURS · 0/4</Title>
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 14 }}>
          {[0, 1, 2, 3].map((k) => (
            <View key={k} style={{ width: 54, height: 54, borderRadius: 27, borderWidth: 2, borderStyle: 'dashed', borderColor: LINE, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: AMB, fontSize: 24 }}>+</Text>
            </View>
          ))}
        </View>
      </ScrollView>
      {pk !== null ? (<View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: H * 0.6, overflow: 'hidden' }}><ListeSons open={true} onClose={() => { setPk(null); setQ(''); }} q={q} setQ={setQ} cur={pk === 2 && s2 !== null ? s2 : cur} playing={playing} onPick={(i: number) => { if (pk === 1 && pick) pick(i); else { setS2(i); try { const u = TRACKS[i] && (TRACKS[i] as any).uri; if (u) { deck2Load(u); deck2Play(); setS2p(true); } } catch (e) {} } setPk(null); setQ(''); }} /></View>) : null}
    </View>
  );
}
