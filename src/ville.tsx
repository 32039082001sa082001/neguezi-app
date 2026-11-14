import React from 'react';
import { View, Text, ImageBackground, ScrollView, Pressable } from 'react-native';
import { TRACKS } from './theme';

const F = { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 } as const;
export function VilleSons({ cur, onPick, onAsk }: any) {
  const t = TRACKS[cur];
  return (
    <ImageBackground source={require('../assets/ville.png')} resizeMode="cover" style={F}>
      <View style={{ position: 'absolute', top: 14, left: 20 }}><Text style={{ color: '#EAF1FF', fontSize: 38 }}>Mes sons</Text><Pressable onPress={onAsk} style={{ alignSelf: 'flex-start', marginTop: 10, paddingVertical: 8, paddingHorizontal: 14, borderRadius: 16, borderWidth: 1, borderColor: '#4D8DFF', backgroundColor: 'rgba(45,107,255,0.25)' }}><Text style={{ color: '#EAF1FF', fontSize: 14 }}>Charger ma musique</Text></Pressable></View>
      <View style={{ position: 'absolute', top: '24%', left: 16, right: 16, alignItems: 'center' }}>
        <Text numberOfLines={2} style={{ color: '#EAF1FF', fontSize: 26, textAlign: 'center' }}>{t ? t.t : ''}</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}
        style={{ position: 'absolute', left: 0, right: 0, bottom: 240 }}
        contentContainerStyle={{ paddingHorizontal: 16 }}>
        {TRACKS.map((x: any, i: number) => (
          <Pressable key={x.t + i} onPress={() => onPick(i)}
            style={{ marginRight: 12, paddingVertical: 8, paddingHorizontal: 14, borderRadius: 16, borderWidth: 1,
              borderColor: i === cur ? '#4D8DFF' : '#1B3A8A', backgroundColor: 'rgba(5,10,26,0.7)' }}>
            <Text numberOfLines={1} style={{ color: i === cur ? '#EAF1FF' : '#8899BB', fontSize: 14, maxWidth: 160 }}>{x.t}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </ImageBackground>
  );
}
