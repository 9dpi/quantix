import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, Zap, DollarSign, Calendar, FileText, Mail, Phone, Building2, ArrowRight, CheckCircle, Target, Briefcase, Activity } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import InvestorConcierge from './components/InvestorConcierge';

// Mock data for growth projections
const growthData = [
    { month: 'Q1 2026', users: 5000, revenue: 150 },
    { month: 'Q2 2026', users: 50000, revenue: 1200 },
    { month: 'Q3 2026', users: 120000, revenue: 3600 },
    { month: 'Q4 2026', users: 250000, revenue: 8500 },
    { month: 'Q1 2027', users: 500000, revenue: 18000 },
];

const marketData = [
    { segment: 'Individual', users: 3500000, conversion: 3 },
    { segment: 'Professional', users: 1200000, conversion: 8 },
    { segment: 'Institutional', users: 300000, conversion: 15 },
];

function InvestmentThesis() {
    useEffect(() => {
        window.scrollTo(0, 0);
        document.title = "Quantix AI Forecast | Investment Thesis";
    }, []);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        company: '',
        type: 'investor',
        message: ''
    });

    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await fetch("https://formsubmit.co/ajax/vuquangcuong@gmail.com", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    company: formData.company,
                    type: formData.type,
                    message: formData.message,
                    _subject: "New Investment Lead - Quantix AI Forecast"
                })
            });
            setSubmitted(true);
            setTimeout(() => setSubmitted(false), 5000);
        } catch (error) {
            console.error("Form submission error:", error);
            alert("There was an error sending your message. Please try again.");
        }
    };

    return (
        <div style={{ fontFamily: "'Outfit', sans-serif", background: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%)', minHeight: '100vh', color: 'white' }}>
            {/* HEADER */}
            <nav className="glass-panel nav-container">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => window.location.href = '#/'}>
                    <Activity color="var(--primary)" size={28} />
                    <span style={{ fontSize: '1.5rem', fontWeight: '700', fontFamily: 'var(--font-heading)' }}>
                        Quantix <span className="text-gradient">AI</span> Forecast
                    </span>
                </div>
                <a href="#/" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontWeight: '500' }}>
                    ← Back to Home
                </a>
            </nav>

            {/* HERO - Institutional Focus */}
            <section className="container" style={{ padding: '8rem 2rem 4rem', textAlign: 'center' }}>
                <div style={{
                    display: 'inline-block',
                    padding: '0.5rem 1.5rem',
                    background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                    borderRadius: '50px',
                    marginBottom: '2rem',
                    fontWeight: 'bold',
                    color: '#000',
                    fontSize: '0.9rem',
                    letterSpacing: '1px'
                }}>
                    💎 INSTITUTIONAL OPPORTUNITY
                </div>

                <h1 style={{ fontSize: '3.5rem', lineHeight: 1.1, marginBottom: '1.5rem', fontWeight: '800' }}>
                    Quantix AI Core v1.5: The Future of <br />
                    <span className="text-gradient">Mass-Personalized Wealth Management</span>
                </h1>

                <p style={{ fontSize: '1.4rem', color: 'var(--text-muted)', maxWidth: '900px', margin: '0 auto 3rem', lineHeight: 1.6 }}>
                    Bridging the gap between institutional-grade analytics and individual portfolios through cutting-edge AI efficiency.
                </p>

                <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button className="btn-primary" title="Coming Soon" style={{
                        padding: '1rem 2.5rem', fontSize: '1.1rem', background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                        color: '#000', cursor: 'not-allowed', fontWeight: 'bold'
                    }}>
                        Get Executive Summary
                    </button>
                    <button className="btn-primary" title="Coming Soon" style={{
                        padding: '1rem 2.5rem', fontSize: '1.1rem', background: 'transparent',
                        border: '2px solid #FFD700', color: '#FFD700', cursor: 'not-allowed', fontWeight: 'bold'
                    }}>
                        Book a Technical Deep-Dive
                    </button>
                </div>
            </section>

            {/* THE INVESTMENT THESIS (Bento Grid) */}
            <section className="container" style={{ padding: '6rem 2rem' }}>
                <h2 style={{ fontSize: '3rem', textAlign: 'center', marginBottom: '4rem', fontWeight: '800' }}>
                    The Investment <span className="text-gradient">Thesis</span>
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
                    <div className="glass-panel" style={{ padding: '2.5rem', borderTop: '4px solid #FFD700' }}>
                        <div style={{ background: 'rgba(255,215,0,0.1)', width: '60px', height: '60px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                            <Zap size={32} color="#FFD700" />
                        </div>
                        <h3 style={{ fontSize: '1.6rem', marginBottom: '1rem', color: '#FFD700' }}>Scalable Efficiency</h3>
                        <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, fontSize: '1.05rem' }}>
                            Our proprietary <strong>Semantic Caching</strong> technology allows Quantix v1.5 to serve 10,000+ users with the operational overhead of only 100. We reduce LLM token costs by up to <strong>70%</strong> while maintaining real-time precision.
                        </p>
                    </div>

                    <div className="glass-panel" style={{ padding: '2.5rem', borderTop: '4px solid #00BA88' }}>
                        <div style={{ background: 'rgba(0,186,136,0.1)', width: '60px', height: '60px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                            <Target size={32} color="#00BA88" />
                        </div>
                        <h3 style={{ fontSize: '1.6rem', marginBottom: '1rem', color: '#00BA88' }}>High-Fidelity Personalization</h3>
                        <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, fontSize: '1.05rem' }}>
                            Moving beyond generic market signals. Quantix AI Core focuses on the user's specific 'Niche'—providing deep-dive analysis only for the assets that matter to them. <strong>100% relevance, zero noise.</strong>
                        </p>
                    </div>

                    <div className="glass-panel" style={{ padding: '2.5rem', borderTop: '4px solid #00F0FF' }}>
                        <div style={{ background: 'rgba(0,240,255,0.1)', width: '60px', height: '60px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                            <Activity size={32} color="#00F0FF" />
                        </div>
                        <h3 style={{ fontSize: '1.6rem', marginBottom: '1rem', color: '#00F0FF' }}>Proven Track Record</h3>
                        <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, fontSize: '1.05rem' }}>
                            Built upon the success of v1.0, which specialized in <strong>VN30 blue-chips</strong>. Version 1.5 expands this intelligence to the entire market with enhanced predictive confidence.
                        </p>
                    </div>
                </div>
            </section>

            {/* PARTNERSHIP MODELS */}
            <section className="container" style={{ padding: '4rem 2rem' }}>
                <h2 style={{ fontSize: '3rem', textAlign: 'center', marginBottom: '3rem' }}>
                    Partnership <span style={{ color: '#FFD700' }}>Models</span>
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                    <div className="glass-panel" style={{ padding: '2rem' }}>
                        <Building2 size={36} color="#FFD700" style={{ marginBottom: '1rem' }} />
                        <h3 style={{ fontSize: '1.3rem', marginBottom: '1rem', color: '#FFD700' }}>Strategic Investor</h3>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: 1.6 }}>
                            Focusing on capital injection to complete v2.0 and expand infrastructure.
                        </p>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            {['Equity stake', 'Board seat (optional)', 'Strategic guidance', 'Network access'].map((item, i) => (
                                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
                                    <CheckCircle size={16} color="#FFD700" />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="glass-panel" style={{ padding: '2rem' }}>
                        <Users size={36} color="#00F0FF" style={{ marginBottom: '1rem' }} />
                        <h3 style={{ fontSize: '1.3rem', marginBottom: '1rem', color: '#00F0FF' }}>Affiliate Partners</h3>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: 1.6 }}>
                            For KOLs and Stock Brokers. Earn commissions from subscription fees.
                        </p>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            {['20-30% recurring commission', 'White-label options', 'Marketing support', 'Dedicated dashboard'].map((item, i) => (
                                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
                                    <CheckCircle size={16} color="#00F0FF" />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="glass-panel" style={{ padding: '2rem' }}>
                        <Briefcase size={36} color="#00BA88" style={{ marginBottom: '1rem' }} />
                        <h3 style={{ fontSize: '1.3rem', marginBottom: '1rem', color: '#00BA88' }}>Institutional API</h3>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: 1.6 }}>
                            Providing the Quantix core to funds or brokerage firms.
                        </p>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            {['Custom pricing', 'Dedicated infrastructure', 'SLA guarantee', 'Priority support'].map((item, i) => (
                                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
                                    <CheckCircle size={16} color="#00BA88" />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>

            {/* METRIC DASHBOARD */}
            <section className="container" style={{ padding: '4rem 2rem' }}>
                <h2 style={{ fontSize: '3rem', textAlign: 'center', marginBottom: '3rem' }}>
                    Market <span className="text-gradient">Metrics</span>
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
                    <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', borderBottom: '3px solid #00F0FF' }}>
                        <h3 style={{ fontSize: '3rem', color: '#00F0FF', marginBottom: '0.5rem' }}>5M</h3>
                        <p style={{ color: 'var(--text-muted)' }}>Target Market Size</p>
                        <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>Stock accounts in Vietnam</p>
                    </div>

                    <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', borderBottom: '3px solid #FFD700' }}>
                        <h3 style={{ fontSize: '3rem', color: '#FFD700', marginBottom: '0.5rem' }}>2-5%</h3>
                        <p style={{ color: 'var(--text-muted)' }}>Conversion Goal</p>
                        <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>Users converting to Premium</p>
                    </div>

                    <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', borderBottom: '3px solid #00BA88' }}>
                        <h3 style={{ fontSize: '3rem', color: '#00BA88', marginBottom: '0.5rem' }}>-70%</h3>
                        <p style={{ color: 'var(--text-muted)' }}>Cost Reduction</p>
                        <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>Semantic Caching Tech</p>
                    </div>
                </div>

                {/* Growth Chart */}
                <div className="glass-panel" style={{ padding: '2rem' }}>
                    <h3 style={{ fontSize: '1.5rem', marginBottom: '2rem', textAlign: 'center' }}>
                        Projected Growth Trajectory (2026-2027)
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={growthData}>
                            <defs>
                                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#00F0FF" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#FFD700" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#FFD700" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis dataKey="month" stroke="var(--text-muted)" />
                            <YAxis stroke="var(--text-muted)" />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#030014', borderColor: 'rgba(255,255,255,0.1)' }}
                                itemStyle={{ color: '#fff' }}
                            />
                            <Area type="monotone" dataKey="users" stroke="#00F0FF" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                            <Area type="monotone" dataKey="revenue" stroke="#FFD700" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                        </AreaChart>
                    </ResponsiveContainer>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '12px', height: '12px', background: '#00F0FF', borderRadius: '50%' }}></div>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Active Users</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '12px', height: '12px', background: '#FFD700', borderRadius: '50%' }}></div>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Revenue ($K)</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* STRATEGIC ROADMAP 2026 */}
            <section id="roadmap" className="container" style={{ padding: '6rem 2rem' }}>
                <h2 style={{ fontSize: '3rem', textAlign: 'center', marginBottom: '4rem', fontWeight: '800' }}>
                    Strategic Roadmap <span style={{ color: '#FFD700' }}>2026</span>
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                    {[
                        {
                            quarter: 'Q1: Market Dominance',
                            title: 'Current Phase',
                            items: ['Full Stock Market integration', 'Automated Payment Gateways', 'Launch of Signal Genius AI Premium'],
                            color: '#FFD700'
                        },
                        {
                            quarter: 'Q2: Growth & Acquisition',
                            title: 'Acquisition Surge',
                            items: ['Aggressive User Acquisition (Target: 50,000 active users)', 'Implementation of Affiliate Partner Program', 'Localized Community Operations'],
                            color: '#00F0FF'
                        },
                        {
                            quarter: 'Q3: Multi-Asset Expansion',
                            title: 'Global Scale',
                            items: ['Scaling Quantix Core to Forex, Crypto, and Global Commodities', 'B2B API Licensing for financial institutions', 'Regional Markets penetration'],
                            color: '#00BA88'
                        }
                    ].map((phase, i) => (
                        <div key={i} className="glass-panel" style={{
                            padding: '2.5rem',
                            borderBottom: `4px solid ${phase.color}`,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1rem'
                        }}>
                            <span style={{ color: phase.color, fontWeight: 'bold', fontSize: '1.1rem' }}>{phase.quarter}</span>
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{phase.title}</h3>
                            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                {phase.items.map((item, j) => (
                                    <li key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.95rem', color: 'rgba(255,255,255,0.8)' }}>
                                        <CheckCircle size={16} color={phase.color} style={{ marginTop: '4px', flexShrink: 0 }} />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </section>

            {/* FINANCIAL HIGHLIGHTS */}
            <section className="container" style={{ padding: '4rem 2rem' }}>
                <h2 style={{ fontSize: '2.5rem', textAlign: 'center', marginBottom: '4rem', fontWeight: '800' }}>
                    Financial <span className="text-gradient">Highlights</span>
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                    <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center' }}>
                        <Users size={40} color="#FFD700" style={{ marginBottom: '1.5rem' }} />
                        <h3 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>5M+</h3>
                        <p style={{ color: 'white', fontWeight: '600' }}>Addressable Market</p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '1rem' }}>Active trading accounts in Vietnam (Targeting ~2-5% migration).</p>
                    </div>

                    <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center' }}>
                        <TrendingUp size={40} color="#00BA88" style={{ marginBottom: '1.5rem' }} />
                        <h3 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>90%</h3>
                        <p style={{ color: 'white', fontWeight: '600' }}>Gross Margin</p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '1rem' }}>Projected per Premium user due to optimized AI infrastructure.</p>
                    </div>

                    <div className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center' }}>
                        <Briefcase size={40} color="#00F0FF" style={{ marginBottom: '1.5rem' }} />
                        <h3 style={{ fontSize: '2.2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Strategic Exit</h3>
                        <p style={{ color: 'white', fontWeight: '600' }}>M&A Potential</p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '1rem' }}>Acquisition by Securities Firms or expansion into Regional Neo-Brokerage.</p>
                    </div>
                </div>
            </section>

            {/* CONTACT FORM */}
            <section id="contact" className="container" style={{ padding: '6rem 2rem' }}>
                <div className="glass-panel" style={{
                    maxWidth: '800px',
                    margin: '0 auto',
                    padding: '4rem',
                    background: 'linear-gradient(135deg, rgba(255,215,0,0.05) 0%, rgba(0,240,255,0.05) 100%)',
                    borderRadius: '24px'
                }}>
                    <h2 style={{ fontSize: '2.5rem', textAlign: 'center', marginBottom: '1.5rem', fontWeight: '800' }}>
                        Interested in <span style={{ color: '#FFD700' }}>Joining Our Journey?</span>
                    </h2>
                    <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.9)', marginBottom: '3rem', fontSize: '1.1rem', lineHeight: 1.6 }}>
                        Our AI Concierge is ready to provide you with detailed financial models and our full Pitch Deck.
                        Please fill out the form below or use the chat for instant inquiries.
                    </p>

                    {submitted ? (
                        <div style={{
                            textAlign: 'center',
                            padding: '3rem',
                            background: 'rgba(0,186,136,0.1)',
                            borderRadius: '12px',
                            border: '1px solid #00BA88'
                        }}>
                            <CheckCircle size={48} color="#00BA88" style={{ marginBottom: '1rem' }} />
                            <h3 style={{ color: '#00BA88', marginBottom: '0.5rem' }}>Thank You!</h3>
                            <p style={{ color: 'var(--text-muted)' }}>We'll get back to you within 4 hours.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {/* FormSubmit Configuration */}
                            <input type="hidden" name="_captcha" value="false" />
                            <input type="hidden" name="_subject" value="🚀 [HOT LEAD] - Quantix Investor Inquiry" />
                            <input type="hidden" name="_autoresponse" value="Thank you for your interest in Quantix AI Core v1.5. Our team has received your inquiry and will send the Executive Summary and Financial Projections to this email within the next 4 hours." />

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                                <input
                                    type="text"
                                    placeholder="Your Name *"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    style={{
                                        padding: '1rem',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '8px',
                                        color: 'white',
                                        outline: 'none',
                                        fontSize: '1rem'
                                    }}
                                />
                                <input
                                    type="email"
                                    placeholder="Email Address *"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    style={{
                                        padding: '1rem',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '8px',
                                        color: 'white',
                                        outline: 'none',
                                        fontSize: '1rem'
                                    }}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                                <input
                                    type="text"
                                    placeholder="Your Role (Investor, Partner, etc.)"
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    style={{
                                        padding: '1rem',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '8px',
                                        color: 'white',
                                        outline: 'none',
                                        fontSize: '1rem'
                                    }}
                                />
                                <input
                                    type="text"
                                    placeholder="Organization"
                                    value={formData.organization}
                                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                                    style={{
                                        padding: '1rem',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '8px',
                                        color: 'white',
                                        outline: 'none',
                                        fontSize: '1rem'
                                    }}
                                />
                            </div>

                            <textarea
                                placeholder="Your Message or Investment Interest *"
                                rows={4}
                                required
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                style={{
                                    padding: '1rem',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '8px',
                                    color: 'white',
                                    outline: 'none',
                                    fontFamily: 'inherit',
                                    fontSize: '1rem'
                                }}
                            ></textarea>

                            <button
                                type="submit"
                                style={{
                                    padding: '1.2rem',
                                    background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                                    color: '#000',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    fontSize: '1.1rem',
                                    boxShadow: '0 4px 15px rgba(255, 215, 0, 0.2)'
                                }}
                            >
                                Submit Request
                            </button>
                        </form>
                    )}
                </div>
            </section>

            <section style={{ padding: '6rem 2rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="container" style={{ textAlign: 'center' }}>
                    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                        <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', fontWeight: '800' }}>Ready to Scale?</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '3rem', fontSize: '1.1rem' }}>
                            Download our confidential one-pager for a detailed technical breakdown of Quantix AI Core v1.5.
                        </p>

                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '12px',
                            background: 'rgba(255, 215, 0, 0.1)',
                            padding: '1rem 2rem',
                            borderRadius: '50px',
                            border: '1px solid rgba(255, 215, 0, 0.3)',
                            position: 'relative'
                        }} title="Coming Soon">
                            <FileText size={24} color="var(--primary)" />
                            <span style={{ fontWeight: 'bold' }}>Download Full One-Pager</span>
                            <span style={{
                                position: 'absolute', top: '-10px', right: '10px',
                                background: 'var(--primary)', color: 'black', padding: '2px 8px',
                                borderRadius: '10px', fontSize: '0.65rem', fontWeight: 'bold'
                            }}>COMING SOON</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer style={{ borderTop: '1px solid rgba(255,255,255,0.1)', padding: '4rem 2rem', marginTop: '4rem' }}>
                <div className="container">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '3rem', marginBottom: '3rem' }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
                                <Activity color="var(--primary)" size={24} />
                                <span style={{ fontWeight: '700', fontFamily: 'var(--font-heading)', fontSize: '1.2rem' }}>Signal Genius AI</span>
                            </div>
                            <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', fontSize: '0.9rem' }}>
                                Total Market Vision - Personalized Asset Focus. Institutional-grade quantitative infrastructure.
                            </p>
                        </div>

                        <div style={{ textAlign: 'right', gridColumn: 'span 2' }}>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
                                © 2026 Signal Genius AI.
                            </p>
                            <p style={{ color: 'var(--primary)', fontSize: '0.75rem', marginTop: '4px', fontWeight: '600' }}>
                                Powered by Quantix AI Core v1.5. Institutional Division.
                            </p>
                            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.7rem', marginTop: '8px' }}>
                                Confidential Investment Materials
                            </p>
                        </div>
                    </div>
                </div>
            </footer>

            {/* AI Concierge Chatbot */}
            <InvestorConcierge />
        </div>
    );
}

export default InvestmentThesis;
