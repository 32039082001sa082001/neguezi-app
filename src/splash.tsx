import React, { useEffect, useRef } from 'react';
import { View, Animated, Dimensions } from 'react-native';
const { width: W } = Dimensions.get('window');
export function SplashNote() {
  const op = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.sequence([
      Animated.timing(op, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.delay(3100),
      Animated.timing(op, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);
  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#02040F', alignItems: 'center', justifyContent: 'center' }}>
      <Animated.Image source={require('../assets/splash-logo.jpg')} resizeMode="contain" style={{ width: W, height: W, opacity: op }} />
    </View>
  );
}
