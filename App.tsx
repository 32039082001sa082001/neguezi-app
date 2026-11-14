import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, StatusBar, Animated, Platform, Alert } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { C, TRACKS, setTracks, fmt } from './src/theme';
import { Logo, Cover } from './src/ui';
import { Scene } from './src/scene';
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
  const [room, setRoom] = useState<Room | null>(null);
  const [, setVer] = useState(0);
  const player = useRef<any>(null);

  async function loadMusic() {
    try {
      const p = await MediaLibrary.requestPermissionsAsync(false, ['audio']);
      if (!p.granted) { Alert.alert('Accès refusé', "Autorise l'accès à la musique dans les réglages Android de NEGUEZI."); return; }
      let all: any[] = [];
      let after: string | undefined;
      for (let k = 0; k < 10; k++) {
        const r: any = await MediaLibrary.getAssetsAsync({ mediaType: 'audio', first: 200, after });
        all = all.concat(r.assets);
        if (!r.hasNextPage) break;
        after = r.endCursor;
      }
      setTracks(all.filter((a) => a.duration > 20).map((a) => ({ t: String(a.filename).replace(/\.[^.]+$/, ''), d: Math.round(a.duration), n: 0, uri: a.uri })));
      setVer((v) => v + 1);
    } catch (e: any) { Alert.alert('Erreur musique', String(e && e.message ? e.message : e)); }
  }

  useEffect(() => {
    Animated.timing(logoIn, { toValue: 1, duration: 1400, useNativeDriver: true }).start();
    const t = setTimeout(() => { Animated.timing(fade, { toValue: 0, duration: 400, useNativeDriver: true }).start(() => setSplash(false)); }, 2600);
    setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
    loadMusic();
    return () => clearTimeout(t);
  }, []);

  function pick(i: number) {
    const t = TRACKS[i];
    if (!t || !t.uri) return;
    setCur(i); setTime(0);
    if (!player.current) player.current = createAudioPlayer({ uri: t.uri });
    else player.current.replace({ uri: t.uri });
    player.current.play();
    setPlaying(true);
  }
  function toggle() {
    if (!TRACKS.length) return;
    if (!player.current) { pick(cur); return; }
    if (playing) player.current.pause(); else player.current.play();
    setPlaying(!playing);
  }
  const next = () => { if (TRACKS.length) pick((cur + 1) % TRACKS.length); };
  const prev = () => { if (TRACKS.length) pick((cur - 1 + TRACKS.length) % TRACKS.length); };

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      const p = player.current;
      if (!p) return;
      const ct = p.currentTime || 0;
      setTime(Math.floor(ct));
      const d = TRACKS[cur] ? TRACKS[cur].d : 0;
      if (d && ct >= d - 0.6) next();
    }, 500);
    return () => clearInterval(id);
  }, [playing, cur]);

  const tabs: [string, string, string][] = [['sons', 'Mes sons', '♪'], ['salles', 'Salles', '◉'], ['classement', 'Classement', '♛'], ['profil', 'Profil', '●']];
  const active = screen === 'lecteur' ? 'sons' : screen === 'creer' || screen === 'scene' ? 'salles' : screen;
  const top = Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 44;
  const has = TRACKS.length > 0 && !!TRACKS[cur];

  let body: React.ReactNode = null;
  if (screen === 'sons') body = <Sons cur={cur} playing={playing} onPick={pick} onAsk={loadMusic} />;
  if (screen === 'lecteur' && has) body = <Lecteur cur={cur} playing={playing} time={time} toggle={toggle} next={next} prev={prev} back={() => setScreen('sons')} goRank={() => setScreen('classement')} />;
  if (screen === 'salles') body = <Salles mine={mine} goCreate={() => setScreen('creer')} open={(r) => { setRoom(r); setScreen('scene'); }} />;
  if (screen === 'creer') body = <Creer back={() => setScreen('salles')} onCreate={(r) => { setMine(r); setScreen('salles'); }} />;
  if (screen === 'classement') body = <Classement />;
  if (screen === 'scene' && room) body = <Scene room={room} cur={cur} playing={playing} time={time} toggle={toggle} next={next} prev={prev} back={() => setScreen('salles')} />;
  if (screen === 'profil') body = <Profil mine={mine} openRoom={() => { if (mine) { setRoom(mine); setScreen('scene'); } else setScreen('creer'); }} />;

  return (
    <View style={{ flex: 1, backgroundColor: C.bg, paddingTop: top }}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      <View style={{ flex: 1 }}>{body}</View>
      {screen !== 'lecteur' && screen !== 'scene' && has && (
        <Pressable onPress={() => setScreen('lecteur')} style={{ position: 'absolute', left: 12, right: 12, bottom: 118, backgroundColor: C.card, borderWidth: 1, borderColor: C.copper, borderRadius: 18, padding: 8, flexDirection: 'row', alignItems: 'center' }}>
          <Cover title={TRACKS[cur].t} size={40} />
          <View style={{ flex: 1, marginLeft: 10 }}><Text numberOfLines={1} style={{ color: C.cream }}>{TRACKS[cur].t}</Text><Text style={{ color: C.grey, fontSize: 12 }}>Artiste inconnu · {fmt(time)}</Text></View>
          <Pressable onPress={toggle} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: C.copper, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: C.bg, fontSize: 16 }}>{playing ? '❚❚' : '►'}</Text></Pressable>
        </Pressable>
      )}
      <View style={{ flexDirection: 'row', borderTopWidth: 1, borderTopColor: C.line, backgroundColor: C.bg, paddingBottom: Platform.OS === 'android' ? 44 : 10, paddingTop: 8 }}>
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
