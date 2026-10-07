// Speech Recognition Voice Command Service
export interface VoiceCommandResult {
  command: string;
  intent: 'call' | 'briefing' | 'gmail' | 'whatsapp' | 'call_back' | 'dialer' | 'download' | 'stop' | 'unknown';
  target?: string;
  rawText: string;
}

type VoiceCallback = (result: VoiceCommandResult) => void;
type StatusCallback = (status: 'listening' | 'processing' | 'idle' | 'unsupported', text?: string) => void;

class VoiceCommandService {
  private recognition: any = null;
  private isListening = false;
  private onCommandCallback: VoiceCallback | null = null;
  private onStatusCallback: StatusCallback | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';

        this.recognition.onstart = () => {
          this.isListening = true;
          this.notifyStatus('listening', 'Listening for your voice command...');
        };

        this.recognition.onresult = (event: any) => {
          const current = event.resultIndex;
          const transcript = event.results[current][0].transcript;
          const isFinal = event.results[current].isFinal;

          this.notifyStatus('listening', transcript);

          if (isFinal) {
            this.handleParsedCommand(transcript);
          }
        };

        this.recognition.onerror = (event: any) => {
          console.warn('Speech recognition error:', event.error);
          this.isListening = false;
          this.notifyStatus('idle', `Error: ${event.error}`);
        };

        this.recognition.onend = () => {
          this.isListening = false;
          this.notifyStatus('idle');
        };
      }
    }
  }

  isSupported(): boolean {
    return !!this.recognition;
  }

  onCommand(callback: VoiceCallback) {
    this.onCommandCallback = callback;
  }

  onStatus(callback: StatusCallback) {
    this.onStatusCallback = callback;
  }

  private notifyStatus(status: 'listening' | 'processing' | 'idle' | 'unsupported', text?: string) {
    if (this.onStatusCallback) {
      this.onStatusCallback(status, text);
    }
  }

  startListening() {
    if (!this.recognition) {
      this.notifyStatus('unsupported', 'Voice recognition is not supported in this browser.');
      return;
    }

    try {
      if (this.isListening) {
        this.recognition.stop();
      }
      this.recognition.start();
    } catch (e) {
      console.warn('Could not start recognition:', e);
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (_) {}
    }
    this.isListening = false;
    this.notifyStatus('idle');
  }

  private handleParsedCommand(rawText: string) {
    const text = rawText.toLowerCase().trim();
    let intent: VoiceCommandResult['intent'] = 'unknown';
    let target: string | undefined;

    // Pattern matching
    if (text.startsWith('call back') || text.includes('call back')) {
      intent = 'call_back';
    } else if (text.startsWith('call ') || text.startsWith('dial ') || text.startsWith('phone ')) {
      intent = 'call';
      target = text.replace(/^(?:call|dial|phone)\s+/i, '').trim();
    } else if (
      text.includes('miss') ||
      text.includes('missed') ||
      text.includes('what did i miss') ||
      text.includes('briefing') ||
      text.includes('catch up') ||
      text.includes('summary')
    ) {
      intent = 'briefing';
    } else if (text.includes('gmail') || text.includes('email') || text.includes('inbox')) {
      intent = 'gmail';
    } else if (text.includes('whatsapp') || text.includes('message') || text.includes('chat')) {
      intent = 'whatsapp';
    } else if (text.includes('dialer') || text.includes('keypad')) {
      intent = 'dialer';
    } else if (text.includes('download') || text.includes('install') || text.includes('apk')) {
      intent = 'download';
    } else if (text.includes('stop') || text.includes('pause') || text.includes('cancel')) {
      intent = 'stop';
    }

    const result: VoiceCommandResult = {
      command: text,
      intent,
      target,
      rawText,
    };

    if (this.onCommandCallback) {
      this.onCommandCallback(result);
    }
  }
}

export const voiceCommandEngine = new VoiceCommandService();
