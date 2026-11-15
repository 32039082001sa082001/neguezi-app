import { createAudioPlayer } from 'expo-audio';

let lib: any = null;
try { lib = require('react-native-audio-api'); } catch (e) { lib = null; }

const MAX_S = 300;
const st = { tempo: 1, voix: 1, salle: 0 };
let remote: any = null;
let active: any = null;
let wired = false;

export function setRemote(r: any) { remote = r; }
export function setTempo(v: number) { st.tempo = v; try { if (active) active.rate(); } catch (e) {} }
export function setVoix(v: number) { st.voix = v; try { if (active) active.rate(); } catch (e) {} }
export function setVol(v: number) { try { if (active) active.volume = v; } catch (e) {} }
export function setSalle(v: number) { st.salle = v; try { if (active) active.room(); } catch (e) {} }
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
  gain: any = null; wet: any = null; an: any = null; buf8: any = null;
  mode = 'fb'; rs = 'off'; err = ''; playing = false; off = 0; t0 = 0; cr = 1; vol = 1; tk = 0; loading = false; meta: any = {};

  constructor() { active = this; }

  get currentTime(): number {
    try {
      if (this.mode === 'st') return this.playing && this.ctx ? this.off + (this.ctx.currentTime - this.t0) * this.cr : this.off;
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
    this.tk++; this.rs = 'off'; this.stopSrc(); this.mode = 'fb'; this.off = 0; this.buf = null; this.meta = o || {};
    try {
      if (!this.fb) { this.fb = createAudioPlayer({ uri: o.uri }); try { this.fb.addListener('playbackStatusUpdate', (s: any) => { if (s && s.didJustFinish && endCb) endCb(); }); } catch (e) {} }
      else this.fb.replace({ uri: o.uri });
      this.fb.volume = this.vol;
    } catch (e) {}
    this.rate();
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

  rate() {
    const r = st.tempo * st.voix;
    try {
      if (this.mode === 'st') {
        this.off = this.currentTime; this.t0 = this.ctx.currentTime; this.cr = r;
        if (this.src) this.src.playbackRate.value = r;
      } else if (this.fb) {
        this.fb.shouldCorrectPitch = Math.abs(st.voix - 1) < 0.03;
        this.fb.setPlaybackRate(r);
      }
    } catch (e) {}
  }

  room() {
    const on = st.salle > 0.02;
    try { if (this.wet) this.wet.gain.value = st.salle * 0.5; } catch (e) {}
    if (on && this.mode === 'fb' && this.rs !== 'fail' && this.rs !== 'long') this.load(this.meta.uri, this.meta.d, this.tk);
    if (!on && this.mode === 'st') this.toFb();
    if (!on) this.rs = 'off';
  }

  toFb() {
    if (this.mode !== 'st') return;
    const pos = this.currentTime; const was = this.playing;
    this.stopSrc(); this.mode = 'fb'; this.off = pos;
    try { this.fb.seekTo(pos); this.rate(); if (was) this.fb.play(); } catch (e) {}
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
      const r = st.tempo * st.voix;
      try { s.playbackRate.value = r; } catch (e) {}
      this.cr = r;
      this.gain.gain.value = this.vol;
      this.t0 = this.ctx.currentTime;
      s.start(0, this.off);
      this.src = s;
    } catch (e) { this.bail(); }
  }

  build() {
    const c = new lib.AudioContext();
    const gain = c.createGain(); const an = c.createAnalyser();
    an.fftSize = 256;
    gain.connect(an); an.connect(c.destination);
    this.gain = gain; this.an = an; this.buf8 = new Uint8Array(an.frequencyBinCount); this.wet = null;
    try {
      const conv = c.createConvolver(); const len = Math.floor(c.sampleRate * 1.4);
      const ib = c.createBuffer(2, len, c.sampleRate);
      for (let ch = 0; ch < 2; ch++) {
        const dta = ib.getChannelData(ch);
        for (let i = 0; i < len; i++) dta[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
      }
      conv.buffer = ib;
      const wet = c.createGain(); wet.gain.value = st.salle * 0.5;
      gain.connect(conv); conv.connect(wet); wet.connect(an);
      this.wet = wet;
    } catch (e) { this.wet = null; }
    this.ctx = c;
  }

  async load(uri: string, d: number, tk: number) {
    if (st.salle <= 0.02 || this.loading) return;
    if (!lib) { this.rs = 'fail'; this.err = 'module absent'; return; }
    if (!uri) return;
    if (d && d > MAX_S) { this.rs = 'long'; return; }
    this.rs = 'load';
    this.loading = true;
    try {
      if (!this.ctx) this.build();
      const b = this.buf || await this.ctx.decodeAudioData(uri);
      if (tk !== this.tk || st.salle <= 0.02) { if (st.salle <= 0.02) this.rs = 'off'; return; }
      this.buf = b;
      let pos = 0;
      try { pos = this.fb.currentTime || 0; } catch (e) {}
      const was = this.playing;
      if (was) { try { this.fb.pause(); } catch (e) {} }
      this.off = pos; this.mode = 'st'; this.rs = 'on';
      if (was) this.startSrc();
    } catch (e: any) { this.mode = 'fb'; this.rs = 'fail'; this.err = String((e && e.message) || e).slice(0, 80); }
    finally { this.loading = false; if (tk !== this.tk && st.salle > 0.02) this.load(this.meta.uri, this.meta.d, this.tk); }
  }
}

let endCb: (() => void) | null = null;
export function setEnd(f: (() => void) | null) { endCb = f; }
export function createFacade(o: any): any {
  wire();
  const f = new Facade();
  f.replace(o);
  return f;
}

export function getTime(): number { try { return active ? active.currentTime : 0; } catch (e) { return 0; } }
export function getMeta(): any { try { return active ? active.meta : null; } catch (e) { return null; } }
export function isPlaying(): boolean { return !!(active && active.playing); }
export function getRoom(): string { try { return active ? active.rs + '|' + active.err : 'off|'; } catch (e) { return 'off|'; } }

export function seekTo(x: number) { try { const a: any = active; if (!a) return; if (a.mode === 'st') { a.off = x; if (a.playing) a.startSrc(); } else if (a.fb) { a.fb.seekTo(x); } } catch (e) {} }
