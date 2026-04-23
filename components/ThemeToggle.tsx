'use client';

import { useEffect, useState } from 'react';

const THEMES = ['0', '1', '2', '3'] as const;
type ThemeIndex = typeof THEMES[number];

const COLORS: Record<ThemeIndex, string> = {
  '0': '#003049',
  '1': '#D62828',
  '2': '#F77F00',
  '3': '#FCBF49',
};

function playClickSound() {
  try {
    const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.03);
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.03);
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.03);
  } catch {
    // Audio not supported or blocked
  }
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeIndex | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('theme') as ThemeIndex | null;
    const t: ThemeIndex = THEMES.includes(stored as ThemeIndex) ? (stored as ThemeIndex) : '0';
    setTheme(t);
    document.documentElement.setAttribute('data-theme', t);
  }, []);

  const cycleTheme = () => {
    if (theme === null) return;
    const next = THEMES[(THEMES.indexOf(theme) + 1) % THEMES.length];
    setTheme(next);
    localStorage.setItem('theme', next);
    document.documentElement.setAttribute('data-theme', next);
    playClickSound();
  };

  if (theme === null) return <div className="w-12 h-12" />;

  const nextTheme = THEMES[(THEMES.indexOf(theme) + 1) % THEMES.length];
  const nextColor = COLORS[nextTheme];

  return (
    <button
      onClick={cycleTheme}
      className="w-12 h-12 flex items-center justify-center rounded-lg hover:bg-card-bg transition-colors"
      aria-label={`Switch background color`}
      title={`Next: ${nextColor}`}
    >
      <span
        className="w-5 h-5 rounded-full border-2 transition-colors duration-300"
        style={{
          backgroundColor: nextColor,
          borderColor: 'rgba(255,255,255,0.4)',
        }}
      />
    </button>
  );
}
