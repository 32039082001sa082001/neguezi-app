import React, { useEffect, useRef, useState } from 'react';
import { View, Text, PanResponder, Image, Vibration, Pressable, Alert } from 'react-native';
import { setTempo, setVoix, setSalle, getRoom } from './studio';

const S = 60;
const R0 = -135;
const SEMI = [-3, -2, -1, 0, 1, 2, 3, 4].map((n) => Math.pow(2, n / 12));
const salleTxt = () => {
  const r = getRoom().split('|')[0];
  return r === 'load' ? 'prépare…' : r === 'on' ? 'actif' : r === 'fail' ? 'échec' : r === 'long' ? 'trop long' : '';
};

function Bouton({ label, min, max, init, marks, fmt, poll, info, onChange }: any) {
  const [v, setV] = useState<number>(init);
  const [, tick] = useState(0);
  const g = useRef<any>({ cx: 0, cy: 0, prev: 0, ok: false, raw: init, m: marks ? marks.findIndex((q: number) => Math.abs(q - init) < 1e-9) : -1 }).current;
  const box = useRef<any>(null);
  useEffect(() => {
    if (!poll) return;
    const id = setInterval(() => tick((x: number) => x + 1), 500);
    return () => clearInterval(id);
  }, []);
  const ang = (x: number, y: number) => Math.atan2(y - g.cy, x - g.cx);
  const set = (n: number) => {
    const r = Math.max(min, Math.min(max, n));
    g.raw = r;
    let x = r; let m = -1;
    if (marks) {
      for (let k = 0; k < marks.length; k++) {
        if (Math.abs(r - marks[k]) < (max - min) * 0.02) { x = marks[k]; m = k; break; }
      }
    }
    if (m !== g.m) { if (m >= 0) { try { Vibration.vibrate(12); } catch (e) {} } g.m = m; }
    setV(x);
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
      set(g.raw + (d / (1.5 * Math.PI)) * (max - min));
    },
    onPanResponderRelease: (_: any, s: any) => { if (Math.abs(s.dx) < 5 && Math.abs(s.dy) < 5) set(init); },
  })).current;

  const f = (v - min) / (max - min);
  const th = R0 + f * 270;
  const lab = <Text style={{ color: '#EAF1FF', fontSize: 11, marginTop: 2 }}>{label}</Text>;
  return (
    <View style={{ alignItems: 'center' }}>
      <View ref={box} collapsable={false} {...pan.panHandlers} style={{ width: S, height: S }}>
        <View pointerEvents="none" style={{ width: S, height: S, transform: [{ rotate: th + 'deg' }] }}>
          <Image source={require('../assets/knob.png')} style={{ width: S, height: S }} resizeMode="contain" />
          <View style={{ position: 'absolute', left: S / 2 - 1.5, top: 2, width: 3, height: 11, borderRadius: 2, backgroundColor: '#EAF1FF' }} />
        </View>
        <View pointerEvents="none" style={{ position: 'absolute', left: 0, top: 0, width: S, height: S }}>
          {marks ? marks.map((m: number, k: number) => {
            const a = ((R0 + ((m - min) / (max - min)) * 270) * Math.PI) / 180;
            const on = g.m === k; const z = on ? 9 : 6; const rr = S / 2 - 5;
            return (<View key={k} style={{ position: 'absolute', left: S / 2 + rr * Math.sin(a) - z / 2, top: S / 2 - rr * Math.cos(a) - z / 2, width: z, height: z, borderRadius: z / 2, backgroundColor: on ? '#FF4D4D' : '#B3262E', borderWidth: on ? 1 : 0, borderColor: '#FFD0D0' }} />);
          }) : null}
        </View>
      </View>
      {info ? (<Pressable onPress={() => { try { Alert.alert(label, info()); } catch (e) {} }}>{lab}</Pressable>) : lab}
      <Text style={{ color: g.m >= 0 ? '#EAF1FF' : '#4D8DFF', fontSize: 10 }}>{fmt(v)}</Text>
    </View>
  );
}

export function Platine() {
  return (
    <View style={{ position: 'absolute', left: 0, right: 0, bottom: 4, flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 24 }}>
      <Bouton label="Tempo" min={0.8} max={1.25} init={1} marks={[0.9, 1, 1.1, 1.2]} fmt={(x: number) => x.toFixed(2) + 'x'} onChange={setTempo} />
      <Bouton label="Voix" min={0.8} max={1.3} init={1} marks={SEMI} fmt={(x: number) => { const n = Math.round(12 * Math.log2(x)); return n === 0 ? 'Normal' : (n > 0 ? '+' : '') + n; }} onChange={setVoix} />
      <Bouton label="Concert" min={0} max={1} init={0} poll={true} info={() => { const r = getRoom().split('|'); return 'État : ' + (salleTxt() || 'éteint') + (r[1] ? '\n' + r[1] : ''); }} fmt={(x: number) => Math.round(x * 100) + '% ' + salleTxt()} onChange={setSalle} />
    </View>
  );
}
