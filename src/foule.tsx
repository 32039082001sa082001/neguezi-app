import React from 'react';
import { View, Text, Image, Dimensions } from 'react-native';
const W = Dimensions.get('window').width;
const H = (W * 1672) / 941;
const TXT = '#FFE9D0';
export function Foule({ noms }: { noms: any[] }) {
  const dj = noms.find((p) => p.dj);
  const aud = noms.filter((p) => !p.dj);
  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: 0, top: H * 0.285, width: W }}>
      <Text style={{ color: TXT, textAlign: 'center', fontWeight: '700', fontSize: 12, letterSpacing: 2 }}>{dj ? 'DJ · ' + dj.nom : 'DJ'}</Text>
      <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 6 }}>
        {[0, 1].map((k) => (
          <View key={k} style={{ alignItems: 'center', opacity: aud[k] ? 1 : 0.3 }}>
            <Text style={{ color: TXT, fontSize: 11, fontWeight: '700', height: 16 }}>{aud[k] ? aud[k].nom : ''}</Text>
            <Image source={require('../assets/salle/foule.png')} style={{ width: W * 0.3, height: W * 0.4 }} />
          </View>
        ))}
      </View>
    </View>
  );
}
