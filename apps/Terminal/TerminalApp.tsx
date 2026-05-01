'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useWindows } from '@/context/WindowContext';
import { useGame } from '@/context/GameContext';

interface TerminalLine {
  type: 'input' | 'output' | 'error' | 'success' | 'system';
  content: string;
}

const SKILLS = ['React', 'Next.js', 'TypeScript', 'C++/DSA', 'Python', 'Node.js', 'System Design', 'MongoDB'];

const PROJECTS = [
  { name: 'DevOS Portfolio', tech: 'Next.js + Framer Motion', desc: 'This very site!' },
  { name: 'ChatScale', tech: 'Node.js + WebSockets + Redis', desc: 'Real-time chat for 100k users' },
  { name: 'AlgoVisualizer', tech: 'React + D3.js', desc: 'DSA algorithm visualizer' },
  { name: 'CryptoSensor', tech: 'Python + FastAPI', desc: 'Real-time crypto signal detector' },
];

type CommandHandler = (args: string[]) => string[];

const COMMANDS: Record<string, CommandHandler> = {
  help: () => [
    '  Available commands:',
    '  help            → Show this help menu',
    '  whoami          → About the developer',
    '  ls apps         → List all portfolio apps',
    '  open <app>      → Open an app window',
    '  show skills     → Display tech stack',
    '  show projects   → List projects',
    '  run btc         → BTC price analysis',
    '  matrix          → 🐇 Follow the white rabbit',
    '  clear           → Clear terminal',
    '  sudo rm -rf /   → Try it (if you dare)',
    '',
    '  Tip: Try typing "neo" for a surprise...',
  ],

  whoami: () => [
    '  ┌─────────────────────────────────┐',
    '  │   👨‍💻  Deepak Singh                  │',
    '  │   Software Engineer            │',
    '  │   Location: Dehradun, India     │',
    '  │   Status: Available for hire ✅  │',
    '  │   Coffee level: CRITICAL ☕      │',
    '  └─────────────────────────────────┘',
  ],

  clear: () => ['__CLEAR__'],

  'ls apps': () => [
    '  drwxr-x  about/      → About Me profile',
    '  drwxr-x  blog/       → Notes & Blog posts',
    '  drwxr-x  dsa/        → DSA Complexity Calculator',
    '  drwxr-x  crypto/     → Live Crypto Tracker',
    '  drwxr-x  video/      → Portfolio video player',
    '  drwxr-x  editor/     → Code Editor (Monaco)',
    '  drwxr-x  terminal/   → You are here 📍',
  ],

  'show skills': () => [
    '  Scanning skill matrix...',
    '  Build mode: Vibe Coded',
    '',
    ...SKILLS.map((s, i) => `  [${(i + 1).toString().padStart(2, ' ')}] ${s} ${'█'.repeat(Math.floor(Math.random() * 5) + 6)}░░ ${70 + Math.floor(Math.random() * 25)}%`),
    '',
    '  Skill scan complete. 💪',
  ],

  'show projects': () => [
    '  Fetching project database...',
    '',
    ...PROJECTS.flatMap((p, i) => [
      `  [${i + 1}] ${p.name}`,
      `      Tech: ${p.tech}`,
      `      Desc: ${p.desc}`,
      '',
    ]),
  ],

  'run btc': () => [
    '  Connecting to Binance API...',
    '  Fetching BTC/USDT data...',
    '  Running momentum analysis...',
    '',
    '  📈 BTC/USDT Analysis Report',
    '  ───────────────────────────',
    '  Trend:     BULLISH ▲▲▲',
    '  RSI(14):   62.4 (Neutral-Bullish)',
    '  MACD:      Positive divergence',
    '  Support:   $65,200',
    '  Resistance: $69,000',
    '  Signal:    ⚡ HOLD / BUY DIP',
    '',
    '  ⚠️  Not financial advice.',
  ],

  'sudo rm -rf /': () => [
    '  Executing sudo rm -rf /...',
    '  Deleting /usr...',
    '  Deleting /bin...',
    '  Deleting /home...',
    '  ...',
    '  ...',
    '  Just kidding 😂 — nice try.',
    '  This is a portfolio, not your prod server.',
  ],

  neo: () => [
    '  "You take the blue pill - the story ends..."',
    '  "You take the red pill - you stay in Wonderland..."',
    '',
    '  🐇 You chose the red pill.',
    '  Easter egg unlocked: 🥚 The Matrix',
    '  +200 XP',
  ],

  matrix: () => [
    '  Wake up, Neo...',
    '  The Matrix has you...',
    '  Follow the white rabbit. 🐇',
    '',
    '  01001000 01100101 01101100 01101100 01101111',
    '  01010111 01101111 01110010 01101100 01100100',
    '',
    '  Translation: "Hello World" 😏',
  ],
};

function typeOut(lines: string[], callback: (lines: TerminalLine[]) => void, baseDelay = 30) {
  const result: TerminalLine[] = [];
  lines.forEach((line, i) => {
    setTimeout(() => {
      result.push({
        type: line.startsWith('  ⚠') ? 'error' : line.startsWith('  ✅') || line.startsWith('  📈') ? 'success' : 'output',
        content: line,
      });
      callback([...result]);
    }, i * baseDelay);
  });
}

export default function TerminalApp() {
  const [lines, setLines] = useState<TerminalLine[]>([
    { type: 'system', content: 'DevOS Terminal v2.0 — AI-powered CLI' },
    { type: 'system', content: 'Type "help" for available commands.' },
    { type: 'system', content: '' },
  ]);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState(-1);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { openWindow } = useWindows();
  const { unlockAchievement } = useGame();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  const handleCommand = useCallback((raw: string) => {
    const cmd = raw.trim().toLowerCase();
    if (!cmd) return;

    setHistory(prev => [raw, ...prev]);
    setHistIdx(-1);
    setLines(prev => [...prev, { type: 'input', content: `$ ${raw}` }]);

    // Handle clear
    if (cmd === 'clear') {
      setLines([{ type: 'system', content: 'Terminal cleared.' }]);
      return;
    }

    // Handle open command
    if (cmd.startsWith('open ')) {
      const appName = cmd.slice(5).trim();
      const appMap: Record<string, string> = {
        about: 'about', me: 'about', blog: 'blog', notes: 'blog',
        dsa: 'dsa', crypto: 'crypto', btc: 'crypto', video: 'video',
        player: 'video', portfolio: 'video', editor: 'editor',
        code: 'editor', terminal: 'terminal',
      };
      const appId = appMap[appName];
      if (appId) {
        openWindow(appId as any);
        setLines(prev => [...prev, { type: 'success', content: `  ✅ Opening ${appName} app...` }]);
      } else {
        setLines(prev => [...prev, { type: 'error', content: `  ❌ App "${appName}" not found. Try: open about, open crypto, open dsa` }]);
      }
      return;
    }

    // Easter egg: neo
    if (cmd === 'neo') {
      unlockAchievement('easter_egg');
    }

    // Find command handler
    const handler = COMMANDS[cmd];
    if (handler) {
      const output = handler([]);
      const resultLines = output.map(line => ({
        type: 'output' as const,
        content: line,
      }));
      setLines(prev => [...prev, ...resultLines, { type: 'output', content: '' }]);
    } else {
      setLines(prev => [
        ...prev,
        { type: 'error', content: `  command not found: ${cmd}. Type "help" for commands.` },
        { type: 'output', content: '' },
      ]);
    }
  }, [openWindow, unlockAchievement]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCommand(input);
      setInput('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const newIdx = Math.min(histIdx + 1, history.length - 1);
      setHistIdx(newIdx);
      setInput(history[newIdx] || '');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const newIdx = Math.max(histIdx - 1, -1);
      setHistIdx(newIdx);
      setInput(newIdx === -1 ? '' : history[newIdx] || '');
    }
  };

  const lineColor = (type: TerminalLine['type']) => {
    switch (type) {
      case 'input': return '#00d4ff';
      case 'error': return '#ef4444';
      case 'success': return '#10b981';
      case 'system': return '#a855f7';
      default: return '#94a3b8';
    }
  };

  return (
    <div
      className="h-full flex flex-col overflow-hidden"
      style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13 }}
      onClick={() => inputRef.current?.focus()}
    >
      {/* Output */}
      <div className="flex-1 overflow-y-auto p-4 space-y-0.5">
        {lines.map((line, i) => (
          <div key={i} style={{ color: lineColor(line.type), lineHeight: '1.6' }}>
            {line.content || '\u00A0'}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div
        className="flex items-center px-4 py-3 flex-shrink-0"
        style={{ borderTop: '1px solid rgba(99,179,237,0.12)' }}
      >
        <span style={{ color: '#00d4ff' }}>devos</span>
        <span style={{ color: '#a855f7' }}>@portfolio</span>
        <span style={{ color: '#64748b' }}>:~$</span>
        <input
          ref={inputRef}
          autoFocus
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 ml-2 bg-transparent outline-none"
          style={{ color: '#e2e8f0', caretColor: '#00d4ff' }}
          placeholder="type a command..."
          spellCheck={false}
        />
        <span className="cursor-blink" style={{ color: '#00d4ff' }}>▌</span>
      </div>
    </div>
  );
}
