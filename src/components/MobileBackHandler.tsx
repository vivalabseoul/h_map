'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { App } from '@capacitor/app';
import Toast from './Toast';

export default function MobileBackHandler() {
  const pathname = usePathname();
  const router = useRouter();
  const [showToast, setShowToast] = useState(false);
  const lastBackTimeRef = useRef<number>(0);

  // Helper to check if current pathname is root/home route
  const isRootPage = useCallback((path: string | null) => {
    if (!path) return true;
    const cleanPath = path.replace(/\/$/, '');
    return (
      cleanPath === '' ||
      cleanPath === '/ko' ||
      cleanPath === '/en' ||
      cleanPath === '/ja' ||
      cleanPath === '/zh'
    );
  }, []);

  useEffect(() => {
    let unlistenCapacitor: (() => void) | null = null;

    const handleBackAction = async () => {
      const isRoot = isRootPage(pathname);

      if (!isRoot) {
        // Subpage: go back in history
        if (typeof window !== 'undefined' && window.history.length > 1) {
          router.back();
        } else {
          router.push('/');
        }
        return;
      }

      // Root page handling
      const now = Date.now();
      if (now - lastBackTimeRef.current < 2000) {
        // Exit app if double pressed within 2 seconds
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

    // 1. Capacitor App back button listener
    const initCapacitor = async () => {
      try {
        const listener = await App.addListener('backButton', (data: { canGoBack: boolean }) => {
          handleBackAction();
        });
        unlistenCapacitor = () => {
          listener.remove();
        };
      } catch {
        // Capacitor App plugin not loaded (web mode)
      }
    };
    initCapacitor();

    // 2. Web browser popstate listener for Web/PWA
    const handlePopState = (e: PopStateEvent) => {
      if ((window as any)._ignoreNextPopState) {
        (window as any)._ignoreNextPopState = false;
        return;
      }
      const isRoot = isRootPage(pathname);
      if (isRoot) {
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
    if (typeof window !== 'undefined' && isRootPage(pathname)) {
      window.history.pushState({ page: 'root' }, '', window.location.href);
    }

    window.addEventListener('popstate', handlePopState);

    return () => {
      if (unlistenCapacitor) unlistenCapacitor();
      window.removeEventListener('popstate', handlePopState);
    };
  }, [pathname, router, isRootPage]);

  if (!showToast) return null;

  return (
    <Toast
      type="warning"
      message="한 번 더 누르면 종료됩니다"
      onClose={() => setShowToast(false)}
      duration={2000}
    />
  );
}
