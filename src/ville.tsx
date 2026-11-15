import React from 'react';
import { View, Text, ImageBackground, ScrollView, Pressable, PanResponder, TextInput, BackHandler } from 'react-native';
import { setBass, setConcert } from './studio';
import { Pouls } from './pouls';
import { TRACKS } from './theme';
import { Halo, Reflet } from './anim';

const F = { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 } as const;
export function VilleSons({ cur, onPick, onAsk, playing }: any) {
  const t = TRACKS[cur];
  const [open, setOpen] = React.useState(false); const [q, setQ] = React.useState('');
  const [fxb, setFxb] = React.useState(false); const [fxc, setFxc] = React.useState(false);
  React.useEffect(() => { if (!open) return; const s = BackHandler.addEventListener('hardwareBackPress', () => { setOpen(false); return true; }); return () => s.remove(); }, [open]);
  const R = React.useRef({ cur, onPick }); R.current = { cur, onPick };
  const pan = React.useRef(PanResponder.create({
    onMoveShouldSetPanResponder: (_: any, g: any) => Math.abs(g.dx) > 20 && Math.abs(g.dx) > Math.abs(g.dy) * 1.5,
    onPanResponderRelease: (_: any, g: any) => { const n = TRACKS.length; if (!n) return; const c = R.current.cur;
      if (g.dx < -40) R.current.onPick((c + 1) % n); else if (g.dx > 40) R.current.onPick((c - 1 + n) % n); },
  })).current;
  return (
    <ImageBackground source={require('../assets/ville.png')} resizeMode="cover" style={F} {...pan.panHandlers}>
      <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}><Halo playing={playing} /><Pouls playing={playing} /><Reflet /></View>
      <View style={{ position: 'absolute', top: 14, left: 20 }}><Text style={{ color: '#EAF1FF', fontSize: 38 }}>Mes sons</Text><Pressable onPress={onAsk} style={{ alignSelf: 'flex-start', marginTop: 10, paddingVertical: 8, paddingHorizontal: 14, borderRadius: 16, borderWidth: 1, borderColor: '#4D8DFF', backgroundColor: 'rgba(45,107,255,0.25)' }}><Text style={{ color: '#EAF1FF', fontSize: 14 }}>Charger ma musique</Text></Pressable></View>
      <View style={{ position: 'absolute', top: '24%', left: 16, right: 16, alignItems: 'center' }}>
        <Text numberOfLines={1} style={{ color: '#EAF1FF', fontSize: 26, textAlign: 'center' }}>{t ? t.t : ''}</Text>
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
    <Pressable onPress={() => setOpen(true)} style={{ position: 'absolute', top: 18, right: 16, width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(5,10,26,0.7)', borderWidth: 1, borderColor: '#4D8DFF' }}><Text style={{ color: '#EAF1FF', fontSize: 22 }}>☰</Text></Pressable>
<Pressable onPress={() => { const v = !fxb; setFxb(v); setBass(v); }} style={{ position: 'absolute', top: 76, right: 16, paddingVertical: 8, paddingHorizontal: 14, borderRadius: 18, borderWidth: 1, borderColor: fxb ? '#4D8DFF' : '#1B3A8A', backgroundColor: fxb ? '#2D6BFF' : 'rgba(5,10,26,0.7)' }}><Text style={{ color: '#EAF1FF', fontSize: 13 }}>Basses</Text></Pressable>
<Pressable onPress={() => { const v = !fxc; setFxc(v); setConcert(v); }} style={{ position: 'absolute', top: 120, right: 16, paddingVertical: 8, paddingHorizontal: 14, borderRadius: 18, borderWidth: 1, borderColor: fxc ? '#4D8DFF' : '#1B3A8A', backgroundColor: fxc ? '#2D6BFF' : 'rgba(5,10,26,0.7)' }}><Text style={{ color: '#EAF1FF', fontSize: 13 }}>Concert</Text></Pressable>
{open && (<View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(3,6,16,0.94)', paddingTop: 44, paddingHorizontal: 16, paddingBottom: 16 }}>
<View style={{ flexDirection: 'row', alignItems: 'center' }}>
<TextInput value={q} onChangeText={setQ} placeholder="Rechercher un son" placeholderTextColor="#8899BB" style={{ flex: 1, color: '#EAF1FF', fontSize: 16, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, borderColor: '#1B3A8A', backgroundColor: 'rgba(13,27,60,0.8)' }} />
<Pressable onPress={() => { setOpen(false); setQ(''); }} style={{ marginLeft: 10, padding: 10 }}><Text style={{ color: '#EAF1FF', fontSize: 22 }}>✕</Text></Pressable>
</View>
<Text style={{ color: '#8899BB', marginTop: 12, marginBottom: 6 }}>{TRACKS.length} sons</Text>
<ScrollView keyboardShouldPersistTaps="handled">
{TRACKS.map((x: any, i: number) => (x.t || '').toLowerCase().includes(q.toLowerCase()) ? (
<Pressable key={x.t + i} onPress={() => { onPick(i); setOpen(false); setQ(''); }} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(27,58,138,0.5)' }}>
<View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: '#1B3A8A', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}><Text style={{ color: '#EAF1FF', fontWeight: 'bold' }}>{(x.t || '?').charAt(0).toUpperCase()}</Text></View>
<Text numberOfLines={1} style={{ flex: 1, color: i === cur ? '#4D8DFF' : '#EAF1FF', fontSize: 16 }}>{x.t}</Text>
{i === cur && <Text style={{ color: '#4D8DFF' }}>{playing ? '▶' : '❚❚'}</Text>}
</Pressable>) : null)}
</ScrollView></View>)}
</ImageBackground>
  );
}
