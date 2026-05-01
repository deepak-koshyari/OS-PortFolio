'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

interface BootAnimationProps {
  onComplete: () => void;
}

const bootLines = [
  'Initializing kernel modules...',
  'Loading user environment...',
  'Mounting file systems...',
  'Starting network services...',
  'Launching GUI subsystem...',
  'Applying cyberpunk theme...',
  'System ready.',
];

export default function BootAnimation({ onComplete }: BootAnimationProps) {
  const [lines, setLines] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<'loading' | 'logo' | 'done'>('logo');

  useEffect(() => {
    // Phase 1: show logo for 1.2s
    const timer1 = setTimeout(() => setPhase('loading'), 1200);
    return () => clearTimeout(timer1);
  }, []);

  useEffect(() => {
    if (phase !== 'loading') return;

    let lineIndex = 0;
    const interval = setInterval(() => {
      if (lineIndex < bootLines.length) {
        setLines(prev => [...prev, bootLines[lineIndex]]);
        setProgress(Math.round(((lineIndex + 1) / bootLines.length) * 100));
        lineIndex++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setPhase('done');
          setTimeout(onComplete, 600);
        }, 400);
      }
    }, 280);

    return () => clearInterval(interval);
  }, [phase, onComplete]);

  return (
    <AnimatePresence>
      {phase !== 'done' && (
        <motion.div
          className="fixed inset-0 flex flex-col items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #050816 0%, #0a0f2e 50%, #050816 100%)',
            zIndex: 9999,
          }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        >
          {/* Grid bg */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: 'linear-gradient(rgba(0,212,255,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.07) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />

          {/* Logo Phase */}
          <AnimatePresence>
            {phase === 'logo' && (
              <motion.div
                className="flex flex-col items-center gap-6"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="relative">
                  <div
                    className="w-24 h-24 rounded-2xl flex items-center justify-center text-5xl"
                    style={{
                      background: 'linear-gradient(135deg, rgba(0,212,255,0.15), rgba(168,85,247,0.15))',
                      border: '2px solid rgba(0,212,255,0.4)',
                      boxShadow: '0 0 40px rgba(0,212,255,0.3), 0 0 80px rgba(168,85,247,0.15)',
                    }}
                  >
                    🖥️
                  </div>
                  <motion.div
                    className="absolute -inset-2 rounded-2xl"
                    style={{ border: '1px solid rgba(0,212,255,0.2)' }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                  />
                </div>
                <div className="text-center">
                  <h1
                    className="text-4xl font-bold tracking-wider"
                    style={{
                      background: 'linear-gradient(90deg, #00d4ff, #a855f7)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    DEV OS
                  </h1>
                  <p className="text-sm mt-1" style={{ color: 'rgba(148,163,184,0.7)' }}>
                    Portfolio Edition v2.0 · Vibe Coded
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loading Phase */}
          <AnimatePresence>
            {phase === 'loading' && (
              <motion.div
                className="w-full max-w-md px-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                {/* Logo small */}
                <div className="flex items-center gap-3 mb-8">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-2xl"
                    style={{
                      background: 'linear-gradient(135deg, rgba(0,212,255,0.15), rgba(168,85,247,0.15))',
                      border: '1px solid rgba(0,212,255,0.4)',
                    }}
                  >
                    🖥️
                  </div>
                  <span
                    className="text-xl font-bold tracking-wider"
                    style={{
                      background: 'linear-gradient(90deg, #00d4ff, #a855f7)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    DEV OS
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.2em]" style={{ color: 'rgba(0,212,255,0.75)' }}>
                    Vibe Coded
                  </span>
                </div>

                {/* Boot log */}
                <div
                  className="rounded-lg p-4 mb-6 font-mono text-xs"
                  style={{
                    background: 'rgba(0,0,0,0.4)',
                    border: '1px solid rgba(0,212,255,0.15)',
                    minHeight: '140px',
                  }}
                >
                  {lines.map((line, i) => (
                    <motion.div
                      key={i}
                      className="flex items-center gap-2 mb-1"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <span style={{ color: '#00d4ff' }}>{'>'}</span>
                      <span style={{ color: i === lines.length - 1 ? '#e2e8f0' : '#64748b' }}>{line}</span>
                      {i === lines.length - 1 && (
                        <span className="cursor-blink" style={{ color: '#00d4ff' }}>▌</span>
                      )}
                    </motion.div>
                  ))}
                </div>

                {/* Progress bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs" style={{ color: '#64748b' }}>
                    <span>Loading system...</span>
                    <span style={{ color: '#00d4ff' }}>{progress}%</span>
                  </div>
                  <div
                    className="w-full h-1.5 rounded-full overflow-hidden"
                    style={{ background: 'rgba(255,255,255,0.05)' }}
                  >
                    <motion.div
                      className="h-full rounded-full"
                      style={{
                        background: 'linear-gradient(90deg, #00d4ff, #a855f7)',
                        boxShadow: '0 0 8px rgba(0,212,255,0.6)',
                      }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.2 }}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
