import React, { useState } from 'react';
import { Phone, Delete, PhoneCall, Clock, User, PhoneForwarded, PhoneMissed, Volume2 } from 'lucide-react';
import { dtmfSound } from '../services/audioTones';
import type { CallRecord } from '../types';

interface PhoneDialerProps {
  onCallInitiated?: (number: string, name?: string) => void;
  recentMissedCalls: CallRecord[];
}

export const PhoneDialer: React.FC<PhoneDialerProps> = ({ onCallInitiated, recentMissedCalls }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [activeCallModal, setActiveCallModal] = useState<{ number: string; name?: string; timer: number } | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const dialKeys = [
    { digit: '1', sub: '' },
    { digit: '2', sub: 'ABC' },
    { digit: '3', sub: 'DEF' },
    { digit: '4', sub: 'GHI' },
    { digit: '5', sub: 'JKL' },
    { digit: '6', sub: 'MNO' },
    { digit: '7', sub: 'PQRS' },
    { digit: '8', sub: 'TUV' },
    { digit: '9', sub: 'WXYZ' },
    { digit: '*', sub: '' },
    { digit: '0', sub: '+' },
    { digit: '#', sub: '' },
  ];

  const handleKeyPress = (digit: string) => {
    if (soundEnabled) {
      dtmfSound.playTone(digit);
    }
    setPhoneNumber((prev) => prev + digit);
  };

  const handleBackspace = () => {
    setPhoneNumber((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setPhoneNumber('');
  };

  const triggerCall = (numToCall: string, contactName?: string) => {
    if (!numToCall.trim()) return;
    const cleanNumber = numToCall.replace(/[^\d+]/g, '');

    // Play ring tone preview
    if (soundEnabled) {
      dtmfSound.playRingTone();
    }

    // Trigger Android / native phone dialer via tel:
    const telUrl = `tel:${cleanNumber}`;
    window.location.href = telUrl;

    if (onCallInitiated) {
      onCallInitiated(cleanNumber, contactName);
    }

    setActiveCallModal({
      number: cleanNumber,
      name: contactName,
      timer: 0,
    });
  };

  // Quick Speed Dial contacts
  const speedDialContacts = [
    { name: 'Marcus Vance', number: '+15552348901', tag: 'Urgent' },
    { name: 'Mom', number: '+15558901234', tag: 'Family' },
    { name: 'Health Clinic', number: '+15557823490', tag: 'Doctor' },
    { name: 'Cloud Support', number: '+18004129988', tag: 'Billing' },
  ];

  return (
    <div className="flex flex-col h-full max-w-md mx-auto w-full px-4 py-2">
      {/* Top Dialer Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
            <Phone className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-100">Android Phone Dialer</h2>
            <p className="text-xs text-slate-400">One-tap native calling & touch tones</p>
          </div>
        </div>

        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 transition ${
            soundEnabled ? 'bg-indigo-950/80 text-indigo-300 border border-indigo-700/50' : 'bg-slate-800 text-slate-400'
          }`}
          title="Toggle DTMF Dial Tones"
        >
          <Volume2 className="w-3.5 h-3.5" />
          {soundEnabled ? 'Tones ON' : 'Muted'}
        </button>
      </div>

      {/* Speed Dial / Missed Call Quick Bar */}
      {recentMissedCalls.length > 0 && (
        <div className="mb-3 bg-red-950/30 border border-red-800/40 rounded-xl p-2.5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold text-red-300 uppercase tracking-wider flex items-center gap-1">
              <PhoneMissed className="w-3 h-3 text-red-400" />
              Missed Today ({recentMissedCalls.length})
            </span>
            <span className="text-[10px] text-red-300/80">Tap to call back</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {recentMissedCalls.map((c) => (
              <button
                key={c.id}
                onClick={() => triggerCall(c.phoneNumber, c.name)}
                className="flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-900/40 hover:bg-red-800/60 border border-red-700/50 text-left transition"
              >
                <div className="w-6 h-6 rounded-full bg-red-500/30 text-red-200 flex items-center justify-center text-xs font-bold">
                  {c.name.charAt(0)}
                </div>
                <div>
                  <div className="text-xs font-medium text-slate-100 truncate max-w-[100px]">{c.name}</div>
                  <div className="text-[10px] text-red-300 truncate">{c.timeAgo}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Phone Number Display Screen */}
      <div className="relative bg-slate-900/90 border border-slate-800 rounded-2xl p-4 mb-3 flex flex-col items-center justify-center min-h-[76px] shadow-inner">
        <div className="w-full text-center">
          <input
            type="text"
            readOnly
            value={phoneNumber}
            placeholder="Dial number..."
            className="w-full text-center bg-transparent text-2xl font-mono tracking-wider font-semibold text-slate-100 placeholder-slate-500 focus:outline-none"
          />
        </div>

        {phoneNumber && (
          <div className="absolute right-3 flex items-center gap-1">
            <button
              onClick={handleBackspace}
              className="p-2 text-slate-400 hover:text-red-400 active:scale-95 transition"
              title="Backspace"
            >
              <Delete className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Numerical Dial Keypad (3x4 Grid) */}
      <div className="grid grid-cols-3 gap-2.5 max-w-[340px] mx-auto w-full mb-3">
        {dialKeys.map((key) => (
          <button
            key={key.digit}
            onClick={() => handleKeyPress(key.digit)}
            className="group relative flex flex-col items-center justify-center h-14 rounded-2xl bg-slate-800/80 hover:bg-slate-700 active:bg-indigo-600 active:scale-95 border border-slate-700/60 shadow-sm transition"
          >
            <span className="text-xl font-bold text-slate-100 group-hover:text-white leading-none">
              {key.digit}
            </span>
            {key.sub && (
              <span className="text-[10px] font-semibold text-slate-400 group-hover:text-slate-200 tracking-widest mt-0.5">
                {key.sub}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Call Action Bar */}
      <div className="flex items-center justify-center gap-6 max-w-[340px] mx-auto w-full mb-4">
        {phoneNumber ? (
          <button
            onClick={handleClear}
            className="w-12 h-12 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 flex items-center justify-center text-xs font-medium transition"
          >
            Clear
          </button>
        ) : (
          <div className="w-12 h-12" />
        )}

        {/* Big Green Native Call Trigger */}
        <button
          onClick={() => triggerCall(phoneNumber || (recentMissedCalls[0]?.phoneNumber ?? ''))}
          disabled={!phoneNumber && recentMissedCalls.length === 0}
          className={`flex items-center justify-center w-16 h-16 rounded-full shadow-lg transition active:scale-95 ${
            phoneNumber || recentMissedCalls.length > 0
              ? 'bg-gradient-to-tr from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white shadow-emerald-600/30 cursor-pointer animate-pulse-subtle'
              : 'bg-slate-800 text-slate-600 cursor-not-allowed'
          }`}
          title="Make Phone Call via Android Dialer"
        >
          <Phone className="w-7 h-7" />
        </button>

        {phoneNumber ? (
          <a
            href={`https://wa.me/${phoneNumber.replace(/[^\d]/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-12 h-12 rounded-full bg-emerald-950/80 border border-emerald-700/60 hover:bg-emerald-900 text-emerald-400 flex items-center justify-center text-xs transition"
            title="Open WhatsApp with this number"
          >
            WA
          </a>
        ) : (
          <div className="w-12 h-12" />
        )}
      </div>

      {/* Speed Dial Quick List */}
      <div className="mt-auto border-t border-slate-800/80 pt-2.5">
        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
          <span>Speed Dial Contacts</span>
          <span className="text-[10px] text-slate-500">Opens Android Phone</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {speedDialContacts.map((contact) => (
            <button
              key={contact.name}
              onClick={() => triggerCall(contact.number, contact.name)}
              className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 text-left transition"
            >
              <div className="min-w-0 pr-1">
                <div className="text-xs font-medium text-slate-200 truncate">{contact.name}</div>
                <div className="text-[10px] text-slate-400 truncate">{contact.number}</div>
              </div>
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                {contact.tag}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Call in Progress Modal */}
      {activeCallModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-xs bg-slate-900 border border-slate-700 rounded-3xl p-6 text-center shadow-2xl animate-fade-in">
            <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 ring-8 ring-emerald-500/10 animate-pulse">
              <PhoneCall className="w-10 h-10" />
            </div>

            <h3 className="text-lg font-bold text-white mb-1">
              {activeCallModal.name || 'Calling...'}
            </h3>
            <p className="text-sm font-mono text-emerald-400 mb-2">
              {activeCallModal.number}
            </p>
            <p className="text-xs text-slate-400 mb-6">
              Opening device phone dialer ({activeCallModal.number}). If not launched automatically, tap call below.
            </p>

            <div className="flex gap-3 justify-center">
              <a
                href={`tel:${activeCallModal.number}`}
                className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-semibold text-white text-xs flex items-center justify-center gap-1.5 transition"
              >
                <Phone className="w-4 h-4" /> Redial
              </a>
              <button
                onClick={() => setActiveCallModal(null)}
                className="flex-1 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-500 font-semibold text-white text-xs transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
