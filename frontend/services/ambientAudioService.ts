export class NatureAmbienceEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isRunning: boolean = false;

  // Active procedural audio sources
  private windNode: AudioNode | null = null;
  private windFilter: BiquadFilterNode | null = null;
  private streamIntervalId: number | null = null;
  private cricketsIntervalId: number | null = null;
  private bellIntervalId: number | null = null;
  private onBellPulseCallback: ((intensity: number) => void) | null = null;

  public setBellPulseCallback(cb: (intensity: number) => void): void {
    this.onBellPulseCallback = cb;
  }

  public async start(sharedCtx?: AudioContext): Promise<boolean> {
    if (this.isRunning) return true;

    try {
      if (sharedCtx && sharedCtx.state !== 'closed') {
        this.ctx = sharedCtx;
      } else {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        this.ctx = new AudioContextClass();
      }

      if (this.ctx.state === 'suspended') {
        await this.ctx.resume();
      }

      const master = this.ctx.createGain();
      master.gain.setValueAtTime(0.001, this.ctx.currentTime);
      master.gain.linearRampToValueAtTime(0.24, this.ctx.currentTime + 1.5);
      master.connect(this.ctx.destination);
      this.masterGain = master;
      this.isRunning = true;

      // 1. Rustling Mountain Wind through Bamboo (Pink Noise Generator)
      this.startBambooWind();

      // 2. Babbling River Stream Water Droplets
      this.startBabblingStream();

      // 3. High harmonic mountain crickets / cicadas
      this.startNightCrickets();

      // 4. Distant periodic temple gong
      this.startDistantTempleBell();

      return true;
    } catch (e) {
      console.warn('Nature ambience failed to start', e);
      return false;
    }
  }

  public stop(): void {
    this.isRunning = false;

    if (this.streamIntervalId) {
      clearInterval(this.streamIntervalId);
      this.streamIntervalId = null;
    }
    if (this.cricketsIntervalId) {
      clearInterval(this.cricketsIntervalId);
      this.cricketsIntervalId = null;
    }
    if (this.bellIntervalId) {
      clearTimeout(this.bellIntervalId);
      this.bellIntervalId = null;
    }

    if (this.masterGain && this.ctx && this.ctx.state !== 'closed') {
      try {
        const now = this.ctx.currentTime;
        this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
        this.masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.0);
      } catch (err) {}
    }
  }

  public getActive(): boolean {
    return this.isRunning;
  }

  // Generate continuous bamboo forest wind via procedural noise filtering
  private startBambooWind(): void {
    if (!this.ctx || !this.masterGain) return;

    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99 * b0 + white * 0.05;
      b1 = 0.95 * b1 + white * 0.08;
      b2 = 0.85 * b2 + white * 0.12;
      output[i] = (b0 + b1 + b2) * 0.35;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Resonant bandpass to simulate wind gusting through hollow bamboo
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(380, this.ctx.currentTime);
    filter.Q.setValueAtTime(2.2, this.ctx.currentTime);

    const windGain = this.ctx.createGain();
    windGain.gain.setValueAtTime(0.12, this.ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(windGain);
    windGain.connect(this.masterGain);

    whiteNoise.start();
    this.windNode = whiteNoise;
    this.windFilter = filter;

    // LFO Modulation of wind gusts
    const lfo = this.ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.15, this.ctx.currentTime);
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(140, this.ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start();
  }

  // Stream water droplets with pitched resonant sine pings
  private startBabblingStream(): void {
    this.streamIntervalId = window.setInterval(() => {
      if (!this.isRunning || !this.ctx || !this.masterGain) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const basePitch = 600 + Math.random() * 800;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(basePitch, now);
      osc.frequency.exponentialRampToValueAtTime(basePitch * 1.5, now + 0.06);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.015, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.00001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.09);
    }, 180);
  }

  // Mountain crickets chirping in high frequencies
  private startNightCrickets(): void {
    this.cricketsIntervalId = window.setInterval(() => {
      if (!this.isRunning || !this.ctx || !this.masterGain) return;

      const now = this.ctx.currentTime;
      const pulses = 3 + Math.floor(Math.random() * 3);

      for (let p = 0; p < pulses; p++) {
        const timeOffset = p * 0.055;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(4600 + Math.random() * 300, now + timeOffset);

        gain.gain.setValueAtTime(0.0001, now + timeOffset);
        gain.gain.linearRampToValueAtTime(0.009, now + timeOffset + 0.008);
        gain.gain.exponentialRampToValueAtTime(0.00001, now + timeOffset + 0.045);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now + timeOffset);
        osc.stop(now + timeOffset + 0.05);
      }
    }, 2800);
  }

  // Distant temple gong with long meditative decay
  private startDistantTempleBell(): void {
    const triggerBell = () => {
      if (!this.isRunning || !this.ctx || !this.masterGain) return;

      const now = this.ctx.currentTime;
      const fundamental = 216; // Sacred meditative A
      const partials = [1.0, 1.98, 2.78, 3.44];

      partials.forEach((mult, i) => {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = i === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(fundamental * mult, now);

        const amp = (0.28 / (i + 1)) * 0.25;
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(amp, now + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.00001, now + 8.5);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 8.6);
      });

      if (this.onBellPulseCallback) {
        this.onBellPulseCallback(1.0);
      }

      if (this.isRunning) {
        this.bellIntervalId = window.setTimeout(triggerBell, 16000 + Math.random() * 8000);
      }
    };

    this.bellIntervalId = window.setTimeout(triggerBell, 2000);
  }
}

export const ambientEngine = new NatureAmbienceEngine();
