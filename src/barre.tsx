import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Icone } from './icones';
export function BarreVille({ tabs, active, go }: any) {
  const box = { flexDirection: 'row', marginHorizontal: 12, marginBottom: 14, paddingVertical: 10, borderRadius: 26, borderWidth: 1, borderColor: '#1B3A8A' } as const;
  return <LinearGradient colors={['#0B1533', '#050A1A']} style={box}>
    {tabs.map(([k, l]: string[]) => (
      <Pressable key={k} onPress={() => go(k)} style={{ flex: 1, alignItems: 'center' }}>
        <View style={{ paddingHorizontal: 16, paddingVertical: 6, borderRadius: 16, backgroundColor: active === k ? 'rgba(45,107,255,0.22)' : 'transparent' }}><Icone k={k} on={active === k} /></View>
        <Text style={{ color: active === k ? '#EAF1FF' : '#8899BB', fontSize: 12, marginTop: 2 }}>{l}</Text>
      </Pressable>
    ))}
  </LinearGradient>;
}
