import React from 'react';
import { Wifi, Battery } from 'lucide-react';

interface AndroidFrameProps {
  children: React.ReactNode;
  enabled: boolean;
  batteryLevel?: number | null;
  isCharging?: boolean | null;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({
  children,
  enabled,
  batteryLevel = 94,
  isCharging = false,
}) => {
  if (!enabled) {
    return <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">{children}</div>;
  }

  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-0 sm:p-4 text-slate-100">
      {/* Smartphone Outer Chassis */}
      <div className="w-full sm:max-w-[420px] h-screen sm:h-[900px] sm:max-h-[95vh] bg-slate-950 sm:rounded-[44px] sm:border-[8px] sm:border-slate-800 sm:ring-1 sm:ring-slate-700/60 shadow-2xl flex flex-col overflow-hidden relative">
        {/* Android Punch Hole Camera & Status Bar */}
        <div className="h-7 bg-slate-950 flex items-center justify-between px-6 text-[11px] font-semibold text-slate-300 z-50 select-none flex-shrink-0">
          <span>{timeStr}</span>

          {/* Punch-hole camera */}
          <div className="w-3.5 h-3.5 rounded-full bg-slate-900 border border-slate-800 shadow-inner" />

          {/* Status Icons */}
          <div className="flex items-center gap-1.5">
            <Wifi className="w-3.5 h-3.5 text-slate-300" />
            <div className="flex items-center gap-0.5">
              <span className="text-[10px]">{batteryLevel ?? 94}%</span>
              <Battery className="w-3.5 h-3.5 text-slate-300" />
            </div>
          </div>
        </div>

        {/* Inner App Container */}
        <div className="flex-1 flex flex-col overflow-hidden relative pb-14">
          {children}
        </div>

        {/* Android Bottom Navigation Pill */}
        <div className="absolute bottom-1 left-0 right-0 h-4 flex items-center justify-center pointer-events-none z-50">
          <div className="w-32 h-1 bg-slate-600 rounded-full opacity-60" />
        </div>
      </div>
    </div>
  );
};
