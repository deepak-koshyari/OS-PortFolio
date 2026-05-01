'use client';

import { motion } from 'framer-motion';
import { useWindows, AppId } from '@/context/WindowContext';
import { useGame } from '@/context/GameContext';
import { useState, useEffect } from 'react';

interface DesktopIconProps {
  id: AppId;
  icon: string;
  label: string;
  color: string;
  initialPos: { x: number; y: number };
  achievementId?: string;
}

export default function DesktopIcon({
  id,
  icon,
  label,
  color,
  initialPos,
  achievementId,
}: DesktopIconProps) {
  const { openWindow } = useWindows();
  const { unlockAchievement } = useGame();

  const [clicked, setClicked] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [eggUnlocked, setEggUnlocked] = useState(false);

  const handleDoubleClick = () => {
    openWindow(id);

    if (achievementId) unlockAchievement(achievementId);
    if (id === 'crypto') unlockAchievement('crypto_watcher');
    if (id === 'editor') unlockAchievement('code_master');
    if (id === 'dsa') unlockAchievement('dsa_nerd');
    if (id === 'terminal') unlockAchievement('terminal_hacker');

    unlockAchievement('first_boot');
  };

  const handleClick = () => {
    setClicked(true);

    // ✅ only update state here (no side-effects)
    setClickCount(prev => prev + 1);

    setTimeout(() => setClicked(false), 300);
  };

  // ✅ side-effect moved here (React-safe)
  useEffect(() => {
    if (clickCount >= 5 && !eggUnlocked) {
      unlockAchievement('easter_egg');
      setEggUnlocked(true);
    }
  }, [clickCount, eggUnlocked, unlockAchievement]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="absolute flex flex-col items-center gap-1.5 cursor-pointer select-none"
      style={{
        width: 80,
        zIndex: 5,
        left: initialPos.x,
        top: initialPos.y,
      }}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Icon */}
      <motion.div
        className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${color}18, ${color}08)`,
          border: `2px solid ${clicked ? color + '80' : color + '30'}`,
          boxShadow: clicked
            ? `0 0 20px ${color}30, 0 0 40px ${color}10`
            : `0 4px 15px rgba(0,0,0,0.3)`,
          backdropFilter: 'blur(10px)',
          transition: 'all 0.2s',
        }}
      >
        {/* Glass sheen */}
        <div
          className="absolute top-0 left-0 right-0 h-1/2 rounded-t-2xl opacity-10"
          style={{
            background: 'linear-gradient(to bottom, white, transparent)',
          }}
        />
        <span style={{ position: 'relative', zIndex: 1 }}>{icon}</span>
      </motion.div>

      {/* Label */}
      <span
        className="text-center text-xs leading-tight px-1 py-0.5 rounded"
        style={{
          color: '#e2e8f0',
          background: 'rgba(5,8,22,0.7)',
          backdropFilter: 'blur(4px)',
          textShadow: '0 1px 3px rgba(0,0,0,0.8)',
          maxWidth: '100%',
          fontSize: 11,
        }}
      >
        {label}
      </span>
    </motion.div>
  );
}