import React from 'react';
import { Dimensions, Image, Pressable, Text } from 'react-native';
const W = Dimensions.get('window').width;
const H = W * 1672 / 941;
const NOMS = ['Lasers', 'Flash', 'Braises', 'Bogolan'];
const COL = ['#2EC24A', '#FFE9D0', '#E8421A', '#E8A91C'];
type P = { fx: string[]; setFx: (f: string[]) => void };
export function Projecteurs({ fx, setFx }: P) {
  const tog = (k: string) => setFx(fx.indexOf(k) >= 0 ? fx.filter((x) => x !== k) : [...fx, k]);
  return (
    <>
      {NOMS.map((k, i) => {
        const on = fx.indexOf(k) >= 0;
        const pos = { position: 'absolute' as const, width: W * 0.11, alignItems: 'center' as const, left: i < 2 ? W * 0.09 : W * 0.8, top: H * (i % 2 === 0 ? 0.115 : 0.205) };
        return (
          <Pressable key={k} onPress={() => tog(k)} style={pos}>
            <Image source={require('../assets/salle/projo.png')} style={{ width: W * 0.11, height: W * 0.11, opacity: on ? 1 : 0.45 }} />
            <Text style={{ color: on ? COL[i] : '#FFE9D0', fontSize: 10, fontWeight: '700' }}>{k}</Text>
          </Pressable>
        );
      })}
    </>
  );
}
