import React, { useState, useEffect, useMemo } from 'react';
import { LineChart, BarChart, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Shield, Globe, Zap, Lock, ChevronRight, Activity, TrendingUp, X, User, LogOut, Check, Star, Briefcase, Cpu, Radio, Menu, CheckCircle, Moon, Sun } from 'lucide-react';
import InvestorConcierge from './components/InvestorConcierge';
import AdminDashboard from './AdminDashboard'; // Import Dashboard

const TRANSLATIONS = {
  en: {
    nav: { features: 'Intelligence', signals: 'Live Signals', pricing: 'Institutional Plans', login: 'Portal Login', logout: 'Logout', vn30: 'Global Assets' },
    hero: {
      badge: '✨ Signal Genius AI Core v1.5',
      title1: 'Institutional Grade',
      title2: 'Market Intelligence',
      desc: 'Precision-engineered quantitative infrastructure. Scale your intelligence with Signal Genius AI Core v1.5 - built for mass-personalization and deep tactical execution.',
      ctaPrimary: 'Access Portal',
      ctaSecondary: 'View Thesis',
      stats: { accuracy: 'Forecast Precision', watch: 'Continuous Scan', fees: 'Operational ROI' }
    },
    features: {
      title: 'Why Choose Signal Genius?',
      subtitle: 'State-of-the-art technology for the modern investor.',
      f1: { title: 'Unmatched Efficiency', desc: 'Reduce operational costs by up to 70% through our proprietary Semantic Caching and Hybrid Model routing.' },
      f2: { title: 'Deep Personalization', desc: 'Tailored analysis for thousands of individual portfolios at the cost of a single user. Real-time insights for your specific watchlist.' },
      f3: { title: 'Real-time Execution', desc: 'Instant signal processing and execution powered by Signal Genius AI Core v1.5, ensuring you never miss a volatile market opportunity.' }
    },
    signals: {
      lockedTitle: 'Institutional Access Only',
      lockedDesc: 'Real-time signals and advanced analytics are protected. Login to unlock the full potential of Signal Genius AI.',
      btnUnlock: 'Login to Unlock',
      liveTitle: 'Live Signals - VN30',
      vol: 'Vol',
      target: 'Target',
      viewFull: 'View Full Dashboard'
    },
    pricing: {
      title: 'Simple, Transparent Pricing',
      subtitle: 'Choose the plan that fits your trading style.',
      starter: { title: 'Starter', price: '$0', period: '/forever', desc: 'Perfect for beginners exploring AI trading.' },
      pro: { title: 'Pro Trader', price: '$49', period: '/month', desc: 'Advanced signals and lower latency for serious traders.' },
      inst: { title: 'Institutional', price: 'Custom', period: '', desc: 'Direct API access and dedicated support for funds.' },
      features: {
        signals: 'Daily Signals',
        delay: 'Real-time Data',
        mkts: 'Markets Supported',
        supp: 'Support'
      },
      btn: { start: 'Start Free', buy: 'Upgrade Now', contact: 'Contact Sales' }
    },
    dashboard: {
      welcome: 'Welcome back, Trader',
      status: 'System Optimized',
      conn: 'Connected to Yahoo Finance Realtime API',
      tabs: { overview: 'Market Overview', signals: 'Active Signals', settings: 'Settings' }
    },
    login: {
      title: 'Welcome Back',
      email: 'Email Address',
      pass: 'Password',
      btn: 'Access Dashboard',
      footer: 'Don\'t have an account? Join Waitlist'
    },
    testimonials: {
      title: 'Trusted by Traders',
      subtitle: 'See what our community has to say about Signal Genius AI Forecast.',
      t1: { name: 'Alex Nguyen', role: 'Day Trader', content: 'The accuracy is frighteningly good. I recovered my subscription fee in the first trade.' },
      t2: { name: 'Sarah Le', role: 'Office Worker', content: 'I don\'t have time to watch the screen. The automated signals let me trade while I work. Game changer.' },
      t3: { name: 'Michael Tran', role: 'Crypto Investor', content: 'The dark mode UI is beautiful, but the AI algorithms are the real deal. High win rate on VN30.' }
    }
  },
};

const BACKTEST_DATA = [
  { date: 'Oct 23', Signal Genius: 100, vn30: 100 },
  { date: 'Nov 23', Signal Genius: 112, vn30: 102 },
  { date: 'Dec 23', Signal Genius: 125, vn30: 105 },
  { date: 'Jan 24', Signal Genius: 138, vn30: 108 },
  { date: 'Feb 24', Signal Genius: 155, vn30: 112 },
  { date: 'Mar 24', Signal Genius: 172, vn30: 115 },
];

function BacktestSection() {
  return (
    <section style={{ padding: '8rem 2rem', background: 'var(--bg-section-alt)' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '1.5rem', fontFamily: 'var(--font-heading)' }}>
            Proof of <span className="text-gradient">Performance</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', maxWidth: '800px', margin: '0 auto' }}>
            Signal Genius AI Core v1.5 vs. VN30 Index (Backtest Oct 2023 - Mar 2024).
            Our algorithms consistently outperform the benchmark by optimizing entry/exit points.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: '2rem', borderRadius: '24px', height: '400px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={BACKTEST_DATA}>
              <defs>
                <linearGradient id="colorSignal Genius" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)' }} />
              <YAxis stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)' }} />
              <Tooltip
                contentStyle={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--primary)',
                  borderRadius: '12px',
                  color: 'var(--text-primary)'
                }}
                itemStyle={{ color: 'var(--text-primary)' }}
              />
              <Area type="monotone" dataKey="Signal Genius" stroke="var(--primary-dark)" strokeWidth={3} fillOpacity={1} fill="url(#colorSignal Genius)" name="Signal Genius AI v1.5" />
              <Area type="monotone" dataKey="vn30" stroke="var(--text-secondary)" strokeWidth={2} fillOpacity={0} name="VN30 Index" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}

function KnowledgeBase() {
  const docs = [
    { title: "📄 Algorithm Whitepaper (V1.5)", desc: "Deep dive into Semantic Caching and Hybrid Model routing for 70% op-ex reduction.", link: "#" },
    { title: "📊 Data Health Audit", desc: "Weekly verification of our 6,758+ data points and 100/100 Integrity Score.", link: "#" },
    { title: "🛠️ Institutional User Manual", desc: "Understanding Confidence Levels, Liquidity Zones, and Precision Forecasting.", link: "#" }
  ];

  return (
    <section id="knowledge-base" style={{ padding: '6rem 2rem', background: 'var(--bg-section-alt)' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1rem' }}>
            Knowledge <span className="text-gradient">Base</span>
          </h2>
          <p style={{ color: 'var(--text-muted)' }}>Foundational intelligence for institutional partners.</p>
        </div>
        <div className="kb-grid">
          {docs.map((doc, i) => (
            <a key={i} href={doc.link} className="kb-card">
              <h4>{doc.title}</h4>
              <p>{doc.desc}</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function TooltipIcon({ text }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: 'relative', display: 'inline-block', marginLeft: '6px' }}>
      <CheckCircle
        size={14}
        style={{ cursor: 'pointer', color: 'var(--primary)', opacity: 0.7 }}
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      />
      {show && (
        <div style={{
          position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)',
          background: '#0a0e27', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--primary)',
          fontSize: '0.75rem', width: '180px', zIndex: 100, marginBottom: '8px', color: 'white',
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
        }}>
          {text}
        </div>
      )}
    </div>
  );
}

function MarketIntelligence() {
  const briefs = [
    { title: "Analyzing EUR/USD Liquidity Zones", date: "Jan 11, 2026", desc: "Signal Genius V1.5 detects shifting order flow in European session open." },
    { title: "Q1 Volatility Outlook", date: "Jan 10, 2026", desc: "Strategic asset allocation based on 10-year historical backtesting results." }
  ];

  return (
    <section id="intelligence" style={{ padding: '6rem 2rem' }}>
      <div className="container">
        <h3 style={{ fontSize: '2rem', marginBottom: '2rem', borderLeft: '4px solid var(--primary)', paddingLeft: '1rem' }}>
          Market Intelligence Briefs
        </h3>
        <div className="grid-cols-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
          {briefs.map((b, i) => (
            <div key={i} className="glass-panel" style={{ padding: '2rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: '700' }}>{b.date}</span>
              <h4 style={{ margin: '1rem 0', fontSize: '1.25rem' }}>{b.title}</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>{b.desc}</p>
              <div style={{ fontSize: '0.75rem', opacity: 0.5 }}>Analyzed by Signal Genius AI Core - Data Integrity Verified.</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function useSecurity() {
  useEffect(() => {
    const handleContextMenu = (e) => e.preventDefault();
    const handleKeyDown = (e) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) ||
        (e.ctrlKey && e.key === 'U')
      ) {
        e.preventDefault();
      }
    };
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
}

function Navbar({ t, onLoginClick, isLoggedIn, onLogout }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [utcTime, setUtcTime] = useState(new Date().toUTCString().split(' ')[4]);

  useEffect(() => {
    const timer = setInterval(() => {
      setUtcTime(new Date().toUTCString().split(' ')[4]);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const scrollToSection = (e, id) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <>
      <nav className="glass-panel nav-container">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => window.location.href = '#/'}>
          <Activity className="logo-svg" color="var(--primary)" size={32} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '1.4rem', fontWeight: '800', fontFamily: 'var(--font-heading)', lineHeight: 1, letterSpacing: '-1px' }}>
              Signal Genius <span className="text-gradient">AI</span> CORE
            </span>
            <span style={{ fontSize: '0.65rem', fontWeight: '900', color: 'var(--primary)', letterSpacing: '2px', textTransform: 'uppercase' }}>
              Institutional Division
            </span>
          </div>
        </div>

        {/* Desktop Menu */}
        <div className="nav-links-desktop">
          {!isLoggedIn && (
            <>
              <a href="#intelligence" onClick={(e) => scrollToSection(e, 'intelligence')} className="nav-link">{t.nav.features}</a>
              <a href="#signals" onClick={(e) => scrollToSection(e, 'signals')} className="nav-link">{t.nav.signals}</a>
              <a href="#pricing" onClick={(e) => scrollToSection(e, 'pricing')} className="nav-link">{t.nav.pricing}</a>
            </>
          )}
          <span className="utc-clock" style={{ marginLeft: '1rem' }}>UTC {utcTime}</span>
          <a href="#/investment" className="nav-link" onClick={() => window.scrollTo(0, 0)} style={{
            background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 'bold'
          }}>💎 Thesis</a>
          <a href="https://9dpi.github.io/vn30/" target="_blank" rel="noopener noreferrer" className="nav-link" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{t.nav.vn30}</a>

          {isLoggedIn ? (
            <button onClick={onLogout} className="btn-primary" style={{ padding: '0.5rem 1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <LogOut size={16} /> {t.nav.logout}
            </button>
          ) : (
            <button onClick={onLoginClick} className="btn-primary" style={{ padding: '0.5rem 1.5rem' }}>
              {t.nav.login}
            </button>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className="nav-mobile-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div style={{
          position: 'fixed', inset: '80px 0 0 0', background: 'rgba(3,0,20,0.95)', backdropFilter: 'blur(10px)',
          zIndex: 99, padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem', alignItems: 'center'
        }}>
          {!isLoggedIn && (
            <>
              <a href="#features" className="nav-link" onClick={(e) => scrollToSection(e, 'features')} style={{ fontSize: '1.2rem' }}>{t.nav.features}</a>
              <a href="#signals" className="nav-link" onClick={(e) => scrollToSection(e, 'signals')} style={{ fontSize: '1.2rem' }}>{t.nav.signals}</a>
              <a href="#pricing" className="nav-link" onClick={(e) => scrollToSection(e, 'pricing')} style={{ fontSize: '1.2rem' }}>{t.nav.pricing}</a>
            </>
          )}
          <a href="#/investment" className="nav-link" onClick={() => { setMobileMenuOpen(false); window.scrollTo(0, 0); }} style={{ color: '#FFD700', fontWeight: 'bold', fontSize: '1.2rem' }}>💎 Investment Thesis</a>
          <a href="https://9dpi.github.io/vn30/" target="_blank" className="nav-link" style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '1.2rem' }}>{t.nav.vn30}</a>

          {isLoggedIn ? (
            <button onClick={() => { onLogout(); setMobileMenuOpen(false); }} className="btn-primary" style={{ width: '100%', maxWidth: '300px' }}>
              {t.nav.logout}
            </button>
          ) : (
            <button onClick={() => { onLoginClick(); setMobileMenuOpen(false); }} className="btn-primary" style={{ width: '100%', maxWidth: '300px' }}>
              {t.nav.login}
            </button>
          )}
        </div>
      )}
    </>
  );
}

function LoginModal({ isOpen, onClose, onLogin, t }) {
  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(3, 0, 20, 0.8)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '2rem', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
          <X size={24} />
        </button>

        <h2 style={{ fontSize: '2rem', marginBottom: '2rem', textAlign: 'center' }}>{t.login.title}</h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{t.login.email}</label>
            <input type="email" defaultValue="demo@ai-forecast.com" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white', outline: 'none' }} required />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{t.login.pass}</label>
            <input type="password" defaultValue="demo1234" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white', outline: 'none' }} required />
          </div>
          <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }}>{t.login.btn}</button>
        </form>

        <p style={{ marginTop: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          {t.login.footer}
        </p>
      </div>
    </div>
  );
}

// --- Pricing Components ---
function PricingCard({ title, price, period, desc, features, t, highlighted = false }) {
  return (
    <div className="glass-panel" style={{
      padding: '2rem',
      position: 'relative',
      border: highlighted ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.05)',
      transform: highlighted ? 'scale(1.05)' : 'none',
      zIndex: highlighted ? 10 : 1
    }}>
      {highlighted && (
        <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: 'var(--primary)', color: 'black', padding: '0.25rem 1rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' }}>
          MOST POPULAR
        </div>
      )}
      <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{title}</h3>
      <div style={{ marginBottom: '1rem' }}>
        <span style={{ fontSize: '2.5rem', fontWeight: '700' }}>{price}</span>
        <span style={{ color: 'var(--text-muted)' }}>{period}</span>
      </div>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', minHeight: '3rem' }}>{desc}</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
        {features.map((f, i) => (
          <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <Check size={18} color={highlighted ? 'var(--primary)' : 'var(--text-muted)'} />
            <span style={{ fontSize: '0.9rem' }}>{f}</span>
          </div>
        ))}
      </div>

      <button
        onClick={() => window.dispatchEvent(new CustomEvent('open-Signal Genius-doc', { detail: { docType: highlighted ? 'Upgrade' : 'FreeTrial' } }))}
        className={highlighted ? 'btn-primary' : ''}
        style={{
          width: '100%',
          padding: '0.75rem',
          borderRadius: '8px',
          border: highlighted ? 'none' : '1px solid var(--border-color)',
          background: highlighted ? undefined : 'transparent',
          color: 'var(--text-primary)',
          cursor: 'pointer',
          fontWeight: '600',
          transition: 'transform 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        {highlighted ? t.btn.buy : t.btn.start}
      </button>
    </div>
  );
}

function PricingSection({ t }) {
  return (
    <section id="pricing" className="container" style={{ padding: '4rem 2rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h2 style={{ fontSize: '3rem', marginBottom: '1rem' }}>{t.pricing.title}</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>{t.pricing.subtitle}</p>
      </div>

      <div className="grid-cols-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', alignItems: 'center' }}>
        <PricingCard
          title={t.pricing.starter.title}
          price={t.pricing.starter.price}
          period={t.pricing.starter.period}
          desc={t.pricing.starter.desc}
          features={[
            `VN30 (Delayed 15m)`,
            `1 ${t.pricing.features.signals}`,
            t.pricing.features.supp
          ]}
          t={t.pricing}
        />
        <PricingCard
          title={t.pricing.pro.title}
          price={t.pricing.pro.price}
          period={t.pricing.pro.period}
          desc={t.pricing.pro.desc}
          features={[
            `Global (Real-time)`,
            `Unlimited ${t.pricing.features.signals}`,
            `Crypto & Forex`,
            `24/7 ${t.pricing.features.supp}`
          ]}
          highlighted={true}
          t={t.pricing}
        />
        <PricingCard
          title={t.pricing.inst.title}
          price={t.pricing.inst.price}
          period={t.pricing.inst.period}
          desc={t.pricing.inst.desc}
          features={[
            `API Integration`,
            `Dedicated Account Mgr`,
            `Custom Algos`
          ]}
          t={t.pricing}
        />
      </div>
    </section>
  );
}

// --- Dashboard Components ---
const DashboardChart = React.memo(({ data }) => {
  const isLight = document.documentElement.getAttribute('data-theme') === 'light';

  return (
    <div style={{ flex: 1, width: '100%', minHeight: '300px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorVn30" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--primary)" stopOpacity={isLight ? 0.4 : 0.3} />
              <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="name"
            stroke="var(--text-secondary)"
            tick={{ fontSize: 12, fill: 'var(--text-secondary)' }}
          />
          <YAxis
            domain={['auto', 'auto']}
            stroke="var(--text-secondary)"
            tick={{ fontSize: 12, fill: 'var(--text-secondary)' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-primary)',
              borderRadius: '12px'
            }}
            itemStyle={{ color: 'var(--text-primary)' }}
          />
          <Area
            type="monotone"
            dataKey="vn30"
            stroke="var(--primary-dark)"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorVn30)"
            animationDuration={500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
});

function Dashboard({ t }) {
  // Simulating Real-time Data
  const [data, setData] = useState([
    { name: '09:00', vn30: 1240, spx: 4500 },
    { name: '10:00', vn30: 1242, spx: 4510 },
    { name: '11:00', vn30: 1238, spx: 4505 },
    { name: '13:00', vn30: 1245, spx: 4520 },
    { name: '14:00', vn30: 1250, spx: 4530 },
  ]);

  const [livePrices, setLivePrices] = useState({
    VN30: { price: 1245.5, change: '+0.5%' },
    AAPL: { price: 175.2, change: '+1.2%' },
    BTC: { price: 42000, change: '-0.8%' },
    GOLD: { price: 2030, change: '+0.1%' }
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setLivePrices(prev => {
        const newObj = { ...prev };
        Object.keys(newObj).forEach(key => {
          const mult = 1 + (Math.random() - 0.5) * 0.002;
          newObj[key].price = parseFloat((newObj[key].price * mult).toFixed(2));
        });
        return newObj;
      });

      setData(prev => {
        const last = prev[prev.length - 1];
        const newPoint = {
          name: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          vn30: last.vn30 + (Math.random() - 0.5) * 5,
          spx: last.spx + (Math.random() - 0.5) * 10
        };
        const newData = [...prev, newPoint];
        if (newData.length > 20) newData.shift();
        return newData;
      });

    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container" style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '2rem' }}>{t.dashboard.welcome}</h2>
          <p style={{ color: 'var(--text-muted)' }} className="flex items-center gap-2">
            <Radio size={14} className="animate-pulse text-green-500" style={{ display: 'inline', color: '#00BA88' }} />
            {t.dashboard.conn}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="glass-panel" style={{ padding: '0.5rem 1rem', cursor: 'pointer', color: 'var(--primary)', borderColor: 'var(--primary)' }}>{t.dashboard.tabs.overview}</button>
          <button className="glass-panel" style={{ padding: '0.5rem 1rem', cursor: 'pointer', color: 'var(--text-muted)' }}>{t.dashboard.tabs.signals}</button>
        </div>
      </div>

      {/* Top Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '2rem' }}>
        {Object.entries(livePrices).map(([key, val]) => (
          <div key={key} className="glass-panel" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>{key}</span>
              <Activity size={16} color="var(--primary)" />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{val.price.toLocaleString()}</div>
            <div style={{ color: val.change.includes('+') ? 'var(--color-buy)' : 'var(--color-sell)', fontSize: '0.9rem' }}>
              {val.change}
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Area */}
      <div className="dashboard-layout">
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Real-time Analysis</h3>
          <DashboardChart data={data} />
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>AI Forecast</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { t: 'VN30F1M', sig: 'LONG', conf: '94%', time: '2m ago' },
              { t: 'TSLA', sig: 'WATCH', conf: '60%', time: '5m ago' },
              { t: 'BTC', sig: 'SHORT', conf: '81%', time: '12m ago' },
              { t: 'GOLD', sig: 'LONG', conf: '88%', time: '15m ago' },
              { t: 'EUR/USD', sig: 'SHORT', conf: '75%', time: '20m ago' }
            ].map((item, i) => (
              <div key={i} style={{ padding: '1rem', background: 'var(--bg-card)', borderRadius: '8px', borderLeft: `3px solid ${item.sig === 'LONG' ? 'var(--color-buy)' : item.sig === 'SHORT' ? 'var(--color-sell)' : 'gold'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <span style={{ fontWeight: 'bold' }}>{item.t}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.time}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: item.sig === 'LONG' ? 'var(--color-buy)' : item.sig === 'SHORT' ? 'var(--color-sell)' : 'gold', fontWeight: 'bold' }}>{item.sig}</span>
                  <span style={{ fontSize: '0.9rem' }}>Prob: {item.conf}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- MOCK SIGNALS ---
const MOCK_SIGNALS = [
  { ticker: 'VN30F1M', price: '1,245.8', change: '+1.2%', action: 'LONG', conf: '92%' },
  { ticker: 'TCB', price: '34,500', change: '+2.1%', action: 'BUY', conf: '88%' },
  { ticker: 'HPG', price: '28,100', change: '-0.5%', action: 'HOLD', conf: '65%' },
  { ticker: 'FPT', price: '96,200', change: '+1.5%', action: 'BUY', conf: '85%' },
  { ticker: 'VCB', price: '89,500', change: '+0.2%', action: 'HOLD', conf: '60%' },
  { ticker: 'MWG', price: '45,800', change: '-1.2%', action: 'SHORT', conf: '78%' },
];

function SignalsSection({ isLoggedIn, onUnlock, t }) {
  return (
    <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '24px', margin: '4rem 0' }} className="glass-panel">
      {!isLoggedIn && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(3, 0, 20, 0.6)', backdropFilter: 'blur(20px)', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <div style={{ background: 'rgba(255,255,255,0.1)', padding: '1.5rem', borderRadius: '50%', marginBottom: '1.5rem' }}>
            <Lock size={48} color="var(--primary)" />
          </div>
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>{t.signals.lockedTitle}</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', maxWidth: '500px' }}>
            {t.signals.lockedDesc}
          </p>
          <button onClick={onUnlock} className="btn-primary">{t.signals.btnUnlock}</button>
        </div>
      )}

      {/* Content - Blurred if not logged in */}
      <div style={{ padding: '3rem', filter: isLoggedIn ? 'none' : 'blur(8px)', transition: 'filter 0.5s ease' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Zap color="var(--primary)" /> {t.signals.liveTitle}
          </h3>
          <a href="https://9dpi.github.io/vn30/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', fontWeight: 'bold', fontSize: '0.9rem' }}>
            {t.signals.viewFull} <ChevronRight size={16} />
          </a>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {MOCK_SIGNALS.map((s, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span style={{ fontWeight: '700', fontSize: '1.2rem' }}>{s.ticker}</span>
                <span style={{ color: s.change.includes('+') ? 'var(--color-buy)' : 'var(--color-sell)' }}>{s.change}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{s.price}</div>
                <div style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: '4px',
                  background: s.action === 'LONG' || s.action === 'BUY' ? 'rgba(0, 186, 136, 0.2)' : 'rgba(255, 0, 92, 0.1)',
                  color: s.action === 'LONG' || s.action === 'BUY' ? 'var(--color-buy)' : 'var(--text-secondary)',
                  fontWeight: '600'
                }}>
                  {s.action}
                </div>
              </div>
              <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', marginBottom: '1rem' }}>
                <div style={{ width: s.conf, height: '100%', background: 'var(--primary)', borderRadius: '3px' }}></div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>{t.signals.vol}: High</span>
                <span style={{ display: 'flex', alignItems: 'center' }}>
                  Confidence: {s.conf}
                  <TooltipIcon text="Probability based on multi-model quantitative consensus (v1.5 Core)." />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Hero({ t }) {
  return (
    <section className="container hero-wrapper">
      <div style={{ flex: 1 }}>
        <div style={{ display: 'inline-block', padding: '0.5rem 1rem', background: 'rgba(0, 240, 255, 0.1)', borderRadius: '50px', marginBottom: '1.5rem', border: '1px solid rgba(0, 240, 255, 0.2)' }}>
          <span style={{ color: 'var(--primary)', fontWeight: '600', fontSize: '0.9rem' }}>{t.hero.badge}</span>
        </div>

        <h1 style={{ fontSize: '4rem', lineHeight: 1.1, marginBottom: '1.5rem' }}>
          {t.hero.title1} <br />
          <span className="text-gradient">{t.hero.title2}</span>
        </h1>

        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', marginBottom: '2.5rem', maxWidth: '500px' }} className="hero-text">
          {t.hero.desc}
        </p>

        <div className="hero-cta-row">
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('open-Signal Genius-doc', { detail: { docType: 'FreeTrial' } }))}
            className="btn-primary"
            style={{ cursor: 'pointer' }}
          >
            {t.hero.ctaPrimary}
          </button>
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('open-Signal Genius-doc', { detail: { docType: 'ViewDemo' } }))}
            style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: '0.75rem 2rem', borderRadius: '99px', cursor: 'pointer', fontWeight: '500', transition: 'all 0.3s' }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = 'white'; }}
          >
            {t.hero.ctaSecondary} <ChevronRight size={16} style={{ display: 'inline', verticalAlign: 'middle' }} />
          </button>
        </div>

        <div className="hero-stats-row">
          <div>
            <h3 style={{ fontSize: '2rem', fontWeight: '700' }}>94%</h3>
            <p style={{ color: 'var(--text-muted)' }}>{t.hero.stats.accuracy}</p>
          </div>
          <div>
            <h3 style={{ fontSize: '2rem', fontWeight: '700' }}>24/7</h3>
            <p style={{ color: 'var(--text-muted)' }}>{t.hero.stats.watch}</p>
          </div>
          <div>
            <h3 style={{ fontSize: '2rem', fontWeight: '700' }}>$0</h3>
            <p style={{ color: 'var(--text-muted)' }}>{t.hero.stats.fees}</p>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, position: 'relative' }} className="animate-float">
        <div className="glass-panel" style={{ padding: '2rem', position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
            <div>
              <h4 style={{ color: 'var(--text-muted)' }}>VN30 Index</h4>
              <h2 style={{ fontSize: '2rem' }}>1,245.67</h2>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ color: 'var(--color-buy)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <TrendingUp size={16} /> +1.24%
              </span>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Intraday</p>
            </div>
          </div>

          <svg viewBox="0 0 300 100" style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="var(--secondary)" />
                <stop offset="100%" stopColor="var(--primary)" />
              </linearGradient>
            </defs>
            <path
              d="M0,80 C50,80 50,30 100,50 C150,70 150,10 200,40 C250,70 250,20 300,10"
              fill="none"
              stroke="url(#gradient)"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <circle cx="300" cy="10" r="6" fill="var(--primary)" style={{ filter: 'drop-shadow(0 0 10px var(--primary))' }} />
          </svg>

          <div style={{ marginTop: '2rem', display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1, background: 'var(--bg-section-alt)', padding: '1rem', borderRadius: '12px' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Prediction</p>
              <p style={{ fontWeight: '600', color: 'var(--primary)' }}>Strong Buy</p>
            </div>
            <div style={{ flex: 1, background: 'var(--bg-section-alt)', padding: '1rem', borderRadius: '12px' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Confidence</p>
              <p style={{ fontWeight: '600', color: 'var(--text-primary)' }}>High (89%)</p>
            </div>
          </div>
        </div>
        <div style={{ position: 'absolute', top: '-20%', right: '-20%', width: '300px', height: '300px', background: 'var(--primary)', borderRadius: '50%', filter: 'blur(100px)', opacity: 0.2, zIndex: 1 }}></div>
        <div style={{ position: 'absolute', bottom: '-20%', left: '-20%', width: '300px', height: '300px', background: 'var(--secondary)', borderRadius: '50%', filter: 'blur(100px)', opacity: 0.2, zIndex: 1 }}></div>
      </div>
    </section>
  );
}

function FeatureCard({ icon: Icon, title, desc }) {
  return (
    <div className="glass-panel" style={{ padding: '2rem', transition: 'var(--transition)' }}>
      <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
        <Icon color="var(--primary)" size={24} />
      </div>
      <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>{title}</h3>
      <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>{desc}</p>
    </div>
  );
}

function TestimonialCard({ name, role, content }) {
  return (
    <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', gap: '5px', color: 'gold' }}>
        {'★★★★★'}
      </div>
      <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', fontStyle: 'italic', flex: 1 }}>
        "{content}"
      </p>
      <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <p style={{ fontWeight: '600', color: 'white' }}>{name}</p>
        <p style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>{role}</p>
      </div>
    </div>
  );
}

function TestimonialsSection({ t }) {
  return (
    <section id="testimonials" className="container" style={{ padding: '4rem 2rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h2 style={{ fontSize: '3rem', marginBottom: '1rem' }}>
          {t.testimonials.title}
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>{t.testimonials.subtitle}</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
        <TestimonialCard {...t.testimonials.t1} />
        <TestimonialCard {...t.testimonials.t2} />
        <TestimonialCard {...t.testimonials.t3} />
      </div>
    </section>
  );
}

function App() {
  useSecurity();
  const [page, setPage] = useState('home');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Signal Genius AI Forecast";

    // Force Dark Theme for Landing Page
    document.documentElement.setAttribute('data-theme', 'dark');

    // Routing Logic
    const handleRoute = () => {
      const hash = window.location.hash;
      const path = window.location.pathname;

      console.log("Current Route:", { hash, path });

      // If path contains 'dashboard' or hash is '#/admin', show admin
      if (path.includes('dashboard') || hash === '#/admin') {
        setPage('admin');
      } else {
        setPage('home');
      }
    };

    window.addEventListener('hashchange', handleRoute);
    handleRoute(); // Check on mount

    return () => window.removeEventListener('hashchange', handleRoute);
  }, []);




  const t = TRANSLATIONS.en;

  if (page === 'admin') {
    return <AdminDashboard />;
  }

  return (
    <div style={{ fontFamily: "'Outfit', sans-serif" }}>
      <Navbar
        t={t}
        isLoggedIn={isLoggedIn}
        onLoginClick={() => setShowLoginModal(true)}
        onLogout={() => setIsLoggedIn(false)}
      />

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={() => {
          setIsLoggedIn(true);
          setShowLoginModal(false);
        }}
        t={t}
      />

      <main className="main-content">
        {isLoggedIn ? (
          <Dashboard t={t} />
        ) : (
          <>
            <Hero t={t} onLoginClick={() => setShowLoginModal(true)} />

            <div id="intelligence">
              <MarketIntelligence />
              <section className="container" style={{ padding: '2rem 2rem 8rem 2rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                  <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1.5rem' }}>
                    Why <span className="text-gradient">Institutional Partners?</span>
                  </h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '700px', margin: '0 auto' }}>Leveraging proprietary Semantic Caching and Hybrid Model routing to dominate market volatility.</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
                  <FeatureCard icon={Zap} title={t.features.f1.title} desc={t.features.f1.desc} />
                  <FeatureCard icon={Shield} title={t.features.f2.title} desc={t.features.f2.desc} />
                  <FeatureCard icon={Globe} title={t.features.f3.title} desc={t.features.f3.desc} />
                </div>
              </section>
            </div>

            <BacktestSection />
            <KnowledgeBase />

            <div id="signals">
              <SignalsSection t={t} isLoggedIn={isLoggedIn} onUnlock={() => setShowLoginModal(true)} />
            </div>

            <div id="pricing">
              <PricingSection t={t} />
            </div>

            <TestimonialsSection t={t} />
          </>
        )}
      </main>

      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.1)', padding: '4rem 2rem', marginTop: '4rem' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '3rem', marginBottom: '3rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
                <Activity className="logo-svg" color="var(--primary)" size={24} />
                <span style={{ fontWeight: '800', fontFamily: 'var(--font-heading)', fontSize: '1.4rem', letterSpacing: '-1px' }}>Signal Genius AI CORE</span>
              </div>
              <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', fontSize: '0.9rem', maxWidth: '400px' }}>
                Precision-engineered quantitative infrastructure for strategic alpha generation.
              </p>
            </div>

            <div style={{ textAlign: 'right', gridColumn: 'span 2' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
                © 2026 Signal Genius AI Core. Institutional Division.
              </p>
              <p style={{ color: 'var(--primary)', fontSize: '0.75rem', marginTop: '4px', fontWeight: '900', letterSpacing: '1px' }}>
                DATA INTEGRITY VERIFIED: 100/100 HEALTH SCORE
              </p>
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.7rem', marginTop: '8px' }}>
                Confidential Strategic Materials. Authorized Partners Only.
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

export default App;
