export interface EmailItem {
  id: string;
  threadId: string;
  from: string;
  fromName: string;
  fromEmail: string;
  subject: string;
  snippet: string;
  bodyText?: string;
  date: string;
  isUnread: boolean;
  priority: 'urgent' | 'high' | 'normal';
  category: 'work' | 'personal' | 'finance' | 'alerts';
  extractedPhones?: string[];
}

export interface CallRecord {
  id: string;
  name: string;
  phoneNumber: string;
  type: 'missed' | 'incoming' | 'outgoing';
  timestamp: string;
  timeAgo: string;
  duration?: string;
  isMissedToday: boolean;
  notes?: string;
}

export interface WhatsAppMessage {
  id: string;
  contactName: string;
  phoneNumber: string;
  avatarUrl?: string;
  preview: string;
  timestamp: string;
  unread: boolean;
  isToday: boolean;
  urgent: boolean;
  messages?: Array<{
    sender: 'them' | 'me';
    text: string;
    time: string;
  }>;
}

export interface ActionItem {
  id: string;
  text: string;
  done: boolean;
  source: 'Calls' | 'Gmail' | 'WhatsApp';
  urgency: 'high' | 'medium' | 'low';
}

export interface MissedItem {
  type: 'call' | 'email' | 'whatsapp';
  title: string;
  subtitle: string;
  timestamp?: string;
  actionLabel: string;
  actionPayload: string;
  priority: 'urgent' | 'important' | 'info';
}

export interface DailyBriefingData {
  greeting: string;
  headline: string;
  summary: string;
  urgencyLevel: 'critical' | 'moderate' | 'chill';
  missedItems: MissedItem[];
  actionChecklist: ActionItem[];
  audioScript: string;
  generatedAt?: string;
}
