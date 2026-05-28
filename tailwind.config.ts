import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        arcana: {
          bg: '#0b0a1a',        // 深い夜空
          surface: '#16142b',   // カード裏
          accent: '#c8a96a',    // 金（神秘）
          accentSoft: '#e3cf9a',
          text: '#ece8f5',
          muted: '#9590b4',
          danger: '#e26a6a',
        },
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
      },
      backgroundImage: {
        'starfield':
          'radial-gradient(ellipse at top, rgba(200,169,106,0.10), transparent 60%), radial-gradient(ellipse at bottom, rgba(110,80,180,0.15), transparent 70%)',
      },
    },
  },
  plugins: [],
};

export default config;
