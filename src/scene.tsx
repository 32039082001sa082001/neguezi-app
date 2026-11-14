import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, Animated, Easing, ScrollView, Share, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useKeepAwake } from 'expo-keep-awake';
import { C, TRACKS, fmt } from './theme';
import { Pill } from './ui';

type R = { name: string; pub: boolean; code?: string; mine?: boolean; n: number };
type P = { room: R; cur: number; playing: boolean; time: number; toggle: () => void; next: () => void; prev: () => void; back: () => void };
const AMBER = '#E8A33D';
const RED = '#B8432A';
const WARM = '#F5E6C8';
const card = { backgroundColor: C.card, borderRadius: 16, borderWidth: 1, borderColor: C.line };

function Beam({ color, x, phase }: { color: string; x: number; phase: number }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const a = Animated.loop(Animated.sequence([
      Animated.timing(v, { toValue: 1, duration: 2400 + phase * 400, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      Animated.timing(v, { toValue: 0, duration: 2400 + phase * 400, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
    ]));
    a.start();
    return () => a.stop();
  }, []);
  const rotate = v.interpolate({ inputRange: [0, 1], outputRange: ['-16deg', '16deg'] });
  return <Animated.View style={{ position: 'absolute', top: -20, left: x, width: 46, height: 230, backgroundColor: color, opacity: 0.28, borderBottomLeftRadius: 40, borderBottomRightRadius: 40, transformOrigin: 'top', transform: [{ rotate }] }} />;
}

export function Scene({ room, cur, playing, time, toggle, next, prev, back }: P) {
  useKeepAwake();
  const [fx, setFx] = useState<string | null>(null);
  const [left, setLeft] = useState(0);
  const [light, setLight] = useState<string | null>(null);
  const [tr, setTr] = useState('Fondu');
  const [voix, setVoix] = useState(true);
  const [instru, setInstru] = useState(true);
  const [asked, setAsked] = useState(false);
  const t = TRACKS[cur];
  const djs = room.mine ? ['Moi'] : ['Awa', 'Moussa', 'Fanta'];

  function runFx(n: string) {
    if (fx) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    setFx(n); setLeft(3);
    setTimeout(() => setLeft(2), 1000);
    setTimeout(() => setLeft(1), 2000);
    setTimeout(() => { setFx(null); setLeft(0); }, 3000);
  }
  function runLight(n: string) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setLight(n);
    setTimeout(() => setLight(null), 3000);
  }
  function note() {
    runFx('La note');
    setTimeout(next, 3000);
  }
  const conf = Array.from({ length: 16 }, (_, i) => i);

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={{ height: 250, backgroundColor: '#120807', overflow: 'hidden' }}>
        <Beam color={AMBER} x={30} phase={0} />
        <Beam color={RED} x={150} phase={1} />
        <Beam color={WARM} x={270} phase={2} />
        {light === 'Lasers' && [0, 1, 2, 3, 4].map((i) => (
          <View key={i} style={{ position: 'absolute', top: 0, left: '50%', width: 2, height: 260, backgroundColor: i % 2 ? RED : AMBER, transformOrigin: 'top', transform: [{ rotate: (-40 + i * 20) + 'deg' }] }} />
        ))}
        {light === 'Fumée' && [0, 1, 2, 3].map((i) => (
          <View key={i} style={{ position: 'absolute', bottom: -20, left: (i * 25 - 5) + '%' as any, width: 130, height: 90, borderRadius: 60, backgroundColor: C.grey, opacity: 0.22 }} />
        ))}
        {light === 'Confettis' && conf.map((i) => (
          <View key={i} style={{ position: 'absolute', left: ((i * 37) % 100) + '%' as any, top: ((i * 53) % 80) + '%' as any, width: 8, height: 12, backgroundColor: [AMBER, RED, WARM][i % 3] }} />
        ))}
        {light === 'Flash' && <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: WARM, opacity: 0.45 }} />}
        <Pressable onPress={back} style={{ position: 'absolute', left: 14, top: 12, width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(30,15,12,0.7)', alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: C.cream, fontSize: 20 }}>←</Text></Pressable>
        <View style={{ position: 'absolute', right: 14, top: 14, backgroundColor: 'rgba(30,15,12,0.7)', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6 }}><Text style={{ color: C.cream }}>{room.name}{room.code ? ' · ' + room.code : ''}</Text></View>
        <View style={{ position: 'absolute', left: 0, right: 0, bottom: 44, flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end', gap: 12 }}>
          {[0, 1, 2, 3].map((i) => djs[i] ? (
            <View key={i} style={{ alignItems: 'center' }}>
              <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: '#3A241C', borderWidth: 1, borderColor: C.copper }} />
              <View style={{ width: 54, height: 44, borderTopLeftRadius: 24, borderTopRightRadius: 24, backgroundColor: '#3A241C', borderWidth: 1, borderColor: C.line, marginTop: -2 }} />
              <Text style={{ color: C.cream, fontSize: 10 }}>{djs[i]}</Text>
            </View>
          ) : (
            <Pressable key={i} onPress={() => { setAsked(true); Alert.alert('Demande envoyée', 'Le DJ en chef va te donner la main.'); }} style={{ width: 52, height: 52, borderRadius: 14, borderWidth: 1.5, borderStyle: 'dashed', borderColor: C.copper, alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}><Text style={{ color: C.copper, fontSize: 26 }}>+</Text></Pressable>
          ))}
        </View>
        <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 40, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end' }}>
          {Array.from({ length: 12 }, (_, i) => (
            <View key={i} style={{ alignItems: 'center' }}><View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: '#0A0504' }} /><View style={{ width: 26, height: 20, borderTopLeftRadius: 12, borderTopRightRadius: 12, backgroundColor: '#0A0504' }} /></View>
          ))}
        </View>
      </View>

      <View style={{ padding: 16 }}>
        <Text style={{ color: C.cream, fontSize: 22, fontFamily: 'serif' }}>{t ? t.t : 'Aucun son'}</Text>
        <Text style={{ color: C.grey }}>{room.mine ? "Tu es l'hôte" : "L'hôte contrôle la musique"}</Text>
        <View style={{ height: 4, backgroundColor: C.card, borderRadius: 2, marginTop: 10 }}>
          <View style={{ height: 4, width: (t ? Math.min(100, (time / t.d) * 100) : 0) + '%' as any, backgroundColor: C.copper, borderRadius: 2 }} />
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 26, marginTop: 14 }}>
          <Pressable onPress={prev} style={{ width: 50, height: 50, borderRadius: 25, borderWidth: 1, borderColor: C.copper, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: C.cream }}>|◄</Text></Pressable>
          <Pressable onPress={toggle} style={{ width: 66, height: 66, borderRadius: 33, backgroundColor: C.copper, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: C.bg, fontSize: 24 }}>{playing ? '❚❚' : '►'}</Text></Pressable>
          <Pressable onPress={next} style={{ width: 50, height: 50, borderRadius: 25, borderWidth: 1, borderColor: C.copper, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: C.cream }}>►|</Text></Pressable>
        </View>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
          <Pill label={'VOIX · ' + (voix ? 'ALLUMÉE' : 'COUPÉE')} on={voix} onPress={() => setVoix(!voix)} />
          <Pill label={'INSTRU · ' + (instru ? 'ALLUMÉE' : 'COUPÉE')} on={instru} onPress={() => setInstru(!instru)} />
        </View>
        <Text style={{ color: C.grey, fontSize: 11, letterSpacing: 2, marginTop: 18, marginBottom: 8 }}>TRANSITION A/B</Text>
        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
          {['Fondu', 'Échange', 'Coupe'].map((x) => <Pill key={x} label={x} on={tr === x} onPress={() => setTr(x)} />)}
          <Pill label={fx === 'La note' ? 'LA NOTE · ' + left + ' s' : 'LA NOTE'} on={fx === 'La note'} onPress={note} />
        </View>
        <Text style={{ color: C.grey, fontSize: 11, letterSpacing: 2, marginTop: 18, marginBottom: 8 }}>EFFETS DE SON</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {['Écho', 'Salle', 'Radio', 'Boucle'].map((x) => (
            <Pressable key={x} onPress={() => runFx(x)} style={[card, { flex: 1, paddingVertical: 16, alignItems: 'center', borderColor: fx === x ? C.copper : C.line }]}>
              <Text style={{ color: fx === x ? C.copper : C.cream }}>{x}</Text>
              {fx === x && <Text style={{ color: C.copper, fontSize: 11 }}>{left} s</Text>}
            </Pressable>
          ))}
        </View>
        <Text style={{ color: C.grey, fontSize: 11, letterSpacing: 2, marginTop: 18, marginBottom: 8 }}>EFFETS DE LUMIÈRE</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {['Lasers', 'Flash', 'Fumée', 'Confettis'].map((x) => (
            <Pressable key={x} onPress={() => runLight(x)} style={[card, { flex: 1, paddingVertical: 16, alignItems: 'center', borderColor: light === x ? C.copper : C.line }]}>
              <Text style={{ color: light === x ? C.copper : C.cream, fontSize: 12 }}>{x}</Text>
            </Pressable>
          ))}
        </View>
        <Text style={{ color: C.grey, fontSize: 11, marginTop: 8 }}>Les effets de son sont visuels pour l'instant.</Text>
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 20 }}>
          <Pressable onPress={() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {})} style={[card, { flex: 1, paddingVertical: 14, alignItems: 'center' }]}><Text style={{ color: C.cream }}>Applaudir</Text></Pressable>
          <Pressable onPress={() => { setAsked(true); Alert.alert('Demande envoyée', 'Le DJ en chef va te donner la main.'); }} style={[card, { flex: 1, paddingVertical: 14, alignItems: 'center' }]}><Text style={{ color: C.cream }}>{asked ? 'Demandé' : 'Demander la main'}</Text></Pressable>
          <Pressable onPress={() => Share.share({ message: 'Rejoins ma salle NEGUEZI « ' + room.name + ' » ' + (room.code ? 'Code : ' + room.code : '') })} style={[card, { flex: 1, paddingVertical: 14, alignItems: 'center' }]}><Text style={{ color: C.cream }}>Inviter un ami</Text></Pressable>
        </View>
        <Text style={{ color: C.grey, textAlign: 'center', marginTop: 14, fontSize: 12 }}>{room.n} auditeurs · {djs.length}/4 DJ</Text>
      </View>
    </ScrollView>
  );
}
