import React, { useEffect, useRef } from 'react';
import { Animated, Easing, View } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Rect } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';

function boucle(v: Animated.Value, a: number, b: number, ms: number) {
  Animated.loop(Animated.sequence([
    Animated.timing(v, { toValue: b, duration: ms, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    Animated.timing(v, { toValue: a, duration: ms, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
  ])).start();
}
export function Halo({ playing }: any) {
  const o = useRef(new Animated.Value(0.35)).current;
  useEffect(() => { o.stopAnimation(); o.setValue(0.35); boucle(o, 0.35, playing ? 1 : 0.6, playing ? 450 : 1800); }, [playing]);
  return <Animated.View pointerEvents="none" style={{ position: 'absolute', left: '50%', marginLeft: -130, top: '30%', width: 260, height: 260, opacity: o }}>
    <Svg width={260} height={260}><Defs><RadialGradient id="h" cx="50%" cy="50%" r="50%"><Stop offset="0" stopColor="#4D8DFF" stopOpacity="0.55" /><Stop offset="1" stopColor="#4D8DFF" stopOpacity="0" /></RadialGradient></Defs><Rect width={260} height={260} fill="url(#h)" /></Svg>
  </Animated.View>;
}

export function Reflet() {
  const x = useRef(new Animated.Value(-200)).current;
  useEffect(() => { Animated.loop(Animated.timing(x, { toValue: 760, duration: 5000, easing: Easing.linear, useNativeDriver: true })).start(); }, []);
  return <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, top: '81%', height: '13%', overflow: 'hidden' }}>
    <Animated.View style={{ width: 200, height: '100%', transform: [{ translateX: x }] }}>
      <LinearGradient colors={['rgba(77,141,255,0)', 'rgba(77,141,255,0.28)', 'rgba(77,141,255,0)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ flex: 1 }} />
    </Animated.View>
  </View>;
}
