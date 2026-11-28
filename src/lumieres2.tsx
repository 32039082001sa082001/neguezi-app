import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { getTime, getMeta, isPlaying } from './studio';
import { analyser } from './rythme';

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
      <Coeur W={W} H={H} />
    </View>
  );
}


export function Fond({ W, H }: { W: number; H: number }) {
  const z = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const l = Animated.loop(Animated.sequence([
      Animated.timing(z, { toValue: 1, duration: 200, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(z, { toValue: 0, duration: 280, easing: Easing.in(Easing.quad), useNativeDriver: true }),
    ]));
    l.start();
    return () => l.stop();
  }, []);
  const sc = z.interpolate({ inputRange: [0, 1], outputRange: [1, 1.012] });
  return <Animated.Image source={require('../assets/salle2/fond.jpg')} style={{ position: 'absolute', top: 0, left: 0, width: W, height: H, transform: [{ scale: sc }] }} />;
}

function Point({ x, y, d, big }: { x: number; y: number; d: number; big: boolean }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    let l: Animated.CompositeAnimation | null = null;
    const t = setTimeout(() => {
      l = Animated.loop(Animated.sequence([
        Animated.timing(v, { toValue: 1, duration: 180, useNativeDriver: true }),
        Animated.timing(v, { toValue: 0, duration: 900, useNativeDriver: true }),
      ]));
      l.start();
    }, d);
    return () => { clearTimeout(t); if (l) l.stop(); };
  }, []);
  const op = v.interpolate({ inputRange: [0, 1], outputRange: big ? [0.5, 1] : [0.2, 1] });
  const s = big ? 11 : 7;
  return <Animated.View style={{ position: 'absolute', left: x - s / 2, top: y - s / 2, width: s, height: s, borderRadius: s / 2, backgroundColor: '#FFC24A', opacity: op }} />;
}

function Braise({ W, H, i }: { W: number; H: number; i: number }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    let l: Animated.CompositeAnimation | null = null;
    const t = setTimeout(() => {
      l = Animated.loop(Animated.timing(v, { toValue: 1, duration: 2600 + (i % 4) * 500, easing: Easing.out(Easing.quad), useNativeDriver: true }));
      l.start();
    }, i * 260);
    return () => { clearTimeout(t); if (l) l.stop(); };
  }, []);
  const ty = v.interpolate({ inputRange: [0, 1], outputRange: [0, -H * 0.45] });
  const op = v.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0, 0.9, 0] });
  return <Animated.View style={{ position: 'absolute', left: ((i * 0.137) % 1) * W, top: H * 0.82, width: 5, height: 5, borderRadius: 3, backgroundColor: '#FF8A1F', opacity: op, transform: [{ translateY: ty }] }} />;
}

function Laser({ W, H, x, c, a, d }: { W: number; H: number; x: number; c: string; a: number; d: number }) {
  const s = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const l = Animated.loop(Animated.sequence([
      Animated.timing(s, { toValue: 1, duration: d, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(s, { toValue: 0, duration: d, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ]));
    l.start();
    return () => l.stop();
  }, []);
  const L = H * 0.6;
  const rot = s.interpolate({ inputRange: [0, 1], outputRange: [(a - 35) + 'deg', (a + 35) + 'deg'] });
  return (
    <Animated.View style={{ position: 'absolute', left: x * W - 1.5, top: 0.09 * H, width: 3, height: L, backgroundColor: c, opacity: 0.75, transform: [{ translateY: -L / 2 }, { rotate: rot }, { translateY: L / 2 }] }} />
  );
}

function Eclair({ W, H }: { W: number; H: number }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const l = Animated.loop(Animated.sequence([
      Animated.timing(v, { toValue: 1, duration: 60, useNativeDriver: true }),
      Animated.timing(v, { toValue: 0, duration: 140, useNativeDriver: true }),
      Animated.delay(280),
    ]));
    l.start();
    return () => l.stop();
  }, []);
  const op = v.interpolate({ inputRange: [0, 1], outputRange: [0, 0.35] });
  return <Animated.View style={{ position: 'absolute', left: 0, top: 0, width: W, height: H, backgroundColor: '#FFE9A8', opacity: op }} />;
}

export function Dessus({ W, H, TH, fx }: { W: number; H: number; TH: number; fx: string[] }) {
  const on = (k: string) => fx.indexOf(k) >= 0;
  const h = 0.8 * TH;
  const top = H - h;
  const y0 = top + 0.5 * h;
  const y1 = top + 0.92 * h;
  const xs = [0.1 * W + 0.065 * 0.8 * W, 0.1 * W + 0.935 * 0.8 * W];
  const idx = [0, 1, 2, 3, 4, 5];
  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: 0, top: 0, width: W, height: H, zIndex: 20 }}>
      {xs.map((x, k) => (
        <React.Fragment key={k}>
          {on('Bogolan') ? <View style={{ position: 'absolute', left: x - 1.5, top: y0, width: 3, height: y1 - y0, backgroundColor: '#FF9A1F', opacity: 0.6 }} /> : null}
          {idx.map((i) => <Point key={i} x={x} y={y0 + ((y1 - y0) * i) / 5} d={i * 150} big={on('Bogolan')} />)}
        </React.Fragment>
      ))}
      {on('Flash') ? <Eclair W={W} H={H} /> : null}
      {on('Lasers') ? (
        <>
          <Laser W={W} H={H} x={0.2} c="#47FF6A" a={-10} d={1900} />
          <Laser W={W} H={H} x={0.4} c="#FF4A2A" a={12} d={2300} />
          <Laser W={W} H={H} x={0.6} c="#47FF6A" a={-12} d={2100} />
          <Laser W={W} H={H} x={0.8} c="#FF4A2A" a={10} d={1700} />
        </>
      ) : null}
      {on('Braises') ? [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => <Braise key={i} W={W} H={H} i={i} />) : null}
    </View>
  );
}


const HEART = 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z';
const ST: { uri: string; beats: number[] | null; i: number; last: number } = { uri: '', beats: null, i: 0, last: -1 };

function Coeur({ W, H }: { W: number; H: number }) {
  const S = W * 0.218;
  const Hh = S * 0.9175;
  const cx = 0.503 * W;
  const cy = 0.295 * H;
  const vagues = useRef([0, 1, 2].map(() => new Animated.Value(0))).current;
  const k = useRef(new Animated.Value(0)).current;
  const n = useRef(0);
  useEffect(() => {
    const tir = () => {
      const w = vagues[n.current % 3];
      n.current += 1;
      w.setValue(0);
      Animated.timing(w, { toValue: 1, duration: 800, easing: Easing.out(Easing.quad), useNativeDriver: true }).start();
      k.setValue(1);
      Animated.timing(k, { toValue: 0, duration: 260, easing: Easing.out(Easing.quad), useNativeDriver: true }).start();
    };
    let lastFix = 0;
    const id = setInterval(() => {
      try {
        const m: any = getMeta();
        if (m && m.uri && m.uri !== ST.uri) {
          ST.uri = m.uri; ST.beats = null; ST.i = 0; ST.last = -1;
          const u = m.uri;
          analyser(u, m.d).then((b: any) => { if (ST.uri === u) ST.beats = b && b.length ? b : null; }).catch(() => {});
        }
        if (isPlaying() && ST.beats) {
          const t = getTime() + 0.05;
          const b = ST.beats;
          if (ST.i > 0 && b[ST.i - 1] > t) ST.i = 0;
          let lb = -1;
          while (ST.i < b.length && b[ST.i] <= t) { lb = b[ST.i]; ST.i++; }
          if (lb >= 0 && lb !== ST.last && t - lb < 0.25) { ST.last = lb; tir(); }
          return;
        }
      } catch (e) {}
      const now = Date.now();
      if (now - lastFix >= 480) { lastFix = now; tir(); }
    }, 40);
    return () => clearInterval(id);
  }, []);
  const mk = (w: Animated.Value, i: number) => {
    const sc = w.interpolate({ inputRange: [0, 1], outputRange: [1, 2.2] });
    const op = w.interpolate({ inputRange: [0, 0.1, 1], outputRange: [0, 0.9, 0] });
    return (
      <Animated.View key={i} style={{ position: 'absolute', left: cx - S / 2, top: cy - Hh / 2, width: S, height: Hh, opacity: op, transform: [{ scale: sc }] }}>
        <Svg width={S} height={Hh} viewBox="2 3 20 18.35"><Path d={HEART} fill="none" stroke="#FFC24A" strokeWidth={0.5} /></Svg>
      </Animated.View>
    );
  };
  const kop = k.interpolate({ inputRange: [0, 1], outputRange: [0, 0.75] });
  const ksc = k.interpolate({ inputRange: [0, 1], outputRange: [1, 1.1] });
  return (
    <>
      {vagues.map(mk)}
      <Animated.View style={{ position: 'absolute', left: cx - S / 2, top: cy - Hh / 2, width: S, height: Hh, opacity: kop, transform: [{ scale: ksc }] }}>
        <Svg width={S} height={Hh} viewBox="2 3 20 18.35"><Path d={HEART} fill="none" stroke="#FFE09A" strokeWidth={1.1} /></Svg>
      </Animated.View>
    </>
  );
}
