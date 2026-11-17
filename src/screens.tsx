import { H, ACC, setAccent, getAccent, BGS, setBg, getBgIndex, getBg } from './accent';
import React, { useState, useRef } from 'react';
import * as ImagePicker from 'expo-image-picker';
import * as Clipboard from 'expo-clipboard';
import * as Sharing from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';
import { View, Text, Pressable, ScrollView, TextInput, Switch, Share, Linking, Alert, Image } from 'react-native';
import { C, TRACKS, DEMO as TDEMO, fmt } from './theme';
import { Pill, Cover, Vinyl, Head } from './ui';
import { Dimensions as DimC } from 'react-native';

const pad = { padding: 20, paddingBottom: 220 };
const card = { backgroundColor: C.card, borderRadius: 16, borderWidth: 1, borderColor: C.line };
const btn = { backgroundColor: C.copper, borderRadius: 24, paddingVertical: 14, alignItems: 'center' as const };

export function Sons({ cur, playing, onPick, onAsk }: { cur: number; playing: boolean; onPick: (i: number) => void; onAsk: () => void }) {
  const [tab, setTab] = useState('Sons');
  if (TRACKS.length === 0) return (
    <View style={{ flex: 1, padding: 20, justifyContent: 'center' }}>
      <Head title="Mes sons" />
      <Text style={{ color: C.cream, fontSize: 18, fontFamily: 'serif' }}>Aucun son trouvé</Text>
      <Text style={{ color: C.grey, marginTop: 6 }}>NEGUEZI lit la musique de ton téléphone. Autorise l'accès pour la voir ici.</Text>
      <Pressable onPress={onAsk} style={[btn, { marginTop: 18 }]}><Text style={{ color: C.bg, fontSize: 17 }}>Autoriser l'accès à ma musique</Text></Pressable>
    </View>
  );
  return (
    <ScrollView contentContainerStyle={pad}>
      <Head title="Mes sons" />
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
        {['Sons', 'Albums', 'Pistes'].map((x) => <Pill key={x} label={x} on={tab === x} onPress={() => setTab(x)} />)}
      </View>
      {tab === 'Albums' ? (
        <View style={[card, { padding: 14, flexDirection: 'row', alignItems: 'center', gap: 14 }]}>
          <Cover title="Mes ajouts" size={56} />
          <View><Text style={{ color: C.cream, fontSize: 17 }}>Mes ajouts</Text><Text style={{ color: C.grey }}>{TRACKS.length} sons</Text></View>
        </View>
      ) : TRACKS.map((t, i) => (
        <Pressable key={t.t} onPress={() => onPick(i)} style={[card, { flexDirection: 'row', alignItems: 'center', padding: 10, marginBottom: 10, borderColor: i === cur && playing ? C.copper : C.line }]}>
          <Cover title={t.t} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={{ color: i === cur ? C.copper : C.cream, fontSize: 16 }}>{tab === 'Pistes' ? (i + 1) + '. ' : ''}{t.t}</Text>
            <Text style={{ color: C.grey, fontSize: 12 }}>Artiste inconnu</Text>
          </View>
          <Text style={{ color: C.grey }}>{fmt(t.d)}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

export function Lecteur({ cur, playing, time, toggle, next, prev, back, goRank }: { cur: number; playing: boolean; time: number; toggle: () => void; next: () => void; prev: () => void; back: () => void; goRank: () => void }) {
  const [voix, setVoix] = useState(true);
  const [instru, setInstru] = useState(true);
  const t = TRACKS[cur];
  const rb = { width: 56, height: 56, borderRadius: 28, borderWidth: 1, borderColor: C.copper, alignItems: 'center' as const, justifyContent: 'center' as const };
  return (
    <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
      <Pressable onPress={back}><Text style={{ color: C.copper, fontSize: 24 }}>←</Text></Pressable>
      <View style={{ height: 14 }} />
      <Vinyl spin={playing} size={240} />
      <Text style={{ color: C.cream, fontSize: 26, fontFamily: 'serif', textAlign: 'center', marginTop: 18 }}>{t.t}</Text>
      <Text style={{ color: C.grey, textAlign: 'center' }}>Artiste inconnu</Text>
      <View style={{ height: 4, backgroundColor: C.card, borderRadius: 2, marginTop: 18 }}>
        <View style={{ height: 4, width: (Math.min(100, (time / t.d) * 100) + '%') as any, backgroundColor: C.copper, borderRadius: 2 }} />
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
        <Text style={{ color: C.grey, fontSize: 12 }}>{fmt(time)}</Text><Text style={{ color: C.grey, fontSize: 12 }}>{fmt(t.d)}</Text>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 28, marginTop: 14 }}>
        <Pressable onPress={prev} style={rb}><Text style={{ color: C.cream, fontSize: 20 }}>|◄</Text></Pressable>
        <Pressable onPress={toggle} style={[rb, { width: 76, height: 76, borderRadius: 38, backgroundColor: C.copper }]}><Text style={{ color: C.bg, fontSize: 28 }}>{playing ? '❚❚' : '►'}</Text></Pressable>
        <Pressable onPress={next} style={rb}><Text style={{ color: C.cream, fontSize: 20 }}>►|</Text></Pressable>
      </View>
      <View style={{ flexDirection: 'row', gap: 12, marginTop: 22 }}>
        {[['VOIX', voix, setVoix], ['INSTRU', instru, setInstru]].map(([n, v, f]) => (
          <View key={n as string} style={[card, { flex: 1, padding: 12 }]}>
            <Switch value={v as boolean} onValueChange={f as (b: boolean) => void} trackColor={{ false: H('#3A241C'), true: C.red }} thumbColor={v ? C.copper : C.grey} />
            <Text style={{ color: C.cream, marginTop: 6 }}>{n as string} · {v ? 'ALLUMÉE' : 'COUPÉE'}</Text>
          </View>
        ))}
      </View>
      <Pressable onPress={goRank} style={{ marginTop: 22 }}>
        <Text style={{ color: C.cream, fontSize: 18, fontFamily: 'serif', marginBottom: 10 }}>Les plus écoutés  →</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          {TRACKS.slice(0, 4).map((x) => (
            <View key={x.t} style={{ alignItems: 'center', width: 78 }}>
              <Cover title={x.t} size={62} />
              <Text numberOfLines={1} style={{ color: C.cream, fontSize: 11, marginTop: 4 }}>{x.t}</Text>
              <Text style={{ color: C.grey, fontSize: 10 }}>{x.n} écoutes</Text>
            </View>
          ))}
        </View>
      </Pressable>
    </ScrollView>
  );
}

export type Room = { name: string; pub: boolean; code?: string; mine?: boolean; n: number; photo?: string };
const DEMO: Room[] = [{ name: 'Salle Bamako', pub: true, n: 24 }, { name: 'Soirée Ségou', pub: true, n: 61 }, { name: 'Matin doré', pub: true, n: 8 }];

function SallesOld({ mine, goCreate, open }: { mine: Room | null; goCreate: () => void; open: (r: Room) => void }) {
  const [code, setCode] = useState('');
  const rooms = mine && mine.pub ? [mine, ...DEMO] : DEMO;
  return (
    <ScrollView contentContainerStyle={pad}>
      <Head title="Salles en direct" right={<Pressable onPress={mine ? () => open(mine) : goCreate} style={{ borderWidth: 1, borderColor: C.copper, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 }}><Text style={{ color: C.copper }}>{mine ? 'Ma salle' : 'Créer ma salle'}</Text></Pressable>} />
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 18 }}>
        <TextInput value={code} onChangeText={(x) => setCode(x.toUpperCase().replace(/[^A-Z]/g, ''))} maxLength={6} placeholder="Entrer avec un code" placeholderTextColor={C.grey} style={[card, { flex: 1, color: C.cream, paddingHorizontal: 14, letterSpacing: 3 }]} />
        <Pressable onPress={() => Alert.alert('Bientôt', 'Les salles en direct arrivent avec la connexion.')} style={[btn, { paddingHorizontal: 18, paddingVertical: 12 }]}><Text style={{ color: C.bg }}>Entrer</Text></Pressable>
      </View>
      {rooms.map((r) => (
        <View key={r.name} style={[card, { padding: 16, marginBottom: 14 }]}>
          <Text style={{ color: C.copper, fontSize: 12, letterSpacing: 2 }}>● EN DIRECT</Text>
          <Text style={{ color: C.cream, fontSize: 22, fontFamily: 'serif', marginTop: 4 }}>{r.name}</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
            <Text style={{ color: C.grey }}>{r.n} auditeurs</Text>
            <Pressable onPress={() => open(r)} style={[btn, { paddingHorizontal: 20, paddingVertical: 10 }]}><Text style={{ color: C.bg }}>Écouter</Text></Pressable>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const L = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const newCode = () => Array.from({ length: 6 }, () => L[Math.floor(Math.random() * L.length)]).join('');

function CreerOld({ onCreate, back }: { onCreate: (r: Room) => void; back: () => void }) {
  const [name, setName] = useState('');
  const [pub, setPub] = useState(true);
  const [code] = useState(newCode);
  const [photo, setPhoto] = useState<string | null>(null);
  async function pickPhoto() {
    try {
      const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.4 });
      if (!r.canceled) setPhoto(r.assets[0].uri);
    } catch (e: any) { Alert.alert('Erreur photo', String(e && e.message ? e.message : e)); }
  }
  const msg = 'Viens dans ma salle NEGUEZI « ' + (name || 'Ma salle') + ' » ' + (pub ? '' : 'Code : ' + code);
  const tile = (on: boolean) => ({ flex: 1, padding: 14, borderRadius: 16, borderWidth: on ? 2 : 1, borderColor: on ? C.copper : C.line, backgroundColor: C.card });
  return (
    <ScrollView contentContainerStyle={pad}>
      <Pressable onPress={back}><Text style={{ color: C.copper, fontSize: 24 }}>←</Text></Pressable>
      <Head title="Créer ma salle" />
      <Pressable onPress={pickPhoto} style={{ alignSelf: 'center', width: 120, height: 120, borderRadius: 60, borderWidth: 2, borderStyle: 'dashed', borderColor: C.copper, alignItems: 'center', justifyContent: 'center', marginBottom: 20, overflow: 'hidden' }}>
        {photo ? <Image source={{ uri: photo }} style={{ width: 120, height: 120 }} /> : <View style={{ alignItems: 'center' }}><Text style={{ color: C.copper, fontSize: 30 }}>+</Text><Text style={{ color: C.grey, fontSize: 11 }}>Ajouter une photo</Text></View>}
      </Pressable>
      <View style={[card, { paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center' }]}>
        <TextInput value={name} onChangeText={setName} maxLength={50} placeholder="Nom de ta salle" placeholderTextColor={C.grey} style={{ flex: 1, color: C.cream, fontSize: 17 }} />
        <Text style={{ color: C.grey }}>{name.length}/50</Text>
      </View>
      <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
        <Pressable onPress={() => setPub(true)} style={tile(pub)}><Text style={{ color: C.cream, fontSize: 17 }}>Public</Text><Text style={{ color: C.grey, fontSize: 12 }}>tout le monde peut entrer</Text></Pressable>
        <Pressable onPress={() => setPub(false)} style={tile(!pub)}><Text style={{ color: C.cream, fontSize: 17 }}>Privé</Text><Text style={{ color: C.grey, fontSize: 12 }}>sur invitation avec un code</Text></Pressable>
      </View>
      {!pub && (
        <View style={[card, { padding: 14, marginTop: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}>
          <Text style={{ color: C.grey }}>Ton code</Text>
          <Text style={{ color: C.cream, fontSize: 26, fontFamily: 'serif', letterSpacing: 5 }}>{code}</Text>
          <Pressable onPress={() => { Clipboard.setStringAsync(code).then(() => Alert.alert('Copié', code)); }} style={{ borderWidth: 1, borderColor: C.copper, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6 }}><Text style={{ color: C.copper }}>Copier</Text></Pressable>
        </View>
      )}
      <Text style={{ color: C.grey, marginTop: 14, textAlign: 'center' }}>4 DJ sur scène. Le public écoute sans limite.</Text>
      <Pressable disabled={!name.trim()} onPress={() => onCreate({ name: name.trim(), pub, code: pub ? undefined : code, mine: true, n: 1, photo: photo || undefined })} style={[btn, { marginTop: 22, opacity: name.trim() ? 1 : 0.4 }]}><Text style={{ color: C.bg, fontSize: 18 }}>Créer ma salle</Text></Pressable>
      <Pressable onPress={() => Linking.openURL('https://wa.me/?text=' + encodeURIComponent(msg))} style={{ marginTop: 12, borderWidth: 1, borderColor: C.line, borderRadius: 24, paddingVertical: 14, alignItems: 'center' }}><Text style={{ color: C.cream }}>Partager sur WhatsApp</Text></Pressable>
    </ScrollView>
  );
}

function CChip({ label, on, onPress, big }: { label: string; on: boolean; onPress: () => void; big?: boolean }) {
  return (
    <Pressable onPress={onPress} style={{ paddingVertical: big ? 12 : 9, paddingHorizontal: big ? 18 : 16, borderRadius: 22, borderWidth: 1, borderColor: on ? H('#6FA2FF') : H('#223A7A'), backgroundColor: on ? H('#1F5BFF') : 'rgba(10,25,70,0.55)', flex: big ? 1 : undefined, alignItems: 'center' }}>
      <Text style={{ color: on ? H('#FFFFFF') : H('#9DB4E8'), fontSize: big ? 16 : 14, fontWeight: '600' }}>{label}</Text>
    </Pressable>
  );
}

function Disque({ t, d }: { t: string; d: number }) {
  return (
    <View style={{ width: d, height: d, alignItems: 'center', justifyContent: 'center' }}>
      <Image source={require('../assets/classement/vinyle.png')} style={{ width: d, height: d }} resizeMode="contain" />
      <Text style={{ position: 'absolute', color: H('#EAF2FF'), fontSize: d * 0.4, fontWeight: '700', fontFamily: 'serif', textShadowColor: H('#2F6BFF'), textShadowRadius: 8, textShadowOffset: { width: 0, height: 0 } }}>{t.charAt(0).toUpperCase()}</Text>
    </View>
  );
}

const SOC = [require('../assets/classement/socle1.png'), require('../assets/classement/socle2.png'), require('../assets/classement/socle3.png')];
const LAU = [require('../assets/classement/laurier-or.png'), require('../assets/classement/laurier-argent.png')];

function Place({ r, w }: { r: number; w: number }) {
  const d = w * 0.6;
  const sh = w * 0.62;
  return (
    <View style={{ width: w, alignItems: 'center' }}>
      {r === 0 ? <Image source={require('../assets/classement/couronne.png')} style={{ width: d * 0.8, height: d * 0.55, marginBottom: -d * 0.12, zIndex: 3 }} resizeMode="contain" /> : null}
      <View style={{ width: w, height: d, alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
        <Image source={LAU[r === 0 ? 0 : 1]} style={{ position: 'absolute', width: d * 1.45, height: d * 1.05 }} resizeMode="contain" />
        <Disque t={TDEMO[r].t} d={d * 0.8} />
      </View>
      <View style={{ width: w, height: sh, marginTop: -d * 0.22, zIndex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Image source={SOC[r]} style={{ position: 'absolute', width: w, height: sh }} resizeMode="contain" />
        <View style={{ paddingTop: sh * 0.22, alignItems: 'center', width: w * 0.92 }}>
          <Text style={{ color: H('#EAF2FF'), fontSize: r === 0 ? 26 : 22, fontWeight: '800', textShadowColor: H('#2F6BFF'), textShadowRadius: 8, textShadowOffset: { width: 0, height: 0 } }}>{r + 1}</Text>
          <Text numberOfLines={1} style={{ color: H('#FFFFFF'), fontSize: r === 0 ? 15 : 13, fontWeight: '700' }}>{TDEMO[r].t}</Text>
          <Text style={{ color: H('#B8CCF5'), fontSize: 11 }}>{TDEMO[r].n} écoutes</Text>
        </View>
      </View>
    </View>
  );
}

export function Classement() {
  const [who, setWho] = useState('Tout le monde');
  const [per, setPer] = useState('Cette semaine');
  const cw = DimC.get('window').width - 40;
  return (
    <View style={{ flex: 1, backgroundColor: H('#050A1A') }}>
      <Image source={require('../assets/fond.png')} resizeMode="cover" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%', opacity: 0.55 }} />
      <ScrollView contentContainerStyle={pad}>
        <Text style={{ color: H('#EAF2FF'), fontSize: 32, fontWeight: '800', textAlign: 'center', marginBottom: 14, textShadowColor: H('#2F6BFF'), textShadowRadius: 14, textShadowOffset: { width: 0, height: 0 } }}>Classement</Text>
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>{['Tout le monde', 'Mon top'].map((x) => <CChip big key={x} label={x} on={who === x} onPress={() => setWho(x)} />)}</View>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 22, flexWrap: 'wrap' }}>{['Cette semaine', 'Ce mois', 'Depuis le début'].map((x) => <CChip key={x} label={x} on={per === x} onPress={() => setPer(x)} />)}</View>
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end', marginBottom: 22 }}>
          <Place r={1} w={cw * 0.31} />
          <Place r={0} w={cw * 0.38} />
          <Place r={2} w={cw * 0.31} />
        </View>
        {TDEMO.slice(3).map((x, k) => (
          <View key={x.t} style={{ flexDirection: 'row', alignItems: 'center', padding: 10, marginBottom: 12, borderRadius: 22, borderWidth: 1, borderColor: H('#2F6BFF'), backgroundColor: 'rgba(8,24,70,0.6)' }}>
            <View style={{ width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: H('#4D8DFF'), alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: H('#EAF2FF'), fontSize: 18, fontWeight: '600' }}>{k + 4}</Text></View>
            <View style={{ marginLeft: 10 }}><Disque t={x.t} d={46} /></View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text numberOfLines={1} style={{ color: H('#EAF2FF'), fontSize: 17, fontWeight: '700' }}>{x.t}</Text>
              <Text style={{ color: H('#9DB4E8'), fontSize: 13 }}>{x.n} écoutes</Text>
            </View>
            <Text style={{ color: k % 2 ? H('#2F6BFF') : H('#22D3FF'), fontSize: 24 }}>{k % 2 ? '↘' : '↗'}</Text>
          </View>
        ))}
        <Text style={{ color: H('#6F8FC9'), textAlign: 'center', marginTop: 8 }}>Prochain classement vendredi 8h</Text>
      </ScrollView>
    </View>
  );
}

export function Profil({ mine, openRoom }: { mine: Room | null; openRoom: () => void }) {
  const [, tick] = useState(0);
  const [part, setPart] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [name, setName] = useState('Neguezi');
  const ref = useRef<View>(null);
  const top = TDEMO.slice(0, 3);
  async function pick() {
    try {
      const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.4 });
      if (!r.canceled) setPhoto(r.assets[0].uri);
    } catch (e: any) { Alert.alert('Erreur photo', String(e && e.message ? e.message : e)); }
  }
  async function share() {
    try {
      const uri = await captureRef(ref, { format: 'png', quality: 1 });
      if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(uri);
    } catch (e: any) { Alert.alert('Erreur partage', String(e && e.message ? e.message : e)); }
  }
  const glass: any = { backgroundColor: 'rgba(8,24,70,0.72)', borderWidth: 1.5, borderColor: H('#2F6BFF'), borderRadius: 18, shadowColor: H('#2F6BFF'), shadowOpacity: 0.9, shadowRadius: 12, elevation: 8 };
  const gt: any = { color: H('#EAF2FF'), fontFamily: 'serif' };
  const blue: any = { backgroundColor: H('#1D5BFF'), borderWidth: 1, borderColor: H('#7FB0FF'), shadowColor: H('#2F6BFF'), shadowOpacity: 1, shadowRadius: 10, elevation: 8 };
  const hs = [58, 80, 44];
  const order = [1, 0, 2];
  return (
    <ScrollView style={{ backgroundColor: getBg() }} contentContainerStyle={[pad, { paddingBottom: 230 }]}>
      <Head title="Profil" />
      <View style={{ alignItems: 'center', marginBottom: 18 }}>
        <Pressable onPress={pick} style={{ width: 168, height: 168, borderRadius: 84, borderWidth: 3, borderColor: H('#2F6BFF'), backgroundColor: H('#02050F'), alignItems: 'center', justifyContent: 'center', shadowColor: H('#2F6BFF'), shadowOpacity: 1, shadowRadius: 22, elevation: 14 }}>
          <View style={{ width: 144, height: 144, borderRadius: 72, borderWidth: 1, borderColor: H('#1B3A8A'), alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ width: 118, height: 118, borderRadius: 59, borderWidth: 1, borderColor: H('#27489E'), alignItems: 'center', justifyContent: 'center' }}>
              <View style={{ width: 92, height: 92, borderRadius: 46, borderWidth: 2, borderColor: H('#7FB0FF'), overflow: 'hidden', alignItems: 'center', justifyContent: 'center', backgroundColor: H('#0A1B4D') }}>
                {photo ? <Image source={{ uri: photo }} style={{ width: 92, height: 92 }} /> : <Text style={{ color: H('#7FB0FF'), fontSize: 38 }}>+</Text>}
              </View>
            </View>
          </View>
        </Pressable>
        <View style={[glass, { marginTop: 14, paddingHorizontal: 26, paddingVertical: 8, alignItems: 'center' }]}>
          <TextInput value={name} onChangeText={setName} maxLength={24} style={[gt, { fontSize: 26, textAlign: 'center', padding: 0 }]} />
          <Text style={[gt, { fontSize: 13, fontStyle: 'italic', color: H('#BFD6FF') }]}>La musique avec mes bons amis</Text>
        </View>
      </View>
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 18 }}>
        {[['0', 'Écoutes cette semaine'], [String(TRACKS.length), 'Sons'], [mine ? '1' : '0', 'Salles créées']].map(([n, l]) => (
          <View key={l} style={[glass, { flex: 1, padding: 12, alignItems: 'center' }]}>
            <Text style={[gt, { fontSize: 28 }]}>{n}</Text>
            <Text style={{ color: H('#9DBBFF'), fontSize: 11, textAlign: 'center' }}>{l}</Text>
          </View>
        ))}
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 14, marginBottom: 18 }}>
        {ACC.map(([nm, hx], i) => (
          <Pressable key={nm} onPress={() => { setAccent(i); tick((n) => n + 1); }} style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: hx, borderWidth: getAccent() === i ? 3 : 1, borderColor: '#FFFFFF' }} />
        ))}
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 14, marginBottom: 18 }}>
        {BGS.map(([nm, hx], i) => (
          <Pressable key={nm} onPress={() => { setBg(i); tick((n) => n + 1); }} style={{ width: 34, height: 34, borderRadius: 8, backgroundColor: hx, borderWidth: getBgIndex() === i ? 3 : 1, borderColor: '#2F6BFF' }} />
        ))}
      </View>
      <View ref={ref} collapsable={false} style={[glass, { padding: 16, backgroundColor: H('#030818') }]}>
        <Text style={{ color: H('#7FB0FF'), fontSize: 20, fontFamily: 'serif', letterSpacing: 5, textAlign: 'center' }}>NEGUEZI</Text>
        <Text style={[gt, { fontSize: 18, textAlign: 'center', marginBottom: 12 }]}>Mon top de la semaine</Text>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', gap: 8 }}>
          {order.map((k) => (
            <View key={k} style={{ flex: 1, alignItems: 'center' }}>
              {k === 0 ? <Text style={{ color: H('#BFD6FF'), fontSize: 22 }}>♛</Text> : null}
              <View style={[glass, { width: '100%', height: hs[k], alignItems: 'center', justifyContent: 'center', borderRadius: 10 }]}>
                <Text style={[gt, { fontSize: 26 }]}>{k + 1}</Text>
              </View>
              <Text numberOfLines={1} style={{ color: H('#9DBBFF'), fontSize: 11, marginTop: 4 }}>{top[k] ? top[k].t : ''}</Text>
            </View>
          ))}
        </View>
        <Text style={{ color: H('#7FB0FF'), textAlign: 'center', marginTop: 12 }}>Top de {name}</Text>
        <Text style={{ color: H('#9DBBFF'), textAlign: 'center', fontSize: 12, fontStyle: 'italic' }}>la musique avec tes bons amis</Text>
      </View>
      <Pressable onPress={share} style={[btn, blue, { marginTop: 12 }]}><Text style={{ color: H('#FFFFFF'), fontWeight: '700' }}>Partager mon top</Text></Pressable>
      <View style={[glass, { padding: 14, marginTop: 14, flexDirection: 'row', alignItems: 'center' }]}>
        <View style={{ flex: 1 }}><Text style={[gt, { fontSize: 16 }]}>Participer au classement</Text><Text style={{ color: H('#9DBBFF'), fontSize: 12 }}>Ton top 3 est envoyé chaque jeudi</Text></View>
        <Switch value={part} onValueChange={setPart} trackColor={{ false: H('#12214F'), true: H('#2F6BFF') }} thumbColor={part ? H('#FFFFFF') : H('#8FA6D6')} />
      </View>
      <View style={[glass, { padding: 14, marginTop: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}>
        <Text style={[gt, { fontSize: 16 }]}>Ma salle</Text>
        <Pressable onPress={openRoom} style={[btn, blue, { paddingHorizontal: 18, paddingVertical: 8 }]}><Text style={{ color: H('#FFFFFF'), fontWeight: '700' }}>{mine ? 'Ouvrir' : 'Créer'}</Text></Pressable>
      </View>
    </ScrollView>
  );
}

export { Salles, Creer } from './salles';
