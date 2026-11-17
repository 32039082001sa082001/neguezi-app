import { Animated as AnR, Easing as EaR } from 'react-native';
import { useEffect as ueR, useRef as urR } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Image, Animated, Easing } from 'react-native';
import { getTime, getMeta, isPlaying } from './studio';
import { analyser, statut } from './rythme';

const D = 210;
const NP = 14;
export function Ronds() {
  const pulse = useRef(new Animated.Value(0)).current;
  const flash = useRef(new Animated.Value(0)).current;
  const E = useRef([new Animated.Value(0), new Animated.Value(0), new Animated.Value(0), new Animated.Value(0)]).current;
  const P = useRef(Array.from({ length: NP }, () => ({ v: new Animated.Value(0), x: 3 + Math.random() * 92, s: 2 + Math.random() * 3, d: 7000 + Math.random() * 6000, w: Math.random() * 6000 }))).current;
  const st = useRef<any>({ uri: '', beats: null, done: false, i: 0, last: 0, n: 0, idle: 0 }).current;
  const [, tk] = useState(0);
  useEffect(() => {
    P.forEach((p) => {
      Animated.sequence([
        Animated.delay(p.w),
        Animated.loop(Animated.timing(p.v, { toValue: 1, duration: p.d, easing: Easing.linear, useNativeDriver: true })),
      ]).start();
    });
    const fire = () => {
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 70, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 280, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]).start();
      Animated.sequence([
        Animated.timing(flash, { toValue: 1, duration: 60, useNativeDriver: true }),
        Animated.timing(flash, { toValue: 0, duration: 380, easing: Easing.out(Easing.quad), useNativeDriver: true }),
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
      {P.map((p, k) => (<Animated.View key={'p' + k} style={{ position: 'absolute', left: (p.x + '%') as any, top: 700, width: p.s, height: p.s, borderRadius: p.s / 2, backgroundColor: '#8FBEFF', opacity: p.v.interpolate({ inputRange: [0, 0.2, 0.8, 1], outputRange: [0, 0.9, 0.9, 0] }), transform: [{ translateY: p.v.interpolate({ inputRange: [0, 1], outputRange: [0, -680] }) }] }} />))}
      <Animated.View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#2F6BFF', opacity: flash.interpolate({ inputRange: [0, 1], outputRange: [0, 0.16] }) }} />
      <View style={{ position: 'absolute', top: 205, left: 0, right: 0, alignItems: 'center' }}>
        <View style={{ width: D, height: D, alignItems: 'center', justifyContent: 'center' }}>
          {E.map((e, k) => (<Animated.Image key={k} source={require('../assets/coeur.png')} style={{ position: 'absolute', width: D, height: D, opacity: e.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] }), transform: [{ scale: e.interpolate({ inputRange: [0, 1], outputRange: [1, 1.9] }) }] }} />))}
          <AnR.View pointerEvents="none" style={{ position: 'absolute', width: D, height: D, alignItems: 'center', justifyContent: 'center', transform: [{ scale: sc }] }}>{[1.9, 1.75, 1.6, 1.45, 1.3, 1.18].map((k, i) => (<AnR.View key={i} style={{ position: 'absolute', width: D * k, height: D * k, borderRadius: (D * k) / 2, backgroundColor: '#2F6BFF', opacity: sc.interpolate({ inputRange: [1, 1.12], outputRange: [0.05, 0.12] }) }} />))}</AnR.View><Animated.Image source={require('../assets/coeur.png')} style={{ width: D, height: D, transform: [{ scale: sc }] }} /><Reflet D={D} sc={sc} />
        </View>
      </View>
      <Text style={{ position: 'absolute', top: 432, left: 0, right: 0, textAlign: 'center', color: '#4D8DFF', fontSize: 11, letterSpacing: 6 }}>LES INVINCIBLES{'\n'}{statut()} {getTime().toFixed(1)}</Text>
    </View>
  );
}


function BandeR({ D, x, w, o }: { D: number; x: any; w: number; o: number }) {
  const neg = AnR.multiply(x, -1);
  return (
    <AnR.View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, width: w, height: D, overflow: 'hidden', transform: [{ translateX: x }] }}>
      <AnR.Image source={require('../assets/coeur.png')} style={{ position: 'absolute', top: 0, left: 0, width: D, height: D, tintColor: '#8FC0FF', opacity: o, transform: [{ translateX: neg }] }} />
    </AnR.View>
  );
}

function Reflet({ D, sc }: { D: number; sc: any }) {
  const x = (urR(new AnR.Value(-D * 0.3)) as any).current;
  ueR(() => {
    AnR.loop(AnR.sequence([
      AnR.delay(3200),
      AnR.timing(x, { toValue: D * 1.2, duration: 1000, easing: EaR.inOut(EaR.quad), useNativeDriver: true }),
      AnR.timing(x, { toValue: -D * 0.3, duration: 0, useNativeDriver: true }),
    ])).start();
  }, []);
  return (
    <AnR.View pointerEvents="none" style={{ position: 'absolute', width: D, height: D, transform: [{ scale: sc }] }}>
      <BandeR D={D} x={x} w={D * 0.32} o={0.16} />
      <BandeR D={D} x={x} w={D * 0.1} o={0.42} />
      <Eclair D={D} sc={sc} />
    </AnR.View>
  );
}


function Eclair({ D, sc }: { D: number; sc: any }) {
  const P = [[0.52, 0.15], [0.42, 0.38], [0.58, 0.52], [0.45, 0.72], [0.55, 0.88]];
  const op = sc.interpolate({ inputRange: [1, 1.06, 1.12], outputRange: [0, 0, 1], extrapolate: 'clamp' });
  return (
    <AnR.View pointerEvents="none" style={{ position: 'absolute', width: D, height: D, opacity: op }}>
      {P.slice(1).map((q, i) => {
        const a = P[i];
        const dx = (q[0] - a[0]) * D, dy = (q[1] - a[1]) * D;
        const len = Math.sqrt(dx * dx + dy * dy);
        const cx = ((a[0] + q[0]) / 2) * D, cy = ((a[1] + q[1]) / 2) * D;
        const ang = Math.atan2(dy, dx) + 'rad';
        return (
          <React.Fragment key={i}>
            <View style={{ position: 'absolute', left: cx - len / 2, top: cy - 5, width: len, height: 10, borderRadius: 5, backgroundColor: '#2F6BFF', opacity: 0.3, transform: [{ rotate: ang }] }} />
            <View style={{ position: 'absolute', left: cx - len / 2, top: cy - 1.5, width: len, height: 3, borderRadius: 2, backgroundColor: '#DDEEFF', transform: [{ rotate: ang }] }} />
          </React.Fragment>
        );
      })}
    </AnR.View>
  );
}
