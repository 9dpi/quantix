import React, { useState, useEffect } from 'react';
import { LineChart, Shield, Globe, Zap, Lock, ChevronRight, Activity, TrendingUp, X, User, LogOut } from 'lucide-react';

const TRANSLATIONS = {
  en: {
    nav: { features: 'Features', signals: 'Live Signals', pricing: 'Pricing', login: 'Login', logout: 'Logout' },
    hero: {
      badge: '✨ V1.0 Stable on VN30',
      title1: 'Predict the Future of',
      title2: 'Market Trends',
      desc: '100% Automated Stock Prediction System. Powered by advanced AI algorithms to analyze market volatility and execute precise signals.',
      ctaPrimary: 'Start Free Trial',
      ctaSecondary: 'View Demo',
      stats: { accuracy: 'Accuracy Rate', watch: 'Market Watch', fees: 'Hidden Fees' }
    },
    features: {
      title: 'Why Choose',
      subtitle: 'State-of-the-art technology for the modern investor.',
      f1: { title: 'Real-Time Execution', desc: 'Our algorithms process market data in milliseconds, ensuring you never miss a profitable entry point.' },
      f2: { title: 'Bank-Grade Security', desc: 'Your data and assets are protected by enterprise-level encryption and anti-scraping technology.' },
      f3: { title: 'Global Markets', desc: 'Scale your portfolio across NYSE, NASDAQ, and Crypto markets with a single unified dashboard.' }
    },
    signals: {
      lockedTitle: 'Member Access Only',
      lockedDesc: 'Real-time signals and advanced analytics are protected. Login to unlock the full potential of AI Smart Forecast.',
      btnUnlock: 'Login to Unlock',
      liveTitle: 'Live Trading Signals - VN30',
      vol: 'Vol',
      target: 'Target'
    },
    login: {
      title: 'Welcome Back',
      email: 'Email Address',
      pass: 'Password',
      btn: 'Access Dashboard',
      footer: 'Don\'t have an account? Join Waitlist'
    }
  },
  vi: {
    nav: { features: 'Tính năng', signals: 'Tín hiệu Live', pricing: 'Bảng giá', login: 'Đăng nhập', logout: 'Đăng xuất' },
    hero: {
      badge: '✨ Phiên bản V1.0 Ổn định trên VN30',
      title1: 'Dự báo Tương lai',
      title2: 'Xu hướng Thị trường',
      desc: 'Hệ thống dự báo chứng khoán tự động hóa 100%. Sử dụng thuật toán AI tiên tiến để phân tích biến động và đưa ra tín hiệu chính xác.',
      ctaPrimary: 'Dùng thử miễn phí',
      ctaSecondary: 'Xem Demo',
      stats: { accuracy: 'Độ chính xác', watch: 'Giám sát 24/7', fees: 'Phí ẩn' }
    },
    features: {
      title: 'Tại sao chọn',
      subtitle: 'Công nghệ tối tân dành cho nhà đầu tư hiện đại.',
      f1: { title: 'Khớp lệnh Thời gian thực', desc: 'Thuật toán xử lý dữ liệu thị trường trong mili-giây, đảm bảo bạn không bao giờ lỡ nhịp.' },
      f2: { title: 'Bảo mật Cấp Ngân hàng', desc: 'Dữ liệu và tài sản được bảo vệ bởi mã hóa cấp doanh nghiệp và công nghệ chống thu thập dữ liệu.' },
      f3: { title: 'Thị trường Toàn cầu', desc: 'Mở rộng danh mục đầu tư qua NYSE, NASDAQ và Crypto trên một dashboard duy nhất.' }
    },
    signals: {
      lockedTitle: 'Dành riêng cho Thành viên',
      lockedDesc: 'Tín hiệu thời gian thực và phân tích nâng cao được bảo vệ. Hãy đăng nhập để mở khóa sức mạnh của AI Smart Forecast.',
      btnUnlock: 'Đăng nhập để Mở khóa',
      liveTitle: 'Tín hiệu Giao dịch Trực tiếp - VN30',
      vol: 'KL',
      target: 'Mục tiêu'
    },
    login: {
      title: 'Chào mừng trở lại',
      email: 'Địa chỉ Email',
      pass: 'Mật khẩu',
      btn: 'Truy cập Dashboard',
      footer: 'Chưa có tài khoản? Đăng ký chờ'
    }
  }
};

function useSecurity() {
  useEffect(() => {
    const handleContextMenu = (e) => e.preventDefault();
    const handleKeyDown = (e) => {
      // Prevent F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
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

function Navbar({ lang, setLang, t, onLoginClick, isLoggedIn, onLogout }) {
  return (
    <nav className="glass-panel" style={{ position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', width: '90%', maxWidth: '1200px', zIndex: 100, padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Activity color="var(--primary)" size={28} />
        <span style={{ fontSize: '1.5rem', fontWeight: '700', fontFamily: 'var(--font-heading)' }}>
          AI <span className="text-gradient">Forecast</span>
        </span>
      </div>

      <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }} className="nav-links">
        {/* Language Switch */}
        <button
          onClick={() => setLang(lang === 'en' ? 'vi' : 'en')}
          style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.9rem' }}
        >
          <Globe size={16} /> {lang.toUpperCase()}
        </button>

        <a href="#features" className="nav-link">{t.nav.features}</a>
        <a href="#signals" className="nav-link">{t.nav.signals}</a>
        <a href="#pricing" className="nav-link">{t.nav.pricing}</a>

        {isLoggedIn ? (
          <button onClick={onLogout} className="btn-primary" style={{ padding: '0.5rem 1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={16} /> {t.nav.logout}
          </button>
        ) : (
          <button onClick={onLoginClick} className="btn-primary" style={{ padding: '0.5rem 1.5rem' }}>
            {t.nav.login}
          </button>
        )}
      </div>
    </nav>
  );
}

function LoginModal({ isOpen, onClose, onLogin, t }) {
  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(3, 0, 20, 0.8)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="glass-panel" style={{ width: '400px', padding: '2rem', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
          <X size={24} />
        </button>

        <h2 style={{ fontSize: '2rem', marginBottom: '2rem', textAlign: 'center' }}>{t.login.title}</h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{t.login.email}</label>
            <input type="email" placeholder="demo@ai-forecast.com" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white', outline: 'none' }} required />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{t.login.pass}</label>
            <input type="password" placeholder="••••••••" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white', outline: 'none' }} required />
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

const MOCK_SIGNALS = [
  { ticker: 'VN30F1M', price: '1,245.8', change: '+1.2%', action: 'LONG', conf: '92%' },
  { ticker: 'TCB', price: '34,500', change: '+2.1%', action: 'BUY', conf: '88%' },
  { ticker: 'HPG', price: '28,100', change: '-0.5%', action: 'HOLD', conf: '65%' },
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
        <h3 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Zap color="var(--primary)" /> {t.signals.liveTitle}
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {MOCK_SIGNALS.map((s, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span style={{ fontWeight: '700', fontSize: '1.2rem' }}>{s.ticker}</span>
                <span style={{ color: s.change.includes('+') ? '#00BA88' : '#FF0055' }}>{s.change}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{s.price}</div>
                <div style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: '4px',
                  background: s.action === 'LONG' || s.action === 'BUY' ? 'rgba(0, 186, 136, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                  color: s.action === 'LONG' || s.action === 'BUY' ? '#00BA88' : 'var(--text-muted)',
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
                <span>Confidence: {s.conf}</span>
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
    <section style={{ paddingTop: '160px', paddingBottom: '80px', minHeight: '100vh', display: 'flex', alignItems: 'center' }} className="container">
      <div style={{ flex: 1 }}>
        <div style={{ display: 'inline-block', padding: '0.5rem 1rem', background: 'rgba(0, 240, 255, 0.1)', borderRadius: '50px', marginBottom: '1.5rem', border: '1px solid rgba(0, 240, 255, 0.2)' }}>
          <span style={{ color: 'var(--primary)', fontWeight: '600', fontSize: '0.9rem' }}>{t.hero.badge}</span>
        </div>

        <h1 style={{ fontSize: '4rem', lineHeight: 1.1, marginBottom: '1.5rem' }}>
          {t.hero.title1} <br />
          <span className="text-gradient">{t.hero.title2}</span>
        </h1>

        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', marginBottom: '2.5rem', maxWidth: '500px' }}>
          {t.hero.desc}
        </p>

        <div style={{ display: 'flex', gap: '20px' }}>
          <button className="btn-primary">
            {t.hero.ctaPrimary}
          </button>
          <button style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: '0.75rem 2rem', borderRadius: '99px', cursor: 'pointer', fontWeight: '500' }}>
            {t.hero.ctaSecondary} <ChevronRight size={16} style={{ display: 'inline', verticalAlign: 'middle' }} />
          </button>
        </div>

        <div style={{ marginTop: '4rem', display: 'flex', gap: '40px' }}>
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
              <span style={{ color: '#00BA88', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <TrendingUp size={16} /> +1.24%
              </span>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Intraday</p>
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
            <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Prediction</p>
              <p style={{ fontWeight: '600', color: 'var(--primary)' }}>Strong Buy</p>
            </div>
            <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Confidence</p>
              <p style={{ fontWeight: '600' }}>High (89%)</p>
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

function App() {
  useSecurity(); // Activate Client-side Protection
  const [lang, setLang] = useState('en');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const t = TRANSLATIONS[lang];

  return (
    <div>
      <Navbar
        lang={lang}
        setLang={setLang}
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

      <main>
        <Hero t={t} />

        <section id="features" className="container" style={{ padding: '4rem 2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '3rem', marginBottom: '1rem' }}>
              {t.features.title} <span className="text-gradient">AI Forecast?</span>
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>{t.features.subtitle}</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
            <FeatureCard
              icon={Zap}
              title={t.features.f1.title}
              desc={t.features.f1.desc}
            />
            <FeatureCard
              icon={Shield}
              title={t.features.f2.title}
              desc={t.features.f2.desc}
            />
            <FeatureCard
              icon={Globe}
              title={t.features.f3.title}
              desc={t.features.f3.desc}
            />
          </div>
        </section>

        <section id="signals" className="container">
          <SignalsSection
            isLoggedIn={isLoggedIn}
            onUnlock={() => setShowLoginModal(true)}
            t={t}
          />
        </section>
      </main>

      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.1)', padding: '4rem 2rem', marginTop: '4rem' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Activity color="var(--primary)" size={24} />
            <span style={{ fontWeight: '700', fontFamily: 'var(--font-heading)' }}>AI Forecast</span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            © 2024 AI Smart Forecast Commercial. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
