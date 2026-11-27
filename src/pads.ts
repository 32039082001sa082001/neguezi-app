import { createAudioPlayer } from 'expo-audio';
const SRC: any = {
  Hat: require('../assets/pads/hat.mp3'),
  Clap: require('../assets/pads/clap.mp3'),
  Basse: require('../assets/pads/lowfx.mp3'),
  'Sirène': require('../assets/pads/sirene.mp3'),
  Voix: require('../assets/pads/foule.mp3'),
};
const P: any = {};
const TM: any = {};
export function padPlay(k: string) { try { const s = SRC[k]; if (!s) return;
  if (!P[k]) P[k] = createAudioPlayer(s); P[k].seekTo(0); P[k].play(); const p = P[k]; clearTimeout(TM[k]); TM[k] = setTimeout(() => { try { p.pause(); } catch (e) {} }, 3000); } catch (e) {} }
