'use client';

import { AnimatePresence } from 'framer-motion';
import { lazy, Suspense } from 'react';
import { useWindows } from '@/context/WindowContext';
import Window from './Window';

// Lazy-load all apps for performance
const AboutMeApp = lazy(() => import('@/apps/AboutMe/AboutMeApp'));
const BlogApp = lazy(() => import('@/apps/Blog/BlogApp'));
const DSACalcApp = lazy(() => import('@/apps/DSACalc/DSACalcApp'));
const CryptoTrackerApp = lazy(() => import('@/apps/CryptoTracker/CryptoTrackerApp'));
const VideoPlayerApp = lazy(() => import('@/apps/VideoPlayer/VideoPlayerApp'));
const CodeEditorApp = lazy(() => import('@/apps/CodeEditor/CodeEditorApp'));
const TerminalApp = lazy(() => import('@/apps/Terminal/TerminalApp'));

const AppLoader = () => (
  <div className="flex items-center justify-center h-full">
    <div className="flex flex-col items-center gap-3">
      <div
        className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
        style={{ borderColor: 'rgba(0,212,255,0.6)', borderTopColor: 'transparent' }}
      />
      <span className="text-xs" style={{ color: '#64748b' }}>Loading app...</span>
    </div>
  </div>
);

const APP_COMPONENTS: Record<string, React.ComponentType> = {
  about: AboutMeApp,
  blog: BlogApp,
  dsa: DSACalcApp,
  crypto: CryptoTrackerApp,
  video: VideoPlayerApp,
  editor: CodeEditorApp,
  terminal: TerminalApp,
};

export default function WindowContainer() {
  const { windows } = useWindows();

  return (
    <AnimatePresence>
      {Object.values(windows)
        .filter(w => w.isOpen && !w.isMinimized)
        .map(windowState => {
          const AppComponent = APP_COMPONENTS[windowState.id];
          if (!AppComponent) return null;

          return (
            <Window key={windowState.id} windowState={windowState}>
              <Suspense fallback={<AppLoader />}>
                <AppComponent />
              </Suspense>
            </Window>
          );
        })}
    </AnimatePresence>
  );
}
