'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

interface Algorithm {
  name: string;
  time: string;
  space: string;
  category: string;
  description: string;
  color: string;
}

const ALGORITHMS: Algorithm[] = [
  { name: 'Binary Search', time: 'O(log n)', space: 'O(1)', category: 'Search', color: '#00d4ff', description: 'Divide-and-conquer search on sorted arrays. Halves search space each step.' },
  { name: 'Linear Search', time: 'O(n)', space: 'O(1)', category: 'Search', color: '#10b981', description: 'Sequentially checks every element until a match is found.' },
  { name: 'Bubble Sort', time: 'O(n²)', space: 'O(1)', category: 'Sorting', color: '#f59e0b', description: 'Repeatedly swaps adjacent elements in wrong order. Simple but slow.' },
  { name: 'Merge Sort', time: 'O(n log n)', space: 'O(n)', category: 'Sorting', color: '#a855f7', description: 'Divide-and-conquer. Recursively splits and merges in sorted order.' },
  { name: 'Quick Sort', time: 'O(n log n)', space: 'O(log n)', category: 'Sorting', color: '#6366f1', description: 'Partition around pivot. Average O(n log n), worst O(n²).' },
  { name: 'Heap Sort', time: 'O(n log n)', space: 'O(1)', category: 'Sorting', color: '#ec4899', description: 'Uses a max-heap to sort in place. Guaranteed O(n log n).' },
  { name: 'BFS', time: 'O(V + E)', space: 'O(V)', category: 'Graph', color: '#38bdf8', description: 'Breadth-first traversal. Uses a queue. Finds shortest path in unweighted graphs.' },
  { name: 'DFS', time: 'O(V + E)', space: 'O(V)', category: 'Graph', color: '#818cf8', description: 'Depth-first traversal. Uses a stack (or recursion). For topological sort, cycle detect.' },
  { name: "Dijkstra's", time: 'O((V+E) log V)', space: 'O(V)', category: 'Graph', color: '#f472b6', description: 'Shortest path in weighted graphs with non-negative edges. Uses min-heap.' },
  { name: 'Dynamic Programming', time: 'O(n²) typical', space: 'O(n)', category: 'DP', color: '#34d399', description: 'Breaks problems into overlapping subproblems. Stores results in table.' },
];

// Generate complexity data for chart
function generateChartData(n: number = 20) {
  return Array.from({ length: n }, (_, i) => {
    const x = i + 1;
    return {
      n: x,
      'O(1)': 1,
      'O(log n)': +(Math.log2(x)).toFixed(2),
      'O(n)': x,
      'O(n log n)': +(x * Math.log2(x)).toFixed(2),
      'O(n²)': x * x,
    };
  });
}

const COMPLEXITY_COLORS: Record<string, string> = {
  'O(1)': '#10b981',
  'O(log n)': '#00d4ff',
  'O(n)': '#a855f7',
  'O(n log n)': '#f59e0b',
  'O(n²)': '#ef4444',
};

const CATEGORIES = ['All', 'Search', 'Sorting', 'Graph', 'DP'];

export default function DSACalcApp() {
  const [selected, setSelected] = useState<Algorithm>(ALGORITHMS[0]);
  const [filterCat, setFilterCat] = useState('All');

  const chartData = useMemo(() => generateChartData(15), []);

  const filteredAlgos = filterCat === 'All' ? ALGORITHMS : ALGORITHMS.filter(a => a.category === filterCat);

  // Determine which complexity curve to highlight
  const highlightedCurve = selected.time.includes('log n') && selected.time.includes('n log')
    ? 'O(n log n)'
    : selected.time.includes('n²')
    ? 'O(n²)'
    : selected.time.includes('log n')
    ? 'O(log n)'
    : selected.time === 'O(n)' || selected.time.includes('V + E')
    ? 'O(n)'
    : 'O(1)';

  return (
    <div className="h-full flex flex-col overflow-hidden p-4 space-y-3">
      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setFilterCat(cat)}
            className="px-3 py-1 rounded-full text-xs font-medium transition-all"
            style={{
              background: filterCat === cat ? 'rgba(0,212,255,0.15)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${filterCat === cat ? 'rgba(0,212,255,0.4)' : 'rgba(255,255,255,0.06)'}`,
              color: filterCat === cat ? '#00d4ff' : '#64748b',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-5 gap-3 flex-1 overflow-hidden min-h-0">
        {/* Algorithm List */}
        <div
          className="col-span-2 overflow-y-auto space-y-1.5 pr-1"
          style={{ scrollbarWidth: 'thin' }}
        >
          {filteredAlgos.map(algo => (
            <button
              key={algo.name}
              onClick={() => setSelected(algo)}
              className="w-full text-left px-3 py-2.5 rounded-lg transition-all"
              style={{
                background: selected.name === algo.name ? `${algo.color}10` : 'rgba(255,255,255,0.02)',
                border: `1px solid ${selected.name === algo.name ? algo.color + '40' : 'rgba(99,179,237,0.08)'}`,
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium" style={{ color: selected.name === algo.name ? '#e2e8f0' : '#94a3b8' }}>
                  {algo.name}
                </span>
                <span className="text-xs font-mono" style={{ color: algo.color }}>{algo.time}</span>
              </div>
              <span
                className="text-xs px-1.5 py-0.5 rounded mt-1 inline-block"
                style={{ background: algo.color + '15', color: algo.color }}
              >
                {algo.category}
              </span>
            </button>
          ))}
        </div>

        {/* Details + Chart */}
        <div className="col-span-3 flex flex-col gap-3 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={selected.name}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="space-y-3"
            >
              {/* Complexity Cards */}
              <div className="grid grid-cols-2 gap-2">
                <div
                  className="rounded-xl p-3"
                  style={{
                    background: 'rgba(0,212,255,0.06)',
                    border: '1px solid rgba(0,212,255,0.2)',
                  }}
                >
                  <div className="text-xs mb-1" style={{ color: '#64748b' }}>TIME COMPLEXITY</div>
                  <div className="text-xl font-bold font-mono" style={{ color: '#00d4ff' }}>{selected.time}</div>
                </div>
                <div
                  className="rounded-xl p-3"
                  style={{
                    background: 'rgba(168,85,247,0.06)',
                    border: '1px solid rgba(168,85,247,0.2)',
                  }}
                >
                  <div className="text-xs mb-1" style={{ color: '#64748b' }}>SPACE COMPLEXITY</div>
                  <div className="text-xl font-bold font-mono" style={{ color: '#a855f7' }}>{selected.space}</div>
                </div>
              </div>

              {/* Description */}
              <div
                className="rounded-xl p-3"
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(99,179,237,0.08)',
                }}
              >
                <div className="text-xs mb-1" style={{ color: '#64748b' }}>HOW IT WORKS</div>
                <p className="text-xs leading-relaxed" style={{ color: '#94a3b8' }}>{selected.description}</p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Chart */}
          <div
            className="flex-1 rounded-xl p-3"
            style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(99,179,237,0.08)',
              minHeight: 0,
            }}
          >
            <div className="text-xs mb-2" style={{ color: '#64748b' }}>COMPLEXITY GROWTH VISUALIZATION</div>
            <ResponsiveContainer width="100%" height="85%">
              <LineChart data={chartData} margin={{ top: 2, right: 8, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,179,237,0.06)" />
                <XAxis dataKey="n" tick={{ fill: '#475569', fontSize: 10 }} label={{ value: 'n', position: 'insideRight', fill: '#475569', fontSize: 10 }} />
                <YAxis tick={{ fill: '#475569', fontSize: 10 }} domain={[0, 60]} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(5,8,22,0.95)',
                    border: '1px solid rgba(99,179,237,0.2)',
                    borderRadius: 8,
                    fontSize: 11,
                  }}
                  labelStyle={{ color: '#94a3b8' }}
                />
                {Object.entries(COMPLEXITY_COLORS).map(([key, color]) => (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stroke={color}
                    strokeWidth={key === highlightedCurve ? 2.5 : 1}
                    opacity={key === highlightedCurve ? 1 : 0.3}
                    dot={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
