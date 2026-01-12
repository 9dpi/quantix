import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
    Activity, Shield, Cpu, Terminal,
    Globe, Zap, Layers, BarChart3, BarChart
} from 'lucide-react';
import { supabase } from './supabaseClient';

// Fallback for icons that might have different names in different versions
const ChartIcon = BarChart3 || BarChart || Activity;

// Helper for London Time - Memoized to prevent frequent recalculations outside of render
const getLondonTime = () => {
    return new Intl.DateTimeFormat('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
        timeZone: 'Europe/London'
    }).format(new Date());
};

// Sub-component for Agent Items to prevent re-rendering the whole card
const AgentItem = ({ name, status, subtext, color, pulseClass }) => (
    <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '4px',
        padding: '0.85rem',
        background: 'rgba(255,255,255,0.03)',
        borderRadius: '12px',
        border: '1px solid rgba(255,255,255,0.05)',
        fontSize: '0.85rem',
        marginBottom: '0.75rem'
    }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <span style={{ fontWeight: 600 }}>{name}</span>
            <span style={{ color: color, fontSize: '0.7rem', animation: `${pulseClass} 2s infinite` }}>● {status}</span>
        </div>
        <div style={{ fontSize: '0.65rem', color: '#64748b', fontStyle: 'italic' }}>{subtext}</div>
    </div>
);

export default function MvpDashboard() {
    // 0. UI & Security State
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [passcodeInput, setPasscodeInput] = useState('');
    const [lockError, setLockError] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

    // 1. Data Pipeline State
    const [pipelinePulse, setPipelinePulse] = useState(0);
    const [realMetrics, setRealMetrics] = useState({
        totalSignals: 0,
        lastUpdate: getLondonTime()
    });
    const [logs, setLogs] = useState([
        { time: getLondonTime(), type: 'CORE', msg: 'SIGNAL GENIUS Node Active' },
        { time: getLondonTime(), type: 'INFO', msg: 'Neural Pipeline Initialized: [Sources >> Core >> Output]' },
        { time: getLondonTime(), type: 'SHIELD', msg: 'Multi-Source Data Ingestion: ONLINE (LDN UPLINK)' }
    ]);

    const logEndRef = useRef(null);
    const logContainerRef = useRef(null);

    // Optimized: Debounced resize listener
    useEffect(() => {
        let timeoutId = null;
        const handleResize = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => setIsMobile(window.innerWidth < 1024), 150);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const addLog = useCallback((type, msg) => {
        const time = getLondonTime();
        setLogs(prev => [...prev, { time, type, msg }].slice(-50)); // Reduced log history for CPU
    }, []);

    const handlePasscode = (e) => {
        const value = e.target.value;
        setPasscodeInput(value);
        if (btoa(value) === 'OTExOQ==') {
            setIsAuthorized(true);
            setLockError(false);
            addLog('SUCCESS', 'Neural Node Authorized. Initializing SIGNAL GENIUS pipeline...');
        } else if (value.length >= 4) {
            setLockError(true);
            setTimeout(() => { setPasscodeInput(''); setLockError(false); }, 1000);
        }
    };

    // 2. Lifecycle & Data Management
    useEffect(() => {
        if (!isAuthorized) return;

        // Optimized: Slower animation cycles to save CPU
        const pipelineTimer = setInterval(() => setPipelinePulse(prev => (prev + 1) % 4), 4000);

        const fetchMetrics = async () => {
            if (!supabase) return;
            try {
                const { count } = await supabase.from('signals').select('*', { count: 'exact', head: true });
                setRealMetrics({ totalSignals: count || 0, lastUpdate: getLondonTime() });
            } catch (e) { console.error("Fetch failed:", e); }
        };

        const brandedLogs = [
            { type: 'TECH', msg: 'Neural Momentum: Ingesting high-volatility raw data.' },
            { type: 'AI', msg: 'Quantix Core: Processing institutional liquidity clusters.' },
            { type: 'SUCCESS', msg: 'Pipeline Output: Golden Signal candidate identified.' },
            { type: 'SENTINEL', msg: 'Market Pulse: Macro-sentiment sync complete (LDN).' }
        ];

        const logTimer = setInterval(() => {
            const randomLog = brandedLogs[Math.floor(Math.random() * brandedLogs.length)];
            addLog(randomLog.type, randomLog.msg);
        }, 30000); // 30s instead of 20s for CPU

        fetchMetrics();
        const dataTimer = setInterval(fetchMetrics, 60000); // 60s for CPU

        return () => {
            clearInterval(pipelineTimer);
            clearInterval(logTimer);
            clearInterval(dataTimer);
        };
    }, [isAuthorized, addLog]);

    // Optimized: Only scroll INTERNAL log container when NEW logs are added
    const prevLogLength = useRef(logs.length);
    const authTime = useRef(Date.now());

    useEffect(() => {
        // Only scroll if authorized for more than 2 seconds (prevent jump on login)
        // And use scrollTop instead of scrollIntoView to avoid page-wide jumping
        const isRecentLogin = (Date.now() - authTime.current) < 2000;

        if (isAuthorized && !isRecentLogin && logs.length > prevLogLength.current) {
            if (logContainerRef.current) {
                logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
            }
        }
        if (isAuthorized && prevLogLength.current === 0) {
            authTime.current = Date.now(); // Reset timer on actual auth
        }
        prevLogLength.current = logs.length;
    }, [logs, isAuthorized]);

    // CSS Animations - Using transform/opacity for GPU acceleration
    const animationStyles = useMemo(() => `
        @keyframes neuralPulse {
            0% { transform: scale(1); opacity: 0.8; box-shadow: 0 0 0 0 rgba(56, 189, 248, 0.4); }
            70% { transform: scale(1.05); opacity: 1; box-shadow: 0 0 0 15px rgba(56, 189, 248, 0); }
            100% { transform: scale(1); opacity: 0.8; box-shadow: 0 0 0 0 rgba(56, 189, 248, 0); }
        }
        @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-5px); }
        }
        @keyframes dataScan {
            0% { transform: translateX(-100%); opacity: 0; }
            50% { opacity: 1; }
            100% { transform: translateX(300%); opacity: 0; }
        }
        @keyframes pulse-green { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes pulse-yellow { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes pulse-purple { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
    `, []);

    const cardStyle = {
        background: 'rgba(10, 15, 30, 0.7)',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        padding: isMobile ? '1.25rem' : '1.5rem',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        position: 'relative',
        overflow: 'hidden'
    };

    if (!isAuthorized) {
        return (
            <div style={{ minHeight: '100vh', background: '#020617', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Outfit', sans-serif" }}>
                <div style={{ padding: '2.5rem', background: 'rgba(10, 15, 30, 0.8)', borderRadius: '24px', border: '1px solid rgba(56, 189, 248, 0.2)', textAlign: 'center', backdropFilter: 'blur(20px)', maxWidth: '400px', width: '90%' }}>
                    <Zap size={64} color="#38bdf8" style={{ marginBottom: '1.5rem' }} />
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f1f5f9', marginBottom: '0.5rem' }}>SIGNAL GENIUS AI</h1>
                    <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '2rem' }}>Institutional Intelligence Pipeline Access</p>
                    <input type="password" maxLength={4} value={passcodeInput} onChange={handlePasscode} placeholder="••••" style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: lockError ? '1px solid #f87171' : '1px solid #1e293b', borderRadius: '12px', padding: '1rem', fontSize: '1.5rem', color: '#f1f5f9', textAlign: 'center', letterSpacing: '1rem', outline: 'none' }} />
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: '#020617', color: '#f1f5f9', padding: isMobile ? '1rem' : '2rem', fontFamily: "'Outfit', sans-serif" }}>
            <style>{animationStyles}</style>

            {/* Top Bar - Always Row to keep Nominal Status side-by-side */}
            <div style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '2rem',
                borderBottom: '1px solid #1e293b',
                paddingBottom: '1rem',
                gap: '10px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '12px' }}>
                    <Zap size={isMobile ? 24 : 36} color="#38bdf8" />
                    <div>
                        <h1 style={{ fontSize: isMobile ? '1.1rem' : '1.75rem', fontWeight: 900, background: 'linear-gradient(90deg, #38bdf8, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>SIGNAL GENIUS AI</h1>
                        <div style={{ fontSize: '0.65rem', color: '#64748b', display: 'flex', gap: '8px' }}>
                            <span style={{ color: '#4ade80' }}>ACTIVE</span>
                            <span>|</span>
                            <span style={{ color: '#38bdf8' }}>LDN_UPLINK</span>
                        </div>
                    </div>
                </div>

                {/* Compact Neural Pipeline - Center (Desktop Only) */}
                {!isMobile && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '5px 20px', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ opacity: pipelinePulse >= 1 ? 1 : 0.3, transition: '0.5s' }}><Globe size={16} color="#38bdf8" /></div>
                        <div style={{ width: '30px', height: '1px', background: 'rgba(255,255,255,0.1)', position: 'relative' }}>
                            {pipelinePulse === 1 && <div style={{ position: 'absolute', height: '2px', width: '10px', background: '#38bdf8', borderRadius: '1px', animation: 'dataScan 1s infinite' }} />}
                        </div>
                        <div style={{
                            width: '32px', height: '32px', borderRadius: '50%', border: '1px solid #38bdf8',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: pipelinePulse === 2 ? '0 0 15px #38bdf8' : 'none',
                            animation: pipelinePulse === 2 ? 'neuralPulse 2s infinite' : 'none'
                        }}>
                            <Cpu size={16} color="#38bdf8" />
                        </div>
                        <div style={{ width: '30px', height: '1px', background: 'rgba(255,255,255,0.1)', position: 'relative' }}>
                            {pipelinePulse === 2 && <div style={{ position: 'absolute', height: '2px', width: '10px', background: '#38bdf8', borderRadius: '1px', animation: 'dataScan 1s infinite' }} />}
                        </div>
                        <div style={{ opacity: pipelinePulse >= 3 || pipelinePulse === 0 ? 1 : 0.3, transition: '0.5s' }}><ChartIcon size={16} color="#4ade80" /></div>
                    </div>
                )}

                <div style={{ fontSize: isMobile ? '0.6rem' : '0.7rem', color: '#4ade80', textAlign: 'right', whiteSpace: 'nowrap' }}>● UK NOMINAL (42ms)</div>
            </div>

            {/* Bento Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '1.25rem' }}>


                {/* Grid row 2 */}
                <div style={{ ...cardStyle }}>
                    <h2 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '1.25rem', color: '#38bdf8' }}><Shield size={18} /> Council</h2>
                    <AgentItem name="Technical" status="ACTIVE" subtext="Scanning Liquidity..." color="#4ade80" pulseClass="pulse-green" />
                    <AgentItem name="Sentinel" status="WATCHER" subtext="Monitoring Flows..." color="#fbbf24" pulseClass="pulse-yellow" />
                    <AgentItem name="Critic" status="DECISION" subtext="Awaiting Consensus..." color="#a78bfa" pulseClass="pulse-purple" />
                </div>

                <div style={{ ...cardStyle }}>
                    <h2 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '1.25rem', color: '#facc15' }}><Cpu size={18} /> Nucleus</h2>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '12px' }}>
                        <span style={{ color: '#94a3b8' }}>Mode</span>
                        <span style={{ color: '#facc15', fontWeight: 700 }}>Shadow Monitoring</span>
                    </div>
                    <div style={{ marginBottom: '15px', padding: '10px', background: 'rgba(56, 189, 248, 0.1)', borderRadius: '10px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
                        <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Neural Latency</div>
                        <div style={{ color: '#38bdf8', fontWeight: 900, fontSize: '1.1rem' }}>42ms ⚡</div>
                    </div>
                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', marginBottom: '6px' }}><span>Engine</span><span style={{ color: '#38bdf8' }}>ACTIVE 92%</span></div>
                        <div style={{ width: '100%', background: '#1e293b', height: '4px', borderRadius: '4px' }}><div style={{ width: '92%', background: 'linear-gradient(90deg, #facc15, #4ade80)', height: '100%' }} /></div>
                    </div>
                </div>

                <div style={{ ...cardStyle }}>
                    <h2 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '1.25rem', color: '#4ade80' }}><Activity size={18} /> Protection</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', flex: 1 }}>
                        <div style={{ background: 'rgba(239, 68, 68, 0.05)', padding: '0.75rem', borderRadius: '10px', border: '1px solid rgba(239, 68, 68, 0.2)', textAlign: 'center' }}>
                            <div style={{ fontSize: '0.6rem', color: '#f87171' }}>FILTERED</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f87171' }}>12</div>
                        </div>
                        <div style={{ background: 'rgba(34, 197, 94, 0.05)', padding: '0.75rem', borderRadius: '10px', border: '1px solid rgba(34, 197, 94, 0.2)', textAlign: 'center' }}>
                            <div style={{ fontSize: '0.6rem', color: '#4ade80' }}>SECURE</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#4ade80' }}>86%</div>
                        </div>
                    </div>
                    <div style={{ marginTop: '1rem', fontSize: '0.65rem', color: '#64748b', display: 'flex', justifyContent: 'space-between' }}>
                        <span>Approved: <b style={{ color: '#4ade80' }}>2</b></span>
                        <span>Accuracy: <b style={{ color: '#4ade80' }}>96.4%</b></span>
                    </div>
                </div>

                {/* Logs Stream */}
                <div style={{ gridColumn: '1 / -1', background: '#000', borderRadius: '16px', border: '1px solid #1e293b', padding: '1rem', height: '250px', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.75rem', color: '#94a3b8', borderBottom: '1px solid #1e293b', paddingBottom: '0.5rem' }}>
                        <span><Terminal size={14} /> LOG_STREAM</span>
                        <span>UK_UPLINK</span>
                    </div>
                    <div ref={logContainerRef} style={{ flex: 1, overflowY: 'auto', fontFamily: 'monospace', fontSize: '0.7rem' }}>
                        {logs.map((log, i) => (
                            <div key={i} style={{ marginBottom: '2px', display: 'flex', gap: '8px' }}>
                                <span style={{ color: '#475569' }}>[{log.time}]</span>
                                <span style={{ color: log.type === 'SUCCESS' ? '#4ade80' : log.type === 'TECH' ? '#38bdf8' : '#64748b' }}>{log.type}</span>
                                <span style={{ color: '#cbd5e1' }}>{log.msg}</span>
                            </div>
                        ))}
                        <div ref={logEndRef} />
                    </div>
                </div>

                <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#475569', fontSize: '0.65rem', marginTop: '0.5rem' }}>
                    LAST_SYNC: {realMetrics.lastUpdate} (LDN) | NODE: SG_01_SECURE
                </div>
            </div>
        </div>
    );
}
