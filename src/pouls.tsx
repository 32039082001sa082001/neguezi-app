import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Rect } from 'react-native-svg';
import { getLevel } from './studio';

export function Pouls({ playing }: any) {
  const o = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!playing) { o.setValue(0); return; }
    const id = setInterval(() => {
      try { Animated.timing(o, { toValue: Math.min(1, getLevel() * 2.2), duration: 90, useNativeDriver: true }).start(); } catch (e) {}
    }, 100);
    return () => clearInterval(id);
  }, [playing]);
  return (
    <Animated.View pointerEvents="none" style={{ position: 'absolute', left: '50%', marginLeft: -130, top: '16%', opacity: o }}>
      <Svg width={260} height={260}>
        <Defs><RadialGradient id="pl" cx="50%" cy="50%" r="50%"><Stop offset="0" stopColor="#4D8DFF" stopOpacity="0.85" /><Stop offset="1" stopColor="#2D6BFF" stopOpacity="0" /></RadialGradient></Defs>
        <Rect x="0" y="0" width="260" height="260" fill="url(#pl)" />
      </Svg>
    </Animated.View>
  );
}
