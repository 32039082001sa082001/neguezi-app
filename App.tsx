import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, StatusBar, Animated, Platform, Alert } from 'react-native';
import * as MediaLibrary from 'expo-media-library/legacy';
import { AppState } from 'react-native';
import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { createFacade, setRemote, setEnd } from './src/studio';
import { C, TRACKS, setTracks, fmt } from './src/theme';
import { Logo, Cover } from './src/ui';
import { Scene } from './src/scene';
import { Lecteur, Salles, Creer, Classement, Profil, Room } from './src/screens';
import { SonsNeuf, MiniLecteur, BarreBas, Ouverture, SERIF, LecteurNeuf } from './src/sons';
import { MesSonsNuit, LectureNuit } from './src/univers';
import { VilleSons } from './src/ville';
import { LectureVille } from './src/lecture';
import { BarreVille } from './src/barre';
import { BackHandler } from 'react-native';
import { useFonts } from 'expo-font';
import { Fraunces_600SemiBold } from '@expo-google-fonts/fraunces';
import { Manrope_500Medium } from '@expo-google-fonts/manrope';

export default function App() {
  const [splash, setSplash] = useState(true);
  const fade = useRef(new Animated.Value(1)).current;
  const logoIn = useRef(new Animated.Value(0)).current;
  const [screen, setScreen] = useState('sons');
  useEffect(() => { const h = BackHandler.addEventListener('hardwareBackPress', () => { if (screen === 'sons') return false; setScreen(screen === 'creer' || screen === 'scene' ? 'salles' : 'sons'); return true; }); return () => h.remove(); }, [screen]);
  const [cur, setCur] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [mine, setMine] = useState<Room | null>(null);
  const [loop, setLoop] = useState(false);
  const [uni, setUni] = useState<'sky' | 'cons'>('sky');
  const [shuf, setShuf] = useState(false);
  const [room, setRoom] = useState<Room | null>(null);
  const [, setVer] = useState(0);
  const player = useRef<any>(null);
  const [fontsOk] = useFonts({ Fraunces_600SemiBold, Manrope_500Medium });
  const [eff, setEff] = useState('');
  function applyEff(k: string) {
    const n = eff === k ? '' : k;
    setEff(n);
    const p = player.current; if (!p) return;
    const m: any = { ralenti: [0.8, true], vitesse: [1.25, true], enfant: [1.3, false], grave: [0.8, false] };
    const v = m[n] || [1, true];
    try { p.shouldCorrectPitch = v[1]; p.setPlaybackRate(v[0]); } catch (e) {}
  }

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
      setTracks(all.filter((a) => a.duration > 5).map((a) => ({ t: String(a.filename).replace(/\.[^.]+$/, ''), d: Math.round(a.duration), n: 0, uri: a.uri, id: a.id, dt: a.creationTime || a.modificationTime || 0 })));
      setVer((v) => v + 1);
    } catch (e: any) { Alert.alert('Erreur musique', String(e && e.message ? e.message : e)); }
  }

  useEffect(() => {
    Animated.timing(logoIn, { toValue: 1, duration: 1400, useNativeDriver: true }).start();
    const t = setTimeout(() => { Animated.timing(fade, { toValue: 0, duration: 400, useNativeDriver: true }).start(() => setSplash(false)); }, 2600);
    setAudioModeAsync({ playsInSilentMode: true, shouldPlayInBackground: true, interruptionMode: 'doNotMix' }).catch(() => {});
    loadMusic();
    const sub = AppState.addEventListener('change', (e: any) => { if (e === 'active') loadMusic(); });
    return () => { clearTimeout(t); sub.remove(); };
  }, []);

  function fadeIn() {
    try {
      const p: any = player.current; if (!p) return;
      p.volume = 0; let v = 0;
      const id = setInterval(() => { v += 0.1; try { p.volume = Math.min(v, 1); } catch (e) {} if (v >= 1) clearInterval(id); }, 100);
    } catch (e) {}
  }
  function pick(i: number) {
    const t = TRACKS[i];
    if (!t || !t.uri) return;
    setCur(i); setTime(0);
    if (!player.current) player.current = createFacade({ uri: t.uri, d: t.d, t: t.t });
    else player.current.replace({ uri: t.uri, d: t.d, t: t.t });
    try { player.current.setActiveForLockScreen(true, { title: t.t, artist: 'NEGUEZI' }); } catch (e) {}
    player.current.play();
    fadeIn();
    setPlaying(true);
  }
  function toggle() {
    if (!TRACKS.length) return;
    if (!player.current) { pick(cur); return; }
    if (playing) player.current.pause(); else player.current.play();
    setPlaying(!playing);
  }
  const next = () => {
    if (!TRACKS.length) return;
    if (shuf && TRACKS.length > 1) { let j = cur; while (j === cur) j = Math.floor(Math.random() * TRACKS.length); pick(j); return; }
    pick((cur + 1) % TRACKS.length);
  };
  const lastEnd = useRef(0);
  const endNext = () => { const n = Date.now(); if (n - lastEnd.current < 3000) return; lastEnd.current = n; if (loop) pick(cur); else next(); };
  const endRef = useRef<any>(null); endRef.current = endNext;
  useEffect(() => { setEnd(() => { if (endRef.current) endRef.current(); }); return () => setEnd(null); }, []);
  const prev = () => { if (TRACKS.length) pick((cur - 1 + TRACKS.length) % TRACKS.length); };

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      const p = player.current;
      if (!p) return;
      const ct = p.currentTime || 0;
      setTime(Math.floor(ct));
      const d = TRACKS[cur] ? TRACKS[cur].d : 0;
    if (d && ct >= d - 0.6) endNext();
    }, 500);
    return () => clearInterval(id);
  }, [playing, cur, loop, shuf]);

  useEffect(() => { setRemote({ play: () => { if (!playing) toggle(); }, pause: () => { if (playing) toggle(); }, next: () => next(), prev: () => prev() }); });
  const tabs: [string, string, string][] = [['sons', 'Mes sons', '♪'], ['salles', 'Salles', '◉'], ['classement', 'Classement', '♛'], ['profil', 'Profil', '●']];
  const active = screen === 'lecteur' ? 'sons' : screen === 'creer' || screen === 'scene' ? 'salles' : screen;
  const top = Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 44;
  const has = TRACKS.length > 0 && !!TRACKS[cur];

  let body: React.ReactNode = null;
  if (screen === 'sons') body = <VilleSons playing={playing} cur={cur} onPick={pick} onAsk={loadMusic} uni={uni} setUni={setUni} />;
  if (screen === 'lecteur' && has) body = <LectureVille uni={uni} loop={loop} setLoop={setLoop} shuf={shuf} setShuf={setShuf} eff={eff} setEff={applyEff} cur={cur} playing={playing} time={time} toggle={toggle} next={next} prev={prev} back={() => setScreen('sons')} goRank={() => setScreen('classement')} />;
  if (screen === 'salles') body = <Salles mine={mine} goCreate={() => setScreen('creer')} open={(r) => { setRoom(r); setScreen('scene'); }} />;
  if (screen === 'creer') body = <Creer back={() => setScreen('salles')} onCreate={(r) => { setMine(r); setScreen('salles'); }} />;
  if (screen === 'classement') body = <Classement />;
  if (screen === 'scene' && room) body = <Scene pick={pick} room={room} cur={cur} playing={playing} time={time} toggle={toggle} next={next} prev={prev} back={() => setScreen('salles')} />;
  if (screen === 'profil') body = <Profil mine={mine} openRoom={() => { if (mine) { setRoom(mine); setScreen('scene'); } else setScreen('creer'); }} />;

  if (fontsOk === false) return null;
  return (
    <View style={{ flex: 1, backgroundColor: '#050A1A', paddingTop: top }}>
      <StatusBar barStyle="light-content" backgroundColor="#050A1A" />
      <View style={{ flex: 1 }}>{body}</View>
      {screen !== 'lecteur' && screen !== 'scene' && has && (
        <MiniLecteur t={TRACKS[cur]} i={cur} playing={playing} time={time} toggle={toggle} next={next} open={() => setScreen('lecteur')} />
      )}
      <BarreVille tabs={tabs} active={active} go={(k: string) => setScreen(k)} />
      {splash && (
        <Animated.View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center', opacity: fade }}>
          <Animated.View style={{ alignItems: 'center', opacity: logoIn, transform: [{ scale: logoIn.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) }] }}>
            <Ouverture />
            <Text style={{ color: C.copper, fontFamily: SERIF, fontSize: 34, letterSpacing: 8, marginTop: 24 }}>NEGUEZI</Text>
            <Text style={{ color: C.grey, fontStyle: 'italic', marginTop: 8 }}>la musique avec tes bons amis</Text>
          </Animated.View>
        </Animated.View>
      )}
    </View>
  );
}
