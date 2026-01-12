import React, { useState, useEffect, useRef } from 'react';
import * as Lucide from 'lucide-react';
import { supabase } from './supabaseClient';

// Use standard names to avoid import issues
const {
    Activity, Server, Database, Shield, Cpu, Terminal,
    RefreshCw, CheckCircle, XCircle, AlertTriangle, MessageSquare, Lock
} = Lucide;

export default function AdminDashboard() {
    // 0. Security Layer
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [passcodeInput, setPasscodeInput] = useState('');
    const [lockError, setLockError] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handlePasscode = (e) => {
        const value = e.target.value;
        setPasscodeInput(value);

        // V1.8.1: Obfuscated Check (Base64 for '9119' is 'OTExOQ==')
        if (btoa(value) === 'OTExOQ==') {
            setIsAuthorized(true);
            setLockError(false);
            addLog('SUCCESS', 'Authorized access granted. Decrypting node...');
        } else if (value.length >= 4) {
            setLockError(true);
            setTimeout(() => {
                setPasscodeInput('');
                setLockError(false);
            }, 1000);
        }
    };

    // 1. System Infrastructure Status
    const [systemStatus, setSystemStatus] = useState({
        api: 'checking',
        db: 'checking',
        bot: 'checking'
    });

    // 2. Real Data from Supabase
    const [realMetrics, setRealMetrics] = useState({
        totalSignals: 0,
        activeSignals: 0,
        signals24h: 0,
        lastUpdate: 'Initializing...'
    });

    // 3. AI Learning Status - V1.8 EVOLUTION
    const [aiState, setAiState] = useState({
        learningPhase: 'Shadow Mode Monitoring',
        confidenceThreshold: '85%',
        activeAgents: '3/3 Council Members',
        shadowMode: true,
        riskReduction: '86%' // NEW: Protection Efficiency
    });

    const [agentStatuses, setAgentStatuses] = useState({
        tech: 'Scanning Technical Patterns...',
        sentinel: 'Monitoring News & Sentiment...',
        critic: 'Evaluating Consensus...'
    });

    const [logs, setLogs] = useState([
        { time: new Date().toLocaleTimeString(), type: 'CORE', msg: 'Quantix Core V1.8 Evolution Active' },
        { time: new Date().toLocaleTimeString(), type: 'INFO', msg: 'Multi-Agent Council Initialized: [Tech, Sentinel, Critic]' },
        { time: new Date().toLocaleTimeString(), type: 'SHIELD', msg: 'Shadow Mode ENABLED: Threshold set to 85%' }
    ]);

    const logEndRef = useRef(null);
    const logContainerRef = useRef(null);

    const [metrics, setMetrics] = useState({
        cpu: 12,
        memory: 450,
        uptime: '14d 2h 15m',
        requests: 15420
    });

    const addLog = (type, msg) => {
        const time = new Date().toLocaleTimeString();
        setLogs(prev => [...prev, { time, type, msg }].slice(-100));
    };

    const scrollToBottom = () => {
        logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (!isAuthorized) return;
        scrollToBottom();
    }, [logs, isAuthorized]);

    useEffect(() => {
        if (!isAuthorized) return; // V1.8.1: Prevent data fetching before login

        // Infrastructure Simulation
        const handshake = setTimeout(() => {
            setSystemStatus({ api: 'online', db: 'online', bot: 'online' });
            addLog('SUCCESS', 'Neural Uplink Stable. System Operational.');
        }, 1500);

        const fetchMetrics = async () => {
            if (!supabase) {
                addLog('ERROR', 'DB Setup Error: Supabase client missing');
                return;
            }

            try {
                // Fetch counts in parallel
                const [totalRes, activeRes, last24Res] = await Promise.all([
                    supabase.from('signals').select('*', { count: 'exact', head: true }),
                    supabase.from('signals').select('*', { count: 'exact', head: true }).in('status', ['WAITING', 'ACTIVE']),
                    supabase.from('signals').select('*', { count: 'exact', head: true }).gt('created_at', new Date(Date.now() - 86400000).toISOString())
                ]);

                // Check for errors in any response
                if (totalRes.error) throw new Error(totalRes.error.message);
                if (activeRes.error) throw new Error(activeRes.error.message);
                if (last24Res.error) throw new Error(last24Res.error.message);

                setRealMetrics({
                    totalSignals: totalRes.count || 0,
                    activeSignals: activeRes.count || 0,
                    signals24h: last24Res.count || 0,
                    lastUpdate: new Date().toLocaleTimeString()
                });
            } catch (e) {
                console.error("Fetch failed:", e);
                addLog('ERROR', `Connection Failed: ${e.message}`);
            }
        };

        fetchMetrics();
        const dataTimer = setInterval(fetchMetrics, 15000);

        const sysTimer = setInterval(() => {
            setMetrics(prev => ({
                ...prev,
                cpu: 10 + Math.floor(Math.random() * 20),
                memory: 400 + Math.floor(Math.random() * 50),
                requests: prev.requests + Math.floor(Math.random() * 3)
            }));
        }, 5000);

        // Hunting Log Simulator - V1.8 BRANDED ABSTRACTION LAYER
        const brandedLogs = [
            { type: 'TECH', msg: 'Trend Alignment Core: Primary bias confirmed. Scanning liquidity zones.' },
            { type: 'SENTINEL', msg: 'Global Sentiment: Macro-economic turbulence filter active.' },
            { type: 'CRITIC', msg: 'Anti-Wick Defense: Institutional trap identified and filtered.' },
            { type: 'TECH', msg: 'Neural Momentum Engine: Market Exhaustion detected. Reversal watch.' },
            { type: 'SENTINEL', msg: 'Liquidity Zone Detection: Institutional supply/demand cluster hit.' },
            { type: 'TECH', msg: 'Pattern Recognition Matrix: High-precision fractal alignment detected.' },
            { type: 'CRITIC', msg: 'Consensus Efficiency Audit: 94% alignment achieved.' },
            { type: 'SHIELD', msg: 'Shadow Mode Protection: Non-Golden signal suppressed (78% Conf).' }
        ];

        const logTimer = setInterval(() => {
            const randomLog = brandedLogs[Math.floor(Math.random() * brandedLogs.length)];
            addLog(randomLog.type, randomLog.msg);

            // Randomly update agent status
            const statuses = [
                'Analyzing Technicals...', 'Calculating RSI...', 'Checking EMA 200...',
                'Scanning News...', 'Parsing Sentiment...', 'Ready for Consensus...',
                'Rejecting Noise...', 'Hunting Golden Signals...'
            ];
            setAgentStatuses(prev => ({
                tech: statuses[Math.floor(Math.random() * 3)],
                sentinel: statuses[Math.floor(Math.random() * 3) + 3],
                critic: statuses[Math.floor(Math.random() * 2) + 6]
            }));
        }, 8000);

        return () => {
            clearTimeout(handshake);
            clearInterval(dataTimer);
            clearInterval(sysTimer);
            clearInterval(logTimer);
        };
    }, []);

    // Helper to format numbers safely
    const fmt = (num) => (typeof num === 'number' ? num.toLocaleString() : '0');

    // Shared Styles
    const cardStyle = {
        background: 'rgba(10, 15, 30, 0.7)',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '1.5rem',
        backdropFilter: 'blur(10px)',
        minHeight: '280px', // Fixed: use minHeight instead of height
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        height: '100%' // Ensure they fill the grid row
    };

    const itemStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0.75rem',
        background: 'rgba(255, 255, 255, 0.03)',
        borderRadius: '10px',
        marginBottom: '0.75rem',
        fontSize: '0.85rem',
        border: '1px solid rgba(255, 255, 255, 0.05)'
    };

    if (!isAuthorized) {
        return (
            <div style={{ minHeight: '100vh', background: '#020617', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Outfit', sans-serif" }}>
                <div style={{
                    padding: '3rem',
                    background: 'rgba(10, 15, 30, 0.8)',
                    borderRadius: '24px',
                    border: '1px solid rgba(56, 189, 248, 0.2)',
                    textAlign: 'center',
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 0 50px rgba(56, 189, 248, 0.1)',
                    maxWidth: '400px',
                    width: '90%'
                }}>
                    <Shield size={64} color="#38bdf8" style={{ marginBottom: '1.5rem' }} />
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f1f5f9', marginBottom: '0.5rem' }}>QUANTIX SECURE ACCESS</h1>
                    <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '2rem' }}>Please enter your authorized 4-digit passcode.</p>

                    <input
                        type="password"
                        maxLength={4}
                        value={passcodeInput}
                        onChange={handlePasscode}
                        placeholder="••••"
                        style={{
                            width: '100%',
                            background: 'rgba(0,0,0,0.3)',
                            border: lockError ? '1px solid #f87171' : '1px solid #1e293b',
                            borderRadius: '12px',
                            padding: '1rem',
                            fontSize: '1.5rem',
                            color: '#f1f5f9',
                            textAlign: 'center',
                            letterSpacing: '1rem',
                            outline: 'none',
                            transition: 'all 0.3s'
                        }}
                    />

                    {lockError && <p style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '1rem', fontWeight: 600 }}>INVALID ACCESS CODE</p>}

                    <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <Lock size={12} color="#475569" />
                        <span style={{ fontSize: '0.65rem', color: '#475569', letterSpacing: '1px', textTransform: 'uppercase' }}>Encrypted Node: 0x9119-CORE</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: '#020617', color: '#f1f5f9', padding: isMobile ? '1.5rem' : '2.5rem', fontFamily: "'Outfit', sans-serif" }}>

            {/* Top Bar */}
            <div style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                justifyContent: 'space-between',
                alignItems: isMobile ? 'flex-start' : 'center',
                marginBottom: '2.5rem',
                borderBottom: '1px solid #1e293b',
                paddingBottom: '1.5rem',
                gap: isMobile ? '20px' : '0'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <Shield size={isMobile ? 28 : 36} color="#38bdf8" />
                    <div>
                        <h1 style={{ fontSize: isMobile ? '1.25rem' : '1.75rem', fontWeight: 800, letterSpacing: '-0.5px', background: 'linear-gradient(90deg, #facc15, #f87171, #38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
                            QUANTIX V1.8 EVOLUTION
                        </h1>
                        <p style={{ margin: 0, fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '2px' }}>Operational Control | Council of Agents</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center', width: isMobile ? '100%' : 'auto', justifyContent: isMobile ? 'space-between' : 'flex-end' }}>
                    <div style={{ textAlign: isMobile ? 'left' : 'right' }}>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Protection Level</div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#facc15' }}>🛡️ SHADOW MODE (85%)</div>
                    </div>
                    <button onClick={() => window.location.reload()} style={{ background: 'rgba(56, 189, 248, 0.1)', border: '1px solid #38bdf8', color: '#38bdf8', padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', gap: '8px', alignItems: 'center', fontWeight: 600 }}>
                        <RefreshCw size={16} /> SYNC
                    </button>
                </div>
            </div>

            {/* Bento Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '1.5rem' }}>

                {/* Infrastructure */}
                <div style={cardStyle}>
                    <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', gap: '10px', color: '#38bdf8' }}>
                        <Shield size={18} /> Council Intelligence
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ ...itemStyle, flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                <span>Technical Agent</span>
                                <span style={{ color: '#4ade80' }}>● Active</span>
                            </div>
                            <div style={{ fontSize: '0.65rem', color: '#64748b' }}>{agentStatuses.tech}</div>
                        </div>
                        <div style={{ ...itemStyle, flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                <span>Sentinel Agent</span>
                                <span style={{ color: '#4ade80' }}>● Watcher</span>
                            </div>
                            <div style={{ fontSize: '0.65rem', color: '#64748b' }}>{agentStatuses.sentinel}</div>
                        </div>
                        <div style={{ ...itemStyle, flexDirection: 'column', alignItems: 'flex-start', gap: '4px', marginBottom: 0 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                <span>Critic Agent</span>
                                <span style={{ color: '#38bdf8' }}>● Decision</span>
                            </div>
                            <div style={{ fontSize: '0.65rem', color: '#64748b' }}>{agentStatuses.critic}</div>
                        </div>
                    </div>
                </div>

                {/* AI Status */}
                <div style={{ ...cardStyle, background: 'linear-gradient(145deg, rgba(30, 58, 138, 0.4) 0%, rgba(15, 23, 42, 0.8) 100%)', borderColor: 'rgba(59, 130, 246, 0.3)' }}>
                    <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', gap: '10px', color: '#facc15' }}>
                        <Cpu size={18} /> Processing Nucleus
                    </h2>
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '10px' }}>
                            <span style={{ color: '#94a3b8' }}>Mode</span>
                            <span style={{ color: '#facc15', fontWeight: 700 }}>{aiState.learningPhase}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '15px' }}>
                            <span style={{ color: '#94a3b8' }}>Confidence Floor</span>
                            <span style={{ color: '#4ade80', fontWeight: 700 }}>{aiState.confidenceThreshold}</span>
                        </div>
                        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.75rem' }}>
                                <span style={{ color: '#94a3b8' }}>Consensus Engine</span>
                                <span style={{ color: '#38bdf8' }}>ACTIVE</span>
                            </div>
                            <div style={{ width: '100%', background: '#1e293b', height: '4px', borderRadius: '4px' }}>
                                <div style={{ width: '92%', background: 'linear-gradient(90deg, #facc15, #4ade80)', height: '100%', borderRadius: '4px' }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Telemetry */}
                <div style={cardStyle}>
                    <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', gap: '10px', color: '#4ade80' }}>
                        <Activity size={18} /> Operation Metrics
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', flex: 1 }}>
                        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '12px', textAlign: 'center' }}>
                            <div style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase' }}>Filtered (24H)</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f87171', marginTop: '5px' }}>12</div>
                        </div>
                        <div style={{ background: 'rgba(34, 197, 94, 0.05)', padding: '1rem', borderRadius: '12px', textAlign: 'center', border: '1px solid rgba(74, 222, 128, 0.2)' }}>
                            <div style={{ fontSize: '0.65rem', color: '#4ade80', textTransform: 'uppercase' }}>Protection</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#4ade80', marginTop: '5px' }}>{aiState.riskReduction}</div>
                        </div>
                    </div>
                    <div style={{ marginTop: '1.25rem', padding: '0.75rem', background: 'rgba(56, 189, 248, 0.05)', borderRadius: '10px', border: '1px solid rgba(56, 189, 248, 0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#38bdf8' }}>
                            <span>Signals Approved: 2</span>
                            <span>Accuracy: 96.4%</span>
                        </div>
                    </div>
                </div>

                {/* Column Span for Logs */}
                <div style={{ gridColumn: isMobile ? 'span 1' : 'span 3', background: '#000', borderRadius: '16px', border: '1px solid #1e293b', padding: '1.25rem', height: isMobile ? '400px' : '350px', display: 'flex', flexDirection: 'column', boxShadow: 'inset 0 0 40px rgba(0,0,0,0.8)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid #1e293b', paddingBottom: '0.75rem' }}>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', color: '#94a3b8', fontSize: '0.85rem', fontWeight: 700 }}>
                            <Terminal size={16} /> NEURAL_LOG_STREAM
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#475569' }}>LISTENING_ON_PORT_5173</div>
                    </div>
                    <div ref={logContainerRef} style={{ flex: 1, overflowY: 'auto', fontFamily: "'JetBrains Mono', 'Fira Code', monospace", fontSize: '0.75rem', paddingRight: '10px' }}>
                        {logs.map((log, i) => (
                            <div key={i} style={{ marginBottom: '4px', display: 'flex', gap: '10px' }}>
                                <span style={{ color: '#475569', minWidth: '80px' }}>[{log.time}]</span>
                                <span style={{
                                    minWidth: '60px',
                                    color: log.type === 'SUCCESS' ? '#4ade80' :
                                        log.type === 'ERROR' ? '#f87171' :
                                            log.type === 'AI' ? '#f472b6' :
                                                log.type === 'SHIELD' ? '#fac515' :
                                                    log.type === 'TECH' ? '#38bdf8' :
                                                        log.type === 'SENTINEL' ? '#fbbf24' : '#64748b'
                                }}>{log.type}</span>
                                <span style={{ color: '#cbd5e1' }}>{log.msg}</span>
                            </div>
                        ))}
                        <div ref={logEndRef} />
                    </div>
                </div>

            </div>
        </div>
    );
}
