import React, { useState } from 'react';
import { LineChart, Shield, Globe, Zap, Lock, ChevronRight, Activity, TrendingUp } from 'lucide-react';

function Navbar() {
  return (
    <nav className="glass-panel" style={{ position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)', width: '90%', maxWidth: '1200px', zIndex: 100, padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Activity color="var(--primary)" size={28} />
        <span style={{ fontSize: '1.5rem', fontWeight: '700', fontFamily: 'var(--font-heading)' }}>
          AI <span className="text-gradient">Forecast</span>
        </span>
      </div>

      <div style={{ display: 'flex', gap: '30px' }} className="nav-links">
        <a href="#features" className="nav-link">Features</a>
        <a href="#signals" className="nav-link">Live Signals</a>
        <a href="#pricing" className="nav-link">Pricing</a>
      </div>

      <button className="btn-primary" style={{ padding: '0.5rem 1.5rem' }}>
        Login
      </button>
    </nav>
  );
}

function Hero() {
  return (
    <section style={{ paddingTop: '160px', paddingBottom: '80px', minHeight: '100vh', display: 'flex', alignItems: 'center' }} className="container">
      <div style={{ flex: 1 }}>
        <div style={{ display: 'inline-block', padding: '0.5rem 1rem', background: 'rgba(0, 240, 255, 0.1)', borderRadius: '50px', marginBottom: '1.5rem', border: '1px solid rgba(0, 240, 255, 0.2)' }}>
          <span style={{ color: 'var(--primary)', fontWeight: '600', fontSize: '0.9rem' }}>✨ V1.0 Stable on VN30</span>
        </div>

        <h1 style={{ fontSize: '4rem', lineHeight: 1.1, marginBottom: '1.5rem' }}>
          Predict the Future of <br />
          <span className="text-gradient">Market Trends</span>
        </h1>

        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', marginBottom: '2.5rem', maxWidth: '500px' }}>
          100% Automated Stock Prediction System. Powered by advanced AI algorithms to analyze market volatility and execute precise signals.
        </p>

        <div style={{ display: 'flex', gap: '20px' }}>
          <button className="btn-primary">
            Start Free Trial
          </button>
          <button style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: '0.75rem 2rem', borderRadius: '99px', cursor: 'pointer', fontWeight: '500' }}>
            View Demo <ChevronRight size={16} style={{ display: 'inline', verticalAlign: 'middle' }} />
          </button>
        </div>

        <div style={{ marginTop: '4rem', display: 'flex', gap: '40px' }}>
          <div>
            <h3 style={{ fontSize: '2rem', fontWeight: '700' }}>94%</h3>
            <p style={{ color: 'var(--text-muted)' }}>Accuracy Rate</p>
          </div>
          <div>
            <h3 style={{ fontSize: '2rem', fontWeight: '700' }}>24/7</h3>
            <p style={{ color: 'var(--text-muted)' }}>Market Watch</p>
          </div>
          <div>
            <h3 style={{ fontSize: '2rem', fontWeight: '700' }}>$0</h3>
            <p style={{ color: 'var(--text-muted)' }}>Hidden Fees</p>
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

          {/* Abstract Chart Graphic */}
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

        {/* Decorative Glows */}
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

function BlurredSignals() {
  return (
    <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '24px', margin: '4rem 0' }} className="glass-panel">
      {/* Overlay */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(3, 0, 20, 0.6)', backdropFilter: 'blur(20px)', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <div style={{ background: 'rgba(255,255,255,0.1)', padding: '1.5rem', borderRadius: '50%', marginBottom: '1.5rem' }}>
          <Lock size={48} color="var(--primary)" />
        </div>
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Member Access Only</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', maxWidth: '500px' }}>
          Real-time signals and advanced analytics are protected. Login to unlock the full potential of AI Smart Forecast.
        </p>
        <button className="btn-primary">Login to Unlock</button>
      </div>

      {/* Blurred Content */}
      <div style={{ padding: '3rem', filter: 'blur(8px)', pointerEvents: 'none' }}>
        <h3 style={{ marginBottom: '2rem' }}>Live Trading Signals</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span style={{ fontWeight: '700' }}>TICKER_{i}</span>
                <span style={{ color: '#00BA88' }}>+2.4%</span>
              </div>
              <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', marginBottom: '1rem' }}>
                <div style={{ width: '70%', height: '100%', background: 'var(--primary)', borderRadius: '3px' }}></div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Vol: High</span>
                <span>Target: $120.50</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <div>
      <Navbar />

      <main>
        <Hero />

        <section id="features" className="container" style={{ padding: '4rem 2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Why Choose <span className="text-gradient">AI Forecast?</span></h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>State-of-the-art technology for the modern investor.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
            <FeatureCard
              icon={Zap}
              title="Real-Time Execution"
              desc="Our algorithms process market data in milliseconds, ensuring you never miss a profitable entry point."
            />
            <FeatureCard
              icon={Shield}
              title="Bank-Grade Security"
              desc="Your data and assets are protected by enterprise-level encryption and anti-scraping technology."
            />
            <FeatureCard
              icon={Globe}
              title="Global Markets"
              desc="Scale your portfolio across NYSE, NASDAQ, and Crypto markets with a single unified dashboard."
            />
          </div>
        </section>

        <section id="signals" className="container">
          <BlurredSignals />
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
