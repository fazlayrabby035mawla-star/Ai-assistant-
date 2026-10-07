import React, { useState } from 'react';
import { MessageSquare, Send, Phone, Plus, Copy, Sparkles, ExternalLink, Check, Clock } from 'lucide-react';
import type { WhatsAppMessage } from '../types';
import { QUICK_WHATSAPP_TEMPLATES } from '../services/sampleData';

interface WhatsAppHubProps {
  messages: WhatsAppMessage[];
  onSendMessage: (phoneNumber: string, text: string) => void;
  onCallNumber: (number: string, name?: string) => void;
  onImportChatText: (text: string) => void;
}

export const WhatsAppHub: React.FC<WhatsAppHubProps> = ({
  messages,
  onSendMessage,
  onCallNumber,
  onImportChatText,
}) => {
  const [recipientNumber, setRecipientNumber] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [activeChat, setActiveChat] = useState<WhatsAppMessage | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const [showToast, setShowToast] = useState(false);

  const handleOpenWhatsApp = (phone: string, text: string) => {
    if (!phone) return;
    const cleanNumber = phone.replace(/[^\d]/g, '');
    const encodedText = encodeURIComponent(text);
    const waUrl = `https://wa.me/${cleanNumber}${encodedText ? `?text=${encodedText}` : ''}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const handleQuickTemplateClick = (template: string) => {
    setMessageBody(template);
  };

  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pasteText.trim()) return;
    onImportChatText(pasteText);
    setPasteText('');
    setShowImportModal(false);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const unreadCount = messages.filter((m) => m.unread).length;

  return (
    <div className="flex flex-col h-full max-w-md mx-auto w-full px-4 py-2">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            WhatsApp Hub
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {unreadCount} Unanswered
              </span>
            )}
          </h2>
          <p className="text-xs text-slate-400">Quick replies & today's conversations</p>
        </div>

        <button
          onClick={() => setShowImportModal(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/50 text-xs font-medium text-emerald-300 transition"
          title="Import or paste WhatsApp chat"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          Import Chat
        </button>
      </div>

      {/* Success Notification */}
      {showToast && (
        <div className="mb-2 p-2 rounded-xl bg-emerald-900/50 border border-emerald-600/50 text-[11px] text-emerald-200 flex items-center gap-1.5">
          <Check className="w-3.5 h-3.5" />
          WhatsApp chat imported! Daily Catch-Up briefing updated.
        </div>
      )}

      {/* Quick WhatsApp Composer Card */}
      <div className="mb-3 p-3 rounded-2xl bg-slate-900/90 border border-slate-800">
        <div className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
          <span>Quick WhatsApp Message</span>
          <span className="text-[10px] text-emerald-400">Opens wa.me directly</span>
        </div>

        <div className="space-y-2">
          <input
            type="text"
            value={recipientNumber}
            onChange={(e) => setRecipientNumber(e.target.value)}
            placeholder="Recipient number (e.g. +1 555 234 8901)"
            className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />

          <textarea
            rows={2}
            value={messageBody}
            onChange={(e) => setMessageBody(e.target.value)}
            placeholder="Type WhatsApp message or pick a quick template below..."
            className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
          />

          {/* Quick reply pills */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {QUICK_WHATSAPP_TEMPLATES.slice(0, 3).map((tpl, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleQuickTemplateClick(tpl)}
                className="flex-shrink-0 text-[10px] px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              >
                {tpl.slice(0, 28)}...
              </button>
            ))}
          </div>

          <button
            onClick={() => handleOpenWhatsApp(recipientNumber, messageBody)}
            disabled={!recipientNumber.trim()}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 disabled:opacity-50 text-white font-medium text-xs transition shadow-md active:scale-98"
          >
            <Send className="w-3.5 h-3.5" />
            Send via WhatsApp
          </button>
        </div>
      </div>

      {/* Today's Conversations List */}
      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
        <span>Today's WhatsApp Chats ({messages.length})</span>
        <span className="text-[10px] text-slate-500">Tap to respond</span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {messages.map((chat) => (
          <div
            key={chat.id}
            onClick={() => setActiveChat(chat)}
            className={`p-3 rounded-2xl border cursor-pointer transition ${
              chat.unread
                ? 'bg-slate-900/90 border-emerald-500/30 hover:border-emerald-500/60 shadow-sm'
                : 'bg-slate-900/50 border-slate-800/80 hover:bg-slate-850'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs flex-shrink-0">
                  {chat.contactName.charAt(0)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-slate-200 truncate">
                      {chat.contactName}
                    </span>
                    {chat.unread && (
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    )}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    {chat.phoneNumber}
                  </div>
                </div>
              </div>

              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3" /> {chat.timestamp}
              </span>
            </div>

            <p className="text-[11px] text-slate-300 line-clamp-2 mt-1">
              {chat.preview}
            </p>

            {/* Quick Actions */}
            <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-end gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCallNumber(chat.phoneNumber, chat.contactName);
                }}
                className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-medium flex items-center gap-1 transition"
              >
                <Phone className="w-3 h-3 text-emerald-400" />
                Call Phone
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenWhatsApp(chat.phoneNumber, 'Hey! Got your message.');
                }}
                className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-semibold flex items-center gap-1 transition active:scale-95"
              >
                <MessageSquare className="w-3 h-3" />
                Reply in App
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Chat Thread Modal */}
      {activeChat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-3xl p-5 shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">
                  {activeChat.contactName.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">{activeChat.contactName}</h3>
                  <p className="text-[10px] text-slate-400 font-mono">{activeChat.phoneNumber}</p>
                </div>
              </div>
              <button
                onClick={() => setActiveChat(null)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            {/* Message History */}
            <div className="flex-1 overflow-y-auto space-y-2 mb-3 pr-1">
              {(activeChat.messages || [{ sender: 'them', text: activeChat.preview, time: activeChat.timestamp }]).map(
                (msg, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col ${
                      msg.sender === 'me' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs ${
                        msg.sender === 'me'
                          ? 'bg-emerald-700 text-white rounded-br-none'
                          : 'bg-slate-800 text-slate-200 rounded-bl-none'
                      }`}
                    >
                      {msg.text}
                    </div>
                    <span className="text-[9px] text-slate-500 mt-0.5">{msg.time}</span>
                  </div>
                )
              )}
            </div>

            {/* Bottom Actions */}
            <div className="flex gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => {
                  onCallNumber(activeChat.phoneNumber, activeChat.contactName);
                  setActiveChat(null);
                }}
                className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center justify-center gap-1.5 transition"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-400" /> Call Phone
              </button>
              <button
                onClick={() => {
                  handleOpenWhatsApp(activeChat.phoneNumber, '');
                  setActiveChat(null);
                }}
                className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Open WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import / Paste WhatsApp Chat Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <form
            onSubmit={handleImportSubmit}
            className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-3xl p-5 shadow-2xl"
          >
            <div className="flex items-center gap-2 mb-2 text-emerald-400">
              <Sparkles className="w-4 h-4" />
              <h3 className="text-sm font-bold text-white">Import WhatsApp Chat / Notification</h3>
            </div>
            <p className="text-[11px] text-slate-400 mb-3">
              Paste copied text from your WhatsApp notifications or exported chat. The AI will extract sender, messages, and summarize what you missed.
            </p>

            <textarea
              required
              rows={4}
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder="e.g. John Doe (+1 555 999 1234): Hey, are you available to talk? We have a new update."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none mb-3"
            />

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold"
              >
                Analyze with AI
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
