import { createAudioPlayer } from 'expo-audio';

let lib: any = null;
try { lib = require('react-native-audio-api'); } catch (e) { lib = null; }

const MAX_S = 300;
const fx = { bass: false, concert: false };
let remote: any = null;
let active: any = null;
let wired = false;

export function setRemote(r: any) { remote = r; }
export function setBass(v: boolean) { fx.bass = v; try { if (active && active.bass) active.bass.gain.value = v ? 9 : 0; } catch (e) {} }
export function setConcert(v: boolean) { fx.concert = v; try { if (active && active.wet) active.wet.gain.value = v ? 0.45 : 0; } catch (e) {} }
export function getLevel(): number {
  try {
    const a = active;
    if (!a || a.mode !== 'st' || !a.playing || !a.an) return 0;
    a.an.getByteFrequencyData(a.buf8);
    let s = 0;
    for (let i = 0; i < 12; i++) s += a.buf8[i];
    return s / (12 * 255);
  } catch (e) { return 0; }
}
function quiet(r: any) { try { if (r && r.catch) r.catch(() => {}); } catch (e) {} }

function wire() {
  if (wired || !lib || !lib.PlaybackNotificationManager) return;
  wired = true;
  const M = lib.PlaybackNotificationManager;
  try { quiet(lib.AudioManager && lib.AudioManager.requestNotificationPermissions && lib.AudioManager.requestNotificationPermissions()); } catch (e) {}
  ['play', 'pause', 'nextTrack', 'previousTrack'].forEach((c) => { try { quiet(M.enableControl && M.enableControl(c, true)); } catch (e) {} });
  const on = (n: string, f: () => void) => { try { M.addEventListener(n, () => { try { if (remote) f(); } catch (e) {} }); } catch (e) {} };
  on('playbackNotificationPlay', () => remote.play());
  on('playbackNotificationPause', () => remote.pause());
  on('playbackNotificationNextTrack', () => remote.next());
  on('playbackNotificationPreviousTrack', () => remote.prev());
}

class Facade {
  fb: any = null; ctx: any = null; src: any = null; buf: any = null;
  gain: any = null; bass: any = null; wet: any = null; an: any = null; buf8: any = null;
  mode = 'fb'; playing = false; off = 0; t0 = 0; vol = 1; tk = 0; meta: any = {};

  constructor() { active = this; }

  get currentTime(): number {
    try {
      if (this.mode === 'st') return this.playing && this.ctx ? this.off + (this.ctx.currentTime - this.t0) : this.off;
      return (this.fb && this.fb.currentTime) || 0;
    } catch (e) { return 0; }
  }
  get volume(): number { return this.vol; }
  set volume(v: number) {
    this.vol = v;
    try {
      if (this.mode === 'st' && this.gain) this.gain.gain.value = v;
      else if (this.fb) this.fb.volume = v;
    } catch (e) {}
  }

  replace(o: any) {
    this.tk++; this.stopSrc(); this.mode = 'fb'; this.off = 0; this.buf = null; this.meta = o || {};
    try {
      if (!this.fb) this.fb = createAudioPlayer({ uri: o.uri });
      else this.fb.replace({ uri: o.uri });
      this.fb.volume = this.vol;
    } catch (e) {}
    this.load(o.uri, o.d, this.tk);
  }

  play() {
    this.playing = true;
    try {
      if (this.mode === 'st') { if (!this.src) this.startSrc(); }
      else if (this.fb) this.fb.play();
    } catch (e) {}
    this.notify();
  }

  pause() {
    try {
      if (this.mode === 'st') { this.off = this.currentTime; this.stopSrc(); }
      else if (this.fb) this.fb.pause();
    } catch (e) {}
    this.playing = false;
    this.notify();
  }

  setActiveForLockScreen(a: any, b: any) {
    if (lib && lib.PlaybackNotificationManager) { this.notify(); return; }
    try { if (this.fb) this.fb.setActiveForLockScreen(a, b); } catch (e) {}
  }

  notify() {
    try {
      if (!lib || !lib.PlaybackNotificationManager) return;
      quiet(lib.PlaybackNotificationManager.show({
        title: this.meta.t || 'NEGUEZI', artist: 'NEGUEZI', duration: this.meta.d || 0,
        elapsedTime: this.currentTime, state: this.playing ? 'playing' : 'paused',
      }));
    } catch (e) {}
  }

  stopSrc() {
    if (this.src) {
      try { this.src.stop(); } catch (e) {}
      try { this.src.disconnect(); } catch (e) {}
      this.src = null;
    }
  }

  bail() {
    this.mode = 'fb';
    try { this.fb.seekTo(this.off); this.fb.play(); } catch (e) {}
  }

  startSrc() {
    try {
      this.stopSrc();
      try { quiet(this.ctx.resume()); } catch (e) {}
      const s = this.ctx.createBufferSource();
      s.buffer = this.buf;
      s.connect(this.gain);
      this.gain.gain.value = this.vol;
      this.t0 = this.ctx.currentTime;
      s.start(0, this.off);
      this.src = s;
    } catch (e) { this.bail(); }
  }

  build() {
    const c = new lib.AudioContext();
    const gain = c.createGain(); const bass = c.createBiquadFilter(); const an = c.createAnalyser(); const dry = c.createGain();
    bass.type = 'lowshelf'; bass.frequency.value = 180; bass.gain.value = fx.bass ? 9 : 0;
    an.fftSize = 256;
    gain.connect(bass); bass.connect(dry); dry.connect(an); an.connect(c.destination);
    this.gain = gain; this.bass = bass; this.an = an; this.buf8 = new Uint8Array(an.frequencyBinCount); this.wet = null;
    try {
      const conv = c.createConvolver(); const len = Math.floor(c.sampleRate * 1.6);
      const ib = c.createBuffer(2, len, c.sampleRate);
      for (let ch = 0; ch < 2; ch++) {
        const dta = ib.getChannelData(ch);
        for (let i = 0; i < len; i++) dta[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
      }
      conv.buffer = ib;
      const wet = c.createGain(); wet.gain.value = fx.concert ? 0.45 : 0;
      bass.connect(conv); conv.connect(wet); wet.connect(an);
      this.wet = wet;
    } catch (e) { this.wet = null; }
    this.ctx = c;
  }

  async load(uri: string, d: number, tk: number) {
    if (!lib || (d && d > MAX_S)) return;
    try {
      if (!this.ctx) this.build();
      const b = await this.ctx.decodeAudioData(uri);
      if (tk !== this.tk) return;
      this.buf = b;
      let pos = 0;
      try { pos = this.fb.currentTime || 0; } catch (e) {}
      const was = this.playing;
      if (was) { try { this.fb.pause(); } catch (e) {} }
      this.off = pos; this.mode = 'st';
      if (was) this.startSrc();
    } catch (e) { this.mode = 'fb'; }
  }
}

export function createFacade(o: any): any {
  wire();
  const f = new Facade();
  f.replace(o);
  return f;
}
