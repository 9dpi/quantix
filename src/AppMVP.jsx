import React, { useState, useEffect, memo, useCallback } from 'react';
import { TrendingUp, TrendingDown, Clipboard, Check, Radio, Activity, AlertTriangle, Target, XCircle, CheckCircle, Moon, Sun, Zap } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// --- SUPABASE CONFIG ---
const supabaseUrl = 'https://gvglzvjsexeaectypkyk.supabase.co';
const supabaseKey = 'sb_publishable_twPEMyojWMfPXfubNA3C3g_xqAAwPHq';

let supabase = null;
try {
    supabase = createClient(supabaseUrl, supabaseKey);
} catch (e) {
    console.error("Supabase Init Error:", e);
}

// --- OPTIMIZED COMPONENTS ---

// 1. Bento Signal Card: Optimized for TikTok 9:16 - Stacked Vertical Layout
const SignalBentoCard = memo(({ signal }) => {
    const confidence = parseFloat(signal.conf || 0);
    const tp1 = parseFloat(signal.tp1_raw || 0);
    const tp2 = parseFloat(signal.tp2_raw || 0);

    const finalTP = confidence > 90
        ? ((tp1 + tp2) / 2).toFixed(5)
        : tp1.toFixed(5);

    const isExpired = ['SL_HIT', 'TP2_HIT', 'EXPIRED'].includes(signal.status);

    return (
        <div className="signal-card" data-status={signal.status}>
            {isExpired && <div className="expired-badge">EXPIRED</div>}

            <div className="card-header">
                <div className="asset-info">
                    <span className="pair">{signal.pair}</span>
                    <span className="timeframe">M15 • AI AGENT V1.5</span>
                </div>
            </div>

            {/* AI SCORE CARD - Gold Gradient & Prominent */}
            <div className="ai-confidence-bento">
                <span className="label">AI SCORE CARD</span>
                <span className="score">{signal.conf}%</span>
            </div>

            <div className="card-body">
                <div className="entry-label">ENTRY PRICE</div>
                <div className="entry-price">{signal.entry}</div>

                {/* ACTION BADGE - Full Width & Strong */}
                <div className={`action-badge-full ${signal.action.toLowerCase()}`}>
                    <Zap size={32} fill="currentColor" />
                    {signal.action}
                </div>
            </div>

            <div className="card-footer">
                <div className="price-box-bento sl">
                    <span className="tag">STOP LOSS</span>
                    <span className="val">{signal.sl}</span>
                </div>
                <div className="price-box-bento tp">
                    <span className="tag">TAKE PROFIT</span>
                    <span className="val">{finalTP}</span>
                </div>
            </div>

            {/* PROFESSIONAL STATUS DOT - Binance/TradingView Style */}
            <div
                title={
                    signal.status === 'WAITING' ? "Live: Price in Entry Zone" :
                        ['ENTRY_HIT', 'TP1_HIT'].includes(signal.status) ? "Trade Running: Order Filled" :
                            "Signal Expired"
                }
                style={{
                    position: 'absolute',
                    top: 20,
                    right: 20,
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background:
                        signal.status === 'WAITING' ? 'var(--color-buy)' :
                            ['ENTRY_HIT', 'TP1_HIT'].includes(signal.status) ? '#FFD700' :
                                '#666',
                    boxShadow:
                        signal.status === 'WAITING' ? '0 0 15px var(--color-buy)' :
                            ['ENTRY_HIT', 'TP1_HIT'].includes(signal.status) ? '0 0 10px rgba(255, 215, 0, 0.5)' :
                                'none'
                }}
                className={signal.status === 'WAITING' ? 'animate-pulse' : ''}
            />
        </div>
    );
});

// 2. Live Ticker Component: Handles high-frequency updates independently
const LiveTicker = memo(({ initialPrice }) => {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    const [data, setData] = useState({
        price: initialPrice || null,
        trend1H: 'BULLISH', // Initial fallback, will update with signals
    });

    useEffect(() => {
        if (initialPrice) {
            setData(prev => ({ ...prev, price: initialPrice }));
        }
    }, [initialPrice]);

    return (
        <section style={{ marginBottom: '0' }} className="ticker-container">
            <div className="glass-panel" style={{
                padding: '1.25rem',
                background: 'var(--bg-card)',
                boxShadow: 'var(--card-shadow)',
                borderRadius: '24px',
                border: '1px solid var(--border-color)',
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1fr) 1px minmax(0, 1fr)',
                alignItems: 'center',
                gap: '8px'
            }}>
                {/* Left: Live Price Area */}
                <div style={{ textAlign: 'left', paddingLeft: '4px' }}>
                    <p style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: '900', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '4px' }}>EUR/USD LIVE</p>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                        <span style={{
                            fontSize: '1.8rem',
                            color: 'var(--neon-blue)',
                            fontWeight: '900',
                            fontFamily: 'monospace',
                            lineHeight: 1
                        }}>
                            {data.price ? data.price.toFixed(5) : "---"}
                        </span>
                        <TrendingUp size={16} color="var(--color-buy)" className="animate-pulse" />
                    </div>
                </div>

                {/* Vertical Divider */}
                <div style={{ height: '40px', background: 'var(--border-color)' }}></div>

                {/* Right: Market Sentiment - Differentiated from Signal Score */}
                <div style={{ textAlign: 'right', paddingRight: '4px' }}>
                    <p style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: '900', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '4px' }}>Market Sentiment</p>
                    <div style={{ fontSize: '1.2rem', fontWeight: '900', color: data.trend1H === 'BULLISH' ? 'var(--color-buy)' : 'var(--color-sell)', lineHeight: 1 }}>
                        {data.trend1H === 'BULLISH' ? 'STRONG BULLISH' : 'STRONG BEARISH'}
                    </div>
                </div>
            </div>
        </section>
    );
});

// 3. Signal List Container - TikTok Optimized Bento Layout
const SignalList = memo(({ signals, loadingState }) => {
    return (
        <section className="tiktok-view-container">
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--text-primary)', textAlign: 'center', fontWeight: '900' }}>
                LIVE SIGNALS
            </h2>

            {loadingState === 'CONNECTING' ? (
                <div style={{ textAlign: 'center', padding: '50px', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'inline-block', marginBottom: '15px' }} className="animate-spin">
                        <Activity size={30} color="var(--neon-blue)" />
                    </div>
                    <div>SYNCING WITH AI AGENT...</div>
                </div>
            ) : signals.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '50px', color: 'var(--text-secondary)', background: 'var(--bg-card)', borderRadius: '24px' }}>
                    <AlertTriangle size={30} color="var(--primary)" style={{ marginBottom: '10px' }} />
                    <div style={{ fontWeight: 'bold' }}>SCANNING MARKET...</div>
                    <div style={{ fontSize: '0.8rem' }}>Waiting for high-probability setups</div>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {signals.map(s => (
                        <SignalBentoCard key={s.id} signal={s} />
                    ))}
                </div>
            )}
        </section>
    );
});

export default function AppMVP() {
    const [signals, setSignals] = useState([]);
    const [loadingState, setLoadingState] = useState('CONNECTING'); // CONNECTING -> CONNECTED -> READY
    const [currentPrice, setCurrentPrice] = useState(null);

    const [theme, setTheme] = useState('dark');

    useEffect(() => {
        document.title = "Signal Genius AI";
        const savedTheme = localStorage.getItem('quantix_theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
        setTheme(savedTheme);
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('quantix_theme', newTheme);
    };

    // FETCH REAL DATA
    useEffect(() => {
        if (!supabase) {
            console.error("Supabase client is not initialized.");
            return;
        }

        console.log("🔌 Connected to Supabase, fetching EUR/USD signals...");

        const fetchSignals = async () => {
            const { data, error } = await supabase
                .from('ai_signals')
                .select('*')
                .eq('symbol', 'EURUSD=X')
                .order('created_at', { ascending: false })
                .limit(10);

            if (data && !error && data.length > 0) {
                // Set the current price and trend from the LATEST signal
                const latestSignal = data[0];
                if (latestSignal.current_price) {
                    setCurrentPrice(latestSignal.current_price);
                } else if (latestSignal.predicted_close) {
                    setCurrentPrice(latestSignal.predicted_close);
                }

                const realSignals = data.map(d => ({
                    id: d.id,
                    pair: 'EUR/USD',
                    action: d.signal_type === 'LONG' ? 'BUY' : 'SELL',
                    entry: parseFloat(d.predicted_close || 0).toFixed(5),
                    sl: d.sl_price ? parseFloat(d.sl_price).toFixed(5) : (d.predicted_close * (d.signal_type === 'LONG' ? 0.997 : 1.003)).toFixed(5),
                    tp1_raw: d.tp1_price || (d.predicted_close * (d.signal_type === 'LONG' ? 1.004 : 0.996)),
                    tp2_raw: d.tp2_price || (d.predicted_close * (d.signal_type === 'LONG' ? 1.008 : 0.992)),
                    conf: d.confidence_score,
                    status: d.signal_status || 'WAITING',
                    currentPrice: d.current_price || d.predicted_close,
                    time: new Date(d.created_at).toLocaleTimeString()
                }));
                setSignals(realSignals);
            }

            // Artificial delay for UX
            setTimeout(() => {
                setLoadingState('CONNECTED');
                setTimeout(() => {
                    setLoadingState('READY');
                }, 800);
            }, 1000);
        };

        fetchSignals();

        // Subscribing to new signals
        const channel = supabase
            .channel('eurusd-signals')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'ai_signals',
                    filter: 'symbol=eq.EURUSD=X'
                },
                (payload) => {
                    const d = payload.new;

                    // Update price immediately when new signal arrives
                    if (d.current_price) setCurrentPrice(d.current_price);

                    const newSignal = {
                        id: d.id,
                        pair: 'EUR/USD',
                        action: d.signal_type === 'LONG' ? 'BUY' : 'SELL',
                        entry: parseFloat(d.predicted_close || 0).toFixed(5),
                        sl: d.sl_price ? parseFloat(d.sl_price).toFixed(5) : (d.predicted_close * (d.signal_type === 'LONG' ? 0.997 : 1.003)).toFixed(5),
                        tp1_raw: d.tp1_price || (d.predicted_close * (d.signal_type === 'LONG' ? 1.004 : 0.996)),
                        tp2_raw: d.tp2_price || (d.predicted_close * (d.signal_type === 'LONG' ? 1.008 : 0.992)),
                        conf: d.confidence_score,
                        status: d.signal_status || 'WAITING',
                        currentPrice: d.current_price || d.predicted_close,
                        time: 'Now'
                    };
                    setSignals(prev => [newSignal, ...prev]);
                }
            )
            .subscribe();

        return () => supabase.removeChannel(channel);

    }, []);

    return (
        <div style={{ fontFamily: "'Outfit', sans-serif", minHeight: '100vh', background: 'var(--bg-gradient)', color: 'var(--text-primary)' }}>
            {/* HEADER */}
            <nav className="glass-panel" style={{ padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100, borderRadius: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => window.location.href = '#/'}>
                    <Activity color="var(--neon-blue)" size={24} />
                    <span style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--text-primary)' }}>Signal Genius <span style={{ fontSize: '0.8rem', border: '1px solid var(--neon-blue)', padding: '2px 6px', borderRadius: '4px', color: 'var(--neon-blue)' }}>AI</span></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    {/* Theme Toggle Button */}
                    <button
                        onClick={toggleTheme}
                        style={{
                            background: 'transparent',
                            border: '1px solid var(--border-color)',
                            borderRadius: '50%',
                            width: '36px',
                            height: '36px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                        }}
                        title={theme === 'light' ? "Switch to Dark Mode" : "Switch to Light Mode"}
                    >
                        {theme === 'light' ? <Moon size={18} color="var(--text-secondary)" /> : <Sun size={18} color="var(--primary)" />}
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--color-buy)' }}>
                        <Radio size={16} className="animate-pulse" /> LIVE MONITORING
                    </div>
                </div>
            </nav>

            <main className="container" style={{ padding: '2rem 0' }}>
                <LiveTicker initialPrice={currentPrice} />
                <SignalList signals={signals} loadingState={loadingState} />

                {/* FOOTER */}
                <footer style={{ textAlign: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '2rem' }}>
                    <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                        <AlertTriangle size={16} color="orange" />
                        Educational purposes only. Past performance does not guarantee future results.
                    </p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.75rem', fontWeight: '500' }}>
                        Powered by <span style={{ color: 'var(--neon-blue)' }}>Quantix AI Core v1.5</span>
                    </p>
                    <p style={{ color: 'var(--text-secondary)', opacity: 0.6, fontSize: '0.7rem', marginTop: '0.5rem' }}>
                        &copy; 2026 Signal Genius AI. Forensic Market Analysis System.
                    </p>
                </footer>
            </main>
        </div>
    );
}
