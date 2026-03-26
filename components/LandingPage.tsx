import React, { useEffect, useRef, useState } from 'react';
import { SignInButton } from '@clerk/react';

/* ─── Font loader ─────────────────────────────────────────────────────────── */
const FontLoader = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
  `}</style>
);

/* ─── Global styles ───────────────────────────────────────────────────────── */
const GlobalStyles = () => (
  <style>{`
    .pth-landing * { box-sizing: border-box; margin: 0; padding: 0; }

    .pth-hero-grid  { display: grid; grid-template-columns: 1fr 1fr; gap: 56px; align-items: center; }
    .pth-steps-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
    .pth-feat-grid  { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
    .pth-stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); }
    .pth-trust-row  { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 32px; }
    .pth-footer-row { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; }
    .pth-cta-row    { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; }
    .pth-nav-inner  { display: flex; align-items: center; justify-content: space-between; height: 68px; padding: 0 40px; max-width: 1120px; margin: 0 auto; }

    .pth-hero-pad { padding: 100px 40px 72px; max-width: 1120px; margin: 0 auto; }
    .pth-sec-inner { max-width: 1120px; margin: 0 auto; }
    .pth-sec-pad  { padding: 80px 40px; }

    .pth-step-card {
      background: #0d1829;
      border: 1px solid #1e293b;
      border-radius: 16px;
      padding: 32px 28px;
      transition: border-color 0.25s, box-shadow 0.25s;
    }
    .pth-step-card:hover {
      border-color: rgba(249,115,22,0.35);
      box-shadow: 0 0 0 1px rgba(249,115,22,0.12), 0 8px 32px rgba(0,0,0,0.4);
    }

    .pth-feat-card {
      background: #0a0f1e;
      border: 1px solid #1e293b;
      border-radius: 16px;
      padding: 28px 24px;
      transition: border-color 0.25s, transform 0.2s, box-shadow 0.25s;
    }
    .pth-feat-card:hover {
      border-color: rgba(249,115,22,0.3);
      transform: translateY(-2px);
      box-shadow: 0 12px 40px rgba(0,0,0,0.5);
    }

    @keyframes pth-ping {
      0%        { transform: scale(1); opacity: 0.75; }
      75%, 100% { transform: scale(2.2); opacity: 0; }
    }
    .pth-ping { animation: pth-ping 1.4s cubic-bezier(0,0,0.2,1) infinite; }

    @media (max-width: 900px) {
      .pth-hero-grid  { grid-template-columns: 1fr; gap: 40px; }
      .pth-hero-pad   { padding: 80px 24px 56px; }
    }

    @media (max-width: 768px) {
      .pth-steps-grid { grid-template-columns: 1fr; gap: 16px; }
      .pth-feat-grid  { grid-template-columns: repeat(2, 1fr); gap: 16px; }
      .pth-stats-grid { grid-template-columns: 1fr; }
      .pth-sec-pad    { padding: 56px 24px; }
      .pth-nav-inner  { padding: 0 20px; }
      .pth-cta-row    { flex-direction: column; align-items: flex-start; }
      .pth-nav-status { display: none !important; }
      .pth-footer-row { flex-direction: column; text-align: center; gap: 20px; align-items: center; }
      .pth-stat-item  { border-right: none !important; border-bottom: 1px solid #1e293b; }
      .pth-stat-item:last-child { border-bottom: none; }
    }

    @media (max-width: 480px) {
      .pth-feat-grid { grid-template-columns: 1fr; }
    }
  `}</style>
);

/* ─── Design tokens ───────────────────────────────────────────────────────── */
const C = {
  base:         '#030712',
  surface:      '#080e1c',
  card:         '#0d1829',
  border:       '#1e293b',
  borderFaint:  '#131e30',
  orange:       '#f97316',
  orangeRed:    '#dc2626',
  orangeBg:     'rgba(249,115,22,0.08)',
  orangeBorder: 'rgba(249,115,22,0.22)',
  text:         '#f1f5f9',
  textSub:      '#cbd5e1',
  textMuted:    '#94a3b8',
  textDim:      '#64748b',
  textFaint:    '#475569',
  green:        '#10b981',
  greenBg:      'rgba(16,185,129,0.1)',
};

const F = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";

/* ─── Icons ───────────────────────────────────────────────────────────────── */

const ArrowRightIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const DiagnoseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 28 28" fill="none" aria-hidden="true">
    <circle cx="14" cy="14" r="10" stroke="currentColor" strokeWidth="1.8" />
    <path d="M14 9v6l4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const TireIcon = () => (
  <svg width="20" height="20" viewBox="0 0 28 28" fill="none" aria-hidden="true">
    <circle cx="14" cy="14" r="10" stroke="currentColor" strokeWidth="1.8" />
    <circle cx="14" cy="14" r="4"  stroke="currentColor" strokeWidth="1.8" />
    <path d="M14 4v3M14 21v3M4 14h3M21 14h3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const MapPinIcon = () => (
  <svg width="20" height="20" viewBox="0 0 28 28" fill="none" aria-hidden="true">
    <path d="M14 3C10.13 3 7 6.13 7 10c0 6.25 7 15 7 15s7-8.75 7-15c0-3.87-3.13-7-7-7z"
      stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    <circle cx="14" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.8" />
  </svg>
);

const TowIcon = () => (
  <svg width="20" height="20" viewBox="0 0 28 28" fill="none" aria-hidden="true">
    <rect x="3" y="10" width="14" height="8" rx="2" stroke="currentColor" strokeWidth="1.8" />
    <path d="M17 14h5l2 4H17" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    <circle cx="8"  cy="20" r="2" stroke="currentColor" strokeWidth="1.8" />
    <circle cx="20" cy="20" r="2" stroke="currentColor" strokeWidth="1.8" />
  </svg>
);


/* ─── Data ────────────────────────────────────────────────────────────────── */
const STATS = [
  { value: 'No OBD Scanner', label: 'Needed'          },
  { value: 'Any Device',     label: 'Works everywhere' },
  { value: 'Free',           label: 'To get started'   },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Describe the issue',      body: 'Type your symptoms or use voice input. Select your make, model, and year — no scanner required.' },
  { step: '02', title: 'AI analyzes your car',    body: 'Our model cross-references known issues specific to your vehicle and mileage to rank the most likely causes.' },
  { step: '03', title: 'Get a clear action plan', body: "See ranked causes, estimated repair costs, and whether it's DIY-safe or needs a professional." },
];

const FEATURES = [
  { icon: <DiagnoseIcon />, title: 'AI Diagnosis',    desc: 'Describe your symptoms and get ranked causes with repair cost estimates in seconds.'  },
  { icon: <TireIcon />,     title: 'Tire Tread Scan', desc: 'Upload a photo of your tire and get a wear analysis before it becomes a problem.'     },
  { icon: <MapPinIcon />,   title: 'Find a Mechanic', desc: 'See nearby shops rated by real customers — filtered to what matters most.'            },
  { icon: <TowIcon />,      title: 'Request a Tow',   desc: 'Get towing services dispatched to your location when you need it most.'              },
];


const DIAG_CAUSES = [
  { rank: '01', name: 'Worn Spark Plugs or Failing Ignition Coils', prob: 'HIGH',        probColor: '#f97316', probBg: 'rgba(249,115,22,0.1)',   probBorder: 'rgba(249,115,22,0.25)'  },
  { rank: '02', name: 'Vacuum Leak',                                 prob: 'MEDIUM-HIGH', probColor: '#f59e0b', probBg: 'rgba(245,158,11,0.1)',   probBorder: 'rgba(245,158,11,0.25)'  },
  { rank: '03', name: 'Dirty/Clogged Fuel Injectors',               prob: 'MEDIUM',      probColor: '#94a3b8', probBg: 'rgba(148,163,184,0.08)', probBorder: 'rgba(148,163,184,0.2)'  },
];

const NAV_LINKS = [
  { label: 'Privacy', href: '/privacy' },
  { label: 'Terms',   href: '/terms'   },
];

/* ─── Logo ────────────────────────────────────────────────────────────────── */
const LogoMark: React.FC<{ compact?: boolean }> = ({ compact }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
    <img
      src="/icons/icon.svg"
      alt=""
      aria-hidden="true"
      style={{
        width: compact ? 36 : 40, height: compact ? 36 : 40, borderRadius: 10,
        boxShadow: '0 4px 16px rgba(249,115,22,0.3)',
        flexShrink: 0,
      }}
    />
    <div>
      <div style={{ fontFamily: F, fontWeight: 800, fontSize: compact ? 14 : 16, letterSpacing: '0.04em', textTransform: 'uppercase', color: C.text, lineHeight: 1 }}>PopTheHood</div>
      <div style={{ fontFamily: F, fontWeight: 500, fontSize: 9, color: C.orange, letterSpacing: '0.16em', textTransform: 'uppercase', marginTop: 3, opacity: 0.8, whiteSpace: 'nowrap' }}>Diagnose Before You Dial</div>
    </div>
  </div>
);

/* ─── NavBar ──────────────────────────────────────────────────────────────── */
const NavBar: React.FC<{ onCTAClick: () => void }> = ({ onCTAClick }) => {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, background: scrolled ? 'rgba(3,7,18,0.95)' : 'rgba(3,7,18,0.7)', backdropFilter: 'blur(16px)', borderBottom: `1px solid ${scrolled ? C.border : 'transparent'}`, transition: 'background 0.3s, border-color 0.3s' }}>
      <nav className="pth-nav-inner" aria-label="Main navigation">
        <LogoMark compact />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'nowrap', flexShrink: 0 }}>
          <div className="pth-nav-status" style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 16, background: C.greenBg, border: `1px solid rgba(16,185,129,0.2)`, borderRadius: 9999, padding: '5px 12px' }}>
            <span style={{ position: 'relative', width: 8, height: 8, display: 'inline-block' }}>
              <span className="pth-ping" style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: C.green }} />
              <span style={{ position: 'absolute', inset: 1, borderRadius: '50%', background: C.green }} />
            </span>
            <span style={{ fontFamily: F, fontSize: 11, fontWeight: 600, color: C.green, letterSpacing: '0.04em' }}>All systems online</span>
          </div>
          <SignInButton mode="modal">
            <button onClick={onCTAClick} type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: F, fontSize: 13, fontWeight: 500, color: C.textMuted, transition: 'color 0.2s', padding: '8px 14px', borderRadius: 8 }} onMouseEnter={e => (e.currentTarget.style.color = C.text)} onMouseLeave={e => (e.currentTarget.style.color = C.textMuted)} aria-label="Sign in to your account">Sign in</button>
          </SignInButton>
          <button onClick={onCTAClick} type="button" style={{ background: 'linear-gradient(135deg, #f97316, #dc2626)', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: F, fontSize: 13, fontWeight: 700, padding: '9px 20px', borderRadius: 9999, boxShadow: '0 2px 12px rgba(249,115,22,0.3)', transition: 'opacity 0.2s, transform 0.15s', whiteSpace: 'nowrap', flexShrink: 0 }} onMouseEnter={e => { e.currentTarget.style.opacity = '0.88'; e.currentTarget.style.transform = 'translateY(-1px)'; }} onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)'; }} aria-label="Get started">Get started</button>
        </div>
      </nav>
    </div>
  );
};

/* ─── Hero ────────────────────────────────────────────────────────────────── */
const HeroSection: React.FC<{ onCTAClick: () => void }> = ({ onCTAClick }) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    el.style.opacity = '0'; el.style.transform = 'translateY(24px)';
    const t = setTimeout(() => { el.style.transition = 'opacity 0.7s ease, transform 0.7s ease'; el.style.opacity = '1'; el.style.transform = 'translateY(0)'; }, 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <section style={{ background: C.base, marginTop: 68, position: 'relative', overflow: 'hidden', borderBottom: `1px solid ${C.border}` }}>
      <div aria-hidden="true" style={{ position: 'absolute', top: '-15%', right: '-8%', width: 640, height: 640, borderRadius: '50%', background: 'radial-gradient(circle, rgba(249,115,22,0.07) 0%, transparent 65%)', filter: 'blur(40px)', pointerEvents: 'none' }} />
      <div aria-hidden="true" style={{ position: 'absolute', top: '30%', left: '-10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(220,38,38,0.04) 0%, transparent 65%)', filter: 'blur(40px)', pointerEvents: 'none' }} />
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.018, backgroundImage: `radial-gradient(${C.textMuted} 1px, transparent 1px)`, backgroundSize: '24px 24px' }} />
      <div ref={ref} className="pth-hero-pad" style={{ paddingTop: 100, paddingBottom: 80 }}>
        <div className="pth-hero-grid">
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: C.orangeBg, border: `1px solid ${C.orangeBorder}`, padding: '6px 14px', borderRadius: 9999, marginBottom: 24 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: C.green, display: 'inline-block', flexShrink: 0 }} />
              <span style={{ fontFamily: F, fontWeight: 600, fontSize: 12, color: C.orange, letterSpacing: '0.06em' }}>AI-powered vehicle diagnostics</span>
            </div>
            <h1 style={{ fontFamily: F, fontWeight: 900, fontSize: 'clamp(38px, 5.5vw, 68px)', lineHeight: 1.0, letterSpacing: '-0.03em', color: C.text, marginBottom: 22 }}>
              Know what's wrong{' '}
              <span style={{ background: 'linear-gradient(135deg, #f97316, #dc2626)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>before</span>
              {' '}the shop does.
            </h1>
            <p style={{ fontFamily: F, fontSize: 17, lineHeight: 1.75, color: C.textMuted, maxWidth: 420, marginBottom: 36 }}>
              Describe your symptoms, snap a photo, and get an instant AI diagnosis — with repair costs and nearby mechanic options.
            </p>
            <div className="pth-cta-row">
              <button onClick={onCTAClick} style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'linear-gradient(135deg, #f97316, #dc2626)', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: F, fontWeight: 700, fontSize: 15, letterSpacing: '0.01em', padding: '14px 28px', borderRadius: 9999, boxShadow: '0 4px 24px rgba(249,115,22,0.35)', transition: 'opacity 0.2s, transform 0.15s' }} onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'translateY(-1px)'; }} onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)'; }} aria-label="Diagnose my car for free">
                Diagnose my car <ArrowRightIcon />
              </button>
              <a href="#how-it-works" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'transparent', color: C.textMuted, border: `1px solid ${C.border}`, fontFamily: F, fontWeight: 500, fontSize: 14, padding: '13px 22px', borderRadius: 9999, textDecoration: 'none', transition: 'color 0.2s, border-color 0.2s' }} onMouseEnter={e => { e.currentTarget.style.color = C.text; e.currentTarget.style.borderColor = '#334155'; }} onMouseLeave={e => { e.currentTarget.style.color = C.textMuted; e.currentTarget.style.borderColor = C.border; }}>
                How it works
              </a>
            </div>
          </div>
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 20, padding: 24, boxShadow: '0 24px 64px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, paddingBottom: 16, borderBottom: `1px solid ${C.borderFaint}` }}>
              <div style={{ background: C.orangeBg, border: `1px solid ${C.orangeBorder}`, borderRadius: 8, padding: '5px 12px', fontFamily: F, fontSize: 11, fontWeight: 700, color: C.orange, letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>2012 Acura TLX</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto', fontFamily: F, fontSize: 11, fontWeight: 600, color: C.green, background: C.greenBg, border: '1px solid rgba(16,185,129,0.2)', borderRadius: 9999, padding: '3px 10px', whiteSpace: 'nowrap' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.green, display: 'inline-block', flexShrink: 0 }} />Analysis complete
              </div>
            </div>
            <div style={{ background: C.surface, border: `1px solid ${C.borderFaint}`, borderRadius: 10, padding: '10px 14px', marginBottom: 18 }}>
              <div style={{ fontFamily: F, fontSize: 10, fontWeight: 600, color: C.textDim, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>Reported symptom</div>
              <p style={{ fontFamily: F, fontSize: 13, color: C.textMuted, lineHeight: 1.6 }}>Engine light on, rough idle at stops, slight vibration. Worse in the morning.</p>
            </div>
            <div style={{ fontFamily: F, fontSize: 10, fontWeight: 600, color: C.textDim, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>Top causes — ranked by likelihood</div>
            {DIAG_CAUSES.map(({ rank, name, prob, probColor, probBg, probBorder }) => (
              <div key={rank} style={{ display: 'flex', alignItems: 'center', gap: 10, background: C.surface, border: `1px solid ${C.borderFaint}`, borderRadius: 10, padding: '10px 14px', marginBottom: 6 }}>
                <span style={{ fontFamily: F, fontWeight: 800, fontSize: 12, color: C.textDim, minWidth: 22, flexShrink: 0 }}>{rank}</span>
                <div style={{ fontFamily: F, fontSize: 13, fontWeight: 500, color: C.textSub, flex: 1, minWidth: 0 }}>{name}</div>
                <span style={{ fontFamily: F, fontSize: 10, fontWeight: 700, color: probColor, background: probBg, border: `1px solid ${probBorder}`, borderRadius: 6, padding: '2px 8px', whiteSpace: 'nowrap', flexShrink: 0, letterSpacing: '0.04em' }}>{prob}</span>
              </div>
            ))}
            <div style={{ marginTop: 14, padding: '12px 16px', background: C.orangeBg, border: `1px solid ${C.orangeBorder}`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontFamily: F, fontSize: 10, fontWeight: 600, color: C.textDim, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 3 }}>Estimated repair</div>
                <div style={{ fontFamily: F, fontSize: 14, fontWeight: 700, color: C.orange }}>$250 – $1300+</div>
              </div>
              <div style={{ fontFamily: F, fontSize: 11, fontWeight: 600, color: C.textMuted, textAlign: 'right' }}>Consult a<br />mechanic</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ─── Stats strip ─────────────────────────────────────────────────────────── */
const StatsStrip: React.FC = () => (
  <div className="pth-stats-grid" style={{ background: C.surface, borderBottom: `1px solid ${C.border}` }}>
    {STATS.map(({ value, label }, i) => (
      <div key={label} className="pth-stat-item" style={{ textAlign: 'center', padding: '24px 12px', borderRight: i < STATS.length - 1 ? `1px solid ${C.border}` : 'none' }}>
        <div style={{ fontFamily: F, fontWeight: 800, fontSize: 20, letterSpacing: '-0.02em', background: 'linear-gradient(135deg, #f97316, #dc2626)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: 4 }}>{value}</div>
        <div style={{ fontFamily: F, fontSize: 12, fontWeight: 500, color: C.textDim }}>{label}</div>
      </div>
    ))}
  </div>
);

/* ─── How It Works ────────────────────────────────────────────────────────── */
const HowItWorksSection: React.FC = () => (
  <section id="how-it-works" className="pth-sec-pad" style={{ background: C.base, borderBottom: `1px solid ${C.border}` }}>
    <div className="pth-sec-inner">
      <div style={{ marginBottom: 48 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', background: C.orangeBg, border: `1px solid ${C.orangeBorder}`, padding: '4px 12px', borderRadius: 9999, marginBottom: 16 }}>
          <span style={{ fontFamily: F, fontWeight: 600, fontSize: 11, color: C.orange, letterSpacing: '0.08em' }}>How it works</span>
        </div>
        <h2 style={{ fontFamily: F, fontWeight: 800, fontSize: 'clamp(26px, 4vw, 40px)', color: C.text, lineHeight: 1.1, letterSpacing: '-0.02em' }}>A diagnosis in three steps.</h2>
      </div>
      <div className="pth-steps-grid">
        {HOW_IT_WORKS.map(({ step, title, body }) => (
          <div key={step} className="pth-step-card">
            <div style={{ fontFamily: F, fontWeight: 800, fontSize: 32, color: C.orange, marginBottom: 12, letterSpacing: '-0.02em' }}>{step}</div>
            <h3 style={{ fontFamily: F, fontWeight: 700, fontSize: 18, color: C.text, marginBottom: 10 }}>{title}</h3>
            <p style={{ fontFamily: F, fontSize: 14, color: C.textMuted, lineHeight: 1.6 }}>{body}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

/* ─── Features ────────────────────────────────────────────────────────────── */
const FeaturesSection: React.FC = () => (
  <section className="pth-sec-pad" style={{ background: C.surface, borderBottom: `1px solid ${C.border}` }}>
    <div className="pth-sec-inner">
      <div style={{ marginBottom: 48 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', background: C.orangeBg, border: `1px solid ${C.orangeBorder}`, padding: '4px 12px', borderRadius: 9999, marginBottom: 16 }}>
          <span style={{ fontFamily: F, fontWeight: 600, fontSize: 11, color: C.orange, letterSpacing: '0.08em' }}>Features</span>
        </div>
        <h2 style={{ fontFamily: F, fontWeight: 800, fontSize: 'clamp(26px, 4vw, 40px)', color: C.text, lineHeight: 1.1, letterSpacing: '-0.02em' }}>Everything you need.</h2>
      </div>
      <div className="pth-feat-grid">
        {FEATURES.map(({ icon, title, desc }, i) => (
          <div key={i} className="pth-feat-card">
            <div style={{ color: C.orange, marginBottom: 16 }}>{icon}</div>
            <h3 style={{ fontFamily: F, fontWeight: 700, fontSize: 16, color: C.text, marginBottom: 8 }}>{title}</h3>
            <p style={{ fontFamily: F, fontSize: 13, color: C.textMuted, lineHeight: 1.6 }}>{desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);


/* ─── Footer ──────────────────────────────────────────────────────────────── */
const Footer: React.FC = () => (
  <footer style={{ background: C.base, borderTop: `1px solid ${C.border}`, padding: '40px' }}>
    <div className="pth-sec-inner">
      <div className="pth-footer-row">
        <LogoMark compact />
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          {NAV_LINKS.map(({ label, href }) => (
            <a key={label} href={href} style={{ fontFamily: F, fontSize: 13, fontWeight: 500, color: C.textMuted, textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => (e.currentTarget.style.color = C.text)} onMouseLeave={e => (e.currentTarget.style.color = C.textMuted)}>{label}</a>
          ))}
        </div>
        <div style={{ fontFamily: F, fontSize: 12, color: C.textDim }}>© 2025 PopTheHood. All rights reserved.</div>
      </div>
    </div>
  </footer>
);

/* ─── Main component ──────────────────────────────────────────────────────── */
export const LandingPage: React.FC<{ onEnterApp: () => void }> = ({ onEnterApp }) => {
  return (
    <div className="pth-landing" style={{ background: C.base, color: C.text, fontFamily: F, minHeight: '100vh' }}>
      <FontLoader />
      <GlobalStyles />
      <NavBar onCTAClick={onEnterApp} />
      <HeroSection onCTAClick={onEnterApp} />
      <StatsStrip />
      <HowItWorksSection />
      <FeaturesSection />
      <Footer />
    </div>
  );
};