import React from 'react';
import { Mic, MicOff, Volume2, Sparkles, Phone, Mail, MessageSquare, X } from 'lucide-react';

interface VoiceCommandOverlayProps {
  isOpen: boolean;
  isListening: boolean;
  transcript: string;
  onClose: () => void;
  onToggleListening: () => void;
  onSelectSuggestion: (command: string) => void;
}

export const VoiceCommandOverlay: React.FC<VoiceCommandOverlayProps> = ({
  isOpen,
  isListening,
  transcript,
  onClose,
  onToggleListening,
  onSelectSuggestion,
}) => {
  if (!isOpen) return null;

  const suggestions = [
    { label: 'What did I miss today?', icon: Sparkles, cmd: 'What did I miss today?' },
    { label: 'Call Marcus', icon: Phone, cmd: 'Call Marcus' },
    { label: 'Call Mom', icon: Phone, cmd: 'Call Mom' },
    { label: 'Read unread Gmail', icon: Mail, cmd: 'Read unread Gmail' },
    { label: 'Check WhatsApp messages', icon: MessageSquare, cmd: 'Check WhatsApp messages' },
    { label: 'Call back missed calls', icon: Phone, cmd: 'Call back missed calls' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fade-in">
      <div className="w-full max-w-sm bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-700/80 rounded-3xl p-6 shadow-2xl flex flex-col items-center relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Pulsing Mic Sphere with Equalizer Wave */}
        <div className="relative my-4 flex items-center justify-center">
          <div
            className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${
              isListening
                ? 'bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 shadow-lg shadow-purple-500/40 ring-8 ring-purple-500/20 animate-pulse'
                : 'bg-slate-800 border border-slate-700 text-slate-400'
            }`}
          >
            {isListening ? (
              <Mic className="w-10 h-10 text-white animate-bounce-subtle" />
            ) : (
              <MicOff className="w-10 h-10 text-slate-400" />
            )}
          </div>
        </div>

        {/* Live Status & Transcript Display */}
        <div className="text-center w-full mb-4 min-h-[50px] flex flex-col items-center justify-center">
          <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400 mb-1 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            {isListening ? 'Listening for your command...' : 'Tap Mic to Speak'}
          </span>
          <p className="text-sm font-medium text-slate-100 italic px-3">
            {transcript ? `"${transcript}"` : 'Say "Call Marcus" or "What did I miss today?"'}
          </p>
        </div>

        {/* Suggested Voice Commands */}
        <div className="w-full mb-5">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-2 text-center">
            Or tap a voice command:
          </span>
          <div className="grid grid-cols-2 gap-2">
            {suggestions.map((s, idx) => {
              const Icon = s.icon;
              return (
                <button
                  key={idx}
                  onClick={() => onSelectSuggestion(s.cmd)}
                  className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-700/60 text-left transition active:scale-95"
                >
                  <Icon className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                  <span className="text-xs text-slate-200 truncate">{s.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom controls */}
        <div className="w-full flex gap-3">
          <button
            onClick={onToggleListening}
            className={`flex-1 py-3 rounded-2xl font-semibold text-xs flex items-center justify-center gap-2 transition shadow-md ${
              isListening
                ? 'bg-red-600 hover:bg-red-500 text-white'
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white'
            }`}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            {isListening ? 'Stop Listening' : 'Speak Command'}
          </button>
        </div>
      </div>
    </div>
  );
};
