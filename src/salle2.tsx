import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, Image, Dimensions, Animated, Easing, PanResponder } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useKeepAwake } from 'expo-keep-awake';
import { TRACKS, fmt } from './theme';
import { ListeSons } from './liste';
import Lumieres2, { Fond, Dessus } from './lumieres2';
import { Effets } from './effets';
import { deck2Load, deck2Play, deck2Pause, deck2Vol, deck2Ready } from './deck2';
import { setVol } from './studio';
import { padPlay } from './pads';
import { useDirect } from './direct';
import { Foule } from './foule';
import { EcranCoeur } from './ecran';
import { EnDirect } from './endirect';
import { Projecteurs } from './projecteurs';
import { boucleDemarre, boucleVerrouille, boucleLibere } from './boucle';

type R = { name: string; pub: boolean; code?: string; mine?: boolean; n: number; live?: any };
type P = { pick?: (i: number, auto?: boolean) => void; room: R; cur: number; playing: boolean; time: number; toggle: () => void; next: () => void; prev: () => void; back: () => void };

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

function Spin({ on, size }: { on: boolean; size: number }) {
  const r = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!on) return undefined;
    const a = Animated.loop(Animated.timing(r, { toValue: 1,
      duration: 2400, easing: Easing.linear, useNativeDriver: true }));
    a.start(); return () => a.stop();
  }, [on]);
  const rot = r.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.Image source={require('../assets/salle/disque.png')}
        style={{ width: size * 0.9, height: size * 0.9, transform: [{ rotate: rot }] }} />
    </View>);
}
export function Salle2({ pick, room, cur, playing, time, toggle, next, prev, back }: P) {
  const dir = useDirect(room.live, !!room.mine);
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
  const [ch1, setCh1] = useState(false);
  const [secs, setSecs] = useState(0);
  const [fond, setFond] = useState(0.5);
  const fRef = useRef(0.5);
  useEffect(() => { try { setVol(Math.cos(fond * Math.PI / 2)); deck2Vol(Math.sin(fond * Math.PI / 2)); } catch (e) {} }, [fond, s2]);
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
  const TH = (W * 669) / 700;
  const D = W * 0.34;
  const st2 = useRef(0.5);
  const pr2 = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => { st2.current = fRef.current; },
    onPanResponderMove: (_e, g) => {
      const v = Math.max(0, Math.min(1, st2.current + g.dx / (W * 0.7)));
      fRef.current = v; setFond(v);
    },
  })).current;
  const at = (cx: number, cy: number, w: number, h: number) => ({
    position: 'absolute' as const,
    left: cx * W - w / 2, top: cy * TH - h / 2, width: w, height: h,
  });
  const bt = (cx: number, l: string, on: boolean, f: () => void) => (
    <Pressable key={l} onPress={() => { buzz(); f(); }}
      style={[at(cx, 0.526, W * 0.105, W * 0.105), {
        borderRadius: W * 0.0525, alignItems: 'center',
        justifyContent: 'center', borderWidth: 2,
        backgroundColor: 'rgba(30,12,4,0.88)',
        borderColor: on ? AMB : '#7A3A10' }]}>
      <Text style={{ color: on ? AMB : TXT, fontSize: 8,
        fontWeight: '800', textAlign: 'center' }}>{l}</Text>
    </Pressable>
  );
  const [mode, setMode] = useState(0);
  const px = (c: number) => 0.224 + c * 0.183;
  const py = (r: number) => 0.755 + r * 0.115;
  return (
    <View style={{ flex: 1, backgroundColor: '#1A0803' }}>
      <Fond W={W} H={H} />
      <Pressable onPress={back} style={{ position: 'absolute', top: 8, left: 12, padding: 8 }}>
        <Text style={{ color: TXT, fontSize: 26 }}>‹</Text>
      </Pressable>
      <Text style={{ position: 'absolute', top: 16, width: W, textAlign: 'center',
        color: TXT, fontWeight: '800', letterSpacing: 2 }}>{room.name}</Text>
      <Pressable onPress={() => { buzz(); setRec(!rec); }}
        style={{ position: 'absolute', left: 14 + 2 * ((W - 44) / 3 + 8), bottom: TH * 0.8 + 8, width: (W - 44) / 3, height: 40,
          paddingHorizontal: 6, borderRadius: 20, flexDirection: 'row', justifyContent: 'center',
          alignItems: 'center', gap: 8, backgroundColor: 'rgba(30,12,4,0.88)',
          borderWidth: 2, borderColor: rec ? '#E8421A' : AMB }}>
        <View style={{ width: 14, height: 14, borderRadius: rec ? 3 : 7, backgroundColor: '#E8421A' }} />
        <Text style={{ color: TXT, fontWeight: '700' }}>
          {rec ? Math.floor(secs / 10) + ' s' : 'REC'}</Text>
      </Pressable>
      <Pressable onPress={() => { buzz(); setMode(mode ? 0 : 1); }}
        style={{ position: 'absolute', left: 14, bottom: TH * 0.8 + 8, width: (W - 44) / 3, height: 40,
          paddingHorizontal: 6, borderRadius: 20, justifyContent: 'center', alignItems: 'center',
          backgroundColor: 'rgba(30,12,4,0.88)', borderWidth: 2, borderColor: AMB }}>
        <Text style={{ color: AMB, fontWeight: '800' }}>{mode ? 'EFFETS' : 'PADS'} ⇄</Text>
      </Pressable>
      <Lumieres2 W={W} H={H} />
      <Dessus W={W} H={H} TH={TH} fx={fx} />
      <Pressable onPress={() => { buzz(); if (!ch1) { setPk(1); return; } if (s2 === null) { setPk(2); return; } if (playing && s2p) { toggle(); deck2Pause(); setS2p(false); } else { setFond(0.5); try { setVol(Math.cos(Math.PI / 4)); deck2Vol(Math.sin(Math.PI / 4)); } catch (e) {} if (!s2p) { setS2p(true); deck2Ready(() => { if (!playing) toggle(); }); } else if (!playing) toggle(); } }} style={{ position: 'absolute', left: 14 + (W - 44) / 3 + 8, bottom: TH * 0.8 + 8, width: (W - 44) / 3, height: 40, borderRadius: 22, backgroundColor: '#2A1408', borderWidth: 2, borderColor: '#FFB020', alignItems: 'center', justifyContent: 'center', zIndex: 30 }}><Text style={{ color: '#FFB020', fontWeight: '800', fontSize: 14 }}>{playing && s2p ? '■ STOP' : '2 DISQUES'}</Text></Pressable>
      <Image source={require('../assets/salle2/table-o.webp')}
        style={{ position: 'absolute', left: 0, bottom: 0, width: W, height: TH, transform: [{ translateY: TH * 0.1 }, { scale: 0.8 }] }} />
      <View style={{ position: 'absolute', left: 0, bottom: 0, width: W, height: TH, transform: [{ translateY: TH * 0.1 }, { scale: 0.8 }] }}>
        <Pressable onPress={() => { buzz(); if (!playing && !ch1) setPk(1); else toggle(); }} onLongPress={() => setPk(1)}
          style={at(0.247, 0.223, D, D)}><Spin on={playing} size={D} /></Pressable>
        <Pressable onPress={() => {
          buzz(); if (s2 === null) setPk(2);
          else if (s2p) { deck2Pause(); setS2p(false); }
          else { deck2Play(); setS2p(true); } }}
          onLongPress={() => setPk(2)}
          style={at(0.753, 0.223, D, D)}><Spin on={s2p} size={D} /></Pressable>
          <View {...pr2.panHandlers} style={at(0.5, 0.62, W * 0.7, 44)}>
            <View style={{ position: 'absolute', left: 0, right: 0, top: 19, height: 6, borderRadius: 3, backgroundColor: '#3A1A08' }} />
            <View style={{ position: 'absolute', left: fond * (W * 0.7 - 26), top: 4, width: 26, height: 36, borderRadius: 6, backgroundColor: '#F2A93B', borderWidth: 1, borderColor: '#FFD27A' }} />
          </View>
{bt(0.12, 'INSTRU −', ins === 'cut', () => setIns(ins === 'cut' ? null : 'cut'))}
{bt(0.272, 'INSTRU seul', ins === 'solo', () => setIns(ins === 'solo' ? null : 'solo'))}
{bt(0.424, loop ? 'BOUCLE ' + loop : 'BOUCLE', loop > 0, () => { const n = loop === 0 ? 1 : loop === 1 ? 2 : loop === 2 ? 4 : 0; if (n === 0) { boucleLibere(); setLoop(0); } else { boucleDemarre(); setLoop(boucleVerrouille(n) ? n : 0); } })}
{bt(0.576, 'VOIX −', voi === 'cut', () => setVoi(voi === 'cut' ? null : 'cut'))}
{bt(0.728, 'VOIX seul', voi === 'solo', () => setVoi(voi === 'solo' ? null : 'solo'))}
{room.mine ? bt(0.88, 'DIRECT', !!dir.mic, dir.bascule) : null}
{mode === 0 ? PADS.slice(0, 8).map((k, i) => (
  <Pressable key={k} onPressIn={() => { buzz(); setLit(k); padPlay(k); }} onPressOut={() => setLit(null)} style={[at(px(i % 4), py(Math.floor(i / 4)), W * 0.14, W * 0.14), { alignItems: 'center', justifyContent: 'center' }]}>
    <View style={{ position: 'absolute', width: W * 0.14, height: W * 0.14, borderRadius: 12, borderWidth: 2, backgroundColor: ['#FF8A1F', '#2EC24A', '#E8421A'][i % 3], borderColor: lit === k ? '#FFE9D0' : '#3A1D0C', opacity: lit === k ? 1 : 0.75 }} />
    <Text style={{ color: '#1A0A04', fontWeight: '800', fontSize: 13 }}>{k}</Text>
  </Pressable>
)) : null}
{mode === 1 ? (
  <View style={at(0.5, 0.80, W * 0.8, W * 0.3)}>
    <Effets onDrop={() => setFx(['Flash'])} />
    <View style={{ flexDirection: 'row', gap: 6, marginTop: 8 }}>
      {['Lasers', 'Flash', 'Braises', 'Bogolan'].map((k) => chip(k, fx, setFx))}
    </View>
  </View>
) : null}
</View>
{pk !== null ? (<View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: H * 0.6, overflow: 'hidden' }}><ListeSons open={true} onClose={() => { setPk(null); setQ(''); }} q={q} setQ={setQ} cur={pk === 2 && s2 !== null ? s2 : cur} playing={playing} onPick={(i: number) => {
  if (pk === 1 && pick) { pick(i, false); setCh1(true); } else { setS2(i); try { const u = TRACKS[i] && (TRACKS[i] as any).uri; if (u) { deck2Load(u); setS2p(false); } } catch (e) {} } setPk(null); setQ(''); }} /></View>) : null}
</View>
);
}
