'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import { useGame } from '@/context/GameContext';

export default function AchievementToast() {
    const { recentAchievement, clearRecentAchievement } = useGame();

    useEffect(() => {
        if (recentAchievement) {
            const timer = setTimeout(clearRecentAchievement, 4000);
            return () => clearTimeout(timer);
        }
    }, [recentAchievement, clearRecentAchievement]);

    return (
        <div className="fixed top-4 right-4" style={{ zIndex: 9995 }}>
            <AnimatePresence>
                {recentAchievement && (
                    <motion.div
                        key={recentAchievement.id}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer"
                        style={{
                            background: 'rgba(5, 8, 22, 0.95)',
                            border: '1px solid rgba(168,85,247,0.4)',
                            boxShadow: '0 0 20px rgba(168,85,247,0.2), 0 8px 32px rgba(0,0,0,0.4)',
                            backdropFilter: 'blur(20px)',
                            minWidth: 280,
                        }}
                        initial={{ opacity: 0, x: 60, y: -10 }}
                        animate={{ opacity: 1, x: 0, y: 0 }}
                        exit={{ opacity: 0, x: 60 }}
                        transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
                        onClick={clearRecentAchievement}
                    >
                        <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
                            style={{
                                background: 'linear-gradient(135deg, rgba(168,85,247,0.2), rgba(0,212,255,0.2))',
                                border: '1px solid rgba(168,85,247,0.3)',
                            }}
                        >
                            {recentAchievement.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-xs font-semibold" style={{ color: '#a855f7' }}>
                                    🏆 ACHIEVEMENT UNLOCKED
                                </span>
                            </div>
                            <div className="text-sm font-medium truncate" style={{ color: '#e2e8f0' }}>
                                {recentAchievement.title}
                            </div>
                            <div className="text-xs" style={{ color: '#64748b' }}>
                                {recentAchievement.description} · +{recentAchievement.xpReward} XP
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
