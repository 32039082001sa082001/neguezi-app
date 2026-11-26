import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Pressable } from 'react-native';
const W = Dimensions.get('window').width;
const H = W * 1672 / 941;
type P = { on: boolean; onPress: () => void };
export function EcranCoeur({ on, onPress }: P) {
  const v = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (!on) { v.setValue(1); return undefined; }
    const a = Animated.loop(Animated.sequence([
      Animated.timing(v, { toValue: 1.05, duration: 200, useNativeDriver: true }),
      Animated.timing(v, { toValue: 1, duration: 280, useNativeDriver: true }),
    ]));
    a.start();
    return () => a.stop();
  }, [on]);
  const st = { width: W * 0.6, height: W * 0.3375, opacity: on ? 1 : 0.55, transform: [{ scale: v }] };
  const pos = { position: 'absolute' as const, left: W * 0.2, top: H * 0.08 };
  return (
    <Pressable onPress={onPress} style={pos}>
      <Animated.Image source={require('../assets/salle/coeur.png')} style={st} />
    </Pressable>
  );
}
