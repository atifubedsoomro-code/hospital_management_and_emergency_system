// Web Audio API emergency tones and alerts generator (browser native, crisp & non-intrusive)

class SoundEffectsService {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private masterGainValue: number = 0.5; // balanced, non-fatiguing volume

  constructor() {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('hospital_audio_muted_v1');
        if (saved !== null) {
          this.isMuted = saved === 'true';
        }
      }
    } catch {
      // Ignore
    }
  }

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('hospital_audio_muted_v1', String(muted));
      }
    } catch {
      // Ignore
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  // Soft, modern, crisp UI button click tick
  public playClickTone() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      // Crisp 600Hz -> 300Hz quick 35ms micro-tick
      osc.frequency.setValueAtTime(620, now);
      osc.frequency.exponentialRampToValueAtTime(280, now + 0.035);

      gain.gain.setValueAtTime(0.04 * this.masterGainValue, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.035);

      // Subtle haptic tick on mobile if supported
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(8);
      }
    } catch {
      // Audio context may require prior user interaction
    }
  }

  // Welcoming, pleasant login chime (warm rising triad)
  public playLoginTone() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'triangle';

      osc1.frequency.setValueAtTime(440, now); // A4
      osc1.frequency.setValueAtTime(554.37, now + 0.09); // C#5
      osc1.frequency.setValueAtTime(659.25, now + 0.18); // E5
      osc1.frequency.setValueAtTime(880, now + 0.27); // A5

      osc2.frequency.setValueAtTime(220, now);
      osc2.frequency.setValueAtTime(440, now + 0.18);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.09 * this.masterGainValue, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.55);
      osc2.stop(now + 0.55);

      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([15, 40, 25]);
      }
    } catch {
      // Ignore
    }
  }

  // Soft, calming logout tone (gentle descent)
  public playLogoutTone() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, now); // E5
      osc.frequency.setValueAtTime(554.37, now + 0.09); // C#5
      osc.frequency.setValueAtTime(440, now + 0.18); // A4

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.07 * this.masterGainValue, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.4);

      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(15);
      }
    } catch {
      // Ignore
    }
  }

  // Emergency dispatch incoming alert (siren tone)
  public playEmergencyAlert() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sawtooth';
      osc2.type = 'sine';

      osc1.frequency.setValueAtTime(880, now);
      osc1.frequency.setValueAtTime(659, now + 0.15);
      osc1.frequency.setValueAtTime(987, now + 0.3);
      osc1.frequency.setValueAtTime(784, now + 0.45);

      osc2.frequency.setValueAtTime(440, now);
      osc2.frequency.setValueAtTime(330, now + 0.15);
      osc2.frequency.setValueAtTime(494, now + 0.3);
      osc2.frequency.setValueAtTime(392, now + 0.45);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.12 * this.masterGainValue, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.65);
      osc2.stop(now + 0.65);
    } catch {
      // Ignore
    }
  }

  // Doctor pager beep / notification ping
  public playPagerChime() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1046.5, now);
      osc.frequency.setValueAtTime(1318.5, now + 0.1);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.08 * this.masterGainValue, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.3);
    } catch {
      // Ignore
    }
  }

  // Status transition click / confirm
  public playSuccessTone() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.setValueAtTime(659.25, now + 0.07);
      osc.frequency.setValueAtTime(783.99, now + 0.14);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.07 * this.masterGainValue, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.28);
    } catch {
      // Ignore
    }
  }

  public playStatusUpdateTone() {
    this.playSuccessTone();
  }
}

export const soundEffects = new SoundEffectsService();
