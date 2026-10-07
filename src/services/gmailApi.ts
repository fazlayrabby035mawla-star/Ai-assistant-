import type { EmailItem } from '../types';

export const DEMO_EMAILS: EmailItem[] = [
  {
    id: 'demo-msg-1',
    threadId: 'thread-1',
    from: 'Marcus Vance <m.vance@techlead.org>',
    fromName: 'Marcus Vance (Tech Lead)',
    fromEmail: 'm.vance@techlead.org',
    subject: 'URGENT: Client Demo rescheduled to 4:00 PM today - Call me ASAP',
    snippet: 'Hey Fazlay, the VP pulled forward the demo to 4 PM. Please call me at +1 (555) 234-8901 to confirm if the staging environment is ready.',
    bodyText: 'Hey Fazlay,\n\nJust got off the horn with executive leadership. The client demo has been pushed forward to 4:00 PM today.\n\nCould you please review the slides and call me directly at +1 (555) 234-8901 or ping me on WhatsApp so we can sync before the call?\n\nBest,\nMarcus Vance',
    date: 'Today, 2:15 PM',
    isUnread: true,
    priority: 'urgent',
    category: 'work',
    extractedPhones: ['+1 (555) 234-8901'],
  },
  {
    id: 'demo-msg-2',
    threadId: 'thread-2',
    from: 'Apex Cloud Billing <invoices@apexcloud.com>',
    fromName: 'Apex Cloud Billing',
    fromEmail: 'invoices@apexcloud.com',
    subject: 'Action Required: Payment method verification expiring tonight',
    snippet: 'Your primary payment method requires 3D secure verification. Please complete verification by midnight to prevent service interruption.',
    bodyText: 'Notice: Your monthly enterprise subscription renewal is scheduled for processing. To ensure uninterrupted access to your API cluster, please verify your payment authorization.\n\nFor telephone support, dial our desk: +1 (800) 412-9988.',
    date: 'Today, 11:30 AM',
    isUnread: true,
    priority: 'high',
    category: 'finance',
    extractedPhones: ['+1 (800) 412-9988'],
  },
  {
    id: 'demo-msg-3',
    threadId: 'thread-3',
    from: 'Dr. Sarah Lin <appointments@cityhealthclinic.com>',
    fromName: 'City Health Clinic (Dr. Sarah Lin)',
    fromEmail: 'appointments@cityhealthclinic.com',
    subject: 'Reminder: Medical checkup follow-up tomorrow morning',
    snippet: 'Hello, this is a reminder for your follow-up appointment tomorrow at 9:30 AM. Reply to confirm or contact our clinic desk at +1 (555) 782-3490.',
    bodyText: 'Dear Patient,\n\nThis is a courtesy reminder for your upcoming health checkup tomorrow at 9:30 AM with Dr. Sarah Lin.\n\nPlease arrive 10 minutes early. If you need to reschedule, call our front office at +1 (555) 782-3490.',
    date: 'Today, 9:45 AM',
    isUnread: false,
    priority: 'normal',
    category: 'personal',
    extractedPhones: ['+1 (555) 782-3490'],
  },
  {
    id: 'demo-msg-4',
    threadId: 'thread-4',
    from: 'Elena Rostova <elena.rostova@designstudio.io>',
    fromName: 'Elena Rostova (Product Designer)',
    fromEmail: 'elena.rostova@designstudio.io',
    subject: 'New mobile APK prototype ready for your review',
    snippet: 'Hey! I just uploaded the updated mobile navigation assets and haptic feedback specs. Check the attached designs when you get a chance.',
    bodyText: 'Hi Fazlay,\n\nI finished the revised Android Material 3 layouts for the daily briefing card and phone dialer screen. Looking forward to your thoughts!',
    date: 'Today, 8:20 AM',
    isUnread: true,
    priority: 'high',
    category: 'work',
    extractedPhones: [],
  },
  {
    id: 'demo-msg-5',
    threadId: 'thread-5',
    from: 'GitHub Notifications <notifications@github.com>',
    fromName: 'GitHub',
    fromEmail: 'notifications@github.com',
    subject: '[DayCatch] Security alert: dependencies checked and passed',
    snippet: 'Automated dependency audit completed for main branch: 0 critical vulnerabilities found.',
    bodyText: 'All vulnerability checks passed with 100% build integrity.',
    date: 'Today, 6:00 AM',
    isUnread: false,
    priority: 'normal',
    category: 'alerts',
    extractedPhones: [],
  },
];

export async function fetchLiveGmailMessages(accessToken: string): Promise<EmailItem[]> {
  try {
    // Fetch last 20 messages from inbox
    const listRes = await fetch(
      'https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=15&q=in:inbox',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        },
      }
    );

    if (!listRes.ok) {
      if (listRes.status === 401) {
        throw new Error('UNAUTHORIZED');
      }
      throw new Error(`Gmail API error: ${listRes.statusText}`);
    }

    const listData = await listRes.json();
    const messageList = listData.messages || [];

    if (messageList.length === 0) {
      return [];
    }

    // Fetch individual messages details in parallel (first 10 for performance)
    const detailPromises = messageList.slice(0, 10).map(async (msg: { id: string; threadId: string }) => {
      try {
        const msgRes = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=full`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              Accept: 'application/json',
            },
          }
        );

        if (!msgRes.ok) return null;
        const data = await msgRes.json();

        const headers = data.payload?.headers || [];
        const subject = headers.find((h: any) => h.name.toLowerCase() === 'subject')?.value || '(No Subject)';
        const from = headers.find((h: any) => h.name.toLowerCase() === 'from')?.value || 'Unknown Sender';
        const dateHeader = headers.find((h: any) => h.name.toLowerCase() === 'date')?.value || '';

        // Extract sender name and clean email
        let fromName = from;
        let fromEmail = from;
        const match = from.match(/^(.*?)\s*<(.+?)>$/);
        if (match) {
          fromName = match[1].replace(/["']/g, '').trim() || match[2];
          fromEmail = match[2];
        }

        const isUnread = Array.isArray(data.labelIds) && data.labelIds.includes('UNREAD');
        const snippet = data.snippet || '';

        // Extract phone numbers from snippet and subject
        const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
        const phones = Array.from(new Set(`${subject} ${snippet}`.match(phoneRegex) || []));

        // Determine priority heuristic
        let priority: 'urgent' | 'high' | 'normal' = 'normal';
        const lowerSubj = subject.toLowerCase();
        if (lowerSubj.includes('urgent') || lowerSubj.includes('asap') || lowerSubj.includes('important') || lowerSubj.includes('call me')) {
          priority = 'urgent';
        } else if (isUnread) {
          priority = 'high';
        }

        // Category heuristic
        let category: 'work' | 'personal' | 'finance' | 'alerts' = 'work';
        if (lowerSubj.includes('invoice') || lowerSubj.includes('payment') || lowerSubj.includes('bank') || lowerSubj.includes('bill')) {
          category = 'finance';
        } else if (lowerSubj.includes('alert') || lowerSubj.includes('security') || lowerSubj.includes('notification')) {
          category = 'alerts';
        }

        const formattedDate = dateHeader ? new Date(dateHeader).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Today';

        const emailItem: EmailItem = {
          id: data.id,
          threadId: data.threadId,
          from,
          fromName,
          fromEmail,
          subject,
          snippet,
          bodyText: snippet,
          date: `Today, ${formattedDate}`,
          isUnread,
          priority,
          category,
          extractedPhones: phones,
        };

        return emailItem;
      } catch (err) {
        console.warn('Failed to parse email message:', err);
        return null;
      }
    });

    const parsedMessages = (await Promise.all(detailPromises)).filter(Boolean) as EmailItem[];
    return parsedMessages;
  } catch (err: any) {
    console.error('fetchLiveGmailMessages error:', err);
    throw err;
  }
}
