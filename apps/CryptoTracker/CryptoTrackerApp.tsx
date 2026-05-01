'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

interface HistoryPoint {
    time: string;
    price: number;
}

interface CryptoData {
    symbol: string;
    price: number;
    change: number;
    changePercent: number;
    high: number;
    low: number;
    volume: string;
    history: HistoryPoint[];
}

const COINS = [
    {
        symbol: 'BTCUSDT',
        display: 'BTC',
        name: 'Bitcoin',
        color: '#f59e0b',
        icon: '₿',
    },
    {
        symbol: 'ETHUSDT',
        display: 'ETH',
        name: 'Ethereum',
        color: '#6366f1',
        icon: 'Ξ',
    },
];

function formatPrice(n: number): string {
    return n.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

function formatVolume(n: number): string {
    if (n >= 1e9) return `${(n / 1e9).toFixed(2)} B`;
    if (n >= 1e6) return `${(n / 1e6).toFixed(2)} M`;
    return n.toFixed(0);
}

function useCryptoData(symbol: string) {
    const [data, setData] = useState<CryptoData | null>(null);
    const [loading, setLoading] = useState(true);
    const historyRef = useRef<HistoryPoint[]>([]);

    const fetchData = useCallback(async () => {
        try {
            const [tickerRes, klinesRes] = await Promise.all([
                fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`),
                fetch(
                    `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1h&limit=24`
                ),
            ]);

            if (!tickerRes.ok || !klinesRes.ok) {
                throw new Error('API error');
            }

            const ticker = await tickerRes.json();
            const klines: string[][] = await klinesRes.json();

            const price = parseFloat(ticker.lastPrice);
            const change = parseFloat(ticker.priceChange);
            const changePercent = parseFloat(ticker.priceChangePercent);
            const high = parseFloat(ticker.highPrice);
            const low = parseFloat(ticker.lowPrice);
            const volume = formatVolume(parseFloat(ticker.quoteVolume));

            const history: HistoryPoint[] = klines.map((k) => ({
                time: new Date(parseInt(k[0])).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false,
                }),
                price: parseFloat(k[4]),
            }));

            historyRef.current = history;

            setData({
                symbol,
                price,
                change,
                changePercent,
                high,
                low,
                volume,
                history,
            });
        } catch {
            // Mock fallback
            const mockPrice =
                symbol === 'BTCUSDT'
                    ? 67420 + Math.random() * 100
                    : 3210 + Math.random() * 10;

            const mockHistory: HistoryPoint[] = Array.from(
                { length: 24 },
                (_, i) => ({
                    time: `${String(i).padStart(2, '0')}:00`,
                    price: mockPrice * (0.98 + Math.random() * 0.04),
                })
            );

            setData({
                symbol,
                price: mockPrice,
                change: (Math.random() - 0.4) * 500,
                changePercent: (Math.random() - 0.4) * 2,
                high: mockPrice * 1.02,
                low: mockPrice * 0.98,
                volume: '2.1B',
                history: historyRef.current.length
                    ? historyRef.current
                    : mockHistory,
            });
        } finally {
            setLoading(false);
        }
    }, [symbol]);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, [fetchData]);

    return { data, loading, refetch: fetchData };
}

function CoinCard({
    coin,
    isSelected,
    onClick,
}: {
    coin: typeof COINS[0];
    isSelected: boolean;
    onClick: () => void;
}) {
    const { data, loading } = useCryptoData(coin.symbol);
    const isPositive = (data?.changePercent ?? 0) >= 0;

    return (
        <button
            onClick={onClick}
            className="flex-1 rounded-xl p-3 text-left transition-all"
            style={{
                background: isSelected
                    ? `${coin.color}10`
                    : 'rgba(255,255,255,0.03)',
                border: `1px solid ${
                    isSelected
                        ? coin.color + '40'
                        : 'rgba(99,179,237,0.08)'
                }`,
            }}
        >
            <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{coin.icon}</span>
                <div>
                    <div className="text-sm font-bold text-slate-200">
                        {coin.display}
                    </div>
                    <div className="text-xs text-slate-500">
                        {coin.name}
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="text-sm text-slate-500">
                    Loading...
                </div>
            ) : (
                <>
                    <div
                        className="text-base font-bold font-mono"
                        style={{ color: coin.color }}
                    >
                        ${formatPrice(data?.price ?? 0)}
                    </div>
                    <div
                        className="text-xs flex items-center gap-1"
                        style={{
                            color: isPositive
                                ? '#10b981'
                                : '#ef4444',
                        }}
                    >
                        {isPositive ? '▲' : '▼'}
                        {Math.abs(
                            data?.changePercent ?? 0
                        ).toFixed(2)}
                        %
                    </div>
                </>
            )}
        </button>
    );
}

export default function CryptoTrackerApp() {
    const [selectedCoin, setSelectedCoin] = useState(COINS[0]);
    const { data, loading, refetch } = useCryptoData(
        selectedCoin.symbol
    );
    const [lastUpdated, setLastUpdated] = useState(new Date());

    useEffect(() => {
        setLastUpdated(new Date());
    }, [data]);

    const isPositive = (data?.changePercent ?? 0) >= 0;

    return (
        <div className="h-full flex flex-col overflow-hidden p-4 space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-400">
                    LIVE MARKET
                </h2>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-600">
                        Updated {lastUpdated.toLocaleTimeString()}
                    </span>
                    <button
                        onClick={refetch}
                        className="text-xs px-2 py-1 rounded-lg border border-cyan-400/20 bg-cyan-400/10 text-cyan-400 hover:opacity-80"
                    >
                        ↻ Refresh
                    </button>
                </div>
            </div>

            {/* Coin Selector */}
            <div className="flex gap-3">
                {COINS.map((coin) => (
                    <CoinCard
                        key={coin.symbol}
                        coin={coin}
                        isSelected={
                            selectedCoin.symbol === coin.symbol
                        }
                        onClick={() =>
                            setSelectedCoin(coin)
                        }
                    />
                ))}
            </div>

            {/* Main Section */}
            <AnimatePresence mode="wait">
                {loading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin border-cyan-400" />
                    </div>
                ) : data ? (
                    <motion.div
                        key={selectedCoin.symbol}
                        className="flex-1 flex flex-col gap-3 overflow-hidden"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        {/* Price Box */}
                        <div className="rounded-xl p-4 border border-slate-700 bg-slate-900/40">
                            <div className="flex items-end justify-between">
                                <div>
                                    <div className="text-xs text-slate-500 mb-1">
                                        {selectedCoin.display}/USDT
                                    </div>
                                    <motion.div
                                        key={data.price}
                                        className="text-3xl font-bold font-mono"
                                        style={{
                                            color:
                                                selectedCoin.color,
                                        }}
                                    >
                                        $
                                        {formatPrice(
                                            data.price
                                        )}
                                    </motion.div>

                                    <div
                                        className="flex items-center gap-2 mt-1 text-sm"
                                        style={{
                                            color: isPositive
                                                ? '#10b981'
                                                : '#ef4444',
                                        }}
                                    >
                                        {isPositive
                                            ? '▲'
                                            : '▼'}
                                        {formatPrice(
                                            data.change
                                        )}
                                        (
                                        {data.changePercent.toFixed(
                                            2
                                        )}
                                        %)
                                    </div>
                                </div>

                                <div className="text-right text-xs text-slate-500 space-y-1">
                                    <div>
                                        High: $
                                        {formatPrice(
                                            data.high
                                        )}
                                    </div>
                                    <div>
                                        Low: $
                                        {formatPrice(
                                            data.low
                                        )}
                                    </div>
                                    <div>
                                        Volume: $
                                        {data.volume}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Chart */}
                        <div className="flex-1 rounded-xl p-3 border border-slate-700 bg-slate-900/40">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data.history}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                    <XAxis dataKey="time" hide />
                                    <YAxis hide />
                                    <Tooltip />
                                    <Area
                                        type="monotone"
                                        dataKey="price"
                                        stroke={
                                            selectedCoin.color
                                        }
                                        fillOpacity={0.2}
                                        fill={
                                            selectedCoin.color
                                        }
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>
                ) : null}
            </AnimatePresence>
        </div>
    );
}