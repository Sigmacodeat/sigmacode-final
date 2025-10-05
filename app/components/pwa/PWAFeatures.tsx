'use client';

import { useEffect, useState } from 'react';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { Download, Wifi, WifiOff, RefreshCw } from 'lucide-react';

interface PWAStatus {
  isOnline: boolean;
  isInstallable: boolean;
  isInstalled: boolean;
  canInstall: boolean;
}

export function PWAInstallPrompt() {
  const [status, setStatus] = useState<PWAStatus>({
    isOnline: navigator.onLine,
    isInstallable: false,
    isInstalled: false,
    canInstall: false,
  });
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInWebAppiOS = (window.navigator as any).standalone === true;

    if (isStandalone || isInWebAppiOS) {
      setStatus((prev) => ({ ...prev, isInstalled: true }));
      return;
    }

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setStatus((prev) => ({ ...prev, canInstall: true, isInstallable: true }));
    };

    const handleAppInstalled = () => {
      setStatus((prev) => ({ ...prev, isInstalled: true }));
      setShowPrompt(false);
    };

    const handleOnline = () => {
      setStatus((prev) => ({ ...prev, isOnline: true }));
    };

    const handleOffline = () => {
      setStatus((prev) => ({ ...prev, isOnline: false }));
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) return;

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        setShowPrompt(false);
      }

      setDeferredPrompt(null);
    } catch (error) {
      console.error('Install prompt failed:', error);
    }
  };

  // Show install prompt after 30 seconds if not dismissed
  useEffect(() => {
    if (status.canInstall && !status.isInstalled) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 30000);

      return () => clearTimeout(timer);
    }
  }, [status.canInstall, status.isInstalled]);

  if (status.isInstalled) {
    return null;
  }

  // Don't render anything during SSR to prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <>
      {/* Online/Offline Status entfernt */}

      {/* Install Prompt */}
      {showPrompt && status.canInstall && (
        <div className="fixed bottom-4 right-4 z-50 max-w-sm">
          <div className="bg-white border border-zinc-200 rounded-xl shadow-lg p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <Download className="h-6 w-6 text-violet-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-zinc-900 mb-1">App installieren</h3>
                <p className="text-sm text-zinc-600 mb-3">
                  Installieren Sie SIGMACODE AI als App für bessere Performance und Offline-Zugang.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={installApp}
                    className="flex-1 bg-violet-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-violet-700 transition-colors"
                  >
                    Installieren
                  </button>
                  <button
                    onClick={() => setShowPrompt(false)}
                    className="px-3 py-2 text-zinc-600 hover:text-zinc-800 transition-colors"
                  >
                    Später
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Offline Message */}
      {!status.isOnline && (
        <ErrorMessage
          title="Offline Modus"
          message="Sie sind offline. Einige Features sind möglicherweise nicht verfügbar."
          variant="warning"
          className="fixed top-16 left-4 right-4 z-50 max-w-md"
        />
      )}
    </>
  );
}

// Service Worker Registration Hook
export function useServiceWorker() {
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !('serviceWorker' in navigator)) return;

    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        setRegistration(reg);

        // Check for updates
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setUpdateAvailable(true);
              }
            });
          }
        });
      })
      .catch((error) => {
        console.error('Service Worker registration failed:', error);
      });
  }, [mounted]);

  const updateApp = () => {
    if (registration && registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  };

  return { updateAvailable, updateApp };
}

// Update Notification
export function UpdateNotification({
  updateAvailable,
  updateApp,
}: {
  updateAvailable: boolean;
  updateApp: () => void;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!updateAvailable || !mounted) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 max-w-sm">
      <div className="bg-blue-600 text-white rounded-xl shadow-lg p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <RefreshCw className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold mb-1">Update verfügbar</h3>
            <p className="text-sm mb-3 opacity-90">Eine neue Version der App ist verfügbar.</p>
            <button
              onClick={updateApp}
              className="bg-white text-blue-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors"
            >
              Jetzt aktualisieren
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
