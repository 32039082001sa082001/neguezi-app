import React, { useEffect, useRef } from 'react';
import { View, Text, Pressable, Animated, Easing } from 'react-native';
import { C } from './theme';

export function Logo({ size = 120 }: { size?: number }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, borderWidth: 1.5, borderColor: C.copper, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ position: 'absolute', width: size * 0.74, height: size * 0.74, borderRadius: size * 0.37, borderWidth: 1, borderColor: C.line }} />
      <Text style={{ fontFamily: 'serif', fontSize: size * 0.5, color: C.copper }}>N</Text>
    </View>
  );
}

export function Pill({ label, on, onPress }: { label: string; on?: boolean; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: on ? C.copper : 'transparent', borderWidth: 1, borderColor: on ? C.copper : C.line }}>
      <Text style={{ color: on ? C.bg : C.grey, fontSize: 14 }}>{label}</Text>
    </Pressable>
  );
}

export function Cover({ title, size = 48 }: { title: string; size?: number }) {
  const h = title.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const cols = ['#7A2E1D', '#5A2A18', '#8A4A22', '#4A2218'];
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: cols[h % 4], borderWidth: 1, borderColor: C.copper, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: C.cream, fontFamily: 'serif', fontSize: size * 0.4 }}>{title.slice(0, 1)}</Text>
    </View>
  );
}

export function Head({ title, right }: { title: string; right?: React.ReactNode }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
      <Text style={{ color: C.cream, fontSize: 28, fontFamily: 'serif' }}>{title}</Text>
      {right}
    </View>
  );
}

export function Vinyl({ spin, size = 240 }: { spin: boolean; size?: number }) {
  const r = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!spin) { r.stopAnimation(); return; }
    r.setValue(0);
    const a = Animated.loop(Animated.timing(r, { toValue: 1, duration: 2400, easing: Easing.linear, useNativeDriver: true }));
    a.start();
    return () => a.stop();
  }, [spin]);
  const rotate = r.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const ring = (k: number) => ({ position: 'absolute' as const, width: size * k, height: size * k, borderRadius: (size * k) / 2, borderWidth: 1, borderColor: '#3A241C' });
  return (
    <View style={{ width: size + 50, height: size + 10, alignSelf: 'center' }}>
      <Animated.View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: '#140A08', borderWidth: 2, borderColor: C.copper, alignItems: 'center', justifyContent: 'center', transform: [{ rotate }] }}>
        <View style={ring(0.88)} />
        <View style={ring(0.76)} />
        <View style={ring(0.64)} />
        <View style={{ width: size * 0.34, height: size * 0.34, borderRadius: size * 0.17, backgroundColor: C.copper, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontFamily: 'serif', color: C.bg, fontSize: size * 0.14 }}>N</Text>
        </View>
      </Animated.View>
      <View style={{ position: 'absolute', right: 6, top: -4, width: 5, height: size * 0.85, backgroundColor: C.copper, borderRadius: 3, transform: [{ rotate: spin ? '16deg' : '4deg' }] }} />
      <View style={{ position: 'absolute', right: 0, top: -10, width: 18, height: 18, borderRadius: 9, backgroundColor: C.red, borderWidth: 1.5, borderColor: C.copper }} />
    </View>
  );
}
