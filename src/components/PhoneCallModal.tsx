import React, { useState, useEffect } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Volume2, Grid, User, ExternalLink } from 'lucide-react';
import { dtmfSound } from '../services/audioTones';

interface PhoneCallModalProps {
  phoneNumber: string;
  contactName?: string;
  onEndCall: () => void;
}

export const PhoneCallModal: React.FC<PhoneCallModalProps> = ({
  phoneNumber,
  contactName,
  onEndCall,
}) => {
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);
  const [status, setStatus] = useState<'dialing' | 'ringing' | 'connected'>('dialing');

  useEffect(() => {
    // Play initial DTMF ringing tone
    dtmfSound.playRingTone();

    const ringTimeout = setTimeout(() => {
      setStatus('ringing');
    }, 1500);

    const connectTimeout = setTimeout(() => {
      setStatus('connected');
    }, 3500);

    return () => {
      clearTimeout(ringTimeout);
      clearTimeout(connectTimeout);
    };
  }, []);

  // Timer while connected
  useEffect(() => {
    if (status !== 'connected') return;

    const interval = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [status]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleNativeRedial = () => {
    window.location.href = `tel:${phoneNumber.replace(/[^\d+]/g, '')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 animate-fade-in">
      <div className="w-full max-w-sm bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 text-center shadow-2xl flex flex-col items-center">
        {/* Contact Avatar / Icon */}
        <div className="relative mb-5 mt-2">
          <div className="w-24 h-24 rounded-full bg-slate-800 border-2 border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold text-3xl shadow-xl">
            {contactName ? contactName.charAt(0) : <Phone className="w-10 h-10" />}
          </div>
          {status === 'connected' && (
            <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-900 animate-pulse" />
          )}
        </div>

        {/* Contact Info */}
        <h3 className="text-xl font-bold text-white mb-1">
          {contactName || 'Direct Call'}
        </h3>
        <p className="text-sm font-mono text-emerald-400 mb-2">
          {phoneNumber}
        </p>

        {/* Status / Duration */}
        <div className="mb-6">
          {status === 'dialing' && (
            <span className="text-xs font-medium text-slate-400 animate-pulse">
              Connecting via Android Dialer...
            </span>
          )}
          {status === 'ringing' && (
            <span className="text-xs font-medium text-amber-300 animate-pulse">
              Ringing...
            </span>
          )}
          {status === 'connected' && (
            <span className="text-sm font-mono font-semibold text-emerald-400 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/40">
              {formatTimer(callDuration)}
            </span>
          )}
        </div>

        {/* In-Call Controls */}
        <div className="grid grid-cols-3 gap-4 w-full max-w-[260px] mb-8">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition ${
              isMuted
                ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {isMuted ? <MicOff className="w-5 h-5 mb-1" /> : <Mic className="w-5 h-5 mb-1" />}
            <span className="text-[10px] font-medium">{isMuted ? 'Muted' : 'Mute'}</span>
          </button>

          <button
            onClick={() => setIsSpeaker(!isSpeaker)}
            className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition ${
              isSpeaker
                ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300'
                : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Volume2 className="w-5 h-5 mb-1" />
            <span className="text-[10px] font-medium">{isSpeaker ? 'Speaker' : 'Earpiece'}</span>
          </button>

          <button
            onClick={handleNativeRedial}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-slate-300 hover:bg-slate-700 transition"
            title="Launch Android Phone app"
          >
            <ExternalLink className="w-5 h-5 mb-1 text-emerald-400" />
            <span className="text-[10px] font-medium">OS Dialer</span>
          </button>
        </div>

        {/* End Call Button */}
        <div className="flex justify-center w-full">
          <button
            onClick={onEndCall}
            className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-lg shadow-red-600/40 active:scale-95 transition"
            title="End Call"
          >
            <PhoneOff className="w-7 h-7" />
          </button>
        </div>

        <p className="text-[10px] text-slate-500 mt-4">
          Integrated with Android Phone Services • Audio DTMF Active
        </p>
      </div>
    </div>
  );
};
