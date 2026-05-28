import type { Metadata, Viewport } from 'next';
import Link from 'next/link';
import { RegisterServiceWorker } from '@/components/RegisterServiceWorker';
import './globals.css';

export const metadata: Metadata = {
  title: 'arcana-app — タロット占い',
  description: '78枚のタロットでClaudeがあなたの問いに応える',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'arcana',
  },
  icons: {
    icon: '/icons/icon-192.png',
    apple: '/icons/icon-192.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#0b0a1a',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-arcana-bg bg-starfield text-arcana-text antialiased">
        <div className="mx-auto flex min-h-screen max-w-3xl flex-col px-5 pb-16 pt-6">
          <header className="flex items-center justify-between border-b border-white/5 pb-4">
            <Link href="/" className="font-serif text-2xl tracking-wide text-arcana-accent">
              arcana
            </Link>
            <nav className="flex gap-5 text-sm text-arcana-muted">
              <Link href="/reading" className="hover:text-arcana-text">
                占う
              </Link>
              <Link href="/history" className="hover:text-arcana-text">
                履歴
              </Link>
            </nav>
          </header>
          <main className="flex-1 pt-8">{children}</main>
          <footer className="pt-10 text-center text-xs text-arcana-muted">
            <p>arcana-app — タロットはあなたの内なる声を映す鏡</p>
          </footer>
        </div>
        <RegisterServiceWorker />
      </body>
    </html>
  );
}
