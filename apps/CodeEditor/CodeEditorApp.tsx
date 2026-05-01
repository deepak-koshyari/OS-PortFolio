'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';

// Dynamically import Monaco to avoid SSR issues
const Editor = dynamic(() => import('@monaco-editor/react'), {
    ssr: false,
    loading: () => (
        <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-2">
                <div
                    className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
                    style={{ borderColor: 'rgba(0,212,255,0.6)', borderTopColor: 'transparent' }}
                />
                <div className="text-xs" style={{ color: '#64748b' }}>Loading editor...</div>
            </div>
        </div>
    ),
});

/* ─────────────── Daily Request Counter (localStorage) ─────────────── */
const STORAGE_KEY = 'devos_compiler_usage';
const DAILY_LIMIT = 20;

function getTodayKey() {
    return new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
}

function loadUsage(): number {
    if (typeof window === 'undefined') return 0;
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return 0;
        const { date, count } = JSON.parse(raw);
        return date === getTodayKey() ? (count as number) : 0;
    } catch { return 0; }
}

function saveUsage(count: number) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: getTodayKey(), count }));
}

/* ─────────────── Language Templates ─────────────── */
const TEMPLATES: Record<string, string> = {
    cpp: `#include <bits/stdc++.h>
using namespace std;



int main() {
    cout << "Hello World" << endl;
    return 0;
}`,
    python: `print("Hello World")`,
    javascript: `console.log("Hello World");`,
    typescript: `const greet = (name: string): string => {
    return \`Hello, \${name}!\`;
};

console.log(greet("World"));`,
    java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello World");
    }
}`,
};

const DSA_DEFAULT = `#include <bits/stdc++.h>
using namespace std;

// Merge Sort Implementation
void merge(vector<int>& arr, int l, int m, int r) {
    int n1 = m - l + 1;
    int n2 = r - m;
    vector<int> L(n1), R(n2);
    for (int i = 0; i < n1; i++) L[i] = arr[l + i];
    for (int j = 0; j < n2; j++) R[j] = arr[m + 1 + j];
    int i = 0, j = 0, k = l;
    while (i < n1 && j < n2) {
        if (L[i] <= R[j]) arr[k++] = L[i++];
        else arr[k++] = R[j++];
    }
    while (i < n1) arr[k++] = L[i++];
    while (j < n2) arr[k++] = R[j++];
}

void mergeSort(vector<int>& arr, int l, int r) {
    if (l >= r) return;
    int m = l + (r - l) / 2;
    mergeSort(arr, l, m);
    mergeSort(arr, m + 1, r);
    merge(arr, l, m, r);
}

int main() {
    vector<int> arr = {64, 34, 25, 12, 22, 11, 90};
    mergeSort(arr, 0, arr.size() - 1);
    for (int x : arr) cout << x << " ";
    return 0;
}`;

/* ─────────────── Explanation Data ─────────────── */
interface ExplanationStep {
    icon: string;
    title: string;
    detail: string;
    color: string;
}

const MERGE_SORT_EXPLANATION: ExplanationStep[] = [
    { icon: '🔍', title: 'Algorithm Detected', detail: 'Merge Sort — a divide-and-conquer sorting algorithm', color: '#00d4ff' },
    { icon: '📐', title: 'Time Complexity',    detail: 'O(n log n) in all cases (best, average, worst)',      color: '#a855f7' },
    { icon: '💾', title: 'Space Complexity',   detail: 'O(n) — auxiliary space for temporary arrays',         color: '#10b981' },
    { icon: '✂️', title: 'Step 1: Divide',     detail: 'Recursively split the array in half until single elements remain', color: '#f59e0b' },
    { icon: '🔀', title: 'Step 2: Conquer',    detail: 'Sort each half recursively via the same merge sort',  color: '#6366f1' },
    { icon: '🔗', title: 'Step 3: Merge',      detail: 'Compare elements from left/right halves and build sorted merged array', color: '#ec4899' },
    { icon: '📊', title: 'Stability',          detail: 'Stable sort — equal elements maintain original relative order', color: '#38bdf8' },
    { icon: '🎯', title: 'Best Use Case',      detail: 'Sorting linked lists, external sorting, large datasets needing stable sort', color: '#34d399' },
];

const GENERIC_EXPLANATION: ExplanationStep[] = [
    { icon: '📋', title: 'Code Analysis',     detail: 'Analyzing code structure and patterns...',         color: '#00d4ff' },
    { icon: '📦', title: 'Imports Detected',  detail: 'Standard library imports detected',                color: '#a855f7' },
    { icon: '🔧', title: 'Functions Found',   detail: 'Multiple function definitions with parameters',    color: '#10b981' },
    { icon: '🔄', title: 'Control Flow',      detail: 'Recursive calls detected — stack-based execution', color: '#f59e0b' },
    { icon: '📈', title: 'Complexity Hint',   detail: 'Analyze loop nesting to determine time complexity', color: '#6366f1' },
    { icon: '💡', title: 'Optimization Tips', detail: 'Consider iterative approach to reduce stack overhead', color: '#ec4899' },
];

/* ─────────────── Usage Badge ─────────────── */
function UsageBadge({ used, total }: { used: number; total: number }) {
    const remaining = total - used;
    const pct = (used / total) * 100;
    const color = remaining === 0 ? '#f87171' : remaining <= 5 ? '#f59e0b' : '#10b981';

    return (
        <div
            className="flex items-center gap-1.5 px-2 py-1 rounded-lg"
            style={{
                background: `${color}10`,
                border: `1px solid ${color}30`,
            }}
            title={`${remaining} runs remaining today (resets at midnight)`}
        >
            {/* Mini progress bar */}
            <div
                className="w-12 h-1 rounded-full overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.08)' }}
            >
                <motion.div
                    className="h-full rounded-full"
                    style={{ background: color }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.4 }}
                />
            </div>
            <span className="text-xs font-mono font-semibold" style={{ color }}>
                {used}/{total}
            </span>
            <span className="text-xs" style={{ color: '#64748b' }}>today</span>
        </div>
    );
}

/* ─────────────── Output Panel ─────────────── */
function OutputPanel({
    output,
    isError,
    meta,
    onClose,
}: {
    output: string;
    isError: boolean;
    meta?: { cpuTime?: string; memory?: string };
    onClose: () => void;
}) {
    return (
        <motion.div
            className="flex-shrink-0 flex flex-col"
            style={{
                borderTop: '1px solid rgba(99,179,237,0.12)',
                background: 'rgba(0,0,0,0.45)',
                height: 190,
            }}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 190, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
        >
            {/* Header */}
            <div
                className="flex items-center justify-between px-3 py-1.5 flex-shrink-0"
                style={{ borderBottom: '1px solid rgba(99,179,237,0.08)' }}
            >
                <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold" style={{ color: isError ? '#f87171' : '#10b981' }}>
                        {isError ? '✗ Error' : '✓ Output'}
                    </span>
                    {!isError && meta && (
                        <span className="text-xs" style={{ color: '#475569' }}>
                            {meta.cpuTime ? `⏱ ${meta.cpuTime}s` : ''} {meta.memory ? `· 💾 ${meta.memory}KB` : ''}
                        </span>
                    )}
                </div>
                <button
                    onClick={onClose}
                    className="text-xs px-2 py-0.5 rounded transition-all hover:opacity-80"
                    style={{ color: '#64748b', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                    ✕ Close
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-3">
                <pre
                    className="text-xs leading-relaxed whitespace-pre-wrap break-words font-mono"
                    style={{ color: isError ? '#f87171' : '#e2e8f0' }}
                >
                    {output || '(no output)'}
                </pre>
            </div>
        </motion.div>
    );
}

/* ─────────────── Main Component ─────────────── */
export default function CodeEditorApp() {
    const [code, setCode]         = useState(DSA_DEFAULT);
    const [language, setLanguage] = useState('cpp');

    // Explanation state
    const [showExplanation, setShowExplanation] = useState(false);
    const [explanationSteps, setExplanationSteps] = useState<ExplanationStep[]>([]);
    const [isAnalyzing, setIsAnalyzing]           = useState(false);
    const [visibleCount, setVisibleCount]         = useState(0);

    // Compile state
    const [output, setOutput]       = useState('');
    const [isError, setIsError]     = useState(false);
    const [showOutput, setShowOutput] = useState(false);
    const [isRunning, setIsRunning] = useState(false);
    const [outputMeta, setOutputMeta] = useState<{ cpuTime?: string; memory?: string }>();

    // Daily usage counter (localStorage)
    const [runsUsed, setRunsUsed] = useState(0);
    useEffect(() => { setRunsUsed(loadUsage()); }, []);

    const limitReached = runsUsed >= DAILY_LIMIT;

    // Update template when language changes
    useEffect(() => {
        setCode(TEMPLATES[language] ?? TEMPLATES['cpp']);
        setShowOutput(false);
        setOutput('');
    }, [language]);

    const handleExplain = useCallback(() => {
        setIsAnalyzing(true);
        setShowExplanation(false);
        setVisibleCount(0);

        setTimeout(() => {
            const steps =
                code.toLowerCase().includes('mergesort') || code.toLowerCase().includes('merge(')
                    ? MERGE_SORT_EXPLANATION
                    : GENERIC_EXPLANATION;
            setExplanationSteps(steps);
            setIsAnalyzing(false);
            setShowExplanation(true);
            steps.forEach((_, i) => {
                setTimeout(() => setVisibleCount(i + 1), i * 150);
            });
        }, 1200);
    }, [code]);

    const handleRunCode = useCallback(async () => {
        if (isRunning || limitReached) return;

        setIsRunning(true);
        setShowOutput(true);
        setOutput('Compiling & running...');
        setIsError(false);
        setOutputMeta(undefined);

        try {
            const res = await fetch('/api/compile', {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ language, code }),
            });
            const data = await res.json();

            if (!res.ok || !data.success) {
                setIsError(true);
                setOutput(data.error || 'Compilation failed.');
            } else {
                setIsError(false);
                setOutput(data.output || '(no output)');
                setOutputMeta({ cpuTime: data.cpuTime, memory: data.memory });
            }

            // Increment daily counter whether pass or fail (API credit is consumed either way)
            const next = runsUsed + 1;
            setRunsUsed(next);
            saveUsage(next);

        } catch {
            setIsError(true);
            setOutput('Network error — could not reach compile server.');
        } finally {
            setIsRunning(false);
        }
    }, [language, code, isRunning, limitReached, runsUsed]);

    const remaining = DAILY_LIMIT - runsUsed;

    return (
        <div className="h-full flex flex-col overflow-hidden">
            {/* ── Toolbar ── */}
            <div
                className="flex items-center gap-2 px-3 py-2 flex-shrink-0 flex-wrap"
                style={{ borderBottom: '1px solid rgba(99,179,237,0.1)' }}
            >
                {/* Language selector */}
                <select
                    value={language}
                    onChange={e => setLanguage(e.target.value)}
                    className="px-2 py-1 rounded text-xs outline-none"
                    style={{
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(99,179,237,0.15)',
                        color: '#e2e8f0',
                    }}
                >
                    <option value="cpp">C++</option>
                    <option value="javascript">JavaScript</option>
                    <option value="typescript">TypeScript</option>
                    <option value="python">Python</option>
                    <option value="java">Java</option>
                </select>

                {/* Daily usage badge */}
                <UsageBadge used={runsUsed} total={DAILY_LIMIT} />

                <div className="flex items-center gap-1 ml-auto">
                    <button
                        onClick={() => { setShowExplanation(false); setShowOutput(false); }}
                        className="px-3 py-1 rounded text-xs transition-all hover:opacity-80"
                        style={{
                            background: 'rgba(255,255,255,0.06)',
                            border: '1px solid rgba(99,179,237,0.1)',
                            color: '#64748b',
                        }}
                    >
                        🔄 Reset View
                    </button>

                    {/* Run Code button */}
                    <button
                        onClick={handleRunCode}
                        disabled={isRunning || limitReached}
                        title={limitReached ? 'Daily run limit reached (20/day). Try again tomorrow.' : `${remaining} runs left today`}
                        className="px-3 py-1.5 rounded text-xs font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                        style={{
                            background: limitReached
                                ? 'rgba(248,113,113,0.08)'
                                : 'linear-gradient(90deg, #10b98120, #00d4ff20)',
                            border: `1px solid ${limitReached ? 'rgba(248,113,113,0.3)' : 'rgba(16,185,129,0.35)'}`,
                            color: limitReached ? '#f87171' : '#10b981',
                        }}
                    >
                        {isRunning ? (
                            <>
                                <span
                                    className="w-3 h-3 rounded-full border border-t-transparent animate-spin inline-block"
                                    style={{ borderColor: '#10b981', borderTopColor: 'transparent' }}
                                />
                                Running...
                            </>
                        ) : limitReached ? (
                            '⛔ Limit Reached'
                        ) : (
                            '▶ Run Code'
                        )}
                    </button>

                    {/* Explain button */}
                    <button
                        onClick={handleExplain}
                        disabled={isAnalyzing}
                        className="px-3 py-1.5 rounded text-xs font-semibold transition-all hover:scale-105 disabled:opacity-50"
                        style={{
                            background: 'linear-gradient(90deg, #00d4ff20, #a855f720)',
                            border: '1px solid rgba(0,212,255,0.3)',
                            color: '#00d4ff',
                        }}
                    >
                        {isAnalyzing ? '⚡ Analyzing...' : '🧠 Explain Logic'}
                    </button>
                </div>
            </div>

            {/* ── Editor Area ── */}
            <div className="flex-1 flex overflow-hidden">
                {/* Monaco + Output Panel */}
                <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
                    {/* Editor */}
                    <div className="flex-1 overflow-hidden">
                        <Editor
                            height="100%"
                            language={language}
                            value={code}
                            onChange={v => setCode(v || '')}
                            theme="vs-dark"
                            options={{
                                minimap:             { enabled: false },
                                fontSize:              14,
                                fontFamily:           'JetBrains Mono, Fira Code, monospace',
                                // Monaco expects lineHeight in pixels, not CSS unitless multipliers.
                                lineHeight:            30,
                                lineNumbersMinChars:   3,
                                glyphMargin:           false,
                                folding:               true,
                                scrollBeyondLastLine:  false,
                                automaticLayout:       true,
                                renderLineHighlight:  'all',
                                cursorBlinking:       'smooth',
                                smoothScrolling:       true,
                                contextmenu:           false,
                                wordWrap:             'off',
                                lineNumbers:          'on',
                            }}
                        />
                    </div>

                    {/* Limit-reached banner */}
                    <AnimatePresence>
                        {limitReached && !showOutput && (
                            <motion.div
                                className="flex-shrink-0 flex items-center gap-2 px-4 py-2"
                                style={{
                                    borderTop: '1px solid rgba(248,113,113,0.2)',
                                    background: 'rgba(248,113,113,0.06)',
                                }}
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 36 }}
                                exit={{ opacity: 0, height: 0 }}
                            >
                                <span className="text-xs" style={{ color: '#f87171' }}>
                                    ⛔ Daily limit of 20 runs reached. Resets at midnight.
                                </span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Output panel */}
                    <AnimatePresence>
                        {showOutput && (
                            <OutputPanel
                                output={output}
                                isError={isError}
                                meta={outputMeta}
                                onClose={() => setShowOutput(false)}
                            />
                        )}
                    </AnimatePresence>
                </div>

                {/* Explanation Panel */}
                <AnimatePresence>
                    {(showExplanation || isAnalyzing) && (
                        <motion.div
                            className="w-72 flex-shrink-0 overflow-y-auto"
                            style={{
                                borderLeft: '1px solid rgba(99,179,237,0.12)',
                                background: 'rgba(0,0,0,0.2)',
                            }}
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: 288, opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                        >
                            {isAnalyzing ? (
                                <div className="flex flex-col items-center justify-center h-full gap-3">
                                    <div
                                        className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
                                        style={{ borderColor: 'rgba(0,212,255,0.6)', borderTopColor: 'transparent' }}
                                    />
                                    <span className="text-xs" style={{ color: '#64748b' }}>Analyzing logic...</span>
                                </div>
                            ) : (
                                <div className="p-3 space-y-2">
                                    <div className="text-xs font-semibold mb-3" style={{ color: '#64748b' }}>
                                        CODE EXPLANATION
                                    </div>
                                    {explanationSteps.slice(0, visibleCount).map((step, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, x: 10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="rounded-lg p-2.5"
                                            style={{
                                                background: `${step.color}08`,
                                                border:     `1px solid ${step.color}20`,
                                            }}
                                        >
                                            <div className="flex items-center gap-1.5 mb-1">
                                                <span className="text-sm">{step.icon}</span>
                                                <span className="text-xs font-semibold" style={{ color: step.color }}>
                                                    {step.title}
                                                </span>
                                            </div>
                                            <p className="text-xs leading-relaxed" style={{ color: '#94a3b8' }}>
                                                {step.detail}
                                            </p>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
