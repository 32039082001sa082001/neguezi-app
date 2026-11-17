import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing, Dimensions } from 'react-native';
import { getTime, getMeta, isPlaying } from './studio';
import { analyser } from './rythme';

const { width: W, height: H } = Dimensions.get('window');
const NB = 16, NS = 12, NR = 12, CY = 310;
const nat = { useNativeDriver: true };
const tm = (v: any, to: number, ms: number, e?: any) => Animated.timing(v, { toValue: to, duration: ms, easing: e, ...nat });
const ip = (v: any, a: number[], b: number[]) => v.interpolate({ inputRange: a, outputRange: b, extrapolate: 'clamp' });

export function Ambiance() {
  const mk = (n: number, v = 0) => useRef(Array.from({ length: n }, () => new Animated.Value(v))).current;
  const eq = mk(NB, 0.15), sp = mk(NS), dx = mk(NS), dy = mk(NS), rn = mk(NR), rx = mk(NR);
  const glow = useRef(new Animated.Value(0)).current;
  const st = useRef<any>({ uri: '', beats: null, done: false, i: 0, last: 0, n: 0, idle: 0, s: 0, r: 0 }).current;
  const beat = () => {
    const k = st.n++ % 4, big = k === 3;
    Animated.sequence([tm(glow, 1, 70), tm(glow, 0, 520, Easing.out(Easing.cubic))]).start();
    eq.forEach((v) => { v.setValue(0.45 + Math.random() * 0.55); tm(v, 0.15, 380).start(); });
    for (let j = 0; j < (big ? 8 : 4); j++) {
      const i = st.s++ % NS, a = Math.random() * 6.283, d = 70 + Math.random() * 90;
      dx[i].setValue(Math.cos(a) * d); dy[i].setValue(Math.sin(a) * d - 30);
      sp[i].setValue(0); tm(sp[i], 1, 700, Easing.out(Easing.quad)).start();
    }
    for (let j = 0; j < (big ? 7 : 4); j++) {
      const i = st.r++ % NR;
      rx[i].setValue(Math.random() * W); rn[i].setValue(0);
      tm(rn[i], 1, big ? 600 : 1000, Easing.in(Easing.quad)).start();
    }
  };
  useEffect(() => {
    const id = setInterval(() => { try {
      const m: any = getMeta();
      if (m && m.uri && m.uri !== st.uri) {
        st.uri = m.uri; st.beats = null; st.done = false; st.i = 0; st.last = 0;
        const u = m.uri;
        analyser(u, m.d).then((b: any) => {
          if (st.uri === u) { st.beats = b && b.length ? b : null; st.done = true; }
        });
      }
      if (!isPlaying()) return;
      if (!st.beats) {
        const now = Date.now();
        if (st.done && now - st.idle > 600) { st.idle = now; beat(); }
        return;
      }
      const t = getTime() + 0.05, b = st.beats;
      if (t < st.last - 0.5 || t > st.last + 2) {
        let k = 0; while (k < b.length && b[k] < t - 0.05) k++; st.i = k;
      }
      st.last = t;
      while (st.i < b.length && b[st.i] <= t) { if (b[st.i] > t - 0.2) beat(); st.i++; }
    } catch (e) {} }, 40);
    return () => clearInterval(id);
  }, []);
  const A: any = { position: 'absolute' };
  return (
    <View pointerEvents="none" style={[A, { top: 0, left: 0, right: 0, bottom: 0 }]}>
      <Animated.View style={[A, { left: W / 2 - 150, top: CY - 150, width: 300, height: 300, borderRadius: 150,
        backgroundColor: '#2f6fff', opacity: ip(glow, [0, 1], [0, 0.3]), transform: [{ scale: ip(glow, [0, 1], [0.9, 1.3]) }] }]} />
      {rn.map((y, i) => <Animated.View key={'r' + i} style={[A, { left: 0, top: 0, width: 2, height: 90, backgroundColor: '#7fb8ff',
        opacity: ip(y, [0, 0.1, 0.9, 1], [0, 0.6, 0.6, 0]),
        transform: [{ translateX: rx[i] }, { translateY: ip(y, [0, 1], [-100, H]) }] }]} />)}
      {sp.map((s, i) => <Animated.View key={'s' + i} style={[A, { left: W / 2 - 2, top: CY - 2, width: 4, height: 4, borderRadius: 2,
        backgroundColor: '#cfe6ff', opacity: ip(s, [0, 0.15, 1], [0, 1, 0]), transform: [{ translateX: Animated.multiply(s, dx[i]) },
        { translateY: Animated.add(Animated.multiply(s, dy[i]), ip(s, [0, 1], [0, 50])) }] }]} />)}
    </View>
  );
}
