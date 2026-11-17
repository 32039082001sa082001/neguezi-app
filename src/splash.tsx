import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing, Dimensions } from 'react-native';
const { width: W, height: H } = Dimensions.get('window');
const NOM = 'NEGUEZI'.split('');
const nat = { useNativeDriver: true };
export function SplashNote() {
  const note = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;
  const flash = useRef(new Animated.Value(0)).current;
  const line = useRef(new Animated.Value(0)).current;
  const tag = useRef(new Animated.Value(0)).current;
  const L = useRef(NOM.map(() => new Animated.Value(0))).current;
  useEffect(() => {
    Animated.sequence([
      Animated.timing(note, { toValue: 0.25, duration: 120, ...nat }),
      Animated.timing(note, { toValue: 0.05, duration: 90, ...nat }),
      Animated.timing(note, { toValue: 0.7, duration: 140, ...nat }),
      Animated.timing(note, { toValue: 0.3, duration: 100, ...nat }),
      Animated.timing(note, { toValue: 1, duration: 450, easing: Easing.out(Easing.cubic), ...nat }),
    ]).start();
    Animated.sequence([
      Animated.delay(850),
      Animated.timing(flash, { toValue: 1, duration: 60, ...nat }),
      Animated.timing(flash, { toValue: 0, duration: 420, ...nat }),
    ]).start();
    Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1, duration: 700, easing: Easing.inOut(Easing.sin), ...nat }),
      Animated.timing(pulse, { toValue: 0, duration: 700, easing: Easing.inOut(Easing.sin), ...nat }),
    ])).start();
    Animated.sequence([
      Animated.delay(1100),
      Animated.stagger(110, L.map((v) => Animated.timing(v, { toValue: 1, duration: 380, easing: Easing.out(Easing.cubic), ...nat }))),
    ]).start();
    Animated.sequence([Animated.delay(1900), Animated.timing(line, { toValue: 1, duration: 500, easing: Easing.out(Easing.cubic), ...nat })]).start();
    Animated.sequence([Animated.delay(2300), Animated.timing(tag, { toValue: 1, duration: 600, ...nat })]).start();
  }, []);
  const A: any = { position: 'absolute' };
  return (
    <View style={[A, { top: 0, left: 0, right: 0, bottom: 0 }]}>
      <Animated.View style={[A, { left: W * 0.1, top: H * 0.38 - W * 0.4, width: W * 0.8, height: W * 0.8, borderRadius: W * 0.4, backgroundColor: '#2F6BFF',
        opacity: Animated.multiply(note, pulse.interpolate({ inputRange: [0, 1], outputRange: [0.1, 0.3] })) }]} />
      <Animated.Image source={require('../assets/splash-note.png')} resizeMode="contain"
        style={[A, { left: W * 0.05, top: H * 0.38 - W * 0.45, width: W * 0.9, height: W * 0.9, opacity: note,
          transform: [{ scale: Animated.multiply(note.interpolate({ inputRange: [0, 1], outputRange: [0.88, 1] }), pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.03] })) }] }]} />
      <Animated.View style={[A, { top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#9CC4FF', opacity: flash.interpolate({ inputRange: [0, 1], outputRange: [0, 0.22] }) }]} />
      <View style={[A, { left: 0, right: 0, bottom: H * 0.13, flexDirection: 'row', justifyContent: 'center' }]}>
        {NOM.map((c, i) => (
          <Animated.Text key={i} style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 40, color: '#CFE3FF', marginHorizontal: 5,
            textShadowColor: '#2F6BFF', textShadowRadius: 16, textShadowOffset: { width: 0, height: 0 },
            opacity: L[i], transform: [{ translateY: L[i].interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }] }}>{c}</Animated.Text>
        ))}
      </View>
      <Animated.View style={[A, { left: W * 0.3, width: W * 0.4, bottom: H * 0.115, height: 2, backgroundColor: '#4D8DFF', opacity: line, transform: [{ scaleX: line }] }]} />
      <Animated.Text style={[A, { left: 0, right: 0, bottom: H * 0.075, textAlign: 'center', color: '#6F8FC9', fontStyle: 'italic', fontSize: 13, letterSpacing: 1, opacity: tag }]}>la musique avec tes bons amis</Animated.Text>
    </View>
  );
}
