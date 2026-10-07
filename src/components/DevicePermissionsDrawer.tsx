import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Phone,
  Mic,
  Bell,
  Vibrate,
  Battery,
  Wifi,
  MapPin,
  ShieldCheck,
  Check,
  Download,
  X,
  Share2,
} from 'lucide-react';
import { deviceHardware, type DeviceCapabilities } from '../services/deviceHardwareService';

interface DevicePermissionsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onInstallPwa: () => void;
  isInstalled: boolean;
}

export const DevicePermissionsDrawer: React.FC<DevicePermissionsDrawerProps> = ({
  isOpen,
  onClose,
  onInstallPwa,
  isInstalled,
}) => {
  const [caps, setCaps] = useState<DeviceCapabilities>(deviceHardware.getCapabilities());
  const [micGranted, setMicGranted] = useState(false);
  const [locGranted, setLocGranted] = useState(false);

  useEffect(() => {
    return deviceHardware.subscribe((c) => setCaps(c));
  }, []);

  if (!isOpen) return null;

  const handleRequestMic = async () => {
    const granted = await deviceHardware.requestMicrophoneAccess();
    setMicGranted(granted);
    deviceHardware.triggerHaptic(50);
  };

  const handleRequestNotifications = async () => {
    await deviceHardware.requestNotificationAccess();
    deviceHardware.triggerHaptic(50);
  };

  const handleRequestLocation = async () => {
    const pos = await deviceHardware.requestLocationAccess();
    if (pos) {
      setLocGranted(true);
      deviceHardware.triggerHaptic(50);
    }
  };

  const handleTestVibrate = () => {
    deviceHardware.triggerHaptic([50, 100, 50]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="w-full max-w-sm bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-700 rounded-3xl p-6 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Full Mobile Device Access</h3>
              <p className="text-[11px] text-slate-400">Hardware & System Permissions</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Device Status Bar Preview */}
        <div className="mb-4 p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <Wifi className="w-4 h-4 text-emerald-400" />
            <span>{caps.networkType || '5G Network'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Battery className="w-4 h-4 text-emerald-400" />
            <span>
              {caps.batteryLevel !== null ? `${caps.batteryLevel}%` : '98%'}
              {caps.isCharging ? ' (Charging)' : ''}
            </span>
          </div>
        </div>

        {/* Permissions List */}
        <div className="space-y-2.5 mb-5">
          {/* Phone & Dialer Intent */}
          <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Phone className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-200">Phone Calls & Dialer</div>
                <div className="text-[10px] text-slate-400">Direct `tel:` intent execution</div>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
              <Check className="w-3 h-3" /> Active
            </span>
          </div>

          {/* Microphone & Voice */}
          <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                <Mic className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-200">Microphone & Voice Engine</div>
                <div className="text-[10px] text-slate-400">Speech recognition & commands</div>
              </div>
            </div>
            <button
              onClick={handleRequestMic}
              className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition ${
                micGranted
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-purple-600 hover:bg-purple-500 text-white'
              }`}
            >
              {micGranted ? 'Granted' : 'Grant Mic'}
            </button>
          </div>

          {/* Notifications & WhatsApp Reader */}
          <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Bell className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-200">Notifications & Alerts</div>
                <div className="text-[10px] text-slate-400">WhatsApp & missed call listener</div>
              </div>
            </div>
            <button
              onClick={handleRequestNotifications}
              className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition ${
                caps.notificationPermission === 'granted'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-amber-600 hover:bg-amber-500 text-white'
              }`}
            >
              {caps.notificationPermission === 'granted' ? 'Allowed' : 'Enable'}
            </button>
          </div>

          {/* Vibration / Haptics */}
          <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <Vibrate className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-200">Vibration & Haptic Feedback</div>
                <div className="text-[10px] text-slate-400">Tactile dial pad sensations</div>
              </div>
            </div>
            <button
              onClick={handleTestVibrate}
              className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-medium transition"
            >
              Test Haptic
            </button>
          </div>

          {/* Location Services */}
          <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-pink-500/20 text-pink-400 flex items-center justify-center">
                <MapPin className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-200">Location & Timezone</div>
                <div className="text-[10px] text-slate-400">{caps.locationName || 'Local timezone sync'}</div>
              </div>
            </div>
            <button
              onClick={handleRequestLocation}
              className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition ${
                locGranted
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              {locGranted ? 'Synced' : 'Sync GPS'}
            </button>
          </div>
        </div>

        {/* Install APK / Home Screen Prompt */}
        <div className="p-3 rounded-2xl bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border border-indigo-700/50 mb-4 text-center">
          <div className="text-xs font-bold text-white mb-1">
            Install as Full Android APK / App
          </div>
          <p className="text-[10px] text-slate-300 mb-2.5">
            Run full-screen without address bar, receive real-time notifications, and launch directly from your home screen.
          </p>
          <button
            onClick={() => {
              onInstallPwa();
              onClose();
            }}
            className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold text-white text-xs flex items-center justify-center gap-1.5 transition active:scale-98"
          >
            <Download className="w-3.5 h-3.5" />
            {isInstalled ? 'App Already Installed' : 'Install APK on Android'}
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition"
        >
          Close
        </button>
      </div>
    </div>
  );
};
