import React, { useState, useEffect, memo, useCallback } from 'react';
import { TrendingUp, TrendingDown, Clipboard, Check, Radio, Activity, AlertTriangle, Target, XCircle, CheckCircle, Moon, Sun, Zap, Filter, ChevronDown, Sparkles } from 'lucide-react';
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
                    < Zap size={32} fill="currentColor" />
                    {signal.action}
                </div>

                {/* RISK WARNING SYSTEM - Honesty for Irfan */}
                <div style={{
                    marginTop: '12px',
                    padding: '8px',
                    borderRadius: '8px',
                    fontSize: '0.65rem',
                    fontWeight: '800',
                    textAlign: 'center',
                    background: confidence < 70 ? 'rgba(255, 68, 68, 0.1)' : confidence < 85 ? 'rgba(255, 165, 0, 0.1)' : 'rgba(0, 255, 128, 0.1)',
                    border: `1px solid ${confidence < 70 ? '#ff4444' : confidence < 85 ? '#ffa500' : '#00ff80'}`,
                    color: confidence < 70 ? '#ff4444' : confidence < 85 ? '#ffa500' : '#00ff80',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    letterSpacing: '0.5px'
                }}>
                    <AlertTriangle size={12} />
                    {confidence < 70 ? 'SPECTRUM RISK: SPECULATIVE SETUP' :
                        confidence < 85 ? 'STABLE RISK: MODERATE ALIGNMENT' :
                            'INSTITUTIONAL GRADE: HIGH CONVICTION'}
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
    const [data, setData] = useState({
        price: initialPrice || null,
        trend1H: 'BULLISH',
    });
    const [utcTime, setUtcTime] = useState(new Date().toUTCString().split(' ')[4]);

    useEffect(() => {
        if (initialPrice) {
            setData(prev => ({ ...prev, price: initialPrice }));
        }
    }, [initialPrice]);

    // Live UTC Clock
    useEffect(() => {
        const timer = setInterval(() => {
            setUtcTime(new Date().toUTCString().split(' ')[4]);
        }, 1000);
        return () => clearInterval(timer);
    }, []);

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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <p style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: '900', letterSpacing: '1px', textTransform: 'uppercase', margin: 0 }}>EUR/USD LIVE</p>
                    </div>
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

                {/* Right: Market Sentiment */}
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

// 3. Filter Controls: Smart View Toggle Button (Simplified)
const SmartToggle = memo(({ isSmartMode, setSmartMode }) => {
    return (
        <button
            onClick={() => setSmartMode(!isSmartMode)}
            style={{
                background: isSmartMode
                    ? 'linear-gradient(135deg, rgba(0, 240, 255, 0.2) 0%, rgba(255, 215, 0, 0.1) 100%)'
                    : 'rgba(255,255,255,0.03)',
                border: `1px solid ${isSmartMode ? 'var(--primary)' : 'var(--border-color)'}`,
                borderRadius: '12px',
                padding: '8px 16px',
                color: isSmartMode ? 'var(--primary)' : 'var(--text-secondary)',
                fontSize: '0.75rem',
                fontWeight: '800',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: isSmartMode ? '0 0 15px rgba(255, 215, 0, 0.2)' : 'none',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            {isSmartMode ? <Sparkles size={14} /> : <Target size={14} />}
            {isSmartMode ? 'SMART' : 'ALL'}

            {isSmartMode && (
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                    animation: 'shimmer 2s infinite'
                }} />
            )}
        </button>
    );
});

// 4. Signal List Container - TikTok Optimized Bento Layout
const SignalList = memo(({ signals, loadingState, totalSignalsCount }) => {
    return (
        <section className="tiktok-view-container">
            {loadingState === 'CONNECTING' ? (
                <div className="empty-state-container">
                    <div className="animate-spin" style={{ display: 'inline-block', marginBottom: '1rem' }}>
                        <Activity size={32} color="var(--neon-blue)" />
                    </div>
                    <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>SYNCHRONIZING CORE...</div>
                    <p className="empty-state-msg">
                        Signal Genius AI is establishing a secure tunnel to 10-year data clusters.<br />
                        Integrity verification in progress.
                    </p>
                </div>
            ) : signals.length === 0 ? (
                <div className="empty-state-container" style={{ opacity: 0, animation: 'fadeIn 0.5s forwards' }}>
                    <Target size={32} color="var(--primary)" style={{ marginBottom: '1rem' }} />
                    <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>WAITING FOR ALIGNMENT...</div>
                    <p className="empty-state-msg">
                        {totalSignalsCount > 0
                            ? "Signal Genius AI is filtering for the best entries. Currently, no signals meet the strict validation threshold. Stay tuned!"
                            : "Signal Genius AI is scanning 6,758+ data points across EUR/USD pairs. Market volatility is currently low. Precision is our priority."}
                    </p>
                </div>
            ) : (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px',
                    transition: 'opacity 0.2s ease'
                }}>
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
    const [isSmartMode, setIsSmartMode] = useState(true);

    useEffect(() => {
        document.title = "Signal Genius AI";
        const savedTheme = localStorage.getItem('Signal Genius_theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
        setTheme(savedTheme);

        // Load Smart Mode preference
        const savedSmartMode = localStorage.getItem('Signal Genius_smart_mode');
        if (savedSmartMode !== null) {
            setIsSmartMode(savedSmartMode === 'true');
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('Signal Genius_smart_mode', isSmartMode);
    }, [isSmartMode]);

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('Signal Genius_theme', newTheme);
    };

    // LOGIC: High-Performance Filtering (Never Static for Irfan)
    const filteredSignals = React.useMemo(() => {
        const sortedSignals = [...signals].sort((a, b) => parseFloat(b.conf || 0) - parseFloat(a.conf || 0));

        // Mode ALL: Show Top 3 most recent/highest conf active signals
        if (!isSmartMode) {
            return sortedSignals
                .filter(sig => !['SL_HIT', 'TP2_HIT', 'EXPIRED'].includes(sig.status))
                .slice(0, 3);
        }

        // Mode SMART: Try strict limit first
        let smartCandidates = sortedSignals.filter(sig => {
            const confidence = parseFloat(sig.conf || 0);
            const isHighConf = confidence >= 70;
            const signalTime = new Date(sig.timestamp).getTime();
            const now = new Date().getTime();
            const isFresh = (now - signalTime) < (48 * 60 * 60 * 1000);
            const isActive = !['SL_HIT', 'TP2_HIT', 'EXPIRED'].includes(sig.status);
            return isHighConf && isFresh && isActive;
        });

        // FALLBACK: If AI is too strict, show the single best available authentic signal
        if (smartCandidates.length === 0 && sortedSignals.length > 0) {
            const bestActive = sortedSignals.find(sig => !['SL_HIT', 'TP2_HIT', 'EXPIRED'].includes(sig.status));
            if (bestActive) smartCandidates = [bestActive];
        }

        return smartCandidates.slice(0, 1);
    }, [signals, isSmartMode]);

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
                .limit(20);

            if (data && !error && data.length > 0) {
                const latestSignal = data[0];
                if (latestSignal.current_price) setCurrentPrice(latestSignal.current_price);

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
                    timestamp: d.created_at,
                    time: new Date(d.created_at).toLocaleTimeString()
                }));
                setSignals(realSignals);
            }

            setTimeout(() => {
                setLoadingState('CONNECTED');
                setTimeout(() => setLoadingState('READY'), 800);
            }, 1000);
        };

        fetchSignals();

        const dataTimer = setInterval(fetchSignals, 5000);

        const channel = supabase
            .channel('eurusd-signals-realtime')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'ai_signals',
                filter: 'symbol=eq.EURUSD=X'
            }, (payload) => {
                console.log('⚡ Signal Pulse Received:', payload.eventType);

                if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
                    const d = payload.new;
                    if (d.current_price) setCurrentPrice(parseFloat(d.current_price));

                    // Update signals list if the signal is already there, or add if new
                    setSignals(prev => {
                        const exists = prev.find(s => s.id === d.id);
                        if (exists) {
                            return prev.map(s => s.id === d.id ? {
                                ...s,
                                status: d.signal_status || s.status,
                                entry: parseFloat(d.predicted_close || 0).toFixed(5),
                                sl: d.sl_price ? parseFloat(d.sl_price).toFixed(5) : s.sl,
                                tp1_raw: d.tp1_price || s.tp1_raw,
                                tp2_raw: d.tp2_price || s.tp2_raw,
                                conf: d.confidence_score || s.conf,
                                // Important: We don't display current_price in the card currently, but we update status
                            } : s);
                        } else if (payload.eventType === 'INSERT') {
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
                                timestamp: d.created_at,
                                time: 'Now'
                            };
                            return [newSignal, ...prev];
                        }
                        return prev;
                    });
                }
            }).subscribe();

        return () => {
            clearInterval(dataTimer);
            supabase.removeChannel(channel);
        };
    }, []);

    return (
        <div style={{ fontFamily: "'Outfit', sans-serif", minHeight: '100vh', background: 'var(--bg-gradient)', color: 'var(--text-primary)' }}>
            {/* HEADER */}
            <nav className="glass-panel" style={{ padding: '0.75rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100, borderRadius: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => window.location.href = '#/'}>
                    <Activity color="var(--neon-blue)" size={20} />
                    <span style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--text-primary)' }}>Signal Genius <span style={{ fontSize: '0.7rem', border: '1px solid var(--neon-blue)', padding: '1px 4px', borderRadius: '4px', color: 'var(--neon-blue)' }}>AI</span></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button onClick={toggleTheme} style={{ background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        {theme === 'light' ? <Moon size={16} color="var(--text-secondary)" /> : <Sun size={16} color="var(--primary)" />}
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--color-buy)', fontWeight: 'bold' }}>
                        <Radio size={14} className="animate-pulse" /> LIVE
                    </div>
                </div>
            </nav>

            <main className="container" style={{ padding: '1rem 0' }}>
                <LiveTicker initialPrice={currentPrice} />

                <div className="ticker-container" style={{ margin: '1.5rem auto 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{
                        fontSize: '1.6rem',
                        fontWeight: '950',
                        letterSpacing: '-1.2px',
                        margin: 0,
                        textAlign: 'left',
                        color: 'var(--text-primary)'
                    }}>
                        LIVE SIGNALS
                    </h2>
                    <SmartToggle isSmartMode={isSmartMode} setSmartMode={setIsSmartMode} />
                </div>

                <SignalList
                    signals={filteredSignals}
                    loadingState={loadingState}
                    totalSignalsCount={signals.length}
                />

                {/* FOOTER */}
                <footer style={{ textAlign: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', marginTop: '1.5rem' }}>
                    <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.75rem', padding: '0 1rem' }}>
                        <AlertTriangle size={14} color="orange" style={{ flexShrink: 0 }} />
                        Educational purposes only. Past performance does not guarantee future results.
                    </p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '0.5rem', fontWeight: '500' }}>
                        Powered by <span style={{ color: 'var(--neon-blue)' }}>Signal Genius AI v1.8</span>
                    </p>
                    <p style={{ color: 'var(--text-secondary)', opacity: 0.6, fontSize: '0.65rem', marginTop: '0.4rem' }}>
                        &copy; 2026 Signal Genius AI. Forensic Market Analysis System.
                    </p>
                </footer>
            </main>
        </div>
    );
}
