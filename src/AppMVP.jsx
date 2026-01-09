import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Clipboard, Check, Radio, Activity, AlertTriangle, Target, XCircle } from 'lucide-react';
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

// --- MOCK DATA (Fallback) ---
const MOCK_SIGNALS = [
    {
        id: 1,
        pair: 'EUR/USD',
        action: 'BUY',
        entry: 1.0520,
        sl: 1.0490,
        tp1: 1.0560,
        tp2: 1.0600,
        rr: '1:2.6',
        conf: 92,
        status: 'ENTRY_HIT',
        currentPrice: 1.0545,
        time: '5m ago'
    },
    {
        id: 2,
        pair: 'EUR/USD',
        action: 'SELL',
        entry: 1.0750,
        sl: 1.0800,
        tp1: 1.0700,
        tp2: 1.0650,
        rr: '1:2',
        conf: 85,
        status: 'TP1_HIT',
        currentPrice: 1.0695,
        time: '2h ago'
    },
];

const EURUSD_LIVE = {
    price: 1.0542,
    trend1H: 'BULLISH',
    trend15M: 'BULLISH',
    aiConfidence: 87
};

function SignalTableRow({ signal }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        const text = `${signal.action} ${signal.pair} @ ${signal.entry}\nSL: ${signal.sl} | TP1: ${signal.tp1} | TP2: ${signal.tp2}`;
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

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
                border: `1px solid ${badge.color}40`
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
}

export default function AppMVP() {
    const [signals, setSignals] = useState(MOCK_SIGNALS);
    const [liveData, setLiveData] = useState(EURUSD_LIVE);

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
                console.log("✅ Got EUR/USD Signals:", data.length);
                const realSignals = data.map(d => ({
                    id: d.id,
                    pair: 'EUR/USD',
                    action: d.signal_type === 'LONG' ? 'BUY' : 'SELL',
                    entry: parseFloat(d.predicted_close || 0).toFixed(4),
                    sl: (d.predicted_close * (d.signal_type === 'LONG' ? 0.997 : 1.003)).toFixed(4),
                    tp1: (d.predicted_close * (d.signal_type === 'LONG' ? 1.004 : 0.996)).toFixed(4),
                    tp2: (d.predicted_close * (d.signal_type === 'LONG' ? 1.008 : 0.992)).toFixed(4),
                    rr: '1:2.6',
                    conf: d.confidence_score,
                    status: 'WAITING',
                    currentPrice: d.predicted_close,
                    time: new Date(d.created_at).toLocaleTimeString()
                }));
                setSignals(realSignals);
            }
        };

        fetchSignals();

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
                    console.log("🔔 New EUR/USD Signal:", payload);
                    const d = payload.new;
                    const newSignal = {
                        id: d.id,
                        pair: 'EUR/USD',
                        action: d.signal_type === 'LONG' ? 'BUY' : 'SELL',
                        entry: parseFloat(d.predicted_close || 0).toFixed(4),
                        sl: (d.predicted_close * (d.signal_type === 'LONG' ? 0.997 : 1.003)).toFixed(4),
                        tp1: (d.predicted_close * (d.signal_type === 'LONG' ? 1.004 : 0.996)).toFixed(4),
                        tp2: (d.predicted_close * (d.signal_type === 'LONG' ? 1.008 : 0.992)).toFixed(4),
                        rr: '1:2.6',
                        conf: d.confidence_score,
                        status: 'WAITING',
                        currentPrice: d.predicted_close,
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

                {/* EUR/USD LIVE CARD */}
                <section className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem', background: 'linear-gradient(135deg, rgba(0,240,255,0.05) 0%, rgba(0,186,136,0.05) 100%)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '20px', alignItems: 'center' }}>
                        <div>
                            <h1 style={{ fontSize: '3rem', fontWeight: 'bold', color: 'white', marginBottom: '5px' }}>EUR/USD</h1>
                            <p style={{ fontSize: '2.5rem', color: '#00F0FF', fontWeight: 'bold', fontFamily: 'monospace' }}>{liveData.price}</p>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ fontSize: '0.85rem', color: '#999', marginBottom: '5px' }}>1H Trend</p>
                            <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: liveData.trend1H === 'BULLISH' ? '#00BA88' : '#FF0055' }}>
                                {liveData.trend1H === 'BULLISH' ? '↗ BULLISH' : '↘ BEARISH'}
                            </p>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ fontSize: '0.85rem', color: '#999', marginBottom: '5px' }}>15M Trend</p>
                            <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: liveData.trend15M === 'BULLISH' ? '#00BA88' : '#FF0055' }}>
                                {liveData.trend15M === 'BULLISH' ? '↗ BULLISH' : '↘ BEARISH'}
                            </p>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ fontSize: '0.85rem', color: '#999', marginBottom: '5px' }}>AI Confidence</p>
                            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#FFD700' }}>{liveData.aiConfidence}%</p>
                        </div>
                    </div>
                </section>

                {/* SIGNAL TABLE */}
                <section>
                    <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', color: 'white', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Target color="#00F0FF" size={28} />
                        Active Trading Signals
                    </h2>

                    <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
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
                                {signals.map(s => (
                                    <SignalTableRow key={s.id} signal={s} />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

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
