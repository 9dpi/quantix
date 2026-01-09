import React, { useState, useEffect, useMemo } from 'react';
import { LineChart, BarChart, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Shield, Globe, Zap, Lock, ChevronRight, Activity, TrendingUp, X, User, LogOut, Check, Star, Briefcase, Cpu, Radio, Menu } from 'lucide-react';

const TRANSLATIONS = {
  en: {
    nav: { features: 'Features', signals: 'Live Signals', pricing: 'Pricing', login: 'Login', logout: 'Logout', vn30: 'VN30 App' },
    hero: {
      badge: '✨ Quantix AI Core v1.5',
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
      subtitle: 'See what our community has to say about Signal Genius AI.',
      t1: { name: 'Alex Nguyen', role: 'Day Trader', content: 'The accuracy is frighteningly good. I recovered my subscription fee in the first trade.' },
      t2: { name: 'Sarah Le', role: 'Office Worker', content: 'I don\'t have time to watch the screen. The automated signals let me trade while I work. Game changer.' },
      t3: { name: 'Michael Tran', role: 'Crypto Investor', content: 'The dark mode UI is beautiful, but the AI algorithms are the real deal. High win rate on VN30.' }
    }
  },
  vi: {
    nav: { features: 'Tính năng', signals: 'Tín hiệu Live', pricing: 'Bảng giá', login: 'Đăng nhập', logout: 'Đăng xuất', vn30: 'VN30 App' },
    hero: {
      badge: '✨ Quantix AI Core v1.5',
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
    pricing: {
      title: 'Bảng giá Linh hoạt',
      subtitle: 'Chọn gói phù hợp với phong cách giao dịch của bạn.',
      starter: { title: 'Khởi động', price: '0₫', period: '/mãi mãi', desc: 'Dành cho người mới bắt đầu tìm hiểu AI.' },
      pro: { title: 'Chuyên nghiệp', price: '999k', period: '/tháng', desc: 'Tín hiệu nâng cao và dữ liệu real-time.' },
      inst: { title: 'Tổ chức', price: 'Liên hệ', period: '', desc: 'API riêng và hỗ trợ kỹ thuật 24/7.' },
      features: {
        signals: 'Tín hiệu Hàng ngày',
        delay: 'Dữ liệu Thời gian thực',
        mkts: 'Thị trường hỗ trợ',
        supp: 'Hỗ trợ'
      },
      btn: { start: 'Bắt đầu ngay', buy: 'Nâng cấp ngay', contact: 'Liên hệ Sale' }
    },
    dashboard: {
      welcome: 'Chào mừng trở lại',
      status: 'Hệ thống đã tối ưu',
      conn: 'Đã kết nối Yahoo Finance Realtime API',
      tabs: { overview: 'Tổng quan', signals: 'Tín hiệu Active', settings: 'Cài đặt' }
    },
    signals: {
      lockedTitle: 'Dành riêng cho Thành viên',
      lockedDesc: 'Tín hiệu thời gian thực và phân tích nâng cao được bảo vệ. Hãy đăng nhập để mở khóa sức mạnh của AI Smart Forecast.',
      btnUnlock: 'Đăng nhập để Mở khóa',
      liveTitle: 'Tín hiệu Giao dịch - VN30',
      vol: 'KL',
      target: 'Mục tiêu',
      viewFull: 'Xem Dashboard VN30'
    },
    login: {
      title: 'Chào mừng trở lại',
      email: 'Địa chỉ Email',
      pass: 'Mật khẩu',
      btn: 'Truy cập Dashboard',
      footer: 'Chưa có tài khoản? Đăng ký chờ'
    },
    testimonials: {
      title: 'Nhà đầu tư tin dùng',
      subtitle: 'Cộng đồng nói gì về Signal Genius AI.',
      t1: { name: 'Alex Nguyễn', role: 'Day Trader', content: 'Độ chính xác thực sự đáng sợ. Tôi đã thu hồi vốn phí đăng ký ngay trong lệnh đầu tiên.' },
      t2: { name: 'Sarah Lê', role: 'Nhân viên VP', content: 'Tôi không có thời gian canh bảng. Tín hiệu tự động giúp tôi giao dịch ngay cả khi đang làm việc. Quá đỉnh.' },
      t3: { name: 'Michael Trần', role: 'Nhà đầu tư Crypto', content: 'Giao diện Dark mode rất đẹp, nhưng thuật toán AI mới là thứ đáng tiền. Tỷ lệ thắng cao trên VN30.' }
    }
  }
};

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

function Navbar({ lang, setLang, t, onLoginClick, isLoggedIn, onLogout }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <nav className="glass-panel nav-container">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => window.location.reload()}>
          <Activity color="var(--primary)" size={28} />
          <span style={{ fontSize: '1.5rem', fontWeight: '700', fontFamily: 'var(--font-heading)' }}>
            Signal <span className="text-gradient">Genius</span> AI
          </span>
        </div>

        {/* Desktop Menu */}
        <div className="nav-links-desktop">
          <button
            onClick={() => setLang(lang === 'en' ? 'vi' : 'en')}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.9rem' }}
          >
            <Globe size={16} /> {lang.toUpperCase()}
          </button>

          {!isLoggedIn && (
            <>
              <a href="#features" className="nav-link">{t.nav.features}</a>
              <a href="#signals" className="nav-link">{t.nav.signals}</a>
              <a href="#pricing" className="nav-link">{t.nav.pricing}</a>
            </>
          )}
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
          <button
            onClick={() => { setLang(lang === 'en' ? 'vi' : 'en'); setMobileMenuOpen(false); }}
            style={{ background: 'transparent', border: '1px solid var(--text-muted)', color: 'white', padding: '0.5rem 2rem', borderRadius: '50px' }}
          >
            Switch Language: {lang.toUpperCase()}
          </button>

          {!isLoggedIn && (
            <>
              <a href="#features" className="nav-link" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '1.2rem' }}>{t.nav.features}</a>
              <a href="#signals" className="nav-link" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '1.2rem' }}>{t.nav.signals}</a>
              <a href="#pricing" className="nav-link" onClick={() => setMobileMenuOpen(false)} style={{ fontSize: '1.2rem' }}>{t.nav.pricing}</a>
            </>
          )}
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

      <button className={highlighted ? 'btn-primary' : ''} style={{
        width: '100%',
        padding: '0.75rem',
        borderRadius: '8px',
        border: highlighted ? 'none' : '1px solid rgba(255,255,255,0.2)',
        background: highlighted ? undefined : 'transparent',
        color: 'white',
        cursor: 'pointer',
        fontWeight: '600'
      }}>
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
        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>{t.pricing.subtitle}</p>
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
const DashboardChart = React.memo(({ data }) => (
  <div style={{ flex: 1, width: '100%', minHeight: '300px' }}>
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorVn30" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="name" stroke="var(--text-muted)" tick={{ fontSize: 12 }} />
        <YAxis domain={['auto', 'auto']} stroke="var(--text-muted)" tick={{ fontSize: 12 }} />
        <Tooltip
          contentStyle={{ backgroundColor: '#030014', borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }}
          itemStyle={{ color: '#fff' }}
        />
        <Area type="monotone" dataKey="vn30" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorVn30)" animationDuration={500} />
      </AreaChart>
    </ResponsiveContainer>
  </div>
));

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
            <div style={{ color: val.change.includes('+') ? '#00BA88' : '#FF0055', fontSize: '0.9rem' }}>
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
              <div key={i} style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', borderLeft: `3px solid ${item.sig === 'LONG' ? '#00BA88' : item.sig === 'SHORT' ? '#FF0055' : 'gold'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <span style={{ fontWeight: 'bold' }}>{item.t}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.time}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: item.sig === 'LONG' ? '#00BA88' : item.sig === 'SHORT' ? '#FF0055' : 'gold', fontWeight: 'bold' }}>{item.sig}</span>
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
          <button className="btn-primary">
            {t.hero.ctaPrimary}
          </button>
          <button style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: '0.75rem 2rem', borderRadius: '99px', cursor: 'pointer', fontWeight: '500' }}>
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

      <main className="container">
        {isLoggedIn ? (
          <Dashboard t={t} />
        ) : (
          <>
            <Hero t={t} />

            <section id="features" className="container" style={{ padding: '4rem 2rem' }}>
              <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <h2 style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                  {t.features.title} <span className="text-gradient">Signal Genius AI?</span>
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>{t.features.subtitle}</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
                <FeatureCard icon={Zap} title={t.features.f1.title} desc={t.features.f1.desc} />
                <FeatureCard icon={Shield} title={t.features.f2.title} desc={t.features.f2.desc} />
                <FeatureCard icon={Globe} title={t.features.f3.title} desc={t.features.f3.desc} />
              </div>
            </section>

            <section id="signals" className="container">
              <SignalsSection
                isLoggedIn={isLoggedIn}
                onUnlock={() => setShowLoginModal(true)}
                t={t}
              />
            </section>

            <PricingSection t={t} />

            <TestimonialsSection t={t} />
          </>
        )}
      </main>

      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.1)', padding: '4rem 2rem', marginTop: '4rem' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Activity color="var(--primary)" size={24} />
            <span style={{ fontWeight: '700', fontFamily: 'var(--font-heading)' }}>Signal Genius AI</span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
              © 2026 Signal Genius AI. All rights reserved.
            </p>
            <p style={{ color: 'var(--primary)', fontSize: '0.75rem', marginTop: '4px', fontWeight: '500', opacity: 0.8 }}>
              Powered by Quantix AI Core v1.5
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
