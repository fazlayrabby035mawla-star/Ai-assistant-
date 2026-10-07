import React, { useState, useEffect } from 'react';
import {
  Download,
  Smartphone,
  CheckCircle,
  QrCode,
  ExternalLink,
  X,
  Sparkles,
  PackageCheck,
  Share2,
  Copy,
  Check,
} from 'lucide-react';
import { downloadApkPackage, generateQrCodeUrl } from '../services/apkDownloadService';

interface ApkInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInstall: () => void;
  isInstallable: boolean;
  isInstalled: boolean;
  isAndroid: boolean;
}

export const ApkInstallModal: React.FC<ApkInstallModalProps> = ({
  isOpen,
  onClose,
  onInstall,
  isInstallable,
  isInstalled,
  isAndroid,
}) => {
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const sharedAppUrl =
    typeof window !== 'undefined'
      ? window.location.origin
      : 'https://ais-pre-rnspl4nrj6luhmewtwnguh-781146616927.asia-east1.run.app';

  useEffect(() => {
    if (isOpen) {
      generateQrCodeUrl(sharedAppUrl).then(setQrCodeUrl);
    }
  }, [isOpen, sharedAppUrl]);

  if (!isOpen) return null;

  const handleDownloadZip = async () => {
    setIsDownloading(true);
    try {
      await downloadApkPackage(sharedAppUrl);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(sharedAppUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2500);
  };

  const pwaBuilderUrl = `https://www.pwabuilder.com?url=${encodeURIComponent(sharedAppUrl)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in">
      <div className="w-full max-w-md bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-700 rounded-3xl p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-green-500 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30">
            <Download className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white">Download & Install APK</h3>
            <p className="text-xs text-slate-400">DayCatch Mobile Android Application</p>
          </div>
        </div>

        {downloadSuccess && (
          <div className="mb-4 p-3 rounded-2xl bg-emerald-950/60 border border-emerald-600/50 text-xs text-emerald-200 flex items-center gap-2">
            <PackageCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>DayCatch APK package downloaded successfully to your device!</span>
          </div>
        )}

        {/* PRIMARY ACTIONS: 1-Click Install or Download Package */}
        <div className="space-y-2.5 mb-5">
          {/* Action 1: Direct File Download of APK Package */}
          <button
            onClick={handleDownloadZip}
            disabled={isDownloading}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 active:scale-98 transition flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            {isDownloading ? 'Preparing Download...' : 'Download APK Package (.zip)'}
          </button>

          {/* Action 2: In-browser WebAPK Installation */}
          {isInstallable ? (
            <button
              onClick={() => {
                onInstall();
                onClose();
              }}
              className="w-full py-2.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md active:scale-98 transition flex items-center justify-center gap-2"
            >
              <Smartphone className="w-4 h-4" />
              Install WebAPK Directly to Android Home Screen
            </button>
          ) : isInstalled ? (
            <div className="w-full py-2 rounded-xl bg-emerald-950/50 border border-emerald-700/50 text-emerald-300 text-[11px] font-medium text-center">
              ✓ App is already running in installed mode
            </div>
          ) : (
            <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-[11px] text-slate-300 flex items-center justify-between">
              <span>On Android Chrome: Tap menu <strong>⋮</strong> → <strong>"Install app"</strong></span>
            </div>
          )}
        </div>

        {/* QR Code Section for Scanning on Mobile Device */}
        <div className="p-4 rounded-2xl bg-slate-800/70 border border-slate-700/80 mb-4 text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-200 mb-1">
            <QrCode className="w-4 h-4 text-emerald-400" />
            <span>Scan with Phone Camera to Install</span>
          </div>
          <p className="text-[10px] text-slate-400 mb-3">
            Open your phone's camera to immediately load and install the APK on your device
          </p>

          {qrCodeUrl ? (
            <div className="inline-block p-2 rounded-2xl bg-white shadow-xl mb-3">
              <img
                src={qrCodeUrl}
                alt="Scan to download DayCatch APK"
                className="w-40 h-40 mx-auto"
              />
            </div>
          ) : (
            <div className="w-40 h-40 mx-auto bg-slate-700 rounded-xl animate-pulse mb-3" />
          )}

          {/* Copy App Link */}
          <div className="flex items-center gap-2 max-w-xs mx-auto">
            <input
              type="text"
              readOnly
              value={sharedAppUrl}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-[10px] text-slate-300 truncate font-mono"
            />
            <button
              onClick={handleCopyLink}
              className="p-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 transition"
              title="Copy app URL"
            >
              {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Standalone Signed .APK Generation Link (PWABuilder) */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/50 to-indigo-950/50 border border-purple-800/40 text-center mb-3">
          <div className="text-xs font-bold text-purple-200 mb-1 flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            Export Signed .APK via PWABuilder
          </div>
          <p className="text-[10px] text-slate-300 mb-2.5">
            Generate an official signed Android APK or Google Play AAB bundle in under 60 seconds with zero terminal commands.
          </p>
          <a
            href={pwaBuilderUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-[11px] transition"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Build Signed APK on PWABuilder
          </a>
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
