/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import type { User } from 'firebase/auth';
import type { EmailItem, CallRecord, WhatsAppMessage, DailyBriefingData } from './types';

// Services
import { initAuth, googleSignIn, logout, setAccessTokenInMemory } from './services/firebaseAuth';
import { fetchLiveGmailMessages, DEMO_EMAILS } from './services/gmailApi';
import { INITIAL_CALL_RECORDS, INITIAL_WHATSAPP_MESSAGES } from './services/sampleData';
import { whatsappReader, type WhatsAppNotification } from './services/whatsappNotificationService';
import { voiceCommandEngine, type VoiceCommandResult } from './services/voiceCommandService';
import { speechBriefing } from './services/speechService';
import { deviceHardware, type DeviceCapabilities } from './services/deviceHardwareService';
import { usePWAInstall } from './hooks/usePWAInstall';

// Components
import { HeaderNav } from './components/HeaderNav';
import { BottomTabs, type TabType } from './components/BottomTabs';
import { AndroidFrame } from './components/AndroidFrame';
import { DailyBriefing } from './components/DailyBriefing';
import { PhoneDialer } from './components/PhoneDialer';
import { ContactsManager } from './components/ContactsManager';
import { GmailReader } from './components/GmailReader';
import { WhatsAppHub } from './components/WhatsAppHub';
import { CallHistory } from './components/CallHistory';
import { PhoneCallModal } from './components/PhoneCallModal';
import { VoiceCommandOverlay } from './components/VoiceCommandOverlay';
import { DevicePermissionsDrawer } from './components/DevicePermissionsDrawer';
import { ApkInstallModal } from './components/ApkInstallModal';

export default function App() {
  // Navigation
  const [currentTab, setCurrentTab] = useState<TabType>('briefing');
  const [isPhoneFrame, setIsPhoneFrame] = useState(true);

  // Authentication
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Communications Data
  const [emails, setEmails] = useState<EmailItem[]>(DEMO_EMAILS);
  const [emailsLoading, setEmailsLoading] = useState(false);
  const [calls, setCalls] = useState<CallRecord[]>(INITIAL_CALL_RECORDS);
  const [whatsappMessages, setWhatsappMessages] = useState<WhatsAppMessage[]>(INITIAL_WHATSAPP_MESSAGES);
  const [waNotifications, setWaNotifications] = useState<WhatsAppNotification[]>([]);

  // Daily Briefing state
  const [briefing, setBriefing] = useState<DailyBriefingData | null>(null);
  const [briefingLoading, setBriefingLoading] = useState(false);

  // Call in Progress state
  const [activeCall, setActiveCall] = useState<{ number: string; name?: string } | null>(null);

  // Voice Command Modal
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');

  // Device Permissions Drawer
  const [isMobileAccessOpen, setIsMobileAccessOpen] = useState(false);
  const [isApkModalOpen, setIsApkModalOpen] = useState(false);

  // Device capabilities
  const [deviceCaps, setDeviceCaps] = useState<DeviceCapabilities>(deviceHardware.getCapabilities());

  // PWA Install hook
  const { isInstallable, isInstalled, isAndroid, install: installPWA } = usePWAInstall();

  // Subscribe to device hardware
  useEffect(() => {
    return deviceHardware.subscribe(setDeviceCaps);
  }, []);

  // Subscribe to WhatsApp notifications reader
  useEffect(() => {
    return whatsappReader.subscribe(setWaNotifications);
  }, []);

  // Setup Firebase Auth listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, token) => {
        setUser(currentUser);
        setAccessToken(token);
        setAccessTokenInMemory(token);
        // Load live Gmail messages
        loadGmailData(token);
      },
      () => {
        setUser(null);
        setAccessToken(null);
        setAccessTokenInMemory(null);
      }
    );
    return () => unsubscribe();
  }, []);

  // Load Gmail messages
  const loadGmailData = async (token?: string | null) => {
    const tokenToUse = token ?? accessToken;
    if (!tokenToUse) {
      setEmails(DEMO_EMAILS);
      return;
    }

    setEmailsLoading(true);
    try {
      const liveEmails = await fetchLiveGmailMessages(tokenToUse);
      if (liveEmails && liveEmails.length > 0) {
        setEmails(liveEmails);
      } else {
        setEmails(DEMO_EMAILS);
      }
    } catch (err) {
      console.warn('Failed to fetch live Gmail, using fallback data:', err);
      setEmails(DEMO_EMAILS);
    } finally {
      setEmailsLoading(false);
    }
  };

  // Google Sign-In trigger
  const handleGoogleLogin = async () => {
    setAuthLoading(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setAccessToken(result.accessToken);
        await loadGmailData(result.accessToken);
      }
    } catch (err) {
      console.error('Login error:', err);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleLogout = async () => {
    await logout();
    setUser(null);
    setAccessToken(null);
    setEmails(DEMO_EMAILS);
  };

  // Fetch or Generate AI Daily Briefing
  const generateBriefing = useCallback(async () => {
    setBriefingLoading(true);
    try {
      const res = await fetch('/api/briefing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emails,
          whatsappMessages,
          missedCalls: calls.filter((c) => c.isMissedToday),
          userName: user?.displayName || 'User',
        }),
      });

      if (!res.ok) throw new Error('API briefing call failed');
      const data: DailyBriefingData = await res.json();
      setBriefing(data);
    } catch (err) {
      console.warn('Error generating briefing from API, using client fallback:', err);
      // Client-side fallback
      const unreadCount = emails.filter((e) => e.isUnread).length;
      const missedCount = calls.filter((c) => c.isMissedToday).length;
      const unreadWa = whatsappMessages.filter((w) => w.unread).length;

      setBriefing({
        greeting: `Good afternoon, ${user?.displayName || 'User'}!`,
        headline: `You missed ${missedCount} phone calls, ${unreadCount} Gmail emails, and ${unreadWa} WhatsApp messages today.`,
        summary: `Urgent attention is needed for today's communications. Marcus Vance left a missed call and email regarding the 4:00 PM demo, and billing needs payment authorization.`,
        urgencyLevel: missedCount > 1 || unreadCount > 2 ? 'critical' : 'moderate',
        missedItems: [
          ...calls.filter((c) => c.isMissedToday).map((c) => ({
            type: 'call' as const,
            title: `Missed call from ${c.name}`,
            subtitle: `${c.phoneNumber} at ${c.timestamp}`,
            actionLabel: 'Call Back',
            actionPayload: `tel:${c.phoneNumber}`,
            priority: 'urgent' as const,
          })),
          ...emails.filter((e) => e.isUnread).slice(0, 3).map((e) => ({
            type: 'email' as const,
            title: e.subject,
            subtitle: `From: ${e.fromName}`,
            actionLabel: 'Read Email',
            actionPayload: e.id,
            priority: 'important' as const,
          })),
          ...whatsappMessages.filter((w) => w.unread).slice(0, 2).map((w) => ({
            type: 'whatsapp' as const,
            title: `WhatsApp from ${w.contactName}`,
            subtitle: w.preview,
            actionLabel: 'Reply',
            actionPayload: w.phoneNumber,
            priority: 'important' as const,
          })),
        ],
        actionChecklist: [
          { id: '1', text: 'Call back Marcus Vance regarding 4 PM demo schedule', done: false, source: 'Calls', urgency: 'high' },
          { id: '2', text: 'Review urgent Apex Cloud billing verification email', done: false, source: 'Gmail', urgency: 'high' },
          { id: '3', text: 'Respond to Mom\'s WhatsApp message', done: false, source: 'WhatsApp', urgency: 'medium' },
        ],
        audioScript: `Hello ${user?.displayName || 'there'}. Here is what you missed today: You have ${missedCount} missed phone calls, including Marcus Vance and Mom. In Gmail, you have ${unreadCount} unread emails with an urgent demo reschedule. You also have ${unreadWa} unread WhatsApp messages. Tap Call Back to connect immediately.`,
      });
    } finally {
      setBriefingLoading(false);
    }
  }, [emails, whatsappMessages, calls, user]);

  // Initial briefing load
  useEffect(() => {
    generateBriefing();
  }, [generateBriefing]);

  // Make Phone Call Trigger
  const handleInitiateCall = (number: string, name?: string) => {
    if (!number) return;
    const cleanNumber = number.replace(/[^\d+]/g, '');

    // Trigger haptic vibration
    deviceHardware.triggerHaptic([30, 40, 30]);

    // Open real Android dialer intent
    window.location.href = `tel:${cleanNumber}`;

    // Show in-app call modal
    setActiveCall({ number: cleanNumber, name });

    // Add to call log as outgoing
    const newCallLog: CallRecord = {
      id: `call-outgoing-${Date.now()}`,
      name: name || 'Direct Call',
      phoneNumber: cleanNumber,
      type: 'outgoing',
      timestamp: 'Today, Just now',
      timeAgo: 'Just now',
      duration: 'In progress',
      isMissedToday: false,
    };
    setCalls((prev) => [newCallLog, ...prev]);
  };

  // Voice Command Setup
  useEffect(() => {
    voiceCommandEngine.onStatus((status, text) => {
      setIsVoiceListening(status === 'listening');
      if (text) setVoiceTranscript(text);
    });

    voiceCommandEngine.onCommand((result: VoiceCommandResult) => {
      handleVoiceResult(result);
    });
  }, [calls]);

  const handleVoiceResult = (result: VoiceCommandResult) => {
    deviceHardware.triggerHaptic(60);

    if (result.intent === 'call') {
      const target = result.target || '';
      // Find matching contact or dial number
      const matched = calls.find(
        (c) => c.name.toLowerCase().includes(target.toLowerCase()) || c.phoneNumber.includes(target)
      );
      if (matched) {
        speechBriefing.speak(`Calling ${matched.name} now.`);
        handleInitiateCall(matched.phoneNumber, matched.name);
      } else if (/\d/.test(target)) {
        speechBriefing.speak(`Dialing ${target} now.`);
        handleInitiateCall(target);
      } else {
        speechBriefing.speak(`Looking for contact ${target}.`);
        setCurrentTab('contacts');
      }
      setIsVoiceOpen(false);
    } else if (result.intent === 'call_back') {
      const topMissed = calls.find((c) => c.isMissedToday);
      if (topMissed) {
        speechBriefing.speak(`Calling back ${topMissed.name} now.`);
        handleInitiateCall(topMissed.phoneNumber, topMissed.name);
      } else {
        speechBriefing.speak('You have no missed calls today.');
      }
      setIsVoiceOpen(false);
    } else if (result.intent === 'briefing') {
      setCurrentTab('briefing');
      setIsVoiceOpen(false);
      if (briefing?.audioScript) {
        speechBriefing.speak(briefing.audioScript);
      }
    } else if (result.intent === 'gmail') {
      setCurrentTab('gmail');
      setIsVoiceOpen(false);
      const unreadCount = emails.filter((e) => e.isUnread).length;
      speechBriefing.speak(`You have ${unreadCount} unread emails in Gmail.`);
    } else if (result.intent === 'whatsapp') {
      setCurrentTab('whatsapp');
      setIsVoiceOpen(false);
      const unreadWa = waNotifications.filter((n) => n.isUnread);
      if (unreadWa.length > 0) {
        speechBriefing.speak(`You have unread WhatsApp messages from ${unreadWa.map((w) => w.sender).join(' and ')}.`);
      } else {
        speechBriefing.speak('No unread WhatsApp messages today.');
      }
    } else if (result.intent === 'dialer') {
      setCurrentTab('dialer');
      setIsVoiceOpen(false);
    } else if (result.intent === 'download') {
      speechBriefing.speak('Opening APK download and installation center.');
      setIsVoiceOpen(false);
      setIsApkModalOpen(true);
    } else if (result.intent === 'stop') {
      speechBriefing.stop();
      setIsVoiceOpen(false);
    } else {
      speechBriefing.speak(`Command not recognized: "${result.rawText}". Try saying: "Call Marcus" or "What did I miss today?"`);
    }
  };

  const handleToggleVoice = () => {
    if (isVoiceListening) {
      voiceCommandEngine.stopListening();
    } else {
      voiceCommandEngine.startListening();
    }
  };

  const handleSelectVoiceSuggestion = (cmd: string) => {
    setVoiceTranscript(cmd);
    const parsedText = cmd.toLowerCase();
    if (parsedText.includes('marcus')) {
      handleVoiceResult({ command: cmd, intent: 'call', target: 'Marcus', rawText: cmd });
    } else if (parsedText.includes('mom')) {
      handleVoiceResult({ command: cmd, intent: 'call', target: 'Mom', rawText: cmd });
    } else if (parsedText.includes('miss')) {
      handleVoiceResult({ command: cmd, intent: 'briefing', rawText: cmd });
    } else if (parsedText.includes('gmail')) {
      handleVoiceResult({ command: cmd, intent: 'gmail', rawText: cmd });
    } else if (parsedText.includes('whatsapp')) {
      handleVoiceResult({ command: cmd, intent: 'whatsapp', rawText: cmd });
    } else if (parsedText.includes('call back')) {
      handleVoiceResult({ command: cmd, intent: 'call_back', rawText: cmd });
    }
  };

  // WhatsApp import
  const handleImportWhatsAppChat = (rawText: string) => {
    const notif = whatsappReader.parseIncomingNotification(rawText);
    const newWaMessage: WhatsAppMessage = {
      id: notif.id,
      contactName: notif.sender,
      phoneNumber: notif.phoneNumber || '+15552348901',
      preview: notif.fullText,
      timestamp: notif.timestamp,
      unread: true,
      isToday: true,
      urgent: false,
    };
    setWhatsappMessages((prev) => [newWaMessage, ...prev]);
    generateBriefing();
  };

  // Stats
  const unreadEmailCount = emails.filter((e) => e.isUnread).length;
  const missedCallsCount = calls.filter((c) => c.isMissedToday).length;
  const unreadWhatsAppCount = waNotifications.filter((n) => n.isUnread).length;

  return (
    <AndroidFrame
      enabled={isPhoneFrame}
      batteryLevel={deviceCaps.batteryLevel}
      isCharging={deviceCaps.isCharging}
    >
      {/* Top Header Navigation */}
      <HeaderNav
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenVoice={() => setIsVoiceOpen(true)}
        onOpenMobileAccess={() => setIsMobileAccessOpen(true)}
        onOpenApkInstall={() => setIsApkModalOpen(true)}
        isPhoneFrame={isPhoneFrame}
        onTogglePhoneFrame={() => setIsPhoneFrame(!isPhoneFrame)}
        user={user}
        unreadEmailCount={unreadEmailCount}
        missedCallsCount={missedCallsCount}
        unreadWhatsAppCount={unreadWhatsAppCount}
      />

      {/* Main Tab Views */}
      <main className="flex-1 overflow-y-auto">
        {currentTab === 'briefing' && (
          <DailyBriefing
            briefing={briefing}
            isLoading={briefingLoading}
            onRefresh={generateBriefing}
            onCallNumber={handleInitiateCall}
            onOpenGmail={(id) => setCurrentTab('gmail')}
            onOpenWhatsApp={(phone) => setCurrentTab('whatsapp')}
            onOpenVoiceModal={() => setIsVoiceOpen(true)}
            whatsAppNotifications={waNotifications}
            onRequestNotificationPermission={() => deviceHardware.requestNotificationAccess()}
            onDownloadApk={() => setIsApkModalOpen(true)}
          />
        )}

        {currentTab === 'dialer' && (
          <PhoneDialer
            onCallInitiated={handleInitiateCall}
            recentMissedCalls={calls.filter((c) => c.isMissedToday)}
          />
        )}

        {currentTab === 'contacts' && (
          <ContactsManager
            onCallContact={handleInitiateCall}
            onOpenWhatsApp={(phone) => {
              window.open(`https://wa.me/${phone.replace(/[^\d]/g, '')}`, '_blank');
            }}
          />
        )}

        {currentTab === 'gmail' && (
          <GmailReader
            emails={emails}
            user={user}
            isLoading={emailsLoading || authLoading}
            onRefresh={() => loadGmailData()}
            onLogin={handleGoogleLogin}
            onLogout={handleGoogleLogout}
            onCallNumber={handleInitiateCall}
          />
        )}

        {currentTab === 'whatsapp' && (
          <WhatsAppHub
            messages={whatsappMessages}
            onSendMessage={(phone, text) => {
              window.open(`https://wa.me/${phone.replace(/[^\d]/g, '')}?text=${encodeURIComponent(text)}`, '_blank');
            }}
            onCallNumber={handleInitiateCall}
            onImportChatText={handleImportWhatsAppChat}
          />
        )}

        {currentTab === 'calls' && (
          <CallHistory
            calls={calls}
            onCallNumber={handleInitiateCall}
            onAddCall={(record) => {
              setCalls((prev) => [record, ...prev]);
              generateBriefing();
            }}
          />
        )}
      </main>

      {/* Bottom Tabs */}
      <BottomTabs
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        unreadEmailCount={unreadEmailCount}
        missedCallsCount={missedCallsCount}
        unreadWhatsAppCount={unreadWhatsAppCount}
      />

      {/* In-Call Screen Overlay */}
      {activeCall && (
        <PhoneCallModal
          phoneNumber={activeCall.number}
          contactName={activeCall.name}
          onEndCall={() => setActiveCall(null)}
        />
      )}

      {/* Voice Command Overlay */}
      <VoiceCommandOverlay
        isOpen={isVoiceOpen}
        isListening={isVoiceListening}
        transcript={voiceTranscript}
        onClose={() => {
          voiceCommandEngine.stopListening();
          setIsVoiceOpen(false);
        }}
        onToggleListening={handleToggleVoice}
        onSelectSuggestion={handleSelectVoiceSuggestion}
      />

      {/* Full Mobile Device Permissions & Hardware Drawer */}
      <DevicePermissionsDrawer
        isOpen={isMobileAccessOpen}
        onClose={() => setIsMobileAccessOpen(false)}
        onInstallPwa={installPWA}
        isInstalled={isInstalled}
      />

      {/* APK & Home Screen Install Modal */}
      <ApkInstallModal
        isOpen={isApkModalOpen}
        onClose={() => setIsApkModalOpen(false)}
        onInstall={installPWA}
        isInstallable={isInstallable}
        isInstalled={isInstalled}
        isAndroid={isAndroid}
      />
    </AndroidFrame>
  );
}
