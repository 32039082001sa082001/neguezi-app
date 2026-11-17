import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing } from 'react-native';
const nat = { useNativeDriver: true };
export function SplashNote() {
  const fade = useRef(new Animated.Value(0)).current;
  const breath = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 600, easing: Easing.out(Easing.cubic), ...nat }).start();
    Animated.loop(Animated.sequence([
      Animated.timing(breath, { toValue: 1, duration: 1600, easing: Easing.inOut(Easing.sin), ...nat }),
      Animated.timing(breath, { toValue: 0, duration: 1600, easing: Easing.inOut(Easing.sin), ...nat }),
    ])).start();
  }, []);
  const fill: any = { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 };
  return (
    <View style={[fill, { backgroundColor: '#000' }]}>
      <Animated.Image
        source={require('../assets/splash-brume.jpg')}
        resizeMode="cover"
        style={[fill, { opacity: fade, transform: [{ scale: breath.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] }) }] }]}
      />
      <Animated.View style={[fill, { backgroundColor: '#2F6BFF', opacity: breath.interpolate({ inputRange: [0, 1], outputRange: [0, 0.14] }) }]} />
    </View>
  );
}
