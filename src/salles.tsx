import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, ScrollView, TextInput, Alert, Image, Linking, Animated, Easing, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import * as Clipboard from 'expo-clipboard';

type Room = { name: string; pub: boolean; code?: string; mine?: boolean; n: number; photo?: string };
const W = Dimensions.get('window').width;
const AMB = '#2F6BFF';
const TXT = '#EAF2FF';
const DIM = '#9DBBFF';
const LINE = '#2A5BE0';
const CARD = 'rgba(8,24,70,0.78)';
const GRAD = ['#0A1F5C', '#050A1A', '#02050F'] as const;

function Beam({ x, phase }: { x: number; phase: number }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const a = Animated.loop(Animated.sequence([
      Animated.timing(v, { toValue: 1, duration: 2400 + phase * 400, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      Animated.timing(v, { toValue: 0, duration: 2400 + phase * 400, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
    ]));
    a.start();
    return () => a.stop();
  }, []);
  const rot = v.interpolate({ inputRange: [0, 1], outputRange: ['-16deg', '16deg'] });
  return <Animated.View style={{ position: 'absolute', top: -20, left: x, width: 40, height: 300, backgroundColor: AMB, opacity: 0.2, borderBottomLeftRadius: 40, borderBottomRightRadius: 40, transform: [{ rotate: rot }] }} />;
}

function Fond() {
  return (
    <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
      <LinearGradient colors={GRAD as any} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 320, overflow: 'hidden' }}>
        {[0, 1, 2, 3, 4, 5].map((k) => <Beam key={k} x={6 + k * ((W - 50) / 5)} phase={k % 3} />)}
      </View>
    </View>
  );
}

const DEMO: Room[] = [
  { name: 'Salle Bamako', pub: true, n: 4 },
  { name: 'Soirée Ségou', pub: true, n: 2 },
  { name: 'Matin doré', pub: true, n: 1 },
];
const SUB: any = { 'Salle Bamako': 'Nuit à Bamako', 'Soirée Ségou': 'Ambiance musicale', 'Matin doré': 'Bonne musique' };

export function Salles({ mine, goCreate, open }: { mine: Room | null; goCreate: () => void; open: (r: Room) => void }) {
  const [code, setCode] = useState('');
  const rooms = mine && mine.pub ? [mine, ...DEMO] : DEMO;
  return (
    <View style={{ flex: 1, backgroundColor: '#0D0502' }}>
      <Fond />
      <ScrollView contentContainerStyle={{ padding: 18, paddingTop: 40, paddingBottom: 220 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ color: TXT, fontSize: 28, fontWeight: '700' }}>Salles en direct</Text>
          <Pressable onPress={() => (mine ? open(mine) : goCreate())} style={{ borderWidth: 1, borderColor: AMB, borderRadius: 22, paddingHorizontal: 16, paddingVertical: 10, backgroundColor: CARD }}>
            <Text style={{ color: TXT, fontWeight: '600' }}>{mine ? 'Ma salle' : '+ Ma salle'}</Text>
          </Pressable>
        </View>
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 110 }}>
          <TextInput value={code} onChangeText={(x) => setCode(x.toUpperCase().replace(/[^A-Z0-9]/g, ''))} maxLength={6} placeholder="Entrer avec un code" placeholderTextColor={DIM} style={{ flex: 1, color: TXT, fontSize: 17, letterSpacing: 3, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 22, borderWidth: 1, borderColor: LINE, backgroundColor: CARD }} />
          <Pressable onPress={() => Alert.alert('Bientôt', 'Entrer avec un code arrive avec la connexion entre téléphones.')} style={{ backgroundColor: AMB, borderRadius: 22, paddingHorizontal: 22, justifyContent: 'center' }}>
            <Text style={{ color: '#1A0A04', fontWeight: '700', fontSize: 16 }}>Entrer</Text>
          </Pressable>
        </View>
        {rooms.map((r) => (
          <View key={r.name} style={{ marginTop: 16, padding: 16, borderRadius: 22, borderWidth: 1, borderColor: LINE, backgroundColor: CARD }}>
            <View style={{ alignSelf: 'flex-start', borderRadius: 14, borderWidth: 1, borderColor: AMB, paddingHorizontal: 10, paddingVertical: 4, backgroundColor: 'rgba(255,154,31,0.18)' }}>
              <Text style={{ color: AMB, fontWeight: '700', fontSize: 12, letterSpacing: 1 }}>● EN DIRECT</Text>
            </View>
            <Text style={{ color: TXT, fontSize: 24, fontWeight: '700', marginTop: 8 }}>{r.name}</Text>
            <Text style={{ color: DIM, marginTop: 2 }}>{SUB[r.name] || ''}</Text>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
              {[0, 1].map((k) => <View key={k} style={{ width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: AMB, backgroundColor: '#2A1006', alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontSize: 20 }}>🎧</Text></View>)}
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
              <Text style={{ color: DIM }}>2 DJ · {r.n}/4 spectateurs</Text>
              <Pressable onPress={() => open(r)} style={{ backgroundColor: AMB, borderRadius: 22, paddingHorizontal: 20, paddingVertical: 11 }}>
                <Text style={{ color: '#1A0A04', fontWeight: '700' }}>🎧 Écouter</Text>
              </Pressable>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const L = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const newCode = () => Array.from({ length: 6 }, () => L[Math.floor(Math.random() * L.length)]).join('');

export function Creer({ onCreate, back }: { onCreate: (r: Room) => void; back: () => void }) {
  const [name, setName] = useState('');
  const [pub, setPub] = useState(false);
  const [code] = useState(newCode);
  const [photo, setPhoto] = useState<string | null>(null);
  async function pickPhoto() {
    try {
      const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.4 });
      if (!r.canceled) setPhoto(r.assets[0].uri);
    } catch (e: any) { Alert.alert('Erreur photo', String(e && e.message ? e.message : e)); }
  }
  const msg = 'Viens dans ma salle NEGUEZI « ' + (name || 'Ma salle') + ' » · Code : ' + code;
  const tile = (on: boolean) => ({ flex: 1, padding: 14, borderRadius: 20, borderWidth: on ? 2 : 1, borderColor: on ? AMB : LINE, backgroundColor: on ? 'rgba(255,154,31,0.2)' : CARD, alignItems: 'center' as const });
  return (
    <View style={{ flex: 1, backgroundColor: '#0D0502' }}>
      <Fond />
      <ScrollView contentContainerStyle={{ padding: 18, paddingTop: 40, paddingBottom: 220 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Pressable onPress={back} hitSlop={16} style={{ width: 42, height: 42, borderRadius: 21, borderWidth: 1, borderColor: AMB, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: TXT, fontSize: 24 }}>‹</Text></Pressable>
          <Text style={{ color: TXT, fontSize: 26, fontWeight: '700', flex: 1, textAlign: 'center', marginRight: 42 }}>Créer ma salle</Text>
        </View>
        <Pressable onPress={pickPhoto} style={{ alignSelf: 'center', marginTop: 40, width: 130, height: 130, borderRadius: 65, borderWidth: 2, borderStyle: 'dashed', borderColor: AMB, backgroundColor: 'rgba(40,16,6,0.7)', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          {photo ? <Image source={{ uri: photo }} style={{ width: 130, height: 130 }} /> : <View style={{ alignItems: 'center' }}><Text style={{ color: AMB, fontSize: 40 }}>+</Text><Text style={{ color: TXT, fontSize: 13, textAlign: 'center' }}>Ajouter une photo</Text></View>}
        </Pressable>
        <View style={{ marginTop: 30, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, borderRadius: 22, borderWidth: 1, borderColor: LINE, backgroundColor: CARD }}>
          <Text style={{ color: TXT, fontSize: 18, marginRight: 10 }}>✎</Text>
          <TextInput value={name} onChangeText={setName} maxLength={50} placeholder="Nom de ta salle" placeholderTextColor={DIM} style={{ flex: 1, color: TXT, fontSize: 18, paddingVertical: 14 }} />
          <Text style={{ color: DIM }}>{name.length}/50</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
          <Pressable onPress={() => setPub(true)} style={tile(pub)}><Text style={{ fontSize: 26 }}>👥</Text><Text style={{ color: TXT, fontSize: 18, fontWeight: '700', marginTop: 4 }}>Public :</Text><Text style={{ color: DIM, fontSize: 12, textAlign: 'center' }}>tout le monde peut entrer</Text></Pressable>
          <Pressable onPress={() => setPub(false)} style={tile(!pub)}><Text style={{ fontSize: 26 }}>🔒</Text><Text style={{ color: TXT, fontSize: 18, fontWeight: '700', marginTop: 4 }}>Privé :</Text><Text style={{ color: DIM, fontSize: 12, textAlign: 'center' }}>sur invitation avec un code</Text></Pressable>
        </View>
        {!pub ? (
          <View style={{ marginTop: 16, padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: 22, borderWidth: 1, borderColor: LINE, backgroundColor: CARD }}>
            <Text style={{ color: DIM }}>Ton code</Text>
            <Text style={{ color: TXT, fontSize: 28, fontWeight: '700', letterSpacing: 4 }}>{code}</Text>
            <Pressable onPress={() => { Clipboard.setStringAsync(code).then(() => Alert.alert('Copié', code)); }} style={{ borderWidth: 1, borderColor: AMB, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 8 }}><Text style={{ color: TXT }}>Copier</Text></Pressable>
          </View>
        ) : null}
        <Text style={{ color: DIM, textAlign: 'center', marginTop: 16 }}>🎧 2 DJ sur scène · 4 spectateurs au maximum</Text>
        <Pressable disabled={!name.trim()} onPress={() => onCreate({ name: name.trim(), pub, code: pub ? undefined : code, mine: true, n: 0, photo: photo || undefined })} style={{ marginTop: 22, backgroundColor: AMB, borderRadius: 30, paddingVertical: 17, alignItems: 'center', opacity: name.trim() ? 1 : 0.4 }}>
          <Text style={{ color: '#1A0A04', fontSize: 20, fontWeight: '700' }}>Créer ma salle</Text>
        </Pressable>
        <Pressable onPress={() => Linking.openURL('https://wa.me/?text=' + encodeURIComponent(msg))} style={{ marginTop: 12, borderWidth: 1, borderColor: LINE, borderRadius: 26, paddingVertical: 14, alignItems: 'center', backgroundColor: CARD }}>
          <Text style={{ color: TXT, fontSize: 16 }}>Partager sur WhatsApp</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
