import React from 'react';
import { Dimensions, Pressable, Text, View } from 'react-native';
const W = Dimensions.get('window').width;
const H = W * 1672 / 941;
type P = { mic: boolean; onPress: () => void };
export function EnDirect({ mic, onPress }: P) {
  const bg = mic ? '#E8421A' : '#3A1D0C';
  const pos = { position: 'absolute' as const, left: W * 0.14, top: H * 0.36, alignItems: 'center' as const };
  const rond = { width: 66, height: 66, borderRadius: 33, backgroundColor: bg, borderWidth: 3, borderColor: '#E8A91C', alignItems: 'center' as const, justifyContent: 'center' as const };
  return (
    <View style={pos}>
      <Pressable onPress={onPress} style={rond}><Text style={{ fontSize: 28 }}>{mic ? '🎙' : '🔇'}</Text></Pressable>
      <Text style={{ color: '#FFE9D0', fontWeight: '700', marginTop: 2, fontSize: 12 }}>{mic ? 'EN DIRECT' : 'MICRO COUPÉ'}</Text>
    </View>
  );
}
