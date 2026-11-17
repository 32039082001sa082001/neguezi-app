import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing, Dimensions } from 'react-native';
import { getTime, getMeta, isPlaying } from './studio';
import { analyser } from './rythme';
const { width: W, height: H } = Dimensions.get('window');
const S = W * 0.8, XS = [0.1, 0.38, 0.66, 0.92, 0.5], YS = [0.8, 0.76, 0.8, 0.76, 0.72];
const CC: any[] = [[1, 'rgba(50,120,255,0.10)'], [0.66, 'rgba(90,160,255,0.12)'], [0.34, 'rgba(180,215,255,0.16)']];
export function Brume() {
  const bl = useRef(XS.map(() => new Animated.Value(0))).current;
  const st = useRef<any>({ uri: '', beats: null, done: false, i: 0, last: 0, n: 0, idle: 0 }).current;
  const beat = () => {
    const big = st.n++ % 4 === 3;
    bl.forEach((v) => {
      v.setValue(big ? 1 : 0.4 + Math.random() * 0.4);
      Animated.timing(v, { toValue: 0, duration: big ? 900 : 650, easing: Easing.out(Easing.quad), useNativeDriver: true }).start();
    });
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
  return (
    <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
      {bl.map((v, i) => (
        <Animated.View key={i} style={{ position: 'absolute', left: W * XS[i] - S / 2, top: H * YS[i] - S / 2, width: S, height: S,
          opacity: v.interpolate({ inputRange: [0, 1], outputRange: [0.15, 1] }),
          transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1.3] }) }] }}>
          {CC.map((c, j) => <View key={j} style={{ position: 'absolute', left: (S - S * c[0]) / 2, top: (S - S * c[0]) / 2, width: S * c[0], height: S * c[0], borderRadius: (S * c[0]) / 2, backgroundColor: c[1] }} />)}
        </Animated.View>
      ))}
    </View>
  );
}
