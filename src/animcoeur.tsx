import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing, Dimensions, Vibration } from 'react-native';
import { getTime, getMeta, isPlaying } from './studio';
import { analyser } from './rythme';

const { width: W, height: H } = Dimensions.get('window');
const D = 210;
const VIB = true;
const K = W / 360;
const PTS: number[][] = [[20,250],[55,310],[30,380],[75,420],[300,240],[330,300],[290,370],[340,430],[180,470],[120,455],[240,455]];
const LN: number[][] = [[0,1],[1,2],[2,3],[4,5],[5,6],[6,7],[3,9],[9,8],[8,10],[10,7],[1,3]];
const P = PTS.map(([x, y]) => [x * K, y]);
const FI = [require('../assets/fiss1.png'), require('../assets/fiss2.png'), require('../assets/fiss3.png')];
const FA = require('../assets/fiss_all.png');
const RF = [require('../assets/reflet1.png'), require('../assets/reflet2.png'), require('../assets/reflet3.png')];
const BO = require('../assets/fiss_src.png');
const nat = { useNativeDriver: true };
const tm = (v: any, to: number, ms: number, e?: any) => Animated.timing(v, { toValue: to, duration: ms, easing: e, ...nat });

export function CoeurFx() {
  const N = (v = 0) => useRef(new Animated.Value(v)).current;
  const pulse = N(), fa = N(), ring = N(), bolt = N(), bs = N(1), bt = N(), cn = N(), g = N();
  const F = [N(), N(), N()];
  const S = [N(), N(), N()];
  const st = useRef<any>({ uri: '', beats: null, done: false, i: 0, last: 0, n: 0, idle: 0 }).current;
  const star = (i: number) => {
    const s = S[i % 3];
    s.setValue(0);
    tm(s, 1, 750, Easing.out(Easing.quad)).start();
  };
  const boom = () => {
    F.forEach((f) => tm(f, 0, 250).start());
    Animated.sequence([tm(fa, 1, 60), tm(fa, 0, 420)]).start();
    ring.setValue(0);
    tm(ring, 1, 650, Easing.out(Easing.quad)).start();
    bs.setValue(Math.random() < 0.5 ? -1 : 1);
    bt.setValue((Math.random() - 0.5) * 60);
    Animated.sequence([tm(bolt, 1, 50), tm(bolt, 0, 380)]).start();
    if (VIB) Vibration.vibrate(25);
  };
  const beat = () => {
    const n = st.n++, k = n % 4;
    Animated.sequence([tm(pulse, 1, 70), tm(pulse, 0, 280, Easing.out(Easing.cubic))]).start();
    Animated.sequence([tm(cn, 1, 60), tm(cn, 0, 450)]).start();
    if (k < 3) tm(F[k], 1, 120).start(); else boom();
    if (n % 2 === 0) star(n / 2);
  };
  useEffect(() => {
    Animated.loop(Animated.sequence([tm(g, 1, 1600, Easing.linear), tm(g, 0, 0), Animated.delay(3000)])).start();
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
  const op = (a: number, b: number, c: number) =>
    g.interpolate({ inputRange: [a, b, c], outputRange: [0, 0.6, 0], extrapolate: 'clamp' });
  const ip = (v: any, a: number, b: number) => v.interpolate({ inputRange: [0, 1], outputRange: [a, b] });
  const im: any = { position: 'absolute', top: 0, left: 0, width: D, height: D };
  const fill: any = { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 };
  return (
    <View pointerEvents="none" style={fill}>
      <Animated.View style={[fill, { backgroundColor: '#3a8cff', opacity: ip(fa, 0, 0.15) }]} />
      <Animated.Image source={BO} resizeMode="cover"
        style={{ position: 'absolute', top: 0, left: 0, width: W, height: H, opacity: bolt, transform: [{ translateX: bt }, { scaleX: bs }] }} />
      <Animated.View style={{ opacity: ip(cn, 0.3, 0.95), ...fill }}>
        {LN.map(([a, b], k) => {
          const [x1, y1] = P[a], [x2, y2] = P[b], l = Math.hypot(x2 - x1, y2 - y1);
          return <View key={'l' + k} style={{ position: 'absolute', left: (x1 + x2) / 2 - l / 2, top: (y1 + y2) / 2, width: l, height: 1,
            backgroundColor: '#7fb8ff', transform: [{ rotate: Math.atan2(y2 - y1, x2 - x1) + 'rad' }] }} />;
        })}
        {P.map(([x, y], k) => (
          <View key={'d' + k} style={{ position: 'absolute', left: x - 2, top: y - 2, width: 4, height: 4, borderRadius: 2, backgroundColor: '#cfe6ff' }} />
        ))}
      </Animated.View>
      {S.map((s, i) => (
        <Animated.View key={'s' + i} style={{ position: 'absolute', left: W * (0.45 + 0.2 * i), top: 40 + i * 55,
          width: 70, height: 2, borderRadius: 1, backgroundColor: '#cfe6ff',
          opacity: s.interpolate({ inputRange: [0, 0.15, 1], outputRange: [0, 1, 0] }),
          transform: [{ translateX: ip(s, 0, -220) }, { translateY: ip(s, 0, 110) }, { rotate: '-27deg' }] }} />
      ))}
      <Animated.View style={{ position: 'absolute', left: W / 2 - 60, top: 250, width: 120, height: 120, borderRadius: 60,
        borderWidth: 3, borderColor: '#5aa8ff', opacity: ip(ring, 0.8, 0), transform: [{ scale: ip(ring, 0.5, 3.2) }] }} />
      <Animated.View style={{ position: 'absolute', top: 205, left: 0, right: 0, alignItems: 'center', transform: [{ scale: ip(pulse, 1, 1.12) }] }}>
        <View style={{ width: D, height: D }}>
          {FI.map((f, i) => <Animated.Image key={'f' + i} source={f} style={[im, { opacity: F[i] }]} />)}
          <Animated.Image source={FA} style={[im, { opacity: fa }]} />
          <Animated.Image source={RF[0]} style={[im, { opacity: op(0, 0.25, 0.5) }]} />
          <Animated.Image source={RF[1]} style={[im, { opacity: op(0.25, 0.5, 0.75) }]} />
          <Animated.Image source={RF[2]} style={[im, { opacity: op(0.5, 0.75, 1) }]} />
        </View>
      </Animated.View>
    </View>
  );
}
