import { H } from './accent';
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, TextInput, Animated, Easing, FlatList, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { TRACKS } from './theme';
import * as MediaLibrary from 'expo-media-library';
import { Alert } from 'react-native';
const GONE: string[] = [];

const W = Dimensions.get('window').width;
const fmtD = (s: number) => Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');

function Barres({ playing }: any) {
  const b = [useRef(new Animated.Value(0.4)).current, useRef(new Animated.Value(0.8)).current, useRef(new Animated.Value(0.55)).current];
  useEffect(() => {
    if (!playing) return;
    const ls = b.map((v, k) => Animated.loop(Animated.sequence([
      Animated.timing(v, { toValue: 1, duration: 360 + k * 110, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(v, { toValue: 0.25, duration: 360 + k * 110, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ])));
    ls.forEach((l) => l.start());
    return () => ls.forEach((l) => l.stop());
  }, [playing]);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', height: 22, marginLeft: 8 }}>
      {b.map((v, k) => (<Animated.View key={k} style={{ width: 4, height: 22, marginHorizontal: 1.5, borderRadius: 2, backgroundColor: H('#4D8DFF'), transform: [{ scaleY: v }] }} />))}
    </View>
  );
}

function Ligne({ x, n, on, playing, onPress, onLong }: any) {
  const a = useRef(new Animated.Value(n < 10 ? 0 : 1)).current;
  const r = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (n < 10) Animated.timing(a, { toValue: 1, duration: 380, delay: 240 + n * 55, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, []);
  useEffect(() => {
    if (!(on && playing)) { r.stopAnimation(); return; }
    const l = Animated.loop(Animated.timing(r, { toValue: 1, duration: 3600, easing: Easing.linear, useNativeDriver: true }));
    l.start();
    return () => l.stop();
  }, [on, playing]);
  const spin = r.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  return (
    <Animated.View style={{ opacity: a, transform: [{ translateX: a.interpolate({ inputRange: [0, 1], outputRange: [46, 0] }) }] }}>
      <Pressable onPress={onPress} onLongPress={onLong} style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 14, marginVertical: 5, paddingVertical: 9, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1, borderColor: on ? H('#4D8DFF') : 'rgba(45,107,255,0.22)', backgroundColor: on ? 'rgba(45,107,255,0.16)' : 'rgba(13,27,60,0.55)' }}>
        <Animated.Image source={require('../assets/knob.png')} style={{ width: 46, height: 46, marginRight: 14, transform: [{ rotate: spin }] }} />
        <View style={{ flex: 1 }}>
          <Text numberOfLines={1} style={{ color: on ? H('#EAF1FF') : H('#D5E2FF'), fontSize: 16, fontWeight: on ? '700' : '500' }}>{x.t}</Text>
          <Text style={{ color: H('#8899BB'), fontSize: 12, marginTop: 2 }}>{x.d ? fmtD(x.d) : '-'}</Text>
        </View>
        {on ? <Barres playing={playing} /> : null}
      </Pressable>
    </Animated.View>
  );
}

export function ListeSons({ open, onClose, q, setQ, cur, playing, onPick }: any) {
  const [show, setShow] = useState(false);
  const [ord, setOrd] = useState('rec');
  const [, bump] = useState(0);
  const a = useRef(new Animated.Value(0)).current;
  const sw = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (open) {
      setShow(true); a.setValue(0); sw.setValue(0);
      Animated.parallel([
        Animated.timing(a, { toValue: 1, duration: 420, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(sw, { toValue: 1, duration: 650, easing: Easing.inOut(Easing.cubic), useNativeDriver: true }),
      ]).start();
    } else if (show) {
      Animated.timing(a, { toValue: 0, duration: 240, easing: Easing.in(Easing.cubic), useNativeDriver: true }).start(() => setShow(false));
    }
  }, [open]);
  if (!show) return null;
  const data = TRACKS.map((x: any, i: number) => ({ x, i })).filter((o: any) => !GONE.includes(o.x.id || '') && (o.x.t || '').toLowerCase().includes(q.toLowerCase()))
    .sort((a: any, b: any) => ord === 'az' ? String(a.x.t).localeCompare(String(b.x.t)) : ord === 'old' ? (a.x.dt || 0) - (b.x.dt || 0) : (b.x.dt || 0) - (a.x.dt || 0));
  return (
    <Animated.View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: a, backgroundColor: 'rgba(3,6,16,0.95)', transform: [{ translateY: a.interpolate({ inputRange: [0, 1], outputRange: [70, 0] }) }, { scale: a.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1] }) }] }}>
      <LinearGradient colors={['rgba(45,107,255,0.22)', 'rgba(3,6,16,0)']} pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 220 }} />
      <View style={{ paddingTop: 44, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', borderRadius: 24, borderWidth: 1, borderColor: H('#2D6BFF'), backgroundColor: 'rgba(13,27,60,0.75)', paddingHorizontal: 16 }}>
          <TextInput value={q} onChangeText={setQ} placeholder="Rechercher un son" placeholderTextColor="#8899BB" style={{ flex: 1, color: H('#EAF1FF'), fontSize: 16, paddingVertical: 10 }} />
        </View>
        <Pressable onPress={onClose} style={{ marginLeft: 10, padding: 10 }}><Text style={{ color: H('#EAF1FF'), fontSize: 22 }}>X</Text></Pressable>
      </View>
      <Text style={{ color: H('#8899BB'), marginHorizontal: 20, marginTop: 12, marginBottom: 4 }}>{data.length} sons</Text>
      <View style={{ flexDirection: 'row', gap: 8, marginHorizontal: 16, marginBottom: 6 }}>{[['rec', 'Récents'], ['old', 'Anciens'], ['az', 'A-Z']].map((k) => (<Pressable key={k[0]} onPress={() => setOrd(k[0])} style={{ paddingHorizontal: 14, paddingVertical: 7, borderRadius: 16, borderWidth: 1, borderColor: H('#2D6BFF'), backgroundColor: ord === k[0] ? H('#2D6BFF') : 'rgba(13,27,60,0.75)' }}><Text style={{ color: H('#EAF1FF'), fontWeight: '700', fontSize: 13 }}>{k[1]}</Text></Pressable>))}</View>
      <FlatList data={data} keyExtractor={(o: any) => o.x.t + o.i} initialNumToRender={12} windowSize={7} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item, index }: any) => (<Ligne x={item.x} n={index} on={item.i === cur} playing={playing} onPress={() => onPick(item.i)} onLong={() => { if (item.i === cur) { Alert.alert('Son en cours', 'Choisis un autre son avant de supprimer celui-ci.'); return; } Alert.alert('Supprimer ce son ?', String(item.x.t), [{ text: 'Annuler', style: 'cancel' }, { text: 'Supprimer', style: 'destructive', onPress: async () => { try { if (!item.x.id) { Alert.alert('Impossible', 'Fichier non identifié.'); return; } const ok = await MediaLibrary.deleteAssetsAsync([item.x.id]); if (ok) { GONE.push(item.x.id); bump((v: number) => v + 1); } } catch (e) { Alert.alert('Erreur', 'Suppression impossible.'); } } }]); }} />)} />
      <Animated.View pointerEvents="none" style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: 140, opacity: sw.interpolate({ inputRange: [0, 0.15, 0.85, 1], outputRange: [0, 1, 1, 0] }), transform: [{ translateX: sw.interpolate({ inputRange: [0, 1], outputRange: [-140, W] }) }] }}>
        <LinearGradient colors={['rgba(77,141,255,0)', 'rgba(77,141,255,0.35)', 'rgba(77,141,255,0)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ flex: 1 }} />
      </Animated.View>
    </Animated.View>
  );
}
