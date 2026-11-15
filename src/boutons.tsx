import React, { useRef, useState } from 'react';
import { View, Text, PanResponder, Image } from 'react-native';
import { setTempo, setVoix, setSalle } from './studio';

const S = 62;
const R0 = -135;

function Bouton({ label, min, max, init, snap, fmt, onChange }: any) {
  const [v, setV] = useState<number>(init);
  const g = useRef<any>({ cx: 0, cy: 0, prev: 0, ok: false, v: init }).current;
  const box = useRef<any>(null);
  const ang = (x: number, y: number) => Math.atan2(y - g.cy, x - g.cx);
  const set = (n: number) => {
    let x = Math.max(min, Math.min(max, n));
    if (snap != null && Math.abs(x - snap) < (max - min) * 0.03) x = snap;
    g.v = x; setV(x);
    try { onChange(x); } catch (e) {}
  };
  const pan = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderTerminationRequest: () => false,
    onPanResponderGrant: (e: any) => {
      g.ok = false;
      const px = e.nativeEvent.pageX; const py = e.nativeEvent.pageY;
      try {
        box.current.measure((_x: number, _y: number, w: number, h: number, pgx: number, pgy: number) => {
          g.cx = pgx + w / 2; g.cy = pgy + h / 2; g.prev = ang(px, py); g.ok = true;
        });
      } catch (err) {}
    },
    onPanResponderMove: (e: any) => {
      if (!g.ok) return;
      const a = ang(e.nativeEvent.pageX, e.nativeEvent.pageY);
      let d = a - g.prev;
      while (d > Math.PI) d -= 2 * Math.PI;
      while (d < -Math.PI) d += 2 * Math.PI;
      g.prev = a;
      set(g.v + (d / (1.5 * Math.PI)) * (max - min));
    },
    onPanResponderRelease: (_: any, s: any) => { if (Math.abs(s.dx) < 5 && Math.abs(s.dy) < 5) set(init); },
  })).current;

  const f = (v - min) / (max - min);
  const th = R0 + f * 270;
  return (
    <View style={{ alignItems: 'center' }}>
      <View ref={box} collapsable={false} {...pan.panHandlers} style={{ width: S, height: S }}>
        <View pointerEvents="none" style={{ width: S, height: S, transform: [{ rotate: th + 'deg' }] }}>
          <Image source={require('../assets/knob.png')} style={{ width: S, height: S }} resizeMode="contain" />
          <View style={{ position: 'absolute', left: S / 2 - 1.5, top: 2, width: 3, height: 11, borderRadius: 2, backgroundColor: '#EAF1FF' }} />
        </View>
      </View>
      <Text style={{ color: '#EAF1FF', fontSize: 11, marginTop: 2 }}>{label}</Text>
      <Text style={{ color: '#4D8DFF', fontSize: 10 }}>{fmt(v)}</Text>
    </View>
  );
}

export function Platine() {
  return (
    <View style={{ position: 'absolute', left: 0, right: 0, bottom: 4, flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 24 }}>
      <Bouton label="Tempo" min={0.8} max={1.25} init={1} snap={1} fmt={(x: number) => x.toFixed(2) + 'x'} onChange={setTempo} />
      <Bouton label="Voix" min={0.8} max={1.3} init={1} snap={1} fmt={(x: number) => (x < 0.97 ? 'Grave' : x > 1.03 ? 'Enfant' : 'Normal')} onChange={setVoix} />
      <Bouton label="Concert" min={0} max={1} init={0} fmt={(x: number) => Math.round(x * 100) + '%'} onChange={setSalle} />
    </View>
  );
}
