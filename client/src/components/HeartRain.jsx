import { useMemo } from 'react';

const HEARTS = ['❤️','💕','💖','💗','🧡','💛','💜','🩷','💝','💞'];

export default function HeartRain() {
  const hearts = useMemo(() =>
    Array.from({ length: 28 }, (_, i) => ({
      id: i,
      emoji: HEARTS[i % HEARTS.length],
      left: 3 + Math.random() * 94,
      size: 1.1 + Math.random() * 1.6,
      delay: Math.random() * 1.4,
      dur: 2.6 + Math.random() * 2,
      rotate: -20 + Math.random() * 40,
    })), []
  );

  return (
    <div className="heart-rain" aria-hidden="true">
      {hearts.map(h => (
        <span
          key={h.id}
          className="heart-particle"
          style={{
            left: `${h.left}%`,
            fontSize: `${h.size}rem`,
            animationDelay: `${h.delay}s`,
            animationDuration: `${h.dur}s`,
            '--hr': `${h.rotate}deg`,
          }}
        >
          {h.emoji}
        </span>
      ))}
    </div>
  );
}
