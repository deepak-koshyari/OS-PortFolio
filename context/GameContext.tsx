'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  unlocked: boolean;
}

interface GameContextType {
  xp: number;
  level: number;
  levelName: string;
  achievements: Achievement[];
  addXP: (amount: number) => void;
  unlockAchievement: (id: string) => void;
  recentAchievement: Achievement | null;
  clearRecentAchievement: () => void;
}

const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_boot', title: 'First Boot', description: 'Launched the OS for the first time', icon: '🚀', xpReward: 50, unlocked: false },
  { id: 'app_explorer', title: 'App Explorer', description: 'Opened 3 different apps', icon: '🗂️', xpReward: 100, unlocked: false },
  { id: 'crypto_watcher', title: 'Crypto Watcher', description: 'Opened the Crypto Tracker', icon: '₿', xpReward: 75, unlocked: false },
  { id: 'code_master', title: 'Code Master', description: 'Used the Code Editor app', icon: '💻', xpReward: 100, unlocked: false },
  { id: 'dsa_nerd', title: 'DSA Nerd', description: 'Used the DSA Calculator', icon: '🧠', xpReward: 75, unlocked: false },
  { id: 'terminal_hacker', title: 'Terminal Hacker', description: 'Used the AI Terminal', icon: '⌨️', xpReward: 125, unlocked: false },
  { id: 'easter_egg', title: 'Easter Egg Hunter', description: 'Found a hidden easter egg!', icon: '🥚', xpReward: 200, unlocked: false },
  { id: 'all_apps', title: 'Power User', description: 'Opened all apps at once', icon: '⚡', xpReward: 300, unlocked: false },
];

const LEVELS = [
  { min: 0, name: 'Newbie' },
  { min: 100, name: 'Explorer' },
  { min: 300, name: 'Hacker' },
  { min: 600, name: 'Senior Dev' },
  { min: 1000, name: 'Architect' },
];

function getLevelName(xp: number): string {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].min) return LEVELS[i].name;
  }
  return 'Newbie';
}

function getLevel(xp: number): number {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].min) return i + 1;
  }
  return 1;
}

const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [xp, setXP] = useState(0);
  const [achievements, setAchievements] = useState<Achievement[]>(ACHIEVEMENTS);
  const [recentAchievement, setRecentAchievement] = useState<Achievement | null>(null);

  const addXP = useCallback((amount: number) => {
    setXP(prev => prev + amount);
  }, []);

  const unlockAchievement = useCallback((id: string) => {
    let unlockedAchievement: Achievement | null = null;

    setAchievements(prev => {
      const ach = prev.find(a => a.id === id);
      if (!ach || ach.unlocked) return prev;

      unlockedAchievement = { ...ach, unlocked: true };

      return prev.map(a => a.id === id ? { ...a, unlocked: true } : a);
    });

    if (unlockedAchievement) {
      setRecentAchievement(unlockedAchievement);
      setXP(x => x + unlockedAchievement!.xpReward);
    }
  }, []);

  const clearRecentAchievement = useCallback(() => {
    setRecentAchievement(null);
  }, []);

  return (
    <GameContext.Provider
      value={{
        xp,
        level: getLevel(xp),
        levelName: getLevelName(xp),
        achievements,
        addXP,
        unlockAchievement,
        recentAchievement,
        clearRecentAchievement,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
