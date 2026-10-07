// Web Speech Synthesis API voice readout service
export interface SpeechState {
  isPlaying: boolean;
  isPaused: boolean;
  supported: boolean;
}

class SpeechBriefingService {
  private utterance: SpeechSynthesisUtterance | null = null;
  private onStateChangeCallback: ((state: SpeechState) => void) | null = null;
  private isPlaying = false;
  private isPaused = false;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => {
        // Voices loaded
      };
    }
  }

  isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  subscribe(callback: (state: SpeechState) => void) {
    this.onStateChangeCallback = callback;
    this.notify();
  }

  private notify() {
    if (this.onStateChangeCallback) {
      this.onStateChangeCallback({
        isPlaying: this.isPlaying,
        isPaused: this.isPaused,
        supported: this.isSupported(),
      });
    }
  }

  speak(text: string, rate: number = 1.0) {
    if (!this.isSupported()) return;

    this.stop();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = 1.0;

    // Pick best English voice if available
    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(
      (v) => (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel')) && v.lang.startsWith('en')
    ) || voices.find((v) => v.lang.startsWith('en'));

    if (naturalVoice) {
      utterance.voice = naturalVoice;
    }

    utterance.onstart = () => {
      this.isPlaying = true;
      this.isPaused = false;
      this.notify();
    };

    utterance.onend = () => {
      this.isPlaying = false;
      this.isPaused = false;
      this.notify();
    };

    utterance.onerror = (e) => {
      console.warn('SpeechSynthesis error:', e);
      this.isPlaying = false;
      this.isPaused = false;
      this.notify();
    };

    this.utterance = utterance;
    window.speechSynthesis.speak(utterance);
  }

  pause() {
    if (!this.isSupported()) return;
    if (this.isPlaying && !this.isPaused) {
      window.speechSynthesis.pause();
      this.isPaused = true;
      this.notify();
    }
  }

  resume() {
    if (!this.isSupported()) return;
    if (this.isPlaying && this.isPaused) {
      window.speechSynthesis.resume();
      this.isPaused = false;
      this.notify();
    }
  }

  stop() {
    if (!this.isSupported()) return;
    window.speechSynthesis.cancel();
    this.isPlaying = false;
    this.isPaused = false;
    this.notify();
  }
}

export const speechBriefing = new SpeechBriefingService();
