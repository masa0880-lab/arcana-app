'use client';

import { useEffect } from 'react';

export function RegisterServiceWorker() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) return;
    if (process.env.NODE_ENV !== 'production') return;

    navigator.serviceWorker.register('/sw.js').catch(() => {
      // SW登録失敗は無視（開発体験を妨げない）
    });
  }, []);

  return null;
}
