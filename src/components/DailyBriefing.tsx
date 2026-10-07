import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Phone,
  Mail,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  PhoneCall,
  Clock,
  ShieldCheck,
  Share2,
  ExternalLink,
  RefreshCw,
  Bell,
  Mic,
  Download,
} from 'lucide-react';
import type { DailyBriefingData, EmailItem, CallRecord } from '../types';
import type { WhatsAppNotification } from '../services/whatsappNotificationService';
import { speechBriefing, type SpeechState } from '../services/speechService';

interface DailyBriefingProps {
  briefing: DailyBriefingData | null;
  isLoading: boolean;
  onRefresh: () => void;
  onCallNumber: (number: string, name?: string) => void;
  onOpenGmail: (emailId?: string) => void;
  onOpenWhatsApp: (phone: string, text?: string) => void;
  onOpenVoiceModal: () => void;
  whatsAppNotifications: WhatsAppNotification[];
  onRequestNotificationPermission: () => void;
  onDownloadApk?: () => void;
}

export const DailyBriefing: React.FC<DailyBriefingProps> = ({
  briefing,
  isLoading,
  onRefresh,
  onCallNumber,
  onOpenGmail,
  onOpenWhatsApp,
  onOpenVoiceModal,
  whatsAppNotifications,
  onRequestNotificationPermission,
  onDownloadApk,
}) => {
  const [speechState, setSpeechState] = useState<SpeechState>({
    isPlaying: false,
    isPaused: false,
    supported: true,
  });
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [checklist, setChecklist] = useState<Array<{ id: string; text: string; done: boolean; source: string }>>([]);

  useEffect(() => {
    speechBriefing.subscribe((state) => {
      setSpeechState(state);
    });
  }, []);

  useEffect(() => {
    if (briefing?.actionChecklist) {
      setChecklist(briefing.actionChecklist);
    }
  }, [briefing]);

  const toggleSpeech = () => {
    if (!briefing) return;

    if (speechState.isPlaying) {
      if (speechState.isPaused) {
        speechBriefing.resume();
      } else {
        speechBriefing.pause();
      }
    } else {
      speechBriefing.speak(briefing.audioScript || briefing.summary, playbackSpeed);
    }
  };

  const stopSpeech = () => {
    speechBriefing.stop();
  };

  const toggleChecklistItem = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item))
    );
  };

  const handleShareBriefing = async () => {
    if (!briefing) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Today's Catch-Up Briefing",
          text: `${briefing.headline}\n\n${briefing.summary}`,
        });
      } catch (_) {}
    } else {
      navigator.clipboard.writeText(`${briefing.headline}\n\n${briefing.summary}`);
      alert("Summary copied to clipboard!");
    }
  };

  const unreadWhatsApp = whatsAppNotifications.filter((n) => n.isUnread);

  return (
    <div className="flex flex-col h-full max-w-md mx-auto w-full px-4 py-2 pb-16 overflow-y-auto space-y-4">
      {/* Hero Header with AI Status & Voice Command Trigger */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Daily Catch-Up</span>
          </div>
          <h2 className="text-lg font-bold text-slate-100">What You Missed Today</h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Voice Command Button */}
          <button
            onClick={onOpenVoiceModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-medium shadow-md shadow-purple-600/20 active:scale-95 transition"
            title="Use voice command (e.g. Call Marcus)"
          >
            <Mic className="w-3.5 h-3.5" />
            Voice
          </button>

          {/* Refresh Briefing Button */}
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition disabled:opacity-50"
            title="Re-analyze communications"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-indigo-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Audio Executive Briefing Player */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-950/80 via-purple-950/70 to-slate-900 border border-indigo-700/50 p-4 shadow-xl">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-400/40 text-indigo-300 flex items-center justify-center">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-2">
                Voice Catch-Up Assistant
                {speechState.isPlaying && (
                  <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    Speaking
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">Listen hands-free while on the go</p>
            </div>
          </div>

          {/* Speed Selector */}
          <select
            value={playbackSpeed}
            onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
            className="bg-slate-800 border border-slate-700 text-slate-300 text-[10px] rounded-lg px-2 py-1 focus:outline-none"
          >
            <option value="1.0">1.0x</option>
            <option value="1.25">1.25x</option>
            <option value="1.5">1.5x</option>
          </select>
        </div>

        {/* Animated Equalizer Wave when playing */}
        {speechState.isPlaying && !speechState.isPaused && (
          <div className="flex items-center justify-center gap-1 h-6 my-2">
            {[40, 70, 95, 60, 85, 50, 90, 65, 80, 45, 75, 60].map((h, i) => (
              <span
                key={i}
                className="w-1 bg-gradient-to-t from-indigo-400 to-purple-400 rounded-full animate-pulse"
                style={{
                  height: `${h}%`,
                  animationDuration: `${0.4 + (i % 4) * 0.15}s`,
                }}
              />
            ))}
          </div>
        )}

        {/* Player Controls */}
        <div className="flex items-center justify-between pt-1">
          <button
            onClick={toggleSpeech}
            disabled={isLoading || !briefing}
            className="flex-1 mr-2 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-semibold text-xs shadow-md active:scale-98 transition disabled:opacity-50"
          >
            {speechState.isPlaying && !speechState.isPaused ? (
              <>
                <Pause className="w-4 h-4" /> Pause Voice
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                {speechState.isPaused ? 'Resume Voice' : 'Listen to Today\'s Briefing'}
              </>
            )}
          </button>

          {speechState.isPlaying && (
            <button
              onClick={stopSpeech}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
              title="Stop voice"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={handleShareBriefing}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition ml-1"
            title="Share summary"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Executive Summary Card */}
      {briefing && (
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-300">
              {briefing.greeting}
            </span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                briefing.urgencyLevel === 'critical'
                  ? 'bg-red-500/20 text-red-300 border-red-500/30'
                  : briefing.urgencyLevel === 'moderate'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
              }`}
            >
              {briefing.urgencyLevel === 'critical' ? 'Action Needed' : 'Daily Briefing'}
            </span>
          </div>

          <h3 className="text-sm font-bold text-white mb-2 leading-snug">
            {briefing.headline}
          </h3>

          <p className="text-xs text-slate-300 leading-relaxed">
            {briefing.summary}
          </p>
        </div>
      )}

      {/* Download APK Quick Card */}
      {onDownloadApk && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/70 via-slate-900 to-slate-900 border border-emerald-700/50 flex items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
              <Download className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-white truncate">Download DayCatch APK</div>
              <div className="text-[10px] text-slate-300 truncate">Run standalone on Android with native dialer</div>
            </div>
          </div>
          <button
            onClick={onDownloadApk}
            className="py-1.5 px-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white text-[11px] font-bold flex-shrink-0 transition active:scale-95 shadow-sm"
          >
            Download
          </button>
        </div>
      )}

      {/* WhatsApp Privacy-Preserving Summary Card */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-emerald-900/40 shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">WhatsApp Unread Messages</h4>
              <p className="text-[10px] text-slate-400">
                Privacy-preserving summary: sender & first few words
              </p>
            </div>
          </div>

          <button
            onClick={onRequestNotificationPermission}
            className="flex items-center gap-1 text-[10px] font-medium text-emerald-400 hover:text-emerald-300"
            title="Enable Notification Access"
          >
            <Bell className="w-3 h-3" />
            Sync Access
          </button>
        </div>

        {/* Privacy Shield Pill */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 mb-3 rounded-lg bg-emerald-950/40 border border-emerald-800/30 text-[10px] text-emerald-300">
          <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" />
          <span>Local client-side parsing • Zero private chat cloud storage</span>
        </div>

        {/* List of unread WhatsApp items */}
        <div className="space-y-2">
          {unreadWhatsApp.length === 0 ? (
            <div className="text-center py-4 text-xs text-slate-500">
              No unread WhatsApp messages today.
            </div>
          ) : (
            unreadWhatsApp.map((wa) => (
              <div
                key={wa.id}
                className="p-2.5 rounded-xl bg-slate-800/70 border border-slate-700/60 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-200 truncate">
                      {wa.sender}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {wa.timestamp}
                    </span>
                  </div>
                  {/* First few words summary */}
                  <div className="text-[11px] text-emerald-300 font-medium truncate mt-0.5">
                    "{wa.snippet}"
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {wa.phoneNumber && (
                    <button
                      onClick={() => onCallNumber(wa.phoneNumber!, wa.sender)}
                      className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition"
                      title={`Call ${wa.sender}`}
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => onOpenWhatsApp(wa.phoneNumber || '', 'Hey! Saw your message.')}
                    className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-emerald-400 transition"
                    title="Open on WhatsApp"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Missed Items Queue (Calls & Emails) */}
      {briefing && briefing.missedItems && briefing.missedItems.length > 0 && (
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
              Direct Action Queue
            </h4>
            <span className="text-[10px] text-slate-500">Tap to call or reply</span>
          </div>

          <div className="space-y-2">
            {briefing.missedItems.map((item, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      item.type === 'call'
                        ? 'bg-red-500/20 text-red-400'
                        : item.type === 'email'
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-emerald-500/20 text-emerald-400'
                    }`}
                  >
                    {item.type === 'call' && <PhoneCall className="w-3.5 h-3.5" />}
                    {item.type === 'email' && <Mail className="w-3.5 h-3.5" />}
                    {item.type === 'whatsapp' && <MessageSquare className="w-3.5 h-3.5" />}
                  </div>

                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-slate-200 truncate">
                      {item.title}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">
                      {item.subtitle}
                    </div>
                  </div>
                </div>

                {/* Direct Action Trigger */}
                {item.type === 'call' && (
                  <button
                    onClick={() => onCallNumber(item.actionPayload.replace('tel:', ''), item.title.replace('Missed call from ', ''))}
                    className="px-2.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-[11px] font-semibold flex items-center gap-1 transition flex-shrink-0"
                  >
                    <Phone className="w-3 h-3" /> Call Back
                  </button>
                )}

                {item.type === 'email' && (
                  <button
                    onClick={() => onOpenGmail(item.actionPayload)}
                    className="px-2.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-semibold flex items-center gap-1 transition flex-shrink-0"
                  >
                    <Mail className="w-3 h-3" /> View
                  </button>
                )}

                {item.type === 'whatsapp' && (
                  <button
                    onClick={() => onOpenWhatsApp(item.actionPayload)}
                    className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold flex items-center gap-1 transition flex-shrink-0"
                  >
                    <MessageSquare className="w-3 h-3" /> Chat
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Checklist */}
      {checklist.length > 0 && (
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg">
          <h4 className="text-xs font-bold text-white mb-2.5 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
            Today's Catch-Up Checklist
          </h4>

          <div className="space-y-2">
            {checklist.map((item) => (
              <label
                key={item.id}
                onClick={() => toggleChecklistItem(item.id)}
                className={`flex items-start gap-2.5 p-2 rounded-xl border cursor-pointer transition ${
                  item.done
                    ? 'bg-slate-950/40 border-slate-800/40 opacity-60'
                    : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800/70'
                }`}
              >
                <input
                  type="checkbox"
                  checked={item.done}
                  onChange={() => {}}
                  className="mt-0.5 rounded text-indigo-500 focus:ring-0"
                />
                <div className="min-w-0 flex-1">
                  <span
                    className={`text-xs ${
                      item.done ? 'line-through text-slate-500' : 'text-slate-200'
                    }`}
                  >
                    {item.text}
                  </span>
                  <span className="block text-[10px] text-slate-500 mt-0.5">
                    Source: {item.source}
                  </span>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
