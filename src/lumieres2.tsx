import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing } from 'react-native';

// Reglages estimes (x en fraction de la largeur), a ajuster apres capture
const FAISCEAUX = [
  { x: 0.11, c: '#FF7A1A', a: -8, d: 3400 },
  { x: 0.35, c: '#FFB020', a: 10, d: 2600 },
  { x: 0.42, c: '#FFE45C', a: -12, d: 3000 },
  { x: 0.58, c: '#FFE45C', a: 12, d: 2800 },
  { x: 0.64, c: '#FFB020', a: -10, d: 2500 },
  { x: 0.88, c: '#FF7A1A', a: 8, d: 3200 },
];
const Y = 0.09;
const COEUR = { x: 0.5, y: 0.3 };

type F = { x: number; c: string; a: number; d: number };

function Faisceau({ W, H, f, pulse }: { W: number; H: number; f: F; pulse: Animated.Value }) {
  const s = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const l = Animated.loop(Animated.sequence([
      Animated.timing(s, { toValue: 1, duration: f.d, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(s, { toValue: 0, duration: f.d, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ]));
    l.start();
    return () => l.stop();
  }, []);
  const L = H * 0.55;
  const bw = W * 0.34;
  const rot = s.interpolate({ inputRange: [0, 1], outputRange: [(f.a - 30) + 'deg', (f.a + 30) + 'deg'] });
  const op = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.14, 0.34] });
  return (
    <Animated.View style={{ position: 'absolute', left: f.x * W - bw / 2, top: Y * H, width: bw, height: L, opacity: op, transform: [{ translateY: -L / 2 }, { rotate: rot }, { translateY: L / 2 }] }}>
      <View style={{ width: 0, height: 0, borderLeftWidth: bw / 2, borderRightWidth: bw / 2, borderBottomWidth: L, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: f.c }} />
    </Animated.View>
  );
}

function Onde({ W, H, delai }: { W: number; H: number; delai: number }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    let l: Animated.CompositeAnimation | null = null;
    const t = setTimeout(() => {
      l = Animated.loop(Animated.timing(v, { toValue: 1, duration: 1800, easing: Easing.out(Easing.quad), useNativeDriver: true }));
      l.start();
    }, delai);
    return () => { clearTimeout(t); if (l) l.stop(); };
  }, []);
  const D = W * 0.5;
  const sc = v.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1.5] });
  const op = v.interpolate({ inputRange: [0, 1], outputRange: [0.6, 0] });
  return (
    <Animated.View style={{ position: 'absolute', left: COEUR.x * W - D / 2, top: COEUR.y * H - D / 2, width: D, height: D, borderRadius: D / 2, borderWidth: 3, borderColor: '#FFB020', opacity: op, transform: [{ scale: sc }] }} />
  );
}

export default function Lumieres2({ W, H }: { W: number; H: number }) {
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const l = Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1, duration: 200, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 0, duration: 280, easing: Easing.in(Easing.quad), useNativeDriver: true }),
    ]));
    l.start();
    return () => l.stop();
  }, []);
  const D = W * 0.42;
  const sc = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1.12] });
  const op = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.05, 0.22] });
  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: 0, top: 0, width: W, height: H }}>
      {FAISCEAUX.map((f, i) => <Faisceau key={i} W={W} H={H} f={f} pulse={pulse} />)}
      <Animated.View style={{ position: 'absolute', left: COEUR.x * W - D / 2, top: COEUR.y * H - D / 2, width: D, height: D, borderRadius: D / 2, backgroundColor: '#FF9A1F', opacity: op, transform: [{ scale: sc }] }} />
      <Onde W={W} H={H} delai={0} />
      <Onde W={W} H={H} delai={600} />
      <Onde W={W} H={H} delai={1200} />
    </View>
  );
}
