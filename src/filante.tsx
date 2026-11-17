import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Dimensions } from 'react-native';
const { width: W, height: H } = Dimensions.get('window');
const nat = { useNativeDriver: true };
function Etoile({ t, x, y }: { t: any; x: number; y: number }) {
  const op = t.interpolate({ inputRange: [0, 0.1, 0.75, 1], outputRange: [0, 1, 1, 0] });
  const tx = t.interpolate({ inputRange: [0, 1], outputRange: [0, -W * 0.55] });
  const ty = t.interpolate({ inputRange: [0, 1], outputRange: [0, W * 0.2] });
  return (
    <Animated.View pointerEvents="none" style={{ position: 'absolute', left: x, top: y, width: 100, height: 8, opacity: op, transform: [{ translateX: tx }, { translateY: ty }, { rotate: '-20deg' }] }}>
      <Animated.View style={{ position: 'absolute', left: 0, top: 3, width: 100, height: 2, borderRadius: 1, backgroundColor: '#4D8DFF', opacity: 0.18 }} />
      <Animated.View style={{ position: 'absolute', left: 0, top: 3, width: 60, height: 2, borderRadius: 1, backgroundColor: '#8FC0FF', opacity: 0.4 }} />
      <Animated.View style={{ position: 'absolute', left: 0, top: 3, width: 28, height: 2, borderRadius: 1, backgroundColor: '#DDEEFF', opacity: 0.8 }} />
      <Animated.View style={{ position: 'absolute', left: -2, top: 0, width: 8, height: 8, borderRadius: 4, backgroundColor: '#EAF4FF', opacity: 0.95 }} />
    </Animated.View>
  );
}
export function Filante() {
  const a = useRef(new Animated.Value(0)).current;
  const b = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const run = (v: any) => Animated.sequence([Animated.timing(v, { toValue: 1, duration: 1100, easing: Easing.linear, ...nat }), Animated.timing(v, { toValue: 0, duration: 0, ...nat })]);
    Animated.loop(Animated.sequence([Animated.delay(4000), run(a), Animated.delay(7000), run(b), Animated.delay(9000)])).start();
  }, []);
  return (
    <>
      <Etoile t={a} x={W * 0.92} y={H * 0.07} />
      <Etoile t={b} x={W * 0.65} y={H * 0.17} />
    </>
  );
}
