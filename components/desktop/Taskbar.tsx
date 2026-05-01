'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWindows, AppId } from '@/context/WindowContext';
import { useGame } from '@/context/GameContext';

const APPS: Array<{ id: AppId; icon: string; label: string; color: string }> = [
  { id: 'about',    icon: '👤', label: 'About Me',    color: '#00d4ff' },
  { id: 'blog',     icon: '📝', label: 'Notes',       color: '#a855f7' },
  { id: 'dsa',      icon: '📊', label: 'DSA Calc',    color: '#10b981' },
  { id: 'crypto',   icon: '₿',  label: 'Crypto',      color: '#f59e0b' },
  { id: 'video',    icon: '🎬',  label: 'Portfolio Video', color: '#f43f5e' },
  { id: 'editor',   icon: '💻', label: 'Code Editor', color: '#6366f1' },
  { id: 'terminal', icon: '⌨️', label: 'Terminal',    color: '#ec4899' },
];

/* ─────────────── Clock ─────────────── */
function Clock() {
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }));
      setDate(now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="text-center">
      <div className="text-sm font-mono font-bold" style={{ color: '#00d4ff' }}>{time}</div>
      <div className="text-xs" style={{ color: '#64748b' }}>{date}</div>
    </div>
  );
}

/* ─────────────── Start Menu ─────────────── */
function StartMenu({ onClose, isTaskbarVisible }: { onClose: () => void; isTaskbarVisible: boolean }) {
  const { openWindow } = useWindows();
  const { unlockAchievement } = useGame();
  const [search, setSearch] = useState('');

  const filtered = APPS.filter(a =>
    a.label.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpen = (id: AppId) => {
    openWindow(id);
    unlockAchievement('first_boot');
    onClose();
  };

  return (
    <motion.div
      className="fixed left-4"
      style={{
        // Position above taskbar; 48px taskbar + 8px gap
        bottom: isTaskbarVisible ? 56 : 8,
        width: 320,
        background: 'rgba(5, 8, 22, 0.95)',
        backdropFilter: 'blur(30px)',
        border: '1px solid rgba(99,179,237,0.2)',
        borderRadius: 16,
        boxShadow: '0 -10px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,212,255,0.05)',
        zIndex: 9990,
        overflow: 'hidden',
        padding: 16,
      }}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
    >
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg">🖥️</span>
          <span
            className="font-bold text-base tracking-wider"
            style={{
              background: 'linear-gradient(90deg, #00d4ff, #a855f7)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            DEV OS
          </span>
        </div>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search apps..."
          autoFocus
          className="w-full px-3 py-2 rounded-lg text-sm outline-none"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(99,179,237,0.15)',
            color: '#e2e8f0',
          }}
        />
      </div>

      <div className="text-xs mb-2" style={{ color: '#64748b' }}>ALL APPS</div>

      <div className="grid grid-cols-3 gap-2">
        {filtered.map(app => (
          <button
            key={app.id}
            onClick={() => handleOpen(app.id)}
            className="flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all hover:scale-105"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = `${app.color}18`;
              (e.currentTarget as HTMLElement).style.borderColor = `${app.color}40`;
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)';
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)';
            }}
          >
            <span className="text-2xl">{app.icon}</span>
            <span className="text-xs text-center leading-tight" style={{ color: '#94a3b8' }}>
              {app.label}
            </span>
          </button>
        ))}
      </div>
    </motion.div>
  );
}

/* ─────────────── Taskbar ─────────────── */
export default function Taskbar() {
  const { windows, openWindow, restoreWindow } = useWindows();
  const { xp, level, levelName, unlockAchievement } = useGame();
  const [showStart, setShowStart] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Delay-hide timer ref to prevent flicker
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const TRIGGER_ZONE = 10; // px from bottom edge

    const handleMouseMove = (e: MouseEvent) => {
      const fromBottom = window.innerHeight - e.clientY;

      if (fromBottom < TRIGGER_ZONE) {
        // Cursor near bottom — cancel any pending hide, show taskbar
        if (hideTimerRef.current) {
          clearTimeout(hideTimerRef.current);
          hideTimerRef.current = null;
        }
        setIsVisible(true);
      } else if (fromBottom > 60) {
        // Cursor well above taskbar — schedule hide after 200ms delay
        if (!hideTimerRef.current) {
          hideTimerRef.current = setTimeout(() => {
            setIsVisible(false);
            hideTimerRef.current = null;
          }, 200);
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  // Keep taskbar visible while start menu is open
  useEffect(() => {
    if (showStart) {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
      setIsVisible(true);
    }
  }, [showStart]);

  const openApps = Object.values(windows).filter(w => w.isOpen);

  const handleAppClick = (id: AppId) => {
    const w = windows[id];
    if (!w.isOpen) {
      openWindow(id);
      unlockAchievement('first_boot');
    } else if (w.isMinimized) {
      restoreWindow(id);
    } else {
      openWindow(id);
    }
    const openCount = openApps.length + 1;
    if (openCount >= 3) unlockAchievement('app_explorer');
    if (openCount >= 6) unlockAchievement('all_apps');
    if (id === 'crypto') unlockAchievement('crypto_watcher');
    if (id === 'editor') unlockAchievement('code_master');
    if (id === 'dsa') unlockAchievement('dsa_nerd');
    if (id === 'terminal') unlockAchievement('terminal_hacker');
  };

  const xpForNextLevel = [100, 300, 600, 1000];
  const xpThreshold = xpForNextLevel[Math.min(level - 1, xpForNextLevel.length - 1)] || 1000;
  const prevThreshold = xpForNextLevel[Math.min(level - 2, xpForNextLevel.length - 1)] || 0;
  const xpProgress = Math.min(100, ((xp - prevThreshold) / (xpThreshold - prevThreshold)) * 100);

  return (
    <>
      {/* Click outside to close start menu */}
      {showStart && (
        <div className="fixed inset-0" style={{ zIndex: 9989 }} onClick={() => setShowStart(false)} />
      )}

      {/* Start Menu */}
      <AnimatePresence>
        {showStart && <StartMenu onClose={() => setShowStart(false)} isTaskbarVisible={isVisible} />}
      </AnimatePresence>

      {/* ── Invisible hover-trigger strip at the bottom ── */}
      <div
        className="fixed bottom-0 left-0 right-0"
        style={{ height: 12, zIndex: 9979, pointerEvents: 'all' }}
        onMouseEnter={() => {
          if (hideTimerRef.current) {
            clearTimeout(hideTimerRef.current);
            hideTimerRef.current = null;
          }
          setIsVisible(true);
        }}
      />

      {/* ── Taskbar Motion Wrapper ── */}
      <motion.div
        className="fixed bottom-0 left-0 right-0"
        style={{ zIndex: 9980 }}
        initial={{ y: 80 }}
        animate={{ y: isVisible ? 0 : 80 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        // When hidden, only the trigger strip above should capture pointer events
        onMouseEnter={() => {
          if (hideTimerRef.current) {
            clearTimeout(hideTimerRef.current);
            hideTimerRef.current = null;
          }
          setIsVisible(true);
        }}
      >
        <div
          className="flex items-center justify-between px-4"
          style={{
            height: 48,
            background: isVisible
              ? 'rgba(5, 8, 22, 0.88)'
              : 'rgba(5, 8, 22, 0.92)',
            backdropFilter: 'blur(30px)',
            WebkitBackdropFilter: 'blur(30px)',
            borderTop: '1px solid rgba(99,179,237,0.15)',
            boxShadow: isVisible ? '0 -4px 32px rgba(0,0,0,0.5), 0 -1px 0 rgba(0,212,255,0.06)' : 'none',
          }}
        >
          {/* Left: Start + App Icons */}
          <div className="flex items-center gap-1">
            {/* Start Button */}
            <button
              onClick={() => setShowStart(prev => !prev)}
              className="flex items-center gap-1.5 px-3 h-8 rounded-lg text-sm font-medium transition-all hover:scale-105"
              style={{
                background: showStart
                  ? 'linear-gradient(90deg, rgba(0,212,255,0.2), rgba(168,85,247,0.2))'
                  : 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(99,179,237,0.2)',
                color: '#e2e8f0',
              }}
            >
              <span>🖥️</span>
              <span className="text-xs hidden sm:block">Start</span>
            </button>

            {/* Separator */}
            <div className="w-px h-6 mx-1" style={{ background: 'rgba(99,179,237,0.15)' }} />

            {/* App Icons */}
            <div className="flex items-center gap-1">
              {APPS.map(app => {
                const w = windows[app.id];
                const isActive = w.isOpen && !w.isMinimized;
                const isMin = w.isMinimized;

                return (
                  <button
                    key={app.id}
                    onClick={() => handleAppClick(app.id)}
                    title={app.label}
                    className="relative flex items-center justify-center w-9 h-9 rounded-lg text-xl transition-all hover:scale-110"
                    style={{
                      background: isActive ? `${app.color}20` : 'transparent',
                      border: isActive ? `1px solid ${app.color}40` : '1px solid transparent',
                    }}
                  >
                    {app.icon}
                    {/* Active/minimized dot indicator */}
                    {(isActive || isMin) && (
                      <div
                        className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                        style={{
                          background: isMin ? app.color + '80' : app.color,
                          boxShadow: isActive ? `0 0 4px ${app.color}` : 'none',
                        }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Center: XP Bar */}
          <div className="hidden md:flex flex-col items-center gap-0.5 min-w-32">
            <div className="flex items-center gap-2 text-xs" style={{ color: '#64748b' }}>
              <span style={{ color: '#00d4ff' }}>Lv.{level}</span>
              <span>{levelName}</span>
              <span>{xp} XP</span>
            </div>
            <div className="w-28 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: 'linear-gradient(90deg, #00d4ff, #a855f7)',
                  boxShadow: '0 0 6px rgba(0,212,255,0.5)',
                }}
                animate={{ width: `${xpProgress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Right: Clock */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5">
              <div className="status-dot w-2 h-2" />
              <span className="text-xs" style={{ color: '#64748b' }}>Online</span>
            </div>
            <Clock />
          </div>
        </div>
      </motion.div>
    </>
  );
}
