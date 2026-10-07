import React from 'react';
import { Sparkles, Phone, Users, Mail, MessageSquare, Clock } from 'lucide-react';

export type TabType = 'briefing' | 'dialer' | 'contacts' | 'gmail' | 'whatsapp' | 'calls';

interface BottomTabsProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  unreadEmailCount: number;
  missedCallsCount: number;
  unreadWhatsAppCount: number;
}

export const BottomTabs: React.FC<BottomTabsProps> = ({
  currentTab,
  onSelectTab,
  unreadEmailCount,
  missedCallsCount,
  unreadWhatsAppCount,
}) => {
  const tabs = [
    {
      id: 'briefing' as TabType,
      label: 'Catch-Up',
      icon: Sparkles,
      badge: unreadEmailCount + missedCallsCount + unreadWhatsAppCount > 0,
      badgeCount: unreadEmailCount + missedCallsCount + unreadWhatsAppCount,
    },
    {
      id: 'dialer' as TabType,
      label: 'Dialer',
      icon: Phone,
    },
    {
      id: 'contacts' as TabType,
      label: 'Contacts',
      icon: Users,
    },
    {
      id: 'gmail' as TabType,
      label: 'Gmail',
      icon: Mail,
      badge: unreadEmailCount > 0,
      badgeCount: unreadEmailCount,
    },
    {
      id: 'whatsapp' as TabType,
      label: 'WhatsApp',
      icon: MessageSquare,
      badge: unreadWhatsAppCount > 0,
      badgeCount: unreadWhatsAppCount,
    },
    {
      id: 'calls' as TabType,
      label: 'Recents',
      icon: Clock,
      badge: missedCallsCount > 0,
      badgeCount: missedCallsCount,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800/80 py-1.5 px-2">
      <div className="max-w-md mx-auto grid grid-cols-6 gap-0.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1 rounded-xl transition ${
                isActive
                  ? 'text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div
                className={`relative p-1 rounded-xl transition ${
                  isActive ? 'bg-indigo-600/20 text-indigo-400' : ''
                }`}
              >
                <Icon className="w-5 h-5" />

                {tab.badge && (
                  <span className="absolute -top-1 -right-1 px-1 min-w-[14px] h-[14px] rounded-full bg-red-500 text-white text-[9px] font-extrabold flex items-center justify-center ring-2 ring-slate-950 animate-pulse">
                    {tab.badgeCount && tab.badgeCount > 9 ? '9+' : tab.badgeCount}
                  </span>
                )}
              </div>

              <span
                className={`text-[9px] font-medium mt-0.5 tracking-tight ${
                  isActive ? 'font-bold text-indigo-400' : 'text-slate-400'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
