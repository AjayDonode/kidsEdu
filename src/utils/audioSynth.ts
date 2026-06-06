// Web Audio API Synthesis for game sound effects (TypeScript)

class SoundSynth {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;

  init(): void {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute(): boolean {
    this.muted = !this.muted;
    return this.muted;
  }

  isMuted(): boolean {
    return this.muted;
  }

  playCorrect(): void {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // Upward cheerful arpeggio (C5, E5, G5, C6)
    const notes = [523.25, 659.25, 783.99, 1046.50];
    const duration = 0.08;

    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'triangle'; // Flute/retro tone
      osc.frequency.setValueAtTime(freq, now + idx * duration);
      
      gain.gain.setValueAtTime(0.15, now + idx * duration);
      gain.gain.exponentialRampToValueAtTime(0.01, now + idx * duration + duration);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start(now + idx * duration);
      osc.stop(now + idx * duration + duration);
    });
  }

  playIncorrect(): void {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now); // A3
    osc.frequency.linearRampToValueAtTime(110, now + 0.3); // Slide down to A2
    
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.3);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.3);
  }

  playLevelUp(): void {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // Trumpet-like Fanfare (C4, G4, C5, E5, G5, C6)
    const notes = [261.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
    const timings = [0, 0.1, 0.2, 0.3, 0.4, 0.5];
    
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, now + timings[idx]);
      
      gain.gain.setValueAtTime(0.08, now + timings[idx]);
      const sustain = idx === notes.length - 1 ? 0.6 : 0.15;
      gain.gain.exponentialRampToValueAtTime(0.001, now + timings[idx] + sustain);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start(now + timings[idx]);
      osc.stop(now + timings[idx] + sustain);
    });
  }

  playClick(): void {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.05);
    
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.05);
  }
}

export const audioSynth = new SoundSynth();
