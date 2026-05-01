'use client';

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

export type AppId = 'about' | 'blog' | 'dsa' | 'crypto' | 'video' | 'editor' | 'terminal';

export interface WindowState {
  id: AppId;
  title: string;
  icon: string;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  position: { x: number; y: number };
  size: { width: number; height: number };
}

interface WindowContextType {
  windows: Record<AppId, WindowState>;
  openWindow: (id: AppId) => void;
  closeWindow: (id: AppId) => void;
  minimizeWindow: (id: AppId) => void;
  maximizeWindow: (id: AppId) => void;
  restoreWindow: (id: AppId) => void;
  bringToFront: (id: AppId) => void;
  updatePosition: (id: AppId, pos: { x: number; y: number }) => void;
  updateSize: (id: AppId, size: { width: number; height: number }) => void;
  getTopZIndex: () => number;
}

const defaultWindows: Record<AppId, WindowState> = {
  about: {
    id: 'about',
    title: 'About Me',
    icon: '👤',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 10,
    position: { x: 80, y: 60 },
    size: { width: 700, height: 520 },
  },
  blog: {
    id: 'blog',
    title: 'Notes',
    icon: '📝',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 10,
    position: { x: 130, y: 80 },
    size: { width: 750, height: 550 },
  },
  dsa: {
    id: 'dsa',
    title: 'DSA Complexity',
    icon: '📊',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 10,
    position: { x: 160, y: 90 },
    size: { width: 680, height: 520 },
  },
  crypto: {
    id: 'crypto',
    title: 'Crypto Tracker',
    icon: '₿',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 10,
    position: { x: 200, y: 100 },
    size: { width: 640, height: 500 },
  },
  video: {
    id: 'video',
    title: 'Portfolio Video',
    icon: '🎬',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 10,
    position: { x: 220, y: 90 },
    size: { width: 860, height: 560 },
  },
  editor: {
    id: 'editor',
    title: 'Code Editor',
    icon: '💻',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 10,
    position: { x: 120, y: 70 },
    size: { width: 800, height: 560 },
  },
  terminal: {
    id: 'terminal',
    title: 'AI Terminal',
    icon: '⌨️',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 10,
    position: { x: 180, y: 110 },
    size: { width: 680, height: 480 },
  },
};

const WindowContext = createContext<WindowContextType | null>(null);

export function WindowProvider({ children }: { children: React.ReactNode }) {
  const [windows, setWindows] = useState<Record<AppId, WindowState>>(defaultWindows);
  const zCounter = useRef(20);

  const getTopZIndex = useCallback(() => {
    zCounter.current += 1;
    return zCounter.current;
  }, []);

  const openWindow = useCallback((id: AppId) => {
    setWindows(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        isOpen: true,
        isMinimized: false,
        zIndex: zCounter.current + 1,
      },
    }));
    zCounter.current += 1;
  }, []);

  const closeWindow = useCallback((id: AppId) => {
    setWindows(prev => ({
      ...prev,
      [id]: { ...prev[id], isOpen: false, isMinimized: false, isMaximized: false },
    }));
  }, []);

  const minimizeWindow = useCallback((id: AppId) => {
    setWindows(prev => ({
      ...prev,
      [id]: { ...prev[id], isMinimized: true },
    }));
  }, []);

  const maximizeWindow = useCallback((id: AppId) => {
    setWindows(prev => ({
      ...prev,
      [id]: { ...prev[id], isMaximized: !prev[id].isMaximized },
    }));
  }, []);

  const restoreWindow = useCallback((id: AppId) => {
    setWindows(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        isMinimized: false,
        zIndex: zCounter.current + 1,
      },
    }));
    zCounter.current += 1;
  }, []);

  const bringToFront = useCallback((id: AppId) => {
    zCounter.current += 1;
    setWindows(prev => ({
      ...prev,
      [id]: { ...prev[id], zIndex: zCounter.current },
    }));
  }, []);

  const updatePosition = useCallback((id: AppId, pos: { x: number; y: number }) => {
    setWindows(prev => ({
      ...prev,
      [id]: { ...prev[id], position: pos },
    }));
  }, []);

  const updateSize = useCallback((id: AppId, size: { width: number; height: number }) => {
    setWindows(prev => ({
      ...prev,
      [id]: { ...prev[id], size },
    }));
  }, []);

  return (
    <WindowContext.Provider
      value={{
        windows,
        openWindow,
        closeWindow,
        minimizeWindow,
        maximizeWindow,
        restoreWindow,
        bringToFront,
        updatePosition,
        updateSize,
        getTopZIndex,
      }}
    >
      {children}
    </WindowContext.Provider>
  );
}

export function useWindows() {
  const ctx = useContext(WindowContext);
  if (!ctx) throw new Error('useWindows must be used within WindowProvider');
  return ctx;
}
