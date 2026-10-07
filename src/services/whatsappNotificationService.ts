import type { WhatsAppMessage } from '../types';

export interface WhatsAppNotification {
  id: string;
  sender: string;
  phoneNumber?: string;
  snippet: string; // first few words
  fullText: string;
  timestamp: string;
  isUnread: boolean;
  receivedAt: Date;
}

class WhatsAppPrivacyReader {
  private notifications: WhatsAppNotification[] = [];
  private listeners: Array<(notifications: WhatsAppNotification[]) => void> = [];

  constructor() {
    this.notifications = [
      {
        id: 'wa-notif-1',
        sender: 'Marcus Vance',
        phoneNumber: '+15552348901',
        snippet: 'Hey Fazlay, sent you an urgent...',
        fullText: 'Hey Fazlay, sent you an urgent email too! Can we jump on a quick call before 4 PM demo?',
        timestamp: '2:20 PM',
        isUnread: true,
        receivedAt: new Date(Date.now() - 40 * 60 * 1000),
      },
      {
        id: 'wa-notif-2',
        sender: 'Mom',
        phoneNumber: '+15558901234',
        snippet: 'Call me when you are free...',
        fullText: 'Call me when you are free today sweetie! Did you eat lunch?',
        timestamp: '12:50 PM',
        isUnread: true,
        receivedAt: new Date(Date.now() - 130 * 60 * 1000),
      },
      {
        id: 'wa-notif-3',
        sender: 'David (Mobile Dev)',
        phoneNumber: '+15556718822',
        snippet: 'Android APK build is compiling cleanly...',
        fullText: 'Android APK build is compiling cleanly with the new service worker & DTMF dialer!',
        timestamp: '11:10 AM',
        isUnread: true,
        receivedAt: new Date(Date.now() - 230 * 60 * 1000),
      },
      {
        id: 'wa-notif-4',
        sender: 'Alex Rivera',
        phoneNumber: '+15554321100',
        snippet: 'Sounds great, see you tomorrow...',
        fullText: 'Sounds great, see you tomorrow for lunch!',
        timestamp: '8:40 AM',
        isUnread: false,
        receivedAt: new Date(Date.now() - 380 * 60 * 1000),
      },
    ];
  }

  getNotifications(): WhatsAppNotification[] {
    return [...this.notifications];
  }

  getUnreadSummary(): { sender: string; firstWords: string; timestamp: string; phone?: string }[] {
    return this.notifications
      .filter((n) => n.isUnread)
      .map((n) => ({
        sender: n.sender,
        firstWords: n.snippet,
        timestamp: n.timestamp,
        phone: n.phoneNumber,
      }));
  }

  async requestNotificationAccess(): Promise<NotificationPermission | 'unsupported'> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'unsupported';
    }
    try {
      const permission = await Notification.requestPermission();
      return permission;
    } catch {
      return 'denied';
    }
  }

  // Parse raw notification or copied WhatsApp message in privacy-preserving way
  parseIncomingNotification(rawText: string, customSender?: string): WhatsAppNotification {
    const lines = rawText.trim().split('\n');
    let sender = customSender || 'WhatsApp Contact';
    let content = rawText;
    let phoneNumber: string | undefined;

    // Detect format: "Sender Name (+1 234...): Message..."
    const match = rawText.match(/^(?:\[?\d{1,2}:\d{2}\s*(?:AM|PM)?\]?\s*)?([^:\n]+?)(?:\s*\(([^)]+)\))?:\s*(.+)$/is);
    if (match) {
      sender = match[1].trim();
      phoneNumber = match[2]?.trim();
      content = match[3].trim();
    } else if (lines.length > 1) {
      sender = lines[0].trim();
      content = lines.slice(1).join(' ').trim();
    }

    // Extract first 5-7 words for privacy snippet
    const words = content.split(/\s+/);
    const firstWords = words.slice(0, 6).join(' ') + (words.length > 6 ? '...' : '');

    const newNotif: WhatsAppNotification = {
      id: `wa-${Date.now()}`,
      sender,
      phoneNumber: phoneNumber || '+1555' + Math.floor(1000000 + Math.random() * 9000000),
      snippet: firstWords,
      fullText: content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isUnread: true,
      receivedAt: new Date(),
    };

    this.notifications.unshift(newNotif);
    this.notify();
    return newNotif;
  }

  markAsRead(id: string) {
    const notif = this.notifications.find((n) => n.id === id);
    if (notif) {
      notif.isUnread = false;
      this.notify();
    }
  }

  subscribe(listener: (notifications: WhatsAppNotification[]) => void) {
    this.listeners.push(listener);
    listener(this.getNotifications());
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l(this.getNotifications()));
  }
}

export const whatsappReader = new WhatsAppPrivacyReader();
