import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Phone,
  Mic,
  Download,
  Settings,
  Layers,
  Sparkles,
  Wifi,
  Battery,
} from 'lucide-react';
import type { User } from 'firebase/auth';

interface HeaderNavProps {
  currentTab: 'briefing' | 'dialer' | 'gmail' | 'whatsapp' | 'calls' | 'contacts';
  onSelectTab: (tab: 'briefing' | 'dialer' | 'gmail' | 'whatsapp' | 'calls' | 'contacts') => void;
  onOpenVoice: () => void;
  onOpenMobileAccess: () => void;
  onOpenApkInstall: () => void;
  isPhoneFrame: boolean;
  onTogglePhoneFrame: () => void;
  user: User | null;
  unreadEmailCount: number;
  missedCallsCount: number;
  unreadWhatsAppCount: number;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  currentTab,
  onSelectTab,
  onOpenVoice,
  onOpenMobileAccess,
  onOpenApkInstall,
  isPhoneFrame,
  onTogglePhoneFrame,
  user,
  unreadEmailCount,
  missedCallsCount,
  unreadWhatsAppCount,
}) => {
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      setTimeStr(
        new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-850 px-4 py-2.5">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* App Title & Identity */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
            <Phone className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-extrabold text-white tracking-tight">DayCatch</h1>
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                APK
              </span>
            </div>
            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <span>{timeStr}</span>
              <span>•</span>
              <span className="text-emerald-400 font-medium">Ready</span>
            </div>
          </div>
        </div>

        {/* Action Header Icons */}
        <div className="flex items-center gap-1.5">
          {/* Full Mobile Hardware Button */}
          <button
            onClick={onOpenMobileAccess}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/60 text-[11px] font-medium text-slate-300 transition"
            title="Full Mobile Device Permissions & Hardware"
          >
            <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden xs:inline">Mobile</span>
          </button>

          {/* Voice Command Mic Trigger */}
          <button
            onClick={onOpenVoice}
            className="p-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white transition shadow-sm"
            title="Voice Command"
          >
            <Mic className="w-3.5 h-3.5" />
          </button>

          {/* Download APK / Install */}
          <button
            onClick={onOpenApkInstall}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold transition shadow-sm active:scale-95"
            title="Download & Install DayCatch APK"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </button>

          {/* Frame View Switcher */}
          <button
            onClick={onTogglePhoneFrame}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/60 text-slate-400 hover:text-white transition"
            title={isPhoneFrame ? 'Switch to Fullscreen View' : 'Switch to Android Frame View'}
          >
            <Layers className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
