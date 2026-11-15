import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, Image, Dimensions } from 'react-native';
import { useKeepAwake } from 'expo-keep-awake';
import { TRACKS, fmt } from './theme';

type R = { name: string; pub: boolean; code?: string; mine?: boolean; n: number };
type P = { room: R; cur: number; playing: boolean; time: number; toggle: () => void; next: () => void; prev: () => void; back: () => void };

const W = Dimensions.get('window').width;
const H = (W * 1672) / 941;
const AMB = '#FF9A1F';
const TXT = '#FFE9D0';
const DIM = '#E8B98A';
const CARD = 'rgba(50,20,6,0.82)';
const LINE = '#C0651A';
const FX = ['Lasers', 'Flash', 'Fumée', 'Confettis'];
const SND = ['Écho', 'Salle', 'Radio', 'Boucle'];

function Dj({ label }: { label: string }) {
  return (
    <View style={{ alignItems: 'center' }}>
      <View style={{ width: 68, height: 68, borderRadius: 34, borderWidth: 2, borderColor: AMB, backgroundColor: 'rgba(40,16,4,0.75)', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 28 }}>🎧</Text>
      </View>
      <Text style={{ color: TXT, fontWeight: '700', marginTop: 4 }}>{label}</Text>
    </View>
  );
}

export function Scene({ room, cur, playing, time, toggle, next, prev, back }: P) {
  useKeepAwake();
  const [fx, setFx] = useState<string[]>([]);
  const [snd, setSnd] = useState<string[]>([]);
  const t: any = TRACKS[cur];
  const title = t ? t.title || t.name || t.n || '' : '';
  const d = t && t.d ? t.d : 0;
  const pct = d ? Math.min(1, time / d) : 0;
  const tog = (arr: string[], set: (a: string[]) => void, k: string) => set(arr.includes(k) ? arr.filter((x) => x !== k) : [...arr, k]);
  const chip = (k: string, arr: string[], set: (a: string[]) => void) => (
    <Pressable key={k} onPress={() => tog(arr, set, k)} style={{ flex: 1, alignItems: 'center', paddingVertical: 11, borderRadius: 16, borderWidth: 1, borderColor: arr.includes(k) ? AMB : LINE, backgroundColor: arr.includes(k) ? 'rgba(255,154,31,0.3)' : CARD }}>
      <Text style={{ color: TXT, fontWeight: '600', fontSize: 13 }}>{k}</Text>
    </Pressable>
  );
  return (
    <View style={{ flex: 1, backgroundColor: '#8F430F' }}>
      <Image source={require('../assets/studio.png')} style={{ position: 'absolute', top: 0, left: 0, width: W, height: H }} />
      <ScrollView contentContainerStyle={{ paddingBottom: 220 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 40, paddingHorizontal: 16 }}>
          <Pressable onPress={back} style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14, backgroundColor: CARD }}>
            <Text style={{ color: TXT, fontSize: 20 }}>‹</Text>
          </Pressable>
          <Text style={{ color: TXT, fontSize: 20, fontWeight: '700' }}>{room.name}</Text>
          <View style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 14, backgroundColor: CARD, borderWidth: 1, borderColor: LINE }}>
            <Text style={{ color: TXT, fontWeight: '600' }}>0/6</Text>
          </View>
        </View>
        <View style={{ marginTop: H * 0.13, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 26 }}>
          <Dj label="DJ 1" />
          <Dj label="DJ 2" />
        </View>
        <View style={{ marginTop: H * 0.1, marginHorizontal: 16, padding: 14, borderRadius: 22, backgroundColor: CARD, borderWidth: 1, borderColor: LINE }}>
          <Text style={{ color: TXT, fontSize: 18, fontWeight: '700' }} numberOfLines={1}>{title}</Text>
          <View style={{ height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.18)', marginTop: 10 }}>
            <View style={{ height: 6, borderRadius: 3, width: `${pct * 100}%`, backgroundColor: AMB }} />
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
            <Text style={{ color: DIM, fontSize: 12 }}>{fmt(time)}</Text>
            <Text style={{ color: DIM, fontSize: 12 }}>{d ? fmt(d) : ''}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 30, marginTop: 6 }}>
            <Pressable onPress={prev}><Text style={{ color: TXT, fontSize: 30 }}>⏮</Text></Pressable>
            <Pressable onPress={toggle} style={{ width: 62, height: 62, borderRadius: 31, backgroundColor: AMB, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: '#1A0A04', fontSize: 26 }}>{playing ? '❚❚' : '▶'}</Text>
            </Pressable>
            <Pressable onPress={next}><Text style={{ color: TXT, fontSize: 30 }}>⏭</Text></Pressable>
          </View>
        </View>
        <Text style={{ color: TXT, textAlign: 'center', letterSpacing: 3, marginTop: 22, fontWeight: '700' }}>SPECTATEURS · 0/4</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 14, marginTop: 10 }}>
          {[0, 1, 2, 3].map((k) => (
            <View key={k} style={{ width: 56, height: 56, borderRadius: 28, borderWidth: 2, borderStyle: 'dashed', borderColor: LINE, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: AMB, fontSize: 24 }}>+</Text>
            </View>
          ))}
        </View>
        <Text style={{ color: TXT, textAlign: 'center', letterSpacing: 3, marginTop: 24, fontWeight: '700' }}>EFFETS DE SON</Text>
        <View style={{ flexDirection: 'row', gap: 8, marginHorizontal: 16, marginTop: 10 }}>{SND.map((k) => chip(k, snd, setSnd))}</View>
        <Text style={{ color: TXT, textAlign: 'center', letterSpacing: 3, marginTop: 20, fontWeight: '700' }}>EFFETS DE LUMIÈRE</Text>
        <View style={{ flexDirection: 'row', gap: 8, marginHorizontal: 16, marginTop: 10 }}>{FX.map((k) => chip(k, fx, setFx))}</View>
      </ScrollView>
    </View>
  );
}
