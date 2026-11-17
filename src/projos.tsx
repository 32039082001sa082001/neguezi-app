import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing, Dimensions } from 'react-native';
import { getTime, getMeta, isPlaying } from './studio';
import { analyser } from './rythme';
const { width: W, height: H } = Dimensions.get('window');
const tm = (v: any, to: number, ms: number, e?: any) => Animated.timing(v, { toValue: to, duration: ms, easing: e, useNativeDriver: true });
export function Projos() {
  const a = useRef(new Animated.Value(-1)).current;
  const f = useRef(new Animated.Value(0)).current;
  const st = useRef<any>({ uri: '', beats: null, done: false, i: 0, last: 0, n: 0, idle: 0 }).current;
  const beat = () => {
    const k = st.n++, big = k % 4 === 3;
    tm(a, k % 2 ? -1 : 1, big ? 220 : 380, Easing.inOut(Easing.cubic)).start();
    Animated.sequence([tm(f, big ? 1 : 0.7, 70), tm(f, 0, 600, Easing.out(Easing.cubic))]).start();
  };
  useEffect(() => {
    const id = setInterval(() => { try {
      const m: any = getMeta();
      if (m && m.uri && m.uri !== st.uri) {
        st.uri = m.uri; st.beats = null; st.done = false; st.i = 0; st.last = 0;
        const u = m.uri;
        analyser(u, m.d).then((b: any) => { if (st.uri === u) { st.beats = b && b.length ? b : null; st.done = true; } });
      }
      if (!isPlaying()) return;
      if (!st.beats) { const now = Date.now(); if (st.done && now - st.idle > 600) { st.idle = now; beat(); } return; }
      const t = getTime() + 0.05, b = st.beats;
      if (t < st.last - 0.5 || t > st.last + 2) { let k = 0; while (k < b.length && b[k] < t - 0.05) k++; st.i = k; }
      st.last = t;
      while (st.i < b.length && b[st.i] <= t) { if (b[st.i] > t - 0.2) beat(); st.i++; }
    } catch (e) {} }, 40);
    return () => clearInterval(id);
  }, []);
  const L = (mirror: number) => (
    <Animated.Image source={require('../assets/egal.png')} resizeMode="cover" style={{ position: 'absolute', top: 0, left: -W * 0.3, width: W * 1.6, height: H,
      opacity: f.interpolate({ inputRange: [0, 1], outputRange: [0.18, 0.7] }),
      transform: [{ translateY: H / 2 }, { rotate: a.interpolate({ inputRange: [-1, 1], outputRange: mirror > 0 ? ['-18deg', '18deg'] : ['18deg', '-18deg'] }) }, { translateY: -H / 2 }, { scaleX: mirror }] }} />
  );
  return <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>{L(1)}{L(-1)}</View>;
}
