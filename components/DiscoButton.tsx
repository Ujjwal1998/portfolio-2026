"use client";

function playMacarena() {
  try {
    const audioContext = new (window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();

    const notes = [
      { freq: 440, duration: 0.6 },
      { freq: 392, duration: 0.15 },
      { freq: 440, duration: 0.15 },
      { freq: 494, duration: 0.15 },
      { freq: 440, duration: 0.4 },
    ];

    let currentTime = audioContext.currentTime;

    notes.forEach((note) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.type = "square";
      oscillator.frequency.setValueAtTime(note.freq, currentTime);

      gainNode.gain.setValueAtTime(0, currentTime);
      gainNode.gain.linearRampToValueAtTime(0.1, currentTime + 0.02);
      gainNode.gain.setValueAtTime(0.1, currentTime + note.duration - 0.05);
      gainNode.gain.linearRampToValueAtTime(0, currentTime + note.duration);

      oscillator.start(currentTime);
      oscillator.stop(currentTime + note.duration);

      currentTime += note.duration;
    });
  } catch {
    // Audio not supported or blocked
  }
}

interface DiscoButtonProps {
  onDisco: () => void;
  disabled?: boolean;
}

export default function DiscoButton({ onDisco, disabled }: DiscoButtonProps) {
  const handleClick = () => {
    if (disabled) return;
    playMacarena();
    onDisco();
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className="w-12 h-12 flex items-center justify-center rounded-lg hover:bg-card-bg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      aria-label="Disco mode"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="4" />
        <circle cx="12" cy="12" r="8" />
        <line x1="4" y1="12" x2="20" y2="12" />
        <line x1="12" y1="4" x2="12" y2="20" />
      </svg>
    </button>
  );
}
