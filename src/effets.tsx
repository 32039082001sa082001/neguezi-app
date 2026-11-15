import React, { useRef } from 'react';
import { View, Text, Pressable } from 'react-native';
import { setTempo } from './studio';
const TXT = '#FFE9D0';
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
async function ramp(a: number, b: number, ms: number) {
  const n = 12;
  for (let i = 1; i <= n; i++) { setTempo(a + ((b - a) * i) / n); await wait(ms / n); }
}
const LISTE = ['Frein disque', 'Hachée', 'Drop', 'Montée'];
export function Effets({ onDrop }: { onDrop?: () => void }) {
  const busy = useRef(false);
  const go = async (k: string) => {
    if (busy.current) return;
    busy.current = true;
    try {
      if (k === 'Frein disque') { await ramp(1, 0.3, 800); await wait(150); await ramp(0.3, 1, 400); }
      else if (k === 'Hachée') { for (let i = 0; i < 4; i++) { setTempo(0.5); await wait(150); setTempo(1); await wait(150); } }
      else if (k === 'Drop') { onDrop && onDrop(); setTempo(0.4); await wait(1000); setTempo(1); }
      else if (k === 'Montée') { await ramp(1, 1.5, 2000); await wait(300); setTempo(1); }
    } catch (e) {}
    setTempo(1);
    busy.current = false;
  };
  return (
    <View style={{ flexDirection: 'row', gap: 8, marginHorizontal: 16 }}>
      {LISTE.map((k) => (
        <Pressable key={k} onPress={() => go(k)} style={{ flex: 1, alignItems: 'center', padding: 10, borderRadius: 12, backgroundColor: 'rgba(40,16,4,0.78)', borderWidth: 1, borderColor: '#C0651A' }}>
          <Text style={{ color: TXT, fontWeight: '600', fontSize: 12 }}>{k}</Text>
        </Pressable>
      ))}
    </View>
  );
}
