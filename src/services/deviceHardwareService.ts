// Full Mobile Device Hardware & System Capabilities Integration
export interface DeviceCapabilities {
  batteryLevel: number | null;
  isCharging: boolean | null;
  networkType: string;
  isOnline: boolean;
  hasVibration: boolean;
  hasSpeechRecognition: boolean;
  hasSpeechSynthesis: boolean;
  hasNotifications: boolean;
  notificationPermission: NotificationPermission | 'unsupported';
  hasGeolocation: boolean;
  locationName?: string;
  hasWakeLock: boolean;
}

class DeviceHardwareService {
  private capabilities: DeviceCapabilities = {
    batteryLevel: 94,
    isCharging: false,
    networkType: '5G / Wi-Fi',
    isOnline: true,
    hasVibration: false,
    hasSpeechRecognition: false,
    hasSpeechSynthesis: false,
    hasNotifications: false,
    notificationPermission: 'default',
    hasGeolocation: false,
    hasWakeLock: false,
  };

  private listeners: Array<(caps: DeviceCapabilities) => void> = [];

  constructor() {
    this.detectCapabilities();
  }

  async detectCapabilities() {
    if (typeof window === 'undefined') return;

    this.capabilities.isOnline = navigator.onLine;
    this.capabilities.hasVibration = 'vibrate' in navigator;
    this.capabilities.hasSpeechRecognition =
      'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
    this.capabilities.hasSpeechSynthesis = 'speechSynthesis' in window;
    this.capabilities.hasNotifications = 'Notification' in window;
    this.capabilities.hasGeolocation = 'geolocation' in navigator;
    this.capabilities.hasWakeLock = 'wakeLock' in navigator;

    if ('Notification' in window) {
      this.capabilities.notificationPermission = Notification.permission;
    } else {
      this.capabilities.notificationPermission = 'unsupported';
    }

    // Battery API
    if ('getBattery' in navigator) {
      try {
        const battery: any = await (navigator as any).getBattery();
        this.capabilities.batteryLevel = Math.round(battery.level * 100);
        this.capabilities.isCharging = battery.charging;

        battery.addEventListener('levelchange', () => {
          this.capabilities.batteryLevel = Math.round(battery.level * 100);
          this.notify();
        });
        battery.addEventListener('chargingchange', () => {
          this.capabilities.isCharging = battery.charging;
          this.notify();
        });
      } catch (_) {}
    }

    // Network connection API
    if ('connection' in navigator) {
      const conn: any = (navigator as any).connection;
      if (conn?.effectiveType) {
        this.capabilities.networkType = conn.effectiveType.toUpperCase();
      }
    }

    this.notify();
  }

  async requestMicrophoneAccess(): Promise<boolean> {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((track) => track.stop());
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  async requestNotificationAccess(): Promise<NotificationPermission> {
    if ('Notification' in window) {
      try {
        const perm = await Notification.requestPermission();
        this.capabilities.notificationPermission = perm;
        this.notify();
        return perm;
      } catch {
        return 'denied';
      }
    }
    return 'denied';
  }

  async requestLocationAccess(): Promise<GeolocationPosition | null> {
    if (!('geolocation' in navigator)) return null;

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          this.capabilities.locationName = `GPS Active (${pos.coords.latitude.toFixed(2)}, ${pos.coords.longitude.toFixed(2)})`;
          this.notify();
          resolve(pos);
        },
        () => resolve(null),
        { timeout: 5000 }
      );
    });
  }

  triggerHaptic(pattern: number | number[] = 40) {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch (_) {}
    }
  }

  getCapabilities(): DeviceCapabilities {
    return { ...this.capabilities };
  }

  subscribe(listener: (caps: DeviceCapabilities) => void) {
    this.listeners.push(listener);
    listener(this.capabilities);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l({ ...this.capabilities }));
  }
}

export const deviceHardware = new DeviceHardwareService();
