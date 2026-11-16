import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing, Dimensions, Vibration } from 'react-native';
import { getTime, getMeta, isPlaying } from './studio';
import { analyser } from './rythme';

const { width: W } = Dimensions.get('window');
const S = 420;
const CR = [require('../assets/couronne1.png'), require('../assets/couronne2.png'), require('../assets/couronne3.png')];
const nat = { useNativeDriver: true };
const tm = (v: any, to: number, ms: number, e?: any) => Animated.timing(v, { toValue: to, duration: ms, easing: e, ...nat });
const ip = (v: any, a: any, b: any) => v.interpolate({ inputRange: [0, 1], outputRange: [a, b] });

export function Folie() {
  const N = (v = 0) => useRef(new Animated.Value(v)).current;
  const pulse = N(), flash = N(), r1 = N(), r2 = N(), rot = N(), big = N();
  const C = [N(), N(), N()];
  const st = useRef<any>({ uri: '', beats: null, done: false, i: 0, last: 0, n: 0, idle: 0 }).current;
  const drop = () => {
    Animated.sequence([tm(flash, 1, 50), tm(flash, 0, 500)]).start();
    big.setValue(1);
    tm(big, 0, 600, Easing.out(Easing.cubic)).start();
    Vibration.vibrate(40);
  };
  const wave = (r: any, ms: number) => { r.setValue(0); tm(r, 1, ms, Easing.out(Easing.quad)).start(); };
  const beat = () => {
    const n = st.n++, k = n % 3;
    Animated.sequence([tm(pulse, 1, 70), tm(pulse, 0, 300, Easing.out(Easing.cubic))]).start();
    C.forEach((c, i) => tm(c, i === k ? 1 : 0, i === k ? 70 : 260).start());
    tm(rot, n, 160, Easing.out(Easing.quad)).start();
    wave(r1, 650);
    setTimeout(() => wave(r2, 650), 130);
    if (n % 8 === 7) drop();
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
      if (!st.beats) {
        const now = Date.now();
        if (st.done && now - st.idle > 600) { st.idle = now; beat(); }
        return;
      }
      const t = getTime() + 0.05, b = st.beats;
      if (t < st.last - 0.5 || t > st.last + 2) { let k = 0; while (k < b.length && b[k] < t - 0.05) k++; st.i = k; }
      st.last = t;
      while (st.i < b.length && b[st.i] <= t) { if (b[st.i] > t - 0.2) beat(); st.i++; }
    } catch (e) {} }, 40);
    return () => clearInterval(id);
  }, []);
  const fill: any = { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 };
  const box: any = { position: 'absolute', left: W / 2 - S / 2, top: 100, width: S, height: S };
  const sc: any = Animated.add(ip(pulse, 1, 1.12), ip(big, 0, 0.5));
  return (
    <View pointerEvents="none" style={fill}>
      <Animated.View style={[fill, { backgroundColor: '#8fc4ff', opacity: ip(flash, 0, 0.18) }] as any} />
      <Animated.View style={[box, { transform: [{ scale: sc }] }] as any}>
        {CR.map((src, i) => (
          <Animated.Image key={'c' + i} source={src} style={[box, { left: 0, top: 0, opacity: C[i], transform: i === 0 ? [{ rotate: ip(rot, '0deg', '22.5deg') }] : [] }] as any} />
        ))}
      </Animated.View>
      {[r1, r2].map((r, i) => (
        <Animated.View key={'r' + i} style={{ position: 'absolute', left: W / 2 - 60, top: 250, width: 120, height: 120, borderRadius: 60, borderWidth: 2, borderColor: '#7fb8ff', opacity: ip(r, 0.7, 0), transform: [{ scale: ip(r, 0.6, 3.4) }] } as any} />
      ))}
    </View>
  );
}
