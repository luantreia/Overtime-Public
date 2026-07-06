type AudioContextCtor = typeof AudioContext;

export class GameAudio {
  private ctx: AudioContext | null = null;

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const Ctor: AudioContextCtor | undefined = window.AudioContext || (window as any).webkitAudioContext;
      if (!Ctor) return null;
      this.ctx = new Ctor();
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  /** Must be called from a user-gesture handler (e.g. the "Jugar" click) to satisfy autoplay policies. */
  unlock() {
    this.ensureContext();
  }

  private tone(freqStart: number, freqEnd: number, duration: number, type: OscillatorType = 'sine', gainPeak = 0.2) {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(freqStart, now);
    osc.frequency.linearRampToValueAtTime(freqEnd, now + duration);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(gainPeak, now + 0.02);
    gain.gain.linearRampToValueAtTime(0, now + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  playThrow() { this.tone(300, 700, 0.15, 'sine', 0.15); }
  playHit() { this.tone(120, 55, 0.2, 'square', 0.25); }
  playCatch() { this.tone(500, 900, 0.12, 'triangle', 0.2); }
  playEliminate() { this.tone(400, 90, 0.35, 'sawtooth', 0.2); }
  playWhistle() { this.tone(1100, 1100, 0.4, 'square', 0.12); }
  playPowerUp() { this.tone(600, 1200, 0.25, 'triangle', 0.2); }
}
