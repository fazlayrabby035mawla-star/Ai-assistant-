// Dual-Tone Multi-Frequency (DTMF) dialpad generator via Web Audio API
class DTMFGenerator {
  private ctx: AudioContext | null = null;

  // Standard DTMF frequency pairs (Hz) [lowFreq, highFreq]
  private dtmfFrequencies: Record<string, [number, number]> = {
    '1': [697, 1209],
    '2': [697, 1336],
    '3': [697, 1477],
    '4': [770, 1209],
    '5': [770, 1336],
    '6': [770, 1477],
    '7': [852, 1209],
    '8': [852, 1336],
    '9': [852, 1477],
    '*': [941, 1209],
    '0': [941, 1336],
    '#': [941, 1477],
  };

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  playTone(digit: string, durationMs: number = 140) {
    try {
      this.initContext();
      if (!this.ctx) return;

      const freqs = this.dtmfFrequencies[digit];
      if (!freqs) return;

      const [freq1, freq2] = freqs;
      const now = this.ctx.currentTime;
      const durationSec = durationMs / 1000;

      // Primary oscillator
      const osc1 = this.ctx.createOscillator();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(freq1, now);

      // Secondary oscillator
      const osc2 = this.ctx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(freq2, now);

      // Gain / envelope to prevent audio clicking
      const gainNode = this.ctx.createGain();
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.15, now + 0.015);
      gainNode.gain.setValueAtTime(0.15, now + durationSec - 0.02);
      gainNode.gain.linearRampToValueAtTime(0, now + durationSec);

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(this.ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + durationSec);
      osc2.stop(now + durationSec);

      // Haptic vibration feedback for mobile APK feel
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate(25);
        } catch (_) {}
      }
    } catch (e) {
      // Audio autoplay policy fallback
      console.debug('DTMF audio play failed:', e);
    }
  }

  playRingTone() {
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      osc1.type = 'sine';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(440, now);
      osc2.frequency.setValueAtTime(480, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 1.2);
      osc2.stop(now + 1.2);
    } catch (_) {}
  }
}

export const dtmfSound = new DTMFGenerator();
