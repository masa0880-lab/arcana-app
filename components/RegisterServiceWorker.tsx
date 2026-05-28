'use client';

import { useEffect } from 'react';

// SWからのアップデート通知を受け取ったら1度だけリロードして古いJSを捨てる
const RELOAD_KEY = 'arcana:sw:reloaded';

export function RegisterServiceWorker() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) return;
    if (process.env.NODE_ENV !== 'production') return;

    navigator.serviceWorker.register('/sw.js').catch(() => {
      // 登録失敗は無視
    });

    const onMessage = (event: MessageEvent) => {
      const data = event.data as { type?: string } | undefined;
      if (!data || data.type !== 'arcana-sw-updated') return;
      // 同一セッションで複数回リロードしないよう sessionStorage で抑止
      try {
        if (window.sessionStorage.getItem(RELOAD_KEY)) return;
        window.sessionStorage.setItem(RELOAD_KEY, '1');
      } catch {
        // sessionStorage 不可ならそのままリロード
      }
      window.location.reload();
    };

    navigator.serviceWorker.addEventListener('message', onMessage);
    return () => {
      navigator.serviceWorker.removeEventListener('message', onMessage);
    };
  }, []);

  return null;
}
