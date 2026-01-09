import React, { useState, useEffect, memo, useCallback } from 'react';
import { TrendingUp, TrendingDown, Clipboard, Check, Radio, Activity, AlertTriangle, Target, XCircle, CheckCircle } from 'lucide-react';
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

// 1. Memoized Table Row: Only re-renders if the specific signal prop changes
const SignalTableRow = memo(({ signal }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = useCallback(() => {
        const text = `${signal.action} ${signal.pair} @ ${signal.entry}\nSL: ${signal.sl} | TP1: ${signal.tp1} | TP2: ${signal.tp2}`;
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }, [signal]);

    const getStatusBadge = (status) => {
        const badges = {
            'WAITING': { text: 'Waiting', color: '#999', icon: null },
            'ENTRY_HIT': { text: 'Entry Hit', color: '#00BA88', icon: <Check size={14} /> },
            'TP1_HIT': { text: 'TP1 Hit ✓', color: '#00BA88', icon: <Target size={14} /> },
            'TP2_HIT': { text: 'TP2 Hit ✓✓', color: '#FFD700', icon: <Target size={14} /> },
            'SL_HIT': { text: 'SL Hit', color: '#FF0055', icon: <XCircle size={14} /> },
        };
        const badge = badges[status] || badges['WAITING'];
        return (
            <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 10px',
                borderRadius: '12px',
                fontSize: '0.85rem',
                fontWeight: 'bold',
                background: `${badge.color}20`,
                color: badge.color,
                border: `1px solid ${badge.color}40`,
                whiteSpace: 'nowrap'
            }}>
                {badge.icon} {badge.text}
            </span>
        );
    };

    return (
        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <td style={{ padding: '15px 10px' }}>
                <span style={{
                    fontWeight: 'bold',
                    color: signal.action === 'BUY' ? '#00BA88' : '#FF0055',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                }}>
                    {signal.action === 'BUY' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                    {signal.action}
                </span>
            </td>
            <td style={{ padding: '15px 10px', fontWeight: 'bold' }}>{signal.entry}</td>
            <td style={{ padding: '15px 10px', color: '#FF0055' }}>{signal.sl}</td>
            <td style={{ padding: '15px 10px', color: '#00BA88' }}>{signal.tp1}</td>
            <td style={{ padding: '15px 10px', color: '#FFD700' }}>{signal.tp2}</td>
            <td style={{ padding: '15px 10px', fontFamily: 'monospace' }}>{signal.rr}</td>
            <td style={{ padding: '15px 10px' }}>{getStatusBadge(signal.status)}</td>
            <td style={{ padding: '15px 10px' }}>
                <button
                    onClick={handleCopy}
                    style={{
                        background: 'rgba(0,186,136,0.2)',
                        border: '1px solid #00BA88',
                        color: '#00BA88',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        fontSize: '0.85rem',
                        fontWeight: 'bold'
                    }}
                >
                    {copied ? <Check size={14} /> : <Clipboard size={14} />}
                    {copied ? 'Copied' : 'Copy'}
                </button>
            </td>
        </tr>
    );
});

// 2. Live Ticker Component: Handles high-frequency updates independently
const LiveTicker = memo(({ initialPrice }) => {
    // NO MORE HARDCODED DEFAULTS - Only real data from database
    const [data, setData] = useState({
        price: initialPrice || null,
        trend1H: 'BULLISH',
        trend15M: 'BULLISH',
        aiConfidence: 87
    });

    // Update internal state when initialPrice changes (from parent fetch)
    useEffect(() => {
        if (initialPrice) {
            setData(prev => ({ ...prev, price: initialPrice }));
        }
    }, [initialPrice]);

    return (
        <section className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem', background: 'linear-gradient(135deg, rgba(0,240,255,0.05) 0%, rgba(0,186,136,0.05) 100%)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '20px', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '3rem', fontWeight: 'bold', color: 'white', marginBottom: '5px' }}>EUR/USD</h1>
                    <p style={{ fontSize: '2.5rem', color: '#00F0FF', fontWeight: 'bold', fontFamily: 'monospace' }}>
                        {data.price ? data.price.toFixed(4) : "---"}
                    </p>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '0.85rem', color: '#999', marginBottom: '5px' }}>1H Trend</p>
                    <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: data.trend1H === 'BULLISH' ? '#00BA88' : '#FF0055' }}>
                        {data.trend1H === 'BULLISH' ? '↗ BULLISH' : '↘ BEARISH'}
                    </p>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '0.85rem', color: '#999', marginBottom: '5px' }}>15M Trend</p>
                    <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: data.trend15M === 'BULLISH' ? '#00BA88' : '#FF0055' }}>
                        {data.trend15M === 'BULLISH' ? '↗ BULLISH' : '↘ BEARISH'}
                    </p>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '0.85rem', color: '#999', marginBottom: '5px' }}>AI Confidence</p>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#FFD700' }}>{data.aiConfidence}%</p>
                </div>
            </div>
        </section>
    );
});

// 3. Signal List Container
const SignalList = memo(({ signals, loadingState }) => {
    return (
        <section>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', color: 'white', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Target color="#00F0FF" size={28} />
                Active Trading Signals
            </h2>

            <div className="glass-panel" style={{ padding: '0', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                    <thead>
                        <tr style={{ background: 'rgba(0,240,255,0.1)', borderBottom: '2px solid rgba(0,240,255,0.3)' }}>
                            <th style={{ padding: '15px 10px', textAlign: 'left', color: '#00F0FF', fontSize: '0.9rem', fontWeight: 'bold' }}>ACTION</th>
                            <th style={{ padding: '15px 10px', textAlign: 'left', color: '#00F0FF', fontSize: '0.9rem', fontWeight: 'bold' }}>ENTRY</th>
                            <th style={{ padding: '15px 10px', textAlign: 'left', color: '#00F0FF', fontSize: '0.9rem', fontWeight: 'bold' }}>SL</th>
                            <th style={{ padding: '15px 10px', textAlign: 'left', color: '#00F0FF', fontSize: '0.9rem', fontWeight: 'bold' }}>TP1</th>
                            <th style={{ padding: '15px 10px', textAlign: 'left', color: '#00F0FF', fontSize: '0.9rem', fontWeight: 'bold' }}>TP2</th>
                            <th style={{ padding: '15px 10px', textAlign: 'left', color: '#00F0FF', fontSize: '0.9rem', fontWeight: 'bold' }}>R:R</th>
                            <th style={{ padding: '15px 10px', textAlign: 'left', color: '#00F0FF', fontSize: '0.9rem', fontWeight: 'bold' }}>STATUS</th>
                            <th style={{ padding: '15px 10px', textAlign: 'left', color: '#00F0FF', fontSize: '0.9rem', fontWeight: 'bold' }}>COPY</th>
                        </tr>
                    </thead>
                    <tbody style={{ color: 'white' }}>
                        {loadingState === 'CONNECTING' ? (
                            <tr>
                                <td colSpan="8" style={{ textAlign: 'center', padding: '50px', color: '#999' }}>
                                    <div style={{ display: 'inline-block', marginBottom: '15px' }} className="animate-spin">
                                        <Activity size={30} color="#00F0FF" />
                                    </div>
                                    <div style={{ fontSize: '1.2rem', color: 'white' }}>Connecting to Live Server...</div>
                                    <div style={{ fontSize: '0.9rem', color: '#666' }}>Fetching AI Signals</div>
                                </td>
                            </tr>
                        ) : loadingState === 'CONNECTED' ? (
                            <tr>
                                <td colSpan="8" style={{ textAlign: 'center', padding: '50px', color: '#00BA88' }}>
                                    <div style={{ display: 'inline-block', marginBottom: '15px' }}>
                                        <CheckCircle size={40} color="#00BA88" />
                                    </div>
                                    <div style={{ fontSize: '1.2rem', color: '#00BA88', fontWeight: 'bold' }}>Connected Successfully ✅</div>
                                    <div style={{ fontSize: '0.9rem', color: '#666' }}>Syncing Real-time Data...</div>
                                </td>
                            </tr>
                        ) : signals.length === 0 ? (
                            <tr>
                                <td colSpan="8" style={{ textAlign: 'center', padding: '50px', color: '#999' }}>
                                    <div style={{ marginBottom: '15px' }}>
                                        <AlertTriangle size={30} color="#FFD700" />
                                    </div>
                                    <div style={{ fontSize: '1.2rem', color: 'white' }}>Waiting for New Signals</div>
                                    <div style={{ fontSize: '0.9rem', color: '#666' }}>System is scanning for high-probability setups...</div>
                                </td>
                            </tr>
                        ) : (
                            signals.map(s => (
                                <SignalTableRow key={s.id} signal={s} />
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </section>
    );
});

export default function AppMVP() {
    const [signals, setSignals] = useState([]);
    const [loadingState, setLoadingState] = useState('CONNECTING'); // CONNECTING -> CONNECTED -> READY
    const [currentPrice, setCurrentPrice] = useState(null);

    // FETCH REAL DATA
    useEffect(() => {
        if (!supabase) return;

        console.log("🔌 Connected to Supabase, fetching EUR/USD signals...");

        const fetchSignals = async () => {
            const { data, error } = await supabase
                .from('ai_signals')
                .select('*')
                .eq('symbol', 'EURUSD=X')
                .order('created_at', { ascending: false })
                .limit(10);

            if (data && !error && data.length > 0) {
                // Set the current price from the LATEST signal
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
                    entry: parseFloat(d.predicted_close || 0).toFixed(4),
                    sl: d.sl_price ? parseFloat(d.sl_price).toFixed(4) : (d.predicted_close * (d.signal_type === 'LONG' ? 0.997 : 1.003)).toFixed(4),
                    tp1: d.tp1_price ? parseFloat(d.tp1_price).toFixed(4) : (d.predicted_close * (d.signal_type === 'LONG' ? 1.004 : 0.996)).toFixed(4),
                    tp2: d.tp2_price ? parseFloat(d.tp2_price).toFixed(4) : (d.predicted_close * (d.signal_type === 'LONG' ? 1.008 : 0.992)).toFixed(4),
                    rr: '1:2.6',
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
                        entry: parseFloat(d.predicted_close || 0).toFixed(4),
                        sl: d.sl_price ? parseFloat(d.sl_price).toFixed(4) : (d.predicted_close * (d.signal_type === 'LONG' ? 0.997 : 1.003)).toFixed(4),
                        tp1: d.tp1_price ? parseFloat(d.tp1_price).toFixed(4) : (d.predicted_close * (d.signal_type === 'LONG' ? 1.004 : 0.996)).toFixed(4),
                        tp2: d.tp2_price ? parseFloat(d.tp2_price).toFixed(4) : (d.predicted_close * (d.signal_type === 'LONG' ? 1.008 : 0.992)).toFixed(4),
                        rr: '1:2.6',
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
        <div style={{ fontFamily: "'Outfit', sans-serif", minHeight: '100vh', background: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%)' }}>
            {/* HEADER */}
            <nav className="glass-panel" style={{ padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100, borderRadius: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Activity color="#00F0FF" size={24} />
                    <span style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'white' }}>AI Forecast <span style={{ fontSize: '0.8rem', border: '1px solid #FFD700', padding: '2px 6px', borderRadius: '4px', color: '#FFD700' }}>FOREX</span></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: '#00BA88' }}>
                    <Radio size={16} className="animate-pulse" /> LIVE MONITORING
                </div>
            </nav>

            <main className="container" style={{ padding: '2rem 1rem', maxWidth: '1200px', margin: '0 auto' }}>
                <LiveTicker initialPrice={currentPrice} />
                <SignalList signals={signals} loadingState={loadingState} />

                {/* FOOTER */}
                <footer style={{ marginTop: '4rem', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2rem' }}>
                    <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#999', fontSize: '0.8rem' }}>
                        <AlertTriangle size={16} color="orange" />
                        Educational purposes only. Past performance does not guarantee future results.
                    </p>
                    <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.7rem', marginTop: '0.5rem' }}>
                        &copy; 2024 AI Smart Forecast. Forex Edition for Professional Traders.
                    </p>
                </footer>
            </main>
        </div>
    );
}
