'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

const skills = [
  { name: 'React / Next.js', level: 92, color: '#00d4ff' },
  { name: 'TypeScript', level: 88, color: '#3b82f6' },
  { name: 'Node.js', level: 85, color: '#10b981' },
  { name: 'C++ / DSA', level: 90, color: '#a855f7' },
  { name: 'Python', level: 82, color: '#f59e0b' },
  { name: 'System Design', level: 78, color: '#ec4899' },
  { name: 'MongoDB', level: 80, color: '#6366f1' },
  { name: 'Docker / CI/CD', level: 72, color: '#00d4ff' },
];

const timeline = [
  {
    year: '2026',
    title: 'B.Tech CSE — Ongoing',
    company: 'Graphic era hill university',
    description: 'CGPA: 7.80/10 — Specialized in AI and ML.',
    color: '#ec4899',
  }
];

const stats = [
  { label: 'Projects', value: '50+', icon: '🚀' },
  { label: 'Years Exp.', value: '4+', icon: '⚡' },
  { label: 'Tech Stack', value: '20+', icon: '🛠️' },
  { label: 'Coffee/day', value: '∞', icon: '☕' },
];

export default function AboutMeApp() {
  const [activeTab, setActiveTab] = useState<'profile' | 'skills' | 'timeline'>('profile');

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ background: 'transparent' }}>
      {/* Tab Bar */}
      <div
        className="flex gap-1 px-4 pt-3 pb-0"
        style={{ borderBottom: '1px solid rgba(99,179,237,0.1)' }}
      >
        {(['profile', 'skills', 'timeline'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="relative px-4 py-2 text-sm font-medium capitalize rounded-t-lg transition-colors"
            style={{
              color: activeTab === tab ? '#00d4ff' : '#64748b',
              background: activeTab === tab ? 'rgba(0,212,255,0.06)' : 'transparent',
            }}
          >
            {tab}
            {activeTab === tab && (
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t"
                style={{ background: 'linear-gradient(90deg, #00d4ff, #a855f7)' }}
                layoutId="about-tab-line"
              />
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4">

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Profile Card */}
            <div
              className="rounded-xl p-5 flex items-center gap-5"
              style={{
                background: 'linear-gradient(135deg, rgba(0,212,255,0.06), rgba(168,85,247,0.06))',
                border: '1px solid rgba(99,179,237,0.15)',
              }}
            >
              <div className="relative flex-shrink-0">
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center text-5xl"
                  style={{
                    background: 'linear-gradient(135deg, rgba(0,212,255,0.15), rgba(168,85,247,0.15))',
                    border: '2px solid rgba(0,212,255,0.3)',
                  }}
                >
                  👨‍💻
                </div>
                <div className="absolute -bottom-1 -right-1 status-dot" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold" style={{ color: '#e2e8f0' }}>Deepak Singh</h2>
                <p className="text-sm mt-0.5" style={{ color: '#00d4ff' }}>Software Engineer & DSA Enthusiast</p>
                <p className="text-xs mt-1" style={{ color: '#64748b' }}>📍 Dehradun, India</p>
                <div className="flex gap-2 mt-3">
                  <a
                    href="/project.pdf"
                    download
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:scale-105"
                    style={{
                      background: 'linear-gradient(90deg, #00d4ff, #a855f7)',
                      color: '#050816',
                    }}
                  >
                    📄 Resume
                  </a>
                  <a
                    href="https://github.com/deepak-koshyari"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:scale-105"
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(99,179,237,0.2)',
                      color: '#e2e8f0',
                    }}
                  >
                    GitHub →
                  </a>
                </div>
              </div>
            </div>

            {/* Bio */}
            <div
              className="rounded-xl p-4"
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(99,179,237,0.1)',
              }}
            >
              <h3 className="text-sm font-semibold mb-2" style={{ color: '#94a3b8' }}>ABOUT</h3>
              <p className="text-sm leading-relaxed" style={{ color: '#cbd5e1' }}>
                I&apos;I am a passionate full-stack developer who loves building beautiful, performant applications.
                I specialize in React/Next.js ecosystems, competitive programming, and system design.
                When not coding, I explore ML papers and contribute to open source.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-2">
              {stats.map(s => (
                <div
                  key={s.label}
                  className="rounded-xl p-3 text-center"
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(99,179,237,0.08)',
                  }}
                >
                  <div className="text-xl mb-1">{s.icon}</div>
                  <div className="text-lg font-bold" style={{ color: '#00d4ff' }}>{s.value}</div>
                  <div className="text-xs" style={{ color: '#64748b' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Skills Tab */}
        {activeTab === 'skills' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold" style={{ color: '#64748b' }}>SKILL PROFICIENCIES</h3>
              <span
                className="text-[10px] px-2 py-1 rounded-full font-semibold uppercase tracking-wider"
                style={{
                  color: '#00d4ff',
                  background: 'rgba(0,212,255,0.08)',
                  border: '1px solid rgba(0,212,255,0.25)',
                }}
              >
                Vibe Coded
              </span>
            </div>
            {skills.map((skill, i) => (
              <motion.div
                key={skill.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="space-y-1.5"
              >
                <div className="flex justify-between text-sm">
                  <span style={{ color: '#cbd5e1' }}>{skill.name}</span>
                  <span style={{ color: skill.color }}>{skill.level}%</span>
                </div>
                <div
                  className="h-1.5 rounded-full overflow-hidden"
                  style={{ background: 'rgba(255,255,255,0.05)' }}
                >
                  <motion.div
                    className="h-full rounded-full"
                    style={{
                      background: `linear-gradient(90deg, ${skill.color}90, ${skill.color})`,
                      boxShadow: `0 0 8px ${skill.color}60`,
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${skill.level}%` }}
                    transition={{ duration: 0.8, delay: i * 0.06, ease: 'easeOut' }}
                  />
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Timeline Tab */}
        {activeTab === 'timeline' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 relative"
          >
            {/* Vertical line */}
            <div
              className="absolute left-5 top-0 bottom-0 w-px"
              style={{ background: 'linear-gradient(to bottom, rgba(0,212,255,0.3), rgba(168,85,247,0.1))' }}
            />

            {timeline.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex gap-4 pl-2"
              >
                {/* Dot */}
                <div
                  className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center z-10 mt-1"
                  style={{
                    background: item.color + '20',
                    border: `2px solid ${item.color}`,
                    boxShadow: `0 0 8px ${item.color}40`,
                  }}
                >
                  <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                </div>

                {/* Content */}
                <div
                  className="flex-1 rounded-xl p-3 mb-1"
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(99,179,237,0.08)',
                  }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold" style={{ color: '#e2e8f0' }}>{item.title}</span>
                    <span className="text-xs font-mono" style={{ color: item.color }}>{item.year}</span>
                  </div>
                  <div className="text-xs mb-1" style={{ color: item.color }}>{item.company}</div>
                  <p className="text-xs leading-relaxed" style={{ color: '#64748b' }}>{item.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
