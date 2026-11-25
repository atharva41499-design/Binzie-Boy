import type { AudioManifest, BrownieAudioClip, BrownieAudioSlot } from '../types';

const EMPTY_MANIFEST: AudioManifest = {
  demand_meow: [],
  chirp_ekekek: [],
  greeting_trill: [],
  purr_loop: [],
  grumpy_mumble: [],
  zoomies_yowl: [],
};

export class CatAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private delayNode: DelayNode | null = null;
  private delayFeedback: GainNode | null = null;
  private delayWet: GainNode | null = null;

  private manifest: AudioManifest = { ...EMPTY_MANIFEST };
  private bufferCache = new Map<string, AudioBuffer>();
  private purrTimer: number | null = null;
  private purrActive = false;
  private rainSource: AudioBufferSourceNode | null = null;
  private rainGain: GainNode | null = null;
  private rainFilter: BiquadFilterNode | null = null;
  private muted = false;
  private currentRoom = 'Living Room';

  public async loadManifest(): Promise<AudioManifest> {
    try {
      const res = await fetch('/api/brownie-audio');
      if (res.ok) {
        const data = (await res.json()) as { manifest?: AudioManifest };
        if (data.manifest) {
          this.manifest = { ...EMPTY_MANIFEST, ...data.manifest };
          this.bufferCache.clear();
        }
      }
    } catch {
      // Fallback to procedural cat vocals cleanly
    }
    return this.manifest;
  }

  public setManifest(manifest: AudioManifest) {
    this.manifest = { ...EMPTY_MANIFEST, ...manifest };
    this.bufferCache.clear();
  }

  public getManifest(): AudioManifest {
    return this.manifest;
  }

  public setMuted(muted: boolean) {
    this.muted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(muted ? 0 : 0.85, this.ctx.currentTime, 0.04);
    }
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public setRoom(roomName: string) {
    this.currentRoom = roomName;
    if (!this.ctx || !this.delayWet || !this.delayFeedback) return;
    const wet =
      roomName === 'Bathroom'
        ? 0.34
        : roomName === 'Hallway' || roomName === 'Kitchen' || roomName === 'Ground Floor Lobby' || roomName === 'Elevator Cab'
          ? 0.22
          : roomName === 'Balcony' ||
              roomName === 'Sky Terrace Lounge' ||
              roomName === 'Building Rooftop' ||
              roomName === 'Courtyard Garden' ||
              roomName === 'Society Street Gali'
            ? 0.06
            : 0.12;
    this.delayWet.gain.setTargetAtTime(wet, this.ctx.currentTime, 0.12);
    this.delayFeedback.gain.setTargetAtTime(roomName === 'Bathroom' ? 0.38 : 0.18, this.ctx.currentTime, 0.12);
  }

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.muted ? 0 : 0.85;
      this.masterGain.connect(this.ctx.destination);

      this.delayNode = this.ctx.createDelay(0.5);
      this.delayNode.delayTime.value = 0.065;
      this.delayFeedback = this.ctx.createGain();
      this.delayFeedback.gain.value = 0.2;
      this.delayWet = this.ctx.createGain();
      this.delayWet.gain.value = 0.12;

      this.delayNode.connect(this.delayFeedback);
      this.delayFeedback.connect(this.delayNode);
      this.delayNode.connect(this.delayWet);
      this.delayWet.connect(this.masterGain);
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  private routeOutput(node: AudioNode) {
    if (!this.masterGain) return;
    node.connect(this.masterGain);
    if (this.delayNode) {
      node.connect(this.delayNode);
    }
  }

  public async playSlot(slot: BrownieAudioSlot): Promise<'custom' | 'synth'> {
    const ctx = this.ensureContext();
    if (!ctx || this.muted) return 'synth';

    const clips = this.manifest[slot];
    if (clips && clips.length > 0) {
      const pick = clips[Math.floor(Math.random() * clips.length)];
      const played = await this.playCustomClip(pick);
      if (played) return 'custom';
    }

    this.playSynthVocal(slot);
    return 'synth';
  }

  public async previewClip(url: string, trimStart = 0, trimEnd: number | null = null): Promise<void> {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const buffer = await this.fetchBuffer(url);
    if (!buffer) return;
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const gain = ctx.createGain();
    gain.gain.value = 0.95;
    src.connect(gain);
    gain.connect(this.masterGain ?? ctx.destination);

    const start = Math.max(0, Math.min(trimStart, Math.max(0, buffer.duration - 0.05)));
    const duration =
      trimEnd !== null && trimEnd > start ? Math.min(trimEnd - start, buffer.duration - start) : buffer.duration - start;
    src.start(0, start, Math.max(0.05, duration));
  }

  private async fetchBuffer(url: string): Promise<AudioBuffer | null> {
    const ctx = this.ensureContext();
    if (!ctx) return null;
    if (this.bufferCache.has(url)) {
      return this.bufferCache.get(url) ?? null;
    }
    try {
      const res = await fetch(url);
      if (!res.ok) return null;
      const arr = await res.arrayBuffer();
      const buf = await ctx.decodeAudioData(arr);
      this.bufferCache.set(url, buf);
      return buf;
    } catch {
      return null;
    }
  }

  private async playCustomClip(clip: BrownieAudioClip): Promise<boolean> {
    const ctx = this.ensureContext();
    if (!ctx) return false;
    const buffer = await this.fetchBuffer(clip.url);
    if (!buffer) return false;

    const src = ctx.createBufferSource();
    src.buffer = buffer;
    // Slight natural pitch variation (+/- 4%) so repeated meows stay organic
    src.playbackRate.value = 0.96 + Math.random() * 0.08;

    const gain = ctx.createGain();
    gain.gain.value = 1.0;
    src.connect(gain);
    this.routeOutput(gain);

    const start = Math.max(0, Math.min(clip.trimStart || 0, Math.max(0, buffer.duration - 0.05)));
    const duration =
      clip.trimEnd !== null && clip.trimEnd > start
        ? Math.min(clip.trimEnd - start, buffer.duration - start)
        : buffer.duration - start;

    src.onended = () => {
      src.disconnect();
      gain.disconnect();
    };
    src.start(0, start, Math.max(0.05, duration));
    return true;
  }

  public setPurring(active: boolean) {
    if (active === this.purrActive) return;
    this.purrActive = active;
    if (this.purrTimer !== null) {
      window.clearInterval(this.purrTimer);
      this.purrTimer = null;
    }
    if (active) {
      void this.playSlot('purr_loop');
      this.purrTimer = window.setInterval(() => {
        if (this.purrActive) {
          void this.playSlot('purr_loop');
        }
      }, 1750);
    }
  }

  private playSynthVocal(slot: BrownieAudioSlot) {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    if (slot === 'demand_meow') {
      const osc = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const formant = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc2.type = 'triangle';
      const base = 420 + Math.random() * 65;
      osc.frequency.setValueAtTime(base * 0.85, now);
      osc.frequency.exponentialRampToValueAtTime(base * 1.48, now + 0.14);
      osc.frequency.exponentialRampToValueAtTime(base * 0.92, now + 0.44);

      osc2.frequency.setValueAtTime(base * 1.7, now);
      osc2.frequency.exponentialRampToValueAtTime(base * 2.9, now + 0.14);
      osc2.frequency.exponentialRampToValueAtTime(base * 1.8, now + 0.44);

      formant.type = 'bandpass';
      formant.frequency.setValueAtTime(900, now);
      formant.frequency.exponentialRampToValueAtTime(1650, now + 0.15);
      formant.frequency.exponentialRampToValueAtTime(880, now + 0.44);
      formant.Q.value = 3.2;

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.24, now + 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.48);

      osc.connect(formant);
      osc2.connect(formant);
      formant.connect(gain);
      this.routeOutput(gain);

      osc.onended = () => {
        osc.disconnect();
        osc2.disconnect();
        formant.disconnect();
        gain.disconnect();
      };
      osc.start(now);
      osc2.start(now);
      osc.stop(now + 0.5);
      osc2.stop(now + 0.5);
      return;
    }

    if (slot === 'greeting_trill') {
      const osc = ctx.createOscillator();
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(340, now);
      osc.frequency.exponentialRampToValueAtTime(620, now + 0.24);

      lfo.type = 'sine';
      lfo.frequency.value = 34;
      lfoGain.gain.value = 45;
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);

      filter.type = 'bandpass';
      filter.frequency.value = 950;
      filter.Q.value = 2.0;

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.27);

      osc.connect(filter);
      filter.connect(gain);
      this.routeOutput(gain);

      osc.onended = () => {
        osc.disconnect();
        lfo.disconnect();
        lfoGain.disconnect();
        filter.disconnect();
        gain.disconnect();
      };
      osc.start(now);
      lfo.start(now);
      osc.stop(now + 0.29);
      lfo.stop(now + 0.29);
      return;
    }

    if (slot === 'chirp_ekekek') {
      for (let i = 0; i < 4; i++) {
        const t = now + i * 0.095;
        const osc = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(1150 + i * 70, t);
        osc.frequency.exponentialRampToValueAtTime(720, t + 0.055);
        filter.type = 'bandpass';
        filter.frequency.value = 1800;
        filter.Q.value = 4.0;
        gain.gain.setValueAtTime(0.001, t);
        gain.gain.linearRampToValueAtTime(0.14, t + 0.012);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.065);
        osc.connect(filter);
        filter.connect(gain);
        this.routeOutput(gain);
        osc.onended = () => {
          osc.disconnect();
          filter.disconnect();
          gain.disconnect();
        };
        osc.start(t);
        osc.stop(t + 0.07);
      }
      return;
    }

    if (slot === 'purr_loop') {
      const osc = ctx.createOscillator();
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.value = 26;
      lfo.type = 'sine';
      lfo.frequency.value = 2.2;
      lfoGain.gain.value = 0.032;
      lfo.connect(lfoGain);
      lfoGain.connect(gain.gain);

      filter.type = 'lowpass';
      filter.frequency.value = 190;

      gain.gain.setValueAtTime(0.035, now);
      gain.gain.linearRampToValueAtTime(0.088, now + 0.25);
      gain.gain.linearRampToValueAtTime(0.075, now + 1.2);
      gain.gain.linearRampToValueAtTime(0.001, now + 1.65);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain ?? ctx.destination);

      osc.onended = () => {
        osc.disconnect();
        lfo.disconnect();
        lfoGain.disconnect();
        filter.disconnect();
        gain.disconnect();
      };
      osc.start(now);
      lfo.start(now);
      osc.stop(now + 1.68);
      lfo.stop(now + 1.68);
      return;
    }

    if (slot === 'grumpy_mumble') {
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(145, now + 0.34);
      filter.type = 'lowpass';
      filter.frequency.value = 620;
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.19, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.36);
      osc.connect(filter);
      filter.connect(gain);
      this.routeOutput(gain);
      osc.onended = () => {
        osc.disconnect();
        filter.disconnect();
        gain.disconnect();
      };
      osc.start(now);
      osc.stop(now + 0.38);
      return;
    }

    // zoomies_yowl
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(380, now);
    osc.frequency.exponentialRampToValueAtTime(790, now + 0.16);
    osc.frequency.exponentialRampToValueAtTime(510, now + 0.52);
    filter.type = 'bandpass';
    filter.frequency.value = 1400;
    filter.Q.value = 2.6;
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.22, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.54);
    osc.connect(filter);
    filter.connect(gain);
    this.routeOutput(gain);
    osc.onended = () => {
      osc.disconnect();
      filter.disconnect();
      gain.disconnect();
    };
    osc.start(now);
    osc.stop(now + 0.56);
  }

  public playPropClatter(intensity = 1) {
    const ctx = this.ensureContext();
    if (!ctx || this.muted) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    const base = 360 + Math.random() * 280;
    osc.frequency.setValueAtTime(base, now);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.12);
    gain.gain.setValueAtTime(Math.min(0.28, 0.15 * intensity), now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
    osc.connect(gain);
    this.routeOutput(gain);
    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };
    osc.start(now);
    osc.stop(now + 0.15);
  }

  public playSoftLanding() {
    const ctx = this.ensureContext();
    if (!ctx || this.muted) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(135, now);
    osc.frequency.exponentialRampToValueAtTime(52, now + 0.08);
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
    osc.connect(gain);
    gain.connect(this.masterGain ?? ctx.destination);
    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };
    osc.start(now);
    osc.stop(now + 0.1);
  }

  public playLootPickup() {
    const ctx = this.ensureContext();
    if (!ctx || this.muted) return;
    const now = ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
      const t = now + i * 0.065;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.14, t + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
      osc.connect(gain);
      gain.connect(this.masterGain ?? ctx.destination);
      osc.onended = () => {
        osc.disconnect();
        gain.disconnect();
      };
      osc.start(t);
      osc.stop(t + 0.24);
    });
  }

  public playDoorAlert() {
    const ctx = this.ensureContext();
    if (!ctx || this.muted) return;
    const now = ctx.currentTime;
    [660, 880].forEach((freq, idx) => {
      const t = now + idx * 0.12;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
      osc.connect(gain);
      gain.connect(this.masterGain ?? ctx.destination);
      osc.onended = () => {
        osc.disconnect();
        gain.disconnect();
      };
      osc.start(t);
      osc.stop(t + 0.2);
    });
  }

  public playSwitchClick() {
    const ctx = this.ensureContext();
    if (!ctx || this.muted) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(1400, now);
    osc.frequency.exponentialRampToValueAtTime(420, now + 0.03);
    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
    osc.connect(gain);
    gain.connect(this.masterGain ?? ctx.destination);
    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };
    osc.start(now);
    osc.stop(now + 0.045);
  }

  public playKeyboardMash() {
    const ctx = this.ensureContext();
    if (!ctx || this.muted) return;
    const now = ctx.currentTime;
    for (let i = 0; i < 6; i++) {
      const t = now + i * 0.045;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600 + Math.random() * 550, t);
      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
      osc.connect(gain);
      this.routeOutput(gain);
      osc.onended = () => {
        osc.disconnect();
        gain.disconnect();
      };
      osc.start(t);
      osc.stop(t + 0.035);
    }
  }

  public playPaperShred() {
    const ctx = this.ensureContext();
    if (!ctx || this.muted) return;
    const now = ctx.currentTime;
    for (let i = 0; i < 3; i++) {
      const t = now + i * 0.06;
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880 + i * 240, t);
      osc.frequency.exponentialRampToValueAtTime(320, t + 0.08);
      filter.type = 'bandpass';
      filter.frequency.value = 1600;
      gain.gain.setValueAtTime(0.11, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.085);
      osc.connect(filter);
      filter.connect(gain);
      this.routeOutput(gain);
      osc.onended = () => {
        osc.disconnect();
        filter.disconnect();
        gain.disconnect();
      };
      osc.start(t);
      osc.stop(t + 0.09);
    }
  }

  public playBellJingle() {
    const ctx = this.ensureContext();
    if (!ctx || this.muted) return;
    const now = ctx.currentTime;
    [1760, 2217].forEach((freq, idx) => {
      const t = now + idx * 0.04;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.1, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
      osc.connect(gain);
      this.routeOutput(gain);
      osc.onended = () => {
        osc.disconnect();
        gain.disconnect();
      };
      osc.start(t);
      osc.stop(t + 0.24);
    });
  }

  public playWaterSplash() {
    const ctx = this.ensureContext();
    if (!ctx || this.muted) return;
    const now = ctx.currentTime;
    for (let i = 0; i < 3; i++) {
      const t = now + i * 0.07;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(520 + i * 160, t);
      osc.frequency.exponentialRampToValueAtTime(980 + i * 120, t + 0.06);
      gain.gain.setValueAtTime(0.11, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
      osc.connect(gain);
      this.routeOutput(gain);
      osc.onended = () => {
        osc.disconnect();
        gain.disconnect();
      };
      osc.start(t);
      osc.stop(t + 0.075);
    }
  }

  public playElevatorHum() {
    const ctx = this.ensureContext();
    if (!ctx || this.muted) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(58, now);
    osc.frequency.linearRampToValueAtTime(72, now + 0.4);
    osc.frequency.linearRampToValueAtTime(55, now + 1.8);
    filter.type = 'lowpass';
    filter.frequency.value = 180;
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.08, now + 0.25);
    gain.gain.linearRampToValueAtTime(0.07, now + 1.5);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.9);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain ?? ctx.destination);
    osc.onended = () => {
      osc.disconnect();
      filter.disconnect();
      gain.disconnect();
    };
    osc.start(now);
    osc.stop(now + 1.92);
  }

  public playElevatorDing() {
    const ctx = this.ensureContext();
    if (!ctx || this.muted) return;
    const now = ctx.currentTime;
    [987.77, 1318.51].forEach((freq, i) => {
      const t = now + i * 0.14;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.16, t + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.42);
      osc.connect(gain);
      this.routeOutput(gain);
      osc.onended = () => {
        osc.disconnect();
        gain.disconnect();
      };
      osc.start(t);
      osc.stop(t + 0.44);
    });
  }

  public playWatchmanWhistle() {
    const ctx = this.ensureContext();
    if (!ctx || this.muted) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(2480, now);
    lfo.type = 'sine';
    lfo.frequency.value = 38;
    lfoGain.gain.value = 180;
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.16, now + 0.03);
    gain.gain.linearRampToValueAtTime(0.13, now + 0.28);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.36);
    osc.connect(gain);
    this.routeOutput(gain);
    osc.onended = () => {
      osc.disconnect();
      lfo.disconnect();
      lfoGain.disconnect();
      gain.disconnect();
    };
    osc.start(now);
    lfo.start(now);
    osc.stop(now + 0.38);
    lfo.stop(now + 0.38);
  }

  public playDoorKnock() {
    const ctx = this.ensureContext();
    if (!ctx || this.muted) return;
    const now = ctx.currentTime;
    [0, 0.16, 0.32].forEach((offset) => {
      const t = now + offset;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(165, t);
      osc.frequency.exponentialRampToValueAtTime(64, t + 0.07);
      gain.gain.setValueAtTime(0.24, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.085);
      osc.connect(gain);
      this.routeOutput(gain);
      osc.onended = () => {
        osc.disconnect();
        gain.disconnect();
      };
      osc.start(t);
      osc.stop(t + 0.09);
    });
  }

  public playPigeonFlutter() {
    const ctx = this.ensureContext();
    if (!ctx || this.muted) return;
    const now = ctx.currentTime;
    for (let i = 0; i < 4; i++) {
      const t = now + i * 0.055;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(240 + i * 35, t);
      osc.frequency.exponentialRampToValueAtTime(95, t + 0.045);
      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
      osc.connect(gain);
      this.routeOutput(gain);
      osc.onended = () => {
        osc.disconnect();
        gain.disconnect();
      };
      osc.start(t);
      osc.stop(t + 0.055);
    }
  }

  public playDogBark() {
    const ctx = this.ensureContext();
    if (!ctx || this.muted) return;
    const now = ctx.currentTime;
    [0, 0.22].forEach((offset, i) => {
      const t = now + offset;
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(i === 0 ? 390 : 440, t);
      osc.frequency.exponentialRampToValueAtTime(195, t + 0.14);
      filter.type = 'bandpass';
      filter.frequency.value = 820;
      filter.Q.value = 1.6;
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.24, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
      osc.connect(filter);
      filter.connect(gain);
      this.routeOutput(gain);
      osc.onended = () => {
        osc.disconnect();
        filter.disconnect();
        gain.disconnect();
      };
      osc.start(t);
      osc.stop(t + 0.17);
    });
  }

  public playCarAlarm() {
    const ctx = this.ensureContext();
    if (!ctx || this.muted) return;
    const now = ctx.currentTime;
    for (let i = 0; i < 4; i++) {
      const t = now + i * 0.28;
      const osc = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc2.type = 'sawtooth';
      osc.frequency.setValueAtTime(490, t);
      osc2.frequency.setValueAtTime(620, t);
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.14, t + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.17);
      osc.connect(gain);
      osc2.connect(gain);
      this.routeOutput(gain);
      osc.onended = () => {
        osc.disconnect();
        osc2.disconnect();
        gain.disconnect();
      };
      osc.start(t);
      osc2.start(t);
      osc.stop(t + 0.18);
      osc2.stop(t + 0.18);
    }
  }

  public playThunder() {
    const ctx = this.ensureContext();
    if (!ctx || this.muted) return;
    const now = ctx.currentTime;
    const len = Math.floor(ctx.sampleRate * 1.8);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const ch = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      ch[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.65));
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(140, now);
    filter.frequency.exponentialRampToValueAtTime(48, now + 1.6);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.28, now + 0.14);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.75);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain ?? ctx.destination);
    src.onended = () => {
      src.disconnect();
      filter.disconnect();
      gain.disconnect();
    };
    src.start(now);
  }

  public setRainAmbience(active: boolean, outdoor = false) {
    if (!active || this.muted) {
      if (this.rainSource) {
        try {
          this.rainSource.stop();
        } catch {
          // ignore
        }
        this.rainSource.disconnect();
        this.rainFilter?.disconnect();
        this.rainGain?.disconnect();
        this.rainSource = null;
        this.rainFilter = null;
        this.rainGain = null;
      }
      return;
    }

    const ctx = this.ensureContext();
    if (!ctx) return;

    if (!this.rainSource) {
      const len = ctx.sampleRate * 2;
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < len; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = outdoor ? 1450 : 620;
      filter.Q.value = 0.65;

      const gain = ctx.createGain();
      gain.gain.value = outdoor ? 0.085 : 0.035;

      src.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain ?? ctx.destination);
      src.start();

      this.rainSource = src;
      this.rainFilter = filter;
      this.rainGain = gain;
    } else if (this.rainFilter && this.rainGain) {
      this.rainFilter.frequency.setTargetAtTime(outdoor ? 1450 : 620, ctx.currentTime, 0.15);
      this.rainGain.gain.setTargetAtTime(outdoor ? 0.085 : 0.035, ctx.currentTime, 0.15);
    }
  }

  public dispose() {
    this.setPurring(false);
    this.setRainAmbience(false);
    if (this.ctx) {
      void this.ctx.close();
      this.ctx = null;
    }
  }
}
