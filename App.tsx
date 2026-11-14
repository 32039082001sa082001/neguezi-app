import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, StatusBar, Animated, Platform } from 'react-native';
import { C, TRACKS, fmt } from './src/theme';
import { Logo, Cover } from './src/ui';
import { Sons, Lecteur, Salles, Creer, Classement, Profil, Room } from './src/screens';

export default function App() {
  const [splash, setSplash] = useState(true);
  const fade = useRef(new Animated.Value(1)).current;
  const logoIn = useRef(new Animated.Value(0)).current;
  const [screen, setScreen] = useState('sons');
  const [cur, setCur] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [mine, setMine] = useState<Room | null>(null);

  useEffect(() => {
    Animated.timing(logoIn, { toValue: 1, duration: 1400, useNativeDriver: true }).start();
    const t = setTimeout(() => { Animated.timing(fade, { toValue: 0, duration: 400, useNativeDriver: true }).start(() => setSplash(false)); }, 2600);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setTime((x) => x + 1), 1000);
    return () => clearInterval(id);
  }, [playing]);

  const pick = (i: number) => { setCur(i); setTime(0); setPlaying(true); };
  const next = () => pick((cur + 1) % TRACKS.length);
  const prev = () => pick((cur - 1 + TRACKS.length) % TRACKS.length);
  useEffect(() => { if (time >= TRACKS[cur].d) next(); }, [time]);

  const tabs: [string, string, string][] = [['sons', 'Mes sons', '♪'], ['salles', 'Salles', '◉'], ['classement', 'Classement', '♛'], ['profil', 'Profil', '●']];
  const active = screen === 'lecteur' ? 'sons' : screen === 'creer' ? 'salles' : screen;
  const top = Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 44;

  let body: React.ReactNode = null;
  if (screen === 'sons') body = <Sons cur={cur} playing={playing} onPick={pick} />;
  if (screen === 'lecteur') body = <Lecteur cur={cur} playing={playing} time={time} toggle={() => setPlaying(!playing)} next={next} prev={prev} back={() => setScreen('sons')} goRank={() => setScreen('classement')} />;
  if (screen === 'salles') body = <Salles mine={mine} goCreate={() => setScreen('creer')} />;
  if (screen === 'creer') body = <Creer back={() => setScreen('salles')} onCreate={(r) => { setMine(r); setScreen('salles'); }} />;
  if (screen === 'classement') body = <Classement />;
  if (screen === 'profil') body = <Profil mine={mine} openRoom={() => setScreen(mine ? 'salles' : 'creer')} />;

  return (
    <View style={{ flex: 1, backgroundColor: C.bg, paddingTop: top }}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      <View style={{ flex: 1 }}>{body}</View>
      {screen !== 'lecteur' && (
        <Pressable onPress={() => setScreen('lecteur')} style={{ position: 'absolute', left: 12, right: 12, bottom: 74, backgroundColor: C.card, borderWidth: 1, borderColor: C.copper, borderRadius: 18, padding: 8, flexDirection: 'row', alignItems: 'center' }}>
          <Cover title={TRACKS[cur].t} size={40} />
          <View style={{ flex: 1, marginLeft: 10 }}><Text style={{ color: C.cream }}>{TRACKS[cur].t}</Text><Text style={{ color: C.grey, fontSize: 12 }}>Artiste inconnu · {fmt(time)}</Text></View>
          <Pressable onPress={() => setPlaying(!playing)} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: C.copper, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: C.bg, fontSize: 18 }}>{playing ? '⏸' : '▶'}</Text></Pressable>
        </Pressable>
      )}
      <View style={{ flexDirection: 'row', borderTopWidth: 1, borderTopColor: C.line, backgroundColor: C.bg, paddingBottom: 10, paddingTop: 8 }}>
        {tabs.map(([k, l, g]) => (
          <Pressable key={k} onPress={() => setScreen(k)} style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ color: active === k ? C.copper : C.grey, fontSize: 20 }}>{g}</Text>
            <Text style={{ color: active === k ? C.copper : C.grey, fontSize: 11 }}>{l}</Text>
          </Pressable>
        ))}
      </View>
      {splash && (
        <Animated.View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center', opacity: fade }}>
          <Animated.View style={{ alignItems: 'center', opacity: logoIn, transform: [{ scale: logoIn.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) }] }}>
            <Logo size={130} />
            <Text style={{ color: C.copper, fontFamily: 'serif', fontSize: 34, letterSpacing: 8, marginTop: 24 }}>NEGUEZI</Text>
            <Text style={{ color: C.grey, fontStyle: 'italic', marginTop: 8 }}>la musique avec tes bons amis</Text>
          </Animated.View>
        </Animated.View>
      )}
    </View>
  );
}
