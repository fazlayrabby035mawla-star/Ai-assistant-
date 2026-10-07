import React, { useState } from 'react';
import { Mail, MailCheck, AlertTriangle, Phone, MessageSquare, RefreshCw, ExternalLink, ShieldCheck, CheckCircle2 } from 'lucide-react';
import type { EmailItem } from '../types';
import type { User } from 'firebase/auth';

interface GmailReaderProps {
  emails: EmailItem[];
  user: User | null;
  isLoading: boolean;
  onRefresh: () => void;
  onLogin: () => void;
  onLogout: () => void;
  onCallNumber: (number: string, name?: string) => void;
}

export const GmailReader: React.FC<GmailReaderProps> = ({
  emails,
  user,
  isLoading,
  onRefresh,
  onLogin,
  onLogout,
  onCallNumber,
}) => {
  const [filter, setFilter] = useState<'all' | 'unread' | 'urgent'>('unread');
  const [selectedEmail, setSelectedEmail] = useState<EmailItem | null>(null);

  const filteredEmails = emails.filter((e) => {
    if (filter === 'unread' && !e.isUnread) return false;
    if (filter === 'urgent' && e.priority !== 'urgent' && e.priority !== 'high') return false;
    return true;
  });

  const unreadCount = emails.filter((e) => e.isUnread).length;

  return (
    <div className="flex flex-col h-full max-w-md mx-auto w-full px-4 py-2">
      {/* Top Header & Account Status */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            Gmail Catch-Up
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {unreadCount} Unread
              </span>
            )}
          </h2>
          <p className="text-xs text-slate-400">Read & summarize today's inbox</p>
        </div>

        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition disabled:opacity-50"
          title="Refresh Gmail"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-indigo-400' : ''}`} />
        </button>
      </div>

      {/* Google Authentication Status Card */}
      <div className="mb-3 p-3 rounded-2xl bg-slate-900/90 border border-slate-800">
        {user ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'Google User'}
                  className="w-8 h-8 rounded-full border border-indigo-500/40"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                  {user.email?.charAt(0).toUpperCase() || 'G'}
                </div>
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-slate-100 truncate">
                    {user.displayName || 'Google Account'}
                  </span>
                  <span className="flex items-center text-[9px] text-emerald-400 font-medium">
                    <ShieldCheck className="w-3 h-3 mr-0.5" /> Connected
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 truncate">{user.email}</div>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-[11px] font-medium transition"
            >
              Disconnect
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            <div className="flex items-start gap-2">
              <div className="w-7 h-7 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-200">Connect Your Real Gmail</div>
                <div className="text-[11px] text-slate-400 leading-tight">
                  Sign in with Google to read your real today's emails. Showing demo inbox until connected.
                </div>
              </div>
            </div>

            {/* Official Google Sign-In Button */}
            <button
              onClick={onLogin}
              className="w-full flex items-center justify-center gap-2.5 py-2 px-3 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-medium text-xs shadow-md active:scale-98 transition"
            >
              <svg className="w-4 h-4" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
              </svg>
              <span>Sign in with Google</span>
            </button>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-3 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
        <button
          onClick={() => setFilter('unread')}
          className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition ${
            filter === 'unread' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Unread ({unreadCount})
        </button>
        <button
          onClick={() => setFilter('urgent')}
          className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition ${
            filter === 'urgent' ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Urgent
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition ${
            filter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          All ({emails.length})
        </button>
      </div>

      {/* Email List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {filteredEmails.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs">
            <MailCheck className="w-8 h-8 mx-auto mb-2 text-slate-600" />
            Inbox is clear! No messages match this filter.
          </div>
        ) : (
          filteredEmails.map((email) => (
            <div
              key={email.id}
              onClick={() => setSelectedEmail(email)}
              className={`p-3 rounded-2xl border cursor-pointer transition ${
                email.isUnread
                  ? 'bg-slate-900/90 border-amber-500/30 hover:border-amber-500/60 shadow-sm'
                  : 'bg-slate-900/50 border-slate-800/80 hover:bg-slate-850'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  {email.isUnread && (
                    <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0 animate-pulse" />
                  )}
                  <span className="text-xs font-semibold text-slate-200 truncate">
                    {email.fromName || email.from}
                  </span>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {email.priority === 'urgent' && (
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-0.5">
                      <AlertTriangle className="w-2.5 h-2.5" /> URGENT
                    </span>
                  )}
                  <span className="text-[10px] text-slate-400">{email.date}</span>
                </div>
              </div>

              <h4 className="text-xs font-medium text-slate-100 mb-1 line-clamp-1">
                {email.subject}
              </h4>

              <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                {email.snippet}
              </p>

              {/* Detected Phone Number Quick Action */}
              {email.extractedPhones && email.extractedPhones.length > 0 && (
                <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {email.extractedPhones[0]}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCallNumber(email.extractedPhones![0], email.fromName);
                    }}
                    className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-[10px] font-semibold text-white flex items-center gap-1 transition active:scale-95"
                  >
                    <Phone className="w-2.5 h-2.5" /> Call Sender
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Email Detail Modal */}
      {selectedEmail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-5 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-start justify-between mb-3 border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                  {selectedEmail.category}
                </span>
                <h3 className="text-sm font-bold text-white mt-0.5">
                  {selectedEmail.subject}
                </h3>
              </div>
              <button
                onClick={() => setSelectedEmail(null)}
                className="text-slate-400 hover:text-white text-sm p-1"
              >
                ✕
              </button>
            </div>

            <div className="mb-3 text-xs text-slate-300">
              <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                <span>From: <strong className="text-slate-200">{selectedEmail.fromName}</strong></span>
                <span>{selectedEmail.date}</span>
              </div>
              <div className="text-[10px] text-slate-500 font-mono mb-2">
                {selectedEmail.fromEmail}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-slate-950/60 rounded-xl p-3 text-xs text-slate-200 whitespace-pre-wrap leading-relaxed border border-slate-800 mb-4">
              {selectedEmail.bodyText || selectedEmail.snippet}
            </div>

            {/* Modal Bottom Actions */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800">
              {selectedEmail.extractedPhones && selectedEmail.extractedPhones.length > 0 && (
                <button
                  onClick={() => {
                    onCallNumber(selectedEmail.extractedPhones![0], selectedEmail.fromName);
                    setSelectedEmail(null);
                  }}
                  className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                >
                  <Phone className="w-3.5 h-3.5" /> Call Phone ({selectedEmail.extractedPhones[0]})
                </button>
              )}

              <a
                href={`mailto:${selectedEmail.fromEmail}?subject=Re: ${encodeURIComponent(selectedEmail.subject)}`}
                className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition"
              >
                <Mail className="w-3.5 h-3.5" /> Reply via Email
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
