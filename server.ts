import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'DayCatch Assistant API' });
});

// Download APK package endpoint
app.get('/api/download-package', (_req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename="daycatch-android-app.json"');
  res.json({
    app: 'DayCatch - Daily Briefing & Call Assistant',
    version: '1.0.0',
    type: 'Android APK / PWA Standalone',
    manifest: '/manifest.json',
    icon: '/icon.svg',
    instructions: 'Open your mobile browser to install as WebAPK or convert using Bubblewrap / PWABuilder.'
  });
});

// AI Daily Briefing Generator endpoint
app.post('/api/briefing', async (req, res) => {
  try {
    const { emails = [], whatsappMessages = [], missedCalls = [], userName = 'User' } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;

    // Prepare context for the prompt
    const emailSummaries = emails.map((e: any, idx: number) => 
      `[Email #${idx + 1}] From: ${e.from || e.fromName || 'Unknown'} | Subject: "${e.subject || 'No Subject'}" | Snippet: "${(e.snippet || '').slice(0, 160)}" | Unread: ${e.isUnread ? 'YES' : 'NO'}`
    ).join('\n');

    const whatsappSummaries = whatsappMessages.map((w: any, idx: number) =>
      `[WhatsApp #${idx + 1}] Contact: ${w.contactName} (${w.phoneNumber}) | Message: "${w.preview}" | Unread: ${w.unread ? 'YES' : 'NO'}`
    ).join('\n');

    const callSummaries = missedCalls.map((c: any, idx: number) =>
      `[Missed Call #${idx + 1}] Contact: ${c.name} (${c.phoneNumber}) | Time: ${c.timestamp} | Missed Today: ${c.isMissedToday ? 'YES' : 'NO'}`
    ).join('\n');

    if (!apiKey) {
      // Heuristic fallback if GEMINI_API_KEY is not configured
      const unreadEmailsCount = emails.filter((e: any) => e.isUnread).length;
      const missedCallsCount = missedCalls.filter((c: any) => c.isMissedToday).length;
      const unreadWaCount = whatsappMessages.filter((w: any) => w.unread).length;

      return res.json({
        greeting: `Good day, ${userName}! Here is what you missed today.`,
        headline: `You have ${missedCallsCount} missed calls, ${unreadEmailsCount} unread emails, and ${unreadWaCount} pending WhatsApp messages.`,
        summary: `Today's communications require attention: review your missed calls and urgent emails to make sure no time-sensitive requests slip through.`,
        urgencyLevel: (missedCallsCount > 1 || unreadEmailsCount > 3) ? 'critical' : 'moderate',
        missedItems: [
          ...missedCalls.filter((c: any) => c.isMissedToday).map((c: any) => ({
            type: 'call',
            title: `Missed call from ${c.name}`,
            subtitle: `${c.phoneNumber} at ${c.timestamp}`,
            actionLabel: 'Call Back',
            actionPayload: `tel:${c.phoneNumber}`,
            priority: 'urgent',
          })),
          ...emails.filter((e: any) => e.isUnread).slice(0, 4).map((e: any) => ({
            type: 'email',
            title: e.subject || 'Unread Email',
            subtitle: `From: ${e.fromName || e.from}`,
            actionLabel: 'Read Email',
            actionPayload: e.id,
            priority: 'important',
          })),
          ...whatsappMessages.filter((w: any) => w.unread).slice(0, 3).map((w: any) => ({
            type: 'whatsapp',
            title: `WhatsApp from ${w.contactName}`,
            subtitle: w.preview,
            actionLabel: 'Reply on WhatsApp',
            actionPayload: `https://wa.me/${w.phoneNumber.replace(/[^0-9]/g, '')}`,
            priority: 'important',
          })),
        ],
        actionChecklist: [
          { id: '1', text: `Return calls to ${missedCalls.filter((c: any) => c.isMissedToday).map((c: any) => c.name).join(', ') || 'callers'}`, done: false, source: 'Calls', urgency: 'high' },
          { id: '2', text: `Review ${unreadEmailsCount} unread Gmail threads`, done: false, source: 'Gmail', urgency: 'medium' },
          { id: '3', text: `Reply to pending WhatsApp messages`, done: false, source: 'WhatsApp', urgency: 'medium' },
        ],
        audioScript: `Hello ${userName}. Here is what you missed today: You have ${missedCallsCount} missed calls, ${unreadEmailsCount} unread emails in your inbox, and ${unreadWaCount} unanswered WhatsApp messages. Tap call back to reach your contacts immediately.`,
      });
    }

    const ai = new GoogleGenAI();
    const prompt = `You are DayCatch, a personal executive AI assistant for mobile devices and Android APK apps.
Your user is "${userName}". Today is Wednesday, October 7, 2026.
Analyze the user's communications from today and tell them clearly WHAT THEY MISSED TODAY.

Below is the raw data of today's communications:

--- MISSED CALLS ---
${callSummaries || 'None'}

--- GMAIL EMAILS ---
${emailSummaries || 'None'}

--- WHATSAPP MESSAGES ---
${whatsappSummaries || 'None'}

Provide a well-structured JSON response with:
1. "greeting": A warm, professional executive greeting (e.g., "Good afternoon, Fazlay").
2. "headline": A punchy one-sentence summary of what they missed today (e.g., "You have 2 missed calls, 3 urgent emails from clients, and 1 awaiting WhatsApp approval").
3. "summary": A clear 2-3 sentence executive synthesis explaining the key events, who needs a response right away, and any deadlines.
4. "urgencyLevel": "critical" if there are urgent unread requests or multiple missed calls, "moderate" if normal, or "chill" if light.
5. "missedItems": An array of items they missed, each with:
   - "type": "call" | "email" | "whatsapp"
   - "title": Short title (e.g. "Missed Call from Sarah Jenkins")
   - "subtitle": Context or message snippet
   - "actionLabel": Action button label (e.g. "Call Back", "Review Email", "Open WhatsApp")
   - "actionPayload": phone number or link or ID
   - "priority": "urgent" | "important" | "info"
6. "actionChecklist": An array of concrete next steps:
   - "id": unique string
   - "text": task description (e.g., "Call back John regarding Project Alpha contract")
   - "done": boolean (false)
   - "source": "Calls" | "Gmail" | "WhatsApp"
   - "urgency": "high" | "medium" | "low"
7. "audioScript": A crisp, natural spoken-language script (approx 45-60 words) suitable for text-to-speech audio playback so the user can listen to their daily catch-up in their car or hands-free.

Respond strictly with valid JSON.`;

    let parsedData;
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const responseText = response.text || '{}';
      parsedData = JSON.parse(responseText);
    } catch (apiErr: any) {
      console.warn('Gemini model call failed, switching to local executive heuristic fallback:', apiErr.message);
      const unreadEmailsCount = emails.filter((e: any) => e.isUnread).length;
      const missedCallsCount = missedCalls.filter((c: any) => c.isMissedToday).length;
      const unreadWaCount = whatsappMessages.filter((w: any) => w.unread).length;

      parsedData = {
        greeting: `Good day, ${userName}! Here is what you missed today.`,
        headline: `You have ${missedCallsCount} missed calls, ${unreadEmailsCount} unread emails, and ${unreadWaCount} pending WhatsApp messages.`,
        summary: `Today's communications require attention: review your missed calls and urgent emails to make sure no time-sensitive requests slip through.`,
        urgencyLevel: (missedCallsCount > 1 || unreadEmailsCount > 3) ? 'critical' : 'moderate',
        missedItems: [
          ...missedCalls.filter((c: any) => c.isMissedToday).map((c: any) => ({
            type: 'call',
            title: `Missed call from ${c.name}`,
            subtitle: `${c.phoneNumber} at ${c.timestamp}`,
            actionLabel: 'Call Back',
            actionPayload: `tel:${c.phoneNumber}`,
            priority: 'urgent',
          })),
          ...emails.filter((e: any) => e.isUnread).slice(0, 4).map((e: any) => ({
            type: 'email',
            title: e.subject || 'Unread Email',
            subtitle: `From: ${e.fromName || e.from}`,
            actionLabel: 'Read Email',
            actionPayload: e.id,
            priority: 'important',
          })),
          ...whatsappMessages.filter((w: any) => w.unread).slice(0, 3).map((w: any) => ({
            type: 'whatsapp',
            title: `WhatsApp from ${w.contactName}`,
            subtitle: w.preview,
            actionLabel: 'Reply on WhatsApp',
            actionPayload: `https://wa.me/${w.phoneNumber.replace(/[^0-9]/g, '')}`,
            priority: 'important',
          })),
        ],
        actionChecklist: [
          { id: '1', text: `Return calls to ${missedCalls.filter((c: any) => c.isMissedToday).map((c: any) => c.name).join(', ') || 'callers'}`, done: false, source: 'Calls', urgency: 'high' },
          { id: '2', text: `Review ${unreadEmailsCount} unread Gmail threads`, done: false, source: 'Gmail', urgency: 'medium' },
          { id: '3', text: `Reply to pending WhatsApp messages`, done: false, source: 'WhatsApp', urgency: 'medium' },
        ],
        audioScript: `Hello ${userName}. Here is what you missed today: You have ${missedCallsCount} missed calls, ${unreadEmailsCount} unread emails in your inbox, and ${unreadWaCount} unanswered WhatsApp messages. Tap call back to reach your contacts immediately.`,
      };
    }

    res.json(parsedData);
  } catch (error: any) {
    console.error('Error generating briefing:', error);
    res.status(500).json({
      error: 'Failed to generate briefing',
      details: error.message,
    });
  }
});

// Vite middleware in dev or static files in production
if (process.env.NODE_ENV !== 'production') {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

app.listen(port, () => {
  console.log(`DayCatch server listening on http://localhost:${port}`);
});
