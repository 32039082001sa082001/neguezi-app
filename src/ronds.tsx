import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Image, Animated, Easing } from 'react-native';
import { getTime, getMeta, isPlaying } from './studio';
import { analyser, statut } from './rythme';

const D = 210;
export function Ronds() {
  const pulse = useRef(new Animated.Value(0)).current;
  const E = useRef([new Animated.Value(0), new Animated.Value(0), new Animated.Value(0), new Animated.Value(0)]).current;
  const st = useRef<any>({ uri: '', beats: null, done: false, i: 0, last: 0, n: 0, idle: 0 }).current;
  const [, tk] = useState(0);
  useEffect(() => {
    const fire = () => {
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 70, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 280, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]).start();
      const e = E[st.n % 4]; st.n++;
      e.setValue(0);
      Animated.timing(e, { toValue: 1, duration: 950, easing: Easing.out(Easing.quad), useNativeDriver: true }).start();
    };
    const id = setInterval(() => {
      try {
        const m = getMeta();
        if (m && m.uri && m.uri !== st.uri) {
          st.uri = m.uri; st.beats = null; st.done = false; st.i = 0; st.last = 0;
          const u = m.uri;
          analyser(u, m.d).then((b: any) => { if (st.uri === u) { st.beats = b && b.length ? b : null; st.done = true; } }).catch(() => { if (st.uri === u) st.done = true; });
        }
        if (!isPlaying()) return;
        if (!st.beats) {
          if (st.done) { const now = Date.now(); if (now - st.idle > 900) { st.idle = now; fire(); } }
          return;
        }
        const t = getTime() + 0.05;
        const b = st.beats;
        if (t < st.last - 0.5 || t > st.last + 2) {
          let k = 0; while (k < b.length && b[k] < t - 0.05) k++; st.i = k;
        }
        st.last = t;
        while (st.i < b.length && b[st.i] <= t) { if (b[st.i] > t - 0.2) fire(); st.i++; }
      } catch (e) {}
    }, 40);
    const id2 = setInterval(() => tk((x: number) => x + 1), 1000);
    return () => { clearInterval(id); clearInterval(id2); };
  }, []);
  const sc = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] });
  return (
    <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#050A1A' }}>
      <Image source={require('../assets/fond.png')} resizeMode="cover" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' }} />
      <View style={{ position: 'absolute', top: 205, left: 0, right: 0, alignItems: 'center' }}>
        <View style={{ width: D, height: D, alignItems: 'center', justifyContent: 'center' }}>
          {E.map((e, k) => (<Animated.Image key={k} source={require('../assets/coeur.png')} style={{ position: 'absolute', width: D, height: D, opacity: e.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] }), transform: [{ scale: e.interpolate({ inputRange: [0, 1], outputRange: [1, 1.9] }) }] }} />))}
          <Animated.Image source={require('../assets/coeur.png')} style={{ width: D, height: D, transform: [{ scale: sc }] }} />
        </View>
      </View>
      <Text style={{ position: 'absolute', top: 432, left: 0, right: 0, textAlign: 'center', color: '#4D8DFF', fontSize: 11, letterSpacing: 6 }}>LES INVINCIBLES{'\n'}{statut()} {getTime().toFixed(1)}</Text>
    </View>
  );
}
