import JSZip from 'jszip';
import QRCode from 'qrcode';

export async function generateQrCodeUrl(url: string): Promise<string> {
  try {
    return await QRCode.toDataURL(url, {
      width: 260,
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    });
  } catch (err) {
    console.error('Failed to generate QR code:', err);
    return '';
  }
}

export async function downloadApkPackage(appUrl: string = window.location.origin) {
  const zip = new JSZip();

  // 1. Android Manifest
  const manifestContent = {
    name: 'DayCatch - Daily Briefing & Call Assistant',
    short_name: 'DayCatch',
    start_url: appUrl,
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#090d16',
    theme_color: '#0f172a',
    description: 'An AI-powered mobile assistant app to catch up on unread Gmail emails, review WhatsApp messages, make quick phone calls, and see everything you missed today.',
    icons: [
      {
        src: '/pwa-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/pwa-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/pwa-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    shortcuts: [
      {
        name: 'Daily Catch-Up',
        short_name: 'Catch-Up',
        description: 'See what you missed today',
        url: `${appUrl}/#briefing`,
        icons: [{ src: '/pwa-192x192.png', sizes: '192x192' }],
      },
      {
        name: 'Phone Keypad',
        short_name: 'Dialer',
        description: 'Open dialer and call',
        url: `${appUrl}/#dialer`,
        icons: [{ src: '/pwa-192x192.png', sizes: '192x192' }],
      },
    ],
  };

  zip.file('manifest.json', JSON.stringify(manifestContent, null, 2));

  // 2. Service Worker for Android Offline Caching
  const swContent = `// DayCatch Service Worker for Android APK / WebAPK
const CACHE_NAME = 'daycatch-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg',
  '/pwa-192x192.png',
  '/pwa-512x512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((res) => res || fetch(e.request))
  );
});
`;
  zip.file('sw.js', swContent);

  // 3. Android Bubblewrap / TWA build configuration
  const twaConfig = {
    packageId: 'com.daycatch.assistant',
    host: new URL(appUrl).host,
    name: 'DayCatch',
    launcherName: 'DayCatch',
    themeColor: '#0f172a',
    navigationColor: '#090d16',
    backgroundColor: '#090d16',
    enableNotifications: true,
    startUrl: '/',
    iconUrl: `${appUrl}/pwa-512x512.png`,
    maskableIconUrl: `${appUrl}/pwa-512x512.png`,
    appVersionName: '1.0.0',
    appVersionCode: 1,
    shortcuts: [
      { name: 'Dialer', shortName: 'Dialer', url: `${appUrl}/#dialer` },
      { name: 'Briefing', shortName: 'Briefing', url: `${appUrl}/#briefing` },
    ],
  };
  zip.file('twa-manifest.json', JSON.stringify(twaConfig, null, 2));

  // 4. Instructions file
  const instructions = `========================================================
 DAYCATCH - ANDROID APK & APP INSTALLATION GUIDE
========================================================

APP URL: ${appUrl}

OPTION 1: INSTANT 1-CLICK INSTALL ON ANDROID (NO SDK NEEDED)
-----------------------------------------------------------
1. On your Android phone, open Chrome or Edge and visit:
   ${appUrl}
2. Tap the banner "Install DayCatch" or tap Chrome's menu (⋮)
   and select "Install app" or "Add to Home screen".
3. Android will automatically compile and install a native
   WebAPK on your phone! It appears directly in your Android
   app drawer and launcher with full-screen support, native dialer,
   and notifications.

OPTION 2: BUILD A SIGNED STANDALONE .APK FILE (FOR PLAY STORE / SIDELOADING)
----------------------------------------------------------------------------
Using PWABuilder (Easiest - 1 minute):
1. Go to https://www.pwabuilder.com
2. Enter your App URL: ${appUrl}
3. Click "Package for Stores" -> "Android".
4. Download the generated signed .apk or .aab package file.
5. Install directly on any Android device!

Using Google Bubblewrap CLI (Advanced):
1. Install Bubblewrap:
   npm install -g @bubblewrap/cli
2. Initialize project:
   bubblewrap init --manifest="${appUrl}/manifest.webmanifest"
3. Build signed APK:
   bubblewrap build
4. Your .apk file will be in the output folder!

========================================================
`;
  zip.file('README-ANDROID-INSTALL.txt', instructions);

  // Generate ZIP file and trigger browser download
  const blob = await zip.generateAsync({ type: 'blob' });
  const downloadLink = document.createElement('a');
  downloadLink.href = URL.createObjectURL(blob);
  downloadLink.download = 'DayCatch-Android-APK-Package.zip';
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  URL.revokeObjectURL(downloadLink.href);
}
