'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Post {
  id: string;
  title: string;
  category: string;
  date: string;
  content: string;
  readTime: string;
}

const POSTS: Post[] = [
  {
    id: '1',
    category: 'DSA',
    title: 'Mastering Dynamic Programming: From Beginner to Expert',
    date: 'Feb 2025',
    readTime: '8 min',
    content: `## Dynamic Programming Fundamentals

Dynamic programming is a method for solving complex problems by breaking them down into simpler subproblems.

### Core Principles

**1. Optimal Substructure**
A problem has optimal substructure if an optimal solution can be constructed from optimal solutions of its subproblems.

**2. Overlapping Subproblems**
DP is useful when subproblems are not independent — they share sub-subproblems.

### Classic Example: Fibonacci

\`\`\`cpp
// Memoized approach — O(n) time, O(n) space
int fib(int n, unordered_map<int,int>& memo) {
    if (n <= 1) return n;
    if (memo.count(n)) return memo[n];
    return memo[n] = fib(n-1, memo) + fib(n-2, memo);
}
\`\`\`

### Common DP Patterns
- **Knapsack** → item selection with constraints
- **LCS/LIS** → sequence alignment  
- **Matrix DP** → grid path problems
- **Interval DP** → merging ranges

> 💡 **Tip**: Always define your DP state clearly before coding. Ask yourself: *"What does dp[i] represent?"*

### When to Use DP
1. Problem asks for min/max/count/ways
2. Future decisions depend on past choices
3. Problem has recursive structure with repeated sub-calls`,
  },
  {
    id: '2',
    category: 'System Design',
    title: 'Building a Real-Time Chat System at Scale',
    date: 'Jan 2025',
    readTime: '12 min',
    content: `## Real-Time Chat Architecture

Designing a scalable chat system requires careful consideration of latency, consistency, and availability trade-offs.

### Requirements
- **Functional**: 1-1 messaging, group chats, message history, online status
- **Non-Functional**: <200ms delivery, 10M concurrent users, 99.99% uptime

### High-Level Design

\`\`\`
Client → Load Balancer → WebSocket Servers → Message Queue → DB
                              ↓
                        Presence Service
\`\`\`

### Key Components

**WebSocket Layer**
- Maintain persistent connections per user
- Horizontal scaling with consistent hashing
- Redis Pub/Sub for cross-server message routing

**Message Storage**
- Cassandra for message history (write-heavy, time-series)
- Redis for temporary storage & pub/sub
- S3 for media attachments

**Presence Service**
- Heartbeat mechanism every 30s
- "Last seen" derived from heartbeat timestamp

> 🔑 Use message IDs with Snowflake algorithm for globally unique, time-sortable IDs without coordination overhead.`,
  },
  {
    id: '3',
    category: 'React',
    title: 'Deep Dive: React Server Components vs Client Components',
    date: 'Dec 2024',
    readTime: '6 min',
    content: `## React Server Components (RSC)

Next.js 13+ App Router introduced a paradigm shift in how we think about rendering boundaries.

### The Mental Model

\`\`\`
RSC (Server)          RCC (Client)
─────────────         ─────────────  
No JS bundle          Has JS bundle
No hydration          Hydrated
DB access ✓           No DB access
No useState           useState ✓
No useEffect          useEffect ✓
\`\`\`

### When to Use What

**Server Components** (default in App Router):
- Fetch data from DB/API
- Access backend secrets
- Large dependencies (markdown parsers, etc.)

**Client Components** (add 'use client'):
- Interactivity (onClick, onChange)
- React hooks (useState, useEffect)
- Browser-only APIs

### Common Mistake

Don't pass non-serializable data (functions, classes) from server to client components. Use serializable primitives and let the client recreate the logic.

\`\`\`tsx
// ❌ Wrong: passing function from server to client
<ClientComponent onClick={serverFunction} />

// ✅ Correct: client handles its own logic  
<ClientComponent id={data.id} />
\`\`\``,
  },
  {
    id: '4',
    category: 'C++',
    title: 'STL Mastery: Advanced Containers and Algorithms',
    date: 'Nov 2024',
    readTime: '10 min',
    content: `## Advanced C++ STL

The Standard Template Library is one of C++'s greatest strengths. Here's what most tutorials skip.

### Custom Comparators

\`\`\`cpp
// Min-heap of pairs by second element
auto cmp = [](auto& a, auto& b) { return a.second > b.second; };
priority_queue<pair<int,int>, vector<pair<int,int>>, decltype(cmp)> pq(cmp);
\`\`\`

### Ordered vs Unordered

| Container | Lookup | Insert | Order |
|-----------|--------|--------|-------|
| set/map | O(log n) | O(log n) | Sorted |
| unordered_set/map | O(1) avg | O(1) avg | None |

### Algorithms You Should Know

\`\`\`cpp
// Binary search with custom pred
auto it = lower_bound(v.begin(), v.end(), target);

// nth_element — O(n) partial sort
nth_element(v.begin(), v.begin()+k, v.end());

// Permutations
do { /* process */ } while(next_permutation(v.begin(), v.end()));
\`\`\`

> ⚡ Use \`reserve(n)\` on unordered containers to avoid rehashing overhead in competitive programming.`,
  },
];

const CATEGORIES = ['All', ...Array.from(new Set(POSTS.map(p => p.category)))];

export default function BlogApp() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const filtered = activeCategory === 'All'
    ? POSTS
    : POSTS.filter(p => p.category === activeCategory);

  const catColors: Record<string, string> = {
    DSA: '#00d4ff',
    'System Design': '#a855f7',
    React: '#61dafb',
    'C++': '#ec4899',
  };

  return (
    <div className="h-full flex" style={{ background: 'transparent' }}>
      {/* Sidebar */}
      <div
        className="w-48 flex-shrink-0 flex flex-col py-3"
        style={{ borderRight: '1px solid rgba(99,179,237,0.1)' }}
      >
        <div className="px-3 mb-3">
          <p className="text-xs font-semibold" style={{ color: '#64748b' }}>CATEGORIES</p>
        </div>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => { setActiveCategory(cat); setSelectedPost(null); }}
            className="flex items-center gap-2 px-3 py-2 text-sm text-left transition-all"
            style={{
              color: activeCategory === cat ? '#e2e8f0' : '#64748b',
              background: activeCategory === cat ? 'rgba(0,212,255,0.08)' : 'transparent',
              borderLeft: activeCategory === cat ? '2px solid #00d4ff' : '2px solid transparent',
            }}
          >
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ background: cat === 'All' ? '#64748b' : catColors[cat] || '#64748b' }}
            />
            {cat}
          </button>
        ))}

        <div className="mt-auto px-3 py-3 text-xs" style={{ color: '#475569' }}>
          {filtered.length} post{filtered.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <AnimatePresence mode="wait">
          {!selectedPost ? (
            <motion.div
              key="list"
              className="flex-1 overflow-y-auto p-3 space-y-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {filtered.map(post => (
                <motion.button
                  key={post.id}
                  onClick={() => setSelectedPost(post)}
                  className="w-full text-left p-4 rounded-xl transition-all hover:scale-[1.01]"
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(99,179,237,0.08)',
                  }}
                  whileHover={{ borderColor: 'rgba(99,179,237,0.25)' }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="px-2 py-0.5 rounded text-xs font-semibold"
                      style={{
                        background: (catColors[post.category] || '#64748b') + '20',
                        color: catColors[post.category] || '#64748b',
                      }}
                    >
                      {post.category}
                    </span>
                    <span className="text-xs" style={{ color: '#475569' }}>{post.date}</span>
                    <span className="text-xs ml-auto" style={{ color: '#475569' }}>⏱ {post.readTime}</span>
                  </div>
                  <h3 className="text-sm font-semibold" style={{ color: '#cbd5e1' }}>{post.title}</h3>
                </motion.button>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="post"
              className="flex-1 flex flex-col overflow-hidden"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              {/* Post Header */}
              <div
                className="flex items-center gap-2 px-4 py-2.5"
                style={{ borderBottom: '1px solid rgba(99,179,237,0.1)' }}
              >
                <button
                  onClick={() => setSelectedPost(null)}
                  className="text-xs flex items-center gap-1 transition-colors hover:text-blue-400"
                  style={{ color: '#64748b' }}
                >
                  ← Back
                </button>
                <div className="w-px h-4" style={{ background: 'rgba(99,179,237,0.2)' }} />
                <span className="text-xs font-medium truncate" style={{ color: '#94a3b8' }}>
                  {selectedPost.title}
                </span>
              </div>

              {/* Post Content */}
              <div className="flex-1 overflow-y-auto px-5 py-4">
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className="px-2 py-0.5 rounded text-xs font-semibold"
                    style={{
                      background: (catColors[selectedPost.category] || '#64748b') + '20',
                      color: catColors[selectedPost.category] || '#64748b',
                    }}
                  >
                    {selectedPost.category}
                  </span>
                  <span className="text-xs" style={{ color: '#475569' }}>{selectedPost.date} · {selectedPost.readTime} read</span>
                </div>
                <h1 className="text-lg font-bold mb-4" style={{ color: '#e2e8f0' }}>{selectedPost.title}</h1>
                <div
                  className="text-sm leading-relaxed space-y-2 font-mono"
                  style={{ color: '#94a3b8', whiteSpace: 'pre-wrap' }}
                >
                  {selectedPost.content.split('\n').map((line, i) => {
                    if (line.startsWith('## ')) return (
                      <h2 key={i} className="text-base font-bold mt-4" style={{ color: '#e2e8f0' }}>{line.slice(3)}</h2>
                    );
                    if (line.startsWith('### ')) return (
                      <h3 key={i} className="text-sm font-semibold mt-3" style={{ color: '#cbd5e1' }}>{line.slice(4)}</h3>
                    );
                    if (line.startsWith('**') && line.endsWith('**')) return (
                      <p key={i} className="font-semibold" style={{ color: '#cbd5e1' }}>{line.slice(2, -2)}</p>
                    );
                    if (line.startsWith('> ')) return (
                      <div key={i} className="border-l-2 pl-3 italic" style={{ borderColor: '#00d4ff', color: '#94a3b8' }}>
                        {line.slice(2)}
                      </div>
                    );
                    if (line.startsWith('```')) return (
                      <div key={i} className="rounded-lg px-3 py-2 my-2 font-mono text-xs overflow-x-auto" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(99,179,237,0.1)', color: '#86efac' }} />
                    );
                    return <p key={i} style={{ color: line === '' ? 'transparent' : '#94a3b8' }}>{line || ' '}</p>;
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
