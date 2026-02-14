import { useEffect, useRef } from 'react';
import { playPewSound, playHitSound } from '../utils/sounds';

export function Bullet({ fromEl, toEl, onDone }: { fromEl: HTMLElement; toEl: HTMLElement; onDone: () => void }) {
  const bulletRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fromRect = fromEl.getBoundingClientRect();
    const toRect = toEl.getBoundingClientRect();
    const startX = fromRect.left + fromRect.width / 2;
    const startY = fromRect.top + fromRect.height / 2;
    const endX = toRect.left + toRect.width / 2;
    const endY = toRect.top + toRect.height / 2;

    const bullet = bulletRef.current;
    if (!bullet) return;

    const angle = Math.atan2(endY - startY, endX - startX) * (180 / Math.PI);

    bullet.style.left = `${startX}px`;
    bullet.style.top = `${startY}px`;
    bullet.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;

    playPewSound();

    const anim = bullet.animate([
      { left: `${startX}px`, top: `${startY}px`, opacity: 1 },
      { left: `${endX}px`, top: `${endY}px`, opacity: 1 },
    ], {
      duration: 300,
      easing: 'linear',
      fill: 'forwards',
    });

    anim.onfinish = () => {
      playHitSound();
      onDone();
    };
  }, [fromEl, toEl, onDone]);

  return (
    <div
      ref={bulletRef}
      className="fixed z-50 pointer-events-none"
      style={{ width: 0, height: 0 }}
    >
      <div className="absolute" style={{
        width: '18px',
        height: '6px',
        background: 'linear-gradient(90deg, transparent, #fbbf24, #f59e0b, #fff)',
        borderRadius: '3px',
        boxShadow: '0 0 8px #fbbf24, 0 0 16px #f59e0b',
        transform: 'translate(-50%, -50%)',
      }} />
    </div>
  );
}
