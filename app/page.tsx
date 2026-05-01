'use client';

import dynamic from 'next/dynamic';
import { useState, useMemo } from 'react';
import { WindowProvider } from '@/context/WindowContext';
import { GameProvider } from '@/context/GameContext';
import WindowContainer from '@/components/window/WindowContainer';
import AchievementToast from '@/components/gamification/AchievementToast';

// Lazy load heavy components
const ParticleBackground = dynamic(() => import('@/components/desktop/ParticleBackground'), { ssr: false });
const BootAnimation = dynamic(() => import('@/components/desktop/BootAnimation'), { ssr: false });
const Taskbar = dynamic(() => import('@/components/desktop/Taskbar'), { ssr: false });
const DesktopIcon = dynamic(() => import('@/components/desktop/DesktopIcon'), { ssr: false });

// 🔧 Base config (no change in names)
const BASE_APPS = [
  { id: 'about' as const, icon: '👤', label: 'About Me', color: '#00d4ff' },
  { id: 'blog' as const, icon: '📝', label: 'Notes', color: '#a855f7' },
  { id: 'dsa' as const, icon: '📊', label: 'DSA Calc', color: '#10b981' },
  { id: 'crypto' as const, icon: '₿', label: 'Crypto', color: '#f59e0b' },
  { id: 'editor' as const, icon: '💻', label: 'Code Editor', color: '#6366f1' },
  { id: 'terminal' as const, icon: '⌨️', label: 'Terminal', color: '#ec4899' },
  { id: 'video' as const, icon: '🎬', label: 'Portfolio Video', color: '#f43f5e' },
];

function DesktopContent() {
  const [booted, setBooted] = useState(false);

  // ✅ Generate perfectly aligned positions
  const DESKTOP_APPS = useMemo(() => {
    const START_Y = 20;
    const GAP = 110; // consistent spacing

    return BASE_APPS.map((app, index) => ({
      ...app,
      pos: {
        x: 24,
        y: START_Y + index * GAP,
      },
    }));
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Background */}
      <ParticleBackground />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0,212,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.025) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          zIndex: 1,
        }}
      />

      {/* Scanline */}
      <div className="scanline" />

      {/* Boot */}
      {!booted && <BootAnimation onComplete={() => setBooted(true)} />}

      {/* Desktop */}
      {booted && (
        <>
          {/* Icons */}
          <div className="absolute inset-0" style={{ zIndex: 5 }}>
            {DESKTOP_APPS.map(app => (
              <DesktopIcon
                key={app.id}
                id={app.id}
                icon={app.icon}
                label={app.label}
                color={app.color}
                initialPos={app.pos}
              />
            ))}
          </div>

          {/* Center text */}
          <div
            className="absolute"
            style={{
              top: '40%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              zIndex: 2,
              pointerEvents: 'none',
            }}
          >
            <h1
              className="text-5xl font-bold tracking-[0.15em] mb-3"
              style={{
                background:
                  'linear-gradient(135deg, rgba(0,212,255,0.15), rgba(168,85,247,0.15))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                opacity: 0.25,
              }}
            >
              DEV OS
            </h1>
            <p className="text-sm" style={{ color: 'rgba(148,163,184,0.1)' }}>
              Double-click app icons to launch
            </p>
          </div>

          {/* Windows */}
          <div
            className="absolute inset-0"
            style={{ zIndex: 100, pointerEvents: 'none' }}
          >
            <WindowContainer />
          </div>

          {/* Taskbar */}
          <div style={{ zIndex: 200 }}>
            <Taskbar />
          </div>

          {/* Toast */}
          <div style={{ zIndex: 9995 }}>
            <AchievementToast />
          </div>
        </>
      )}
    </div>
  );
}

export default function HomePage() {
  return (
    <WindowProvider>
      <GameProvider>
        <DesktopContent />
      </GameProvider>
    </WindowProvider>
  );
}