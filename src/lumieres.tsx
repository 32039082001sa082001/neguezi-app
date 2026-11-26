import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing, Dimensions } from 'react-native';
import { getTime, getMeta, isPlaying } from './studio';
import { analyser } from './rythme';
const W = Dimensions.get('window').width;
const H = (W * 1672) / 941;
const nd = { useNativeDriver: true };
const COL = ['#FF9A1F', '#FFD27A', '#FFE9D0', '#FF9A1F', '#FFD27A'];
const ang = [-38, -19, 0, 19, 38];
export function Lumieres({ fx }: { fx: string[] }) {
  const beat = useRef(new Animated.Value(0)).current;
  const bass = useRef(new Animated.Value(0)).current;
  const st = useRef<any>({ uri: '', beats: null, i: 0, last: 0 }).current;
  const on = (k: string) => fx.indexOf(k) >= 0;
  const fire = () => {
    beat.setValue(1);
    Animated.timing(beat, { toValue: 0, duration: 380, easing: Easing.out(Easing.quad), ...nd }).start();
    bass.setValue(1);
    Animated.timing(bass, { toValue: 0, duration: 200, easing: Easing.out(Easing.quad), ...nd }).start();
  };
  useEffect(() => {
    const id = setInterval(() => {
      try {
        const m = getMeta();
        if (m && m.uri && m.uri !== st.uri) {
          st.uri = m.uri; st.beats = null; st.i = 0; st.last = 0;
          const u = m.uri;
          analyser(u, m.d).then((b: any) => { if (st.uri === u) st.beats = b && b.length ? b : null; });
        }
        if (!isPlaying() || !st.beats) return;
        const t = getTime() + 0.05;
        const b = st.beats;
        if (t < st.last - 0.5 || t > st.last + 2) {
          let k = 0; while (k < b.length && b[k] < t - 0.05) k++; st.i = k;
        }
        st.last = t;
        while (st.i < b.length && b[st.i] <= t) { if (b[st.i] > t - 0.2) fire(); st.i++; }
      } catch (e) {}
    }, 40);
    return () => clearInterval(id);
  }, []);
  const sw = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const a = Animated.loop(Animated.sequence([
      Animated.timing(sw, { toValue: 1, duration: 2600, easing: Easing.inOut(Easing.sin), ...nd }),
      Animated.timing(sw, { toValue: 0, duration: 2600, easing: Easing.inOut(Easing.sin), ...nd }),
    ]));
    a.start();
    return () => a.stop();
  }, []);
  const lasers = on('Lasers') ? (
    <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, width: W, height: H * 0.5 }}>
      {ang.map((a, i) => (
        <Animated.View key={i} style={{ position: 'absolute', left: W / 2 - 2, top: H * 0.1, width: 4, height: H * 0.45, backgroundColor: COL[i], borderRadius: 2, opacity: beat.interpolate({ inputRange: [0, 1], outputRange: [0.25, 0.95] }), transform: [{ translateY: H * 0.225 }, { rotate: sw.interpolate({ inputRange: [0, 1], outputRange: [(a - 14) + 'deg', (a + 14) + 'deg'] }) }, { translateY: -H * 0.225 }] }} />
      ))}
    </View>
  ) : null;
  const flash = on('Flash') ? (
    <Animated.View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, width: W, height: H * 0.5, backgroundColor: '#FFE9D0', opacity: bass.interpolate({ inputRange: [0, 1], outputRange: [0, 0.28] }) }} />
  ) : null;
  const up = useRef(Array.from({ length: 12 }, () => new Animated.Value(0))).current;
  useEffect(() => {
    const a = up.map((v, i) => Animated.loop(Animated.sequence([
      Animated.delay(i * 330),
      Animated.timing(v, { toValue: 1, duration: 3200 + (i % 4) * 500, easing: Easing.out(Easing.quad), ...nd }),
      Animated.timing(v, { toValue: 0, duration: 0, ...nd }),
    ])));
    a.forEach((x) => x.start());
    return () => a.forEach((x) => x.stop());
  }, []);
  const braises = on('Braises') ? (
    <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, width: W, height: H * 0.5 }}>
      {up.map((v, i) => (
        <Animated.View key={i} style={{ position: 'absolute', left: (W * (i + 0.5)) / 12, top: H * 0.48, width: 5, height: 5, borderRadius: 3, backgroundColor: i % 2 ? '#FFD27A' : '#FF9A1F', opacity: v.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0, 1, 0] }), transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [0, -H * 0.4] }) }, { translateX: v.interpolate({ inputRange: [0, 1], outputRange: [0, (i % 2 ? 18 : -18)] }) }] }} />
      ))}
    </View>
  ) : null;
  const bog = on('Bogolan') ? (
    <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, width: W, height: H * 0.5 }}>
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <React.Fragment key={i}>
          <Animated.View style={{ position: 'absolute', left: 6, top: 20 + i * (H * 0.06), width: 10, height: 10, backgroundColor: i % 2 ? '#C0651A' : '#FFD27A', transform: [{ rotate: '45deg' }], opacity: beat.interpolate({ inputRange: [0, 1], outputRange: [0.12, 1] }) }} />
          <Animated.View style={{ position: 'absolute', right: 6, top: 20 + i * (H * 0.06), width: 10, height: 10, backgroundColor: i % 2 ? '#FFD27A' : '#C0651A', transform: [{ rotate: '45deg' }], opacity: beat.interpolate({ inputRange: [0, 1], outputRange: [0.12, 1] }) }} />
        </React.Fragment>
      ))}
    </View>
  ) : null;
  return (
    <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, width: W, height: H * 0.5 }}>
      <Animated.Image source={require('../assets/salle/bogolan.png')} style={{ position: 'absolute', top: H * 0.05, left: 0, width: W * 0.1, height: W * 0.3, opacity: on('Bogolan') ? beat.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }) : 0.3 }} /><Animated.Image source={require('../assets/salle/bogolan.png')} style={{ position: 'absolute', top: H * 0.05, right: 0, width: W * 0.1, height: W * 0.3, opacity: on('Bogolan') ? beat.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }) : 0.3 }} /><Animated.Image source={require('../assets/salle/enceinte.png')} style={{ position: 'absolute', top: H * 0.29, left: 0, width: W * 0.13, height: W * 0.173, transform: [{ scale: bass.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] }) }] }} /><Animated.Image source={require('../assets/salle/enceinte.png')} style={{ position: 'absolute', top: H * 0.29, right: 0, width: W * 0.13, height: W * 0.173, transform: [{ scale: bass.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] }) }] }} />{flash}{lasers}{braises}{bog}
    </View>
  );
}
