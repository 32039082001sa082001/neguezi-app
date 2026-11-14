import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, TextInput, Switch, Share, Linking, Alert } from 'react-native';
import { C, TRACKS, fmt } from './theme';
import { Pill, Cover, Vinyl, Head } from './ui';

const pad = { padding: 20, paddingBottom: 170 };
const card = { backgroundColor: C.card, borderRadius: 16, borderWidth: 1, borderColor: C.line };
const btn = { backgroundColor: C.copper, borderRadius: 24, paddingVertical: 14, alignItems: 'center' as const };

export function Sons({ cur, playing, onPick }: { cur: number; playing: boolean; onPick: (i: number) => void }) {
  const [tab, setTab] = useState('Sons');
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
        <View style={{ height: 4, width: Math.min(100, (time / t.d) * 100) + '%', backgroundColor: C.copper, borderRadius: 2 }} />
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
        <Text style={{ color: C.grey, fontSize: 12 }}>{fmt(time)}</Text><Text style={{ color: C.grey, fontSize: 12 }}>{fmt(t.d)}</Text>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 28, marginTop: 14 }}>
        <Pressable onPress={prev} style={rb}><Text style={{ color: C.cream, fontSize: 20 }}>⏮</Text></Pressable>
        <Pressable onPress={toggle} style={[rb, { width: 76, height: 76, borderRadius: 38, backgroundColor: C.copper }]}><Text style={{ color: C.bg, fontSize: 28 }}>{playing ? '⏸' : '▶'}</Text></Pressable>
        <Pressable onPress={next} style={rb}><Text style={{ color: C.cream, fontSize: 20 }}>⏭</Text></Pressable>
      </View>
      <View style={{ flexDirection: 'row', gap: 12, marginTop: 22 }}>
        {[['VOIX', voix, setVoix], ['INSTRU', instru, setInstru]].map(([n, v, f]) => (
          <View key={n as string} style={[card, { flex: 1, padding: 12 }]}>
            <Switch value={v as boolean} onValueChange={f as (b: boolean) => void} trackColor={{ false: '#3A241C', true: C.red }} thumbColor={v ? C.copper : C.grey} />
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

export type Room = { name: string; pub: boolean; code?: string; mine?: boolean; n: number };
const DEMO: Room[] = [{ name: 'Salle Bamako', pub: true, n: 24 }, { name: 'Soirée Ségou', pub: true, n: 61 }, { name: 'Matin doré', pub: true, n: 8 }];

export function Salles({ mine, goCreate }: { mine: Room | null; goCreate: () => void }) {
  const [code, setCode] = useState('');
  const rooms = mine && mine.pub ? [mine, ...DEMO] : DEMO;
  return (
    <ScrollView contentContainerStyle={pad}>
      <Head title="Salles en direct" right={<Pressable onPress={goCreate} style={{ borderWidth: 1, borderColor: C.copper, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 }}><Text style={{ color: C.copper }}>{mine ? 'Ma salle' : 'Créer ma salle'}</Text></Pressable>} />
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
            <Pressable onPress={() => Alert.alert('Bientôt', 'Écouter en direct arrive avec la connexion.')} style={[btn, { paddingHorizontal: 20, paddingVertical: 10 }]}><Text style={{ color: C.bg }}>Écouter</Text></Pressable>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const L = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const newCode = () => Array.from({ length: 6 }, () => L[Math.floor(Math.random() * L.length)]).join('');

export function Creer({ onCreate, back }: { onCreate: (r: Room) => void; back: () => void }) {
  const [name, setName] = useState('');
  const [pub, setPub] = useState(true);
  const [code] = useState(newCode);
  const msg = 'Viens dans ma salle NEGUEZI « ' + (name || 'Ma salle') + ' » ' + (pub ? '' : 'Code : ' + code);
  const tile = (on: boolean) => ({ flex: 1, padding: 14, borderRadius: 16, borderWidth: on ? 2 : 1, borderColor: on ? C.copper : C.line, backgroundColor: C.card });
  return (
    <ScrollView contentContainerStyle={pad}>
      <Pressable onPress={back}><Text style={{ color: C.copper, fontSize: 24 }}>←</Text></Pressable>
      <Head title="Créer ma salle" />
      <View style={{ alignSelf: 'center', width: 120, height: 120, borderRadius: 60, borderWidth: 2, borderStyle: 'dashed', borderColor: C.copper, alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
        <Text style={{ color: C.copper, fontSize: 30 }}>+</Text><Text style={{ color: C.grey, fontSize: 11 }}>Photo (bientôt)</Text>
      </View>
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
          <Pressable onPress={() => Share.share({ message: code })} style={{ borderWidth: 1, borderColor: C.copper, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6 }}><Text style={{ color: C.copper }}>Copier</Text></Pressable>
        </View>
      )}
      <Text style={{ color: C.grey, marginTop: 14, textAlign: 'center' }}>4 DJ sur scène. Le public écoute sans limite.</Text>
      <Pressable disabled={!name.trim()} onPress={() => onCreate({ name: name.trim(), pub, code: pub ? undefined : code, mine: true, n: 1 })} style={[btn, { marginTop: 22, opacity: name.trim() ? 1 : 0.4 }]}><Text style={{ color: C.bg, fontSize: 18 }}>Créer ma salle</Text></Pressable>
      <Pressable onPress={() => Linking.openURL('https://wa.me/?text=' + encodeURIComponent(msg))} style={{ marginTop: 12, borderWidth: 1, borderColor: C.line, borderRadius: 24, paddingVertical: 14, alignItems: 'center' }}><Text style={{ color: C.cream }}>Partager sur WhatsApp</Text></Pressable>
    </ScrollView>
  );
}

export function Classement() {
  const [who, setWho] = useState('Tout le monde');
  const [per, setPer] = useState('Cette semaine');
  const pod = [1, 0, 2];
  return (
    <ScrollView contentContainerStyle={pad}>
      <Head title="Classement" />
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>{['Tout le monde', 'Mon top'].map((x) => <Pill key={x} label={x} on={who === x} onPress={() => setWho(x)} />)}</View>
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 22 }}>{['Cette semaine', 'Ce mois', 'Depuis le début'].map((x) => <Pill key={x} label={x} on={per === x} onPress={() => setPer(x)} />)}</View>
      <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end', gap: 10, marginBottom: 22 }}>
        {pod.map((i) => (
          <View key={i} style={{ alignItems: 'center', width: 100 }}>
            <Cover title={TRACKS[i].t} size={i === 0 ? 92 : 68} />
            <View style={{ backgroundColor: C.red, borderWidth: 1, borderColor: C.copper, width: '100%', height: i === 0 ? 70 : 50, marginTop: 8, borderTopLeftRadius: 10, borderTopRightRadius: 10, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: C.cream, fontSize: 28, fontFamily: 'serif' }}>{i + 1}</Text>
            </View>
            <Text numberOfLines={1} style={{ color: C.cream, fontSize: 12, marginTop: 4 }}>{TRACKS[i].t}</Text>
            <Text style={{ color: C.grey, fontSize: 11 }}>{TRACKS[i].n} écoutes</Text>
          </View>
        ))}
      </View>
      {TRACKS.slice(3).map((x, k) => (
        <View key={x.t} style={[card, { flexDirection: 'row', alignItems: 'center', padding: 10, marginBottom: 10 }]}>
          <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: C.red, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: C.cream }}>{k + 4}</Text></View>
          <Text style={{ flex: 1, color: C.cream, fontSize: 16, marginLeft: 12 }}>{x.t}</Text>
          <Text style={{ color: C.grey, marginRight: 8 }}>{x.n} écoutes</Text>
          <Text style={{ color: k % 2 ? C.copper : C.cream }}>{k % 2 ? '▼' : '▲'}</Text>
        </View>
      ))}
      <Text style={{ color: C.grey, textAlign: 'center', marginTop: 8 }}>Prochain classement vendredi 8h</Text>
    </ScrollView>
  );
}

export function Profil({ mine, openRoom }: { mine: Room | null; openRoom: () => void }) {
  const [part, setPart] = useState(false);
  const top = TRACKS.slice(0, 3);
  return (
    <ScrollView contentContainerStyle={pad}>
      <Head title="Profil" />
      <View style={{ alignItems: 'center', marginBottom: 20 }}>
        <Cover title="N" size={96} />
        <Text style={{ color: C.cream, fontSize: 26, fontFamily: 'serif', marginTop: 10 }}>Neguezi</Text>
        <Text style={{ color: C.grey, fontStyle: 'italic' }}>La musique avec mes bons amis</Text>
      </View>
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 18 }}>
        {[['128', 'Écoutes cette semaine'], [String(TRACKS.length), 'Sons'], [mine ? '1' : '0', 'Salles créées']].map(([n, l]) => (
          <View key={l} style={[card, { flex: 1, padding: 12, alignItems: 'center' }]}><Text style={{ color: C.cream, fontSize: 26, fontFamily: 'serif' }}>{n}</Text><Text style={{ color: C.grey, fontSize: 11, textAlign: 'center' }}>{l}</Text></View>
        ))}
      </View>
      <View style={[card, { padding: 14 }]}>
        <Text style={{ color: C.cream, fontSize: 18, fontFamily: 'serif', marginBottom: 8 }}>Mon top de la semaine</Text>
        {top.map((x, i) => <Text key={x.t} style={{ color: C.cream, marginVertical: 3 }}>{i + 1}. {x.t} <Text style={{ color: C.grey }}>· {x.n} écoutes</Text></Text>)}
        <Pressable onPress={() => Share.share({ message: 'Mon top NEGUEZI : ' + top.map((x, i) => (i + 1) + '. ' + x.t).join(' · ') + ' — la musique avec tes bons amis' })} style={[btn, { marginTop: 12 }]}><Text style={{ color: C.bg }}>Partager mon top</Text></Pressable>
      </View>
      <View style={[card, { padding: 14, marginTop: 14, flexDirection: 'row', alignItems: 'center' }]}>
        <View style={{ flex: 1 }}><Text style={{ color: C.cream, fontSize: 16 }}>Participer au classement</Text><Text style={{ color: C.grey, fontSize: 12 }}>Ton top 3 est envoyé chaque jeudi</Text></View>
        <Switch value={part} onValueChange={setPart} trackColor={{ false: '#3A241C', true: C.red }} thumbColor={part ? C.copper : C.grey} />
      </View>
      <View style={[card, { padding: 14, marginTop: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}>
        <Text style={{ color: C.cream, fontSize: 16 }}>Ma salle</Text>
        <Pressable onPress={openRoom} style={[btn, { paddingHorizontal: 18, paddingVertical: 8 }]}><Text style={{ color: C.bg }}>{mine ? 'Ouvrir' : 'Créer'}</Text></Pressable>
      </View>
    </ScrollView>
  );
}
