'use client';

import React, { useEffect, useState, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { App } from '@capacitor/app';
import { Capacitor, type PluginListenerHandle } from '@capacitor/core';
import { useFilter } from '@/context/FilterContext';
import Toast from './Toast';

// TEMPORARY: inside the Android app, show a small notice whenever the back button reaches this code
// (or when the native back plugin could not be connected), to find out why the app closes on back.
const SHOW_BACK_DEBUG = true;

// Same breakpoint the home page uses to turn the list into a bottom sheet
const MOBILE_MAX_WIDTH = 760;

function isRootPage(path: string | null): boolean {
  if (!path) return true;
  const cleanPath = path.replace(/\/$/, '');
  return (
    cleanPath === '' ||
    cleanPath === '/ko' ||
    cleanPath === '/en' ||
    cleanPath === '/ja' ||
    cleanPath === '/zh'
  );
}

export default function MobileBackHandler() {
  const pathname = usePathname();
  const router = useRouter();
  const { viewMode, setViewMode } = useFilter();
  const [showToast, setShowToast] = useState(false);
  const [debugNote, setDebugNote] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const lastBackTimeRef = useRef<number>(0);

  // What a back press does. It is rebuilt every render so it always sees the current page,
  // while the native listener below is registered only once and just calls the latest version.
  const handleBackRef = useRef<() => void>(() => {});
  useEffect(() => {
    handleBackRef.current = async () => {
      if (SHOW_BACK_DEBUG) setDebugNote({ message: `뒤로가기 감지: ${pathname}`, type: 'success' });

      // 1. An open modal or sheet owns the back press: it pushed a history entry, so popping it closes it
      if (window.history.state?.modalOpen) {
        window.history.back();
        return;
      }

      // 2. Subpage: go back in history
      if (!isRootPage(pathname)) {
        if (window.history.length > 1) {
          router.back();
        } else {
          router.push('/');
        }
        return;
      }

      // 3. Home with the list sheet open: close the list and show the map again
      if (viewMode === 'list' && window.innerWidth <= MOBILE_MAX_WIDTH) {
        setViewMode('map');
        return;
      }

      // 4. Home: press twice within 2 seconds to exit
      const now = Date.now();
      if (now - lastBackTimeRef.current < 2000) {
        try {
          await App.exitApp();
        } catch {
          // Pure browser fallback
        }
      } else {
        lastBackTimeRef.current = now;
        setShowToast(true);
      }
    };
  });

  // Capacitor hardware back button. Registered once: re-registering on every route change left short gaps
  // (and, if a removal raced the registration, duplicate listeners that could exit the app on a single press).
  useEffect(() => {
    let disposed = false;
    let handle: PluginListenerHandle | null = null;

    App.addListener('backButton', () => handleBackRef.current())
      .then((listener) => {
        if (disposed) listener.remove();
        else handle = listener;
      })
      .catch((error: unknown) => {
        // Capacitor App plugin not loaded (web mode)
        if (SHOW_BACK_DEBUG && Capacitor.isNativePlatform()) {
          const reason = error instanceof Error ? error.message : String(error);
          setDebugNote({ message: `뒤로가기 연결 실패 (앱 업데이트 필요): ${reason}`, type: 'error' });
        }
      });

    return () => {
      disposed = true;
      handle?.remove();
    };
  }, []);

  // Web browser popstate listener for Web/PWA
  useEffect(() => {
    const handlePopState = () => {
      if ((window as any)._ignoreNextPopState) {
        (window as any)._ignoreNextPopState = false;
        return;
      }
      if (isRootPage(pathname)) {
        const now = Date.now();
        if (now - lastBackTimeRef.current >= 2000) {
          // Push state back so page doesn't immediately close browser tab/window
          window.history.pushState({ page: 'root' }, '', window.location.href);
          lastBackTimeRef.current = now;
          setShowToast(true);
        }
      }
    };

    // Push initial history state on root to catch popstate
    if (isRootPage(pathname)) {
      window.history.pushState({ page: 'root' }, '', window.location.href);
    }

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [pathname]);

  return (
    <>
      {showToast && (
        <Toast
          type="warning"
          message="한 번 더 누르면 종료됩니다"
          onClose={() => setShowToast(false)}
          duration={2000}
        />
      )}
      {debugNote && (
        <Toast type={debugNote.type} message={debugNote.message} onClose={() => setDebugNote(null)} duration={5000} />
      )}
    </>
  );
}
