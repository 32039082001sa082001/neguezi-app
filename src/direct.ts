import { useEffect, useState } from 'react';
import { Room, RoomEvent } from 'livekit-client';
import { PermissionsAndroid } from 'react-native';
import { AudioSession } from '@livekit/react-native';
export function useDirect(live: any, dj: boolean) {
  const [n, setN] = useState(0);
  const [err, setErr] = useState('');
  const [noms, setNoms] = useState<any[]>([]);
  useEffect(() => {
    if (!live) return;
    const room = new Room();
    const maj = () => { setN(room.remoteParticipants.size + 1); setNoms([room.localParticipant, ...Array.from(room.remoteParticipants.values())].map((p: any) => ({ nom: p.name || p.identity, dj: !!p.permissions?.canPublish }))); };
    room.on(RoomEvent.ParticipantConnected, maj);
    room.on(RoomEvent.ParticipantDisconnected, maj);
    room.on(RoomEvent.ParticipantPermissionsChanged, maj);
    let ok = true;
    (async () => {
      try {
        await AudioSession.startAudioSession();
        await room.connect(live.url, live.token);
        if (dj) {
          const p = await PermissionsAndroid.request('android.permission.RECORD_AUDIO');
          if (p === 'granted') await room.localParticipant.setMicrophoneEnabled(true);
          else setErr('Micro refuse');
        }
        if (ok) maj();
      } catch (e: any) { setErr(String(e?.message || e)); }
    })();
    return () => { ok = false; room.disconnect(); AudioSession.stopAudioSession(); };
  }, [live, dj]);
  return { n, err, noms };
}
