import React, { useEffect, useRef, useState } from 'react';
import { SignInButton, SignUpButton } from '@clerk/react';

/* ─── Font loader ─────────────────────────────────────────────────────────── */
const FontLoader = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,700;0,900;1,700;1,900&family=Barlow:wght@400;500;600;700&display=swap');
  `}</style>
);

/* ─── Responsive + global styles ─────────────────────────────────────────── */
const GlobalStyles = () => (
  <style>{`
    .pth-landing * { box-sizing: border-box; margin: 0; padding: 0; }

    .pth-hero-grid  { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: center; }
    .pth-steps-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; }
    .pth-feat-grid  { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px; }
    .pth-stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); }
    .pth-trust-row  { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 24px; }
    .pth-footer-row { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; }
    .pth-cta-row    { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; }
    .pth-nav-inner  { display: flex; align-items: center; justify-content: space-between; height: 68px; padding: 0 32px; }
    .pth-nav-right  { display: flex; align-items: center; gap: 12px; }

    .pth-hero-pad { padding: 96px 32px 64px; }
    .pth-sec-pad  { padding: 72px 32px; }

    .pth-grad-text {
      background: linear-gradient(135deg, #f97316, #dc2626);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .pth-btn-cta {
      display: inline-flex; align-items: center; gap: 10px;
      background: linear-gradient(135deg, #f97316, #dc2626);
      color: #fff; border: none; cursor: pointer;
      font-family: 'Barlow Condensed', sans-serif;
      font-weight: 900; font-style: italic;
      font-size: 20px; letter-spacing: 0.04em; text-transform: uppercase;
      padding: 16px 32px; border-radius: 9999px;
      box-shadow: 0 4px 20px rgba(249,115,22,0.3);
      transition: opacity 0.2s, transform 0.15s;
    }
    .pth-btn-cta:hover  { opacity: 0.9; transform: translateY(-1px); }
    .pth-btn-cta:active { transform: translateY(0); }

    .pth-btn-ghost {
      display: inline-flex; align-items: center; gap: 8px;
      background: transparent; color: #64748b;
      border: 1px solid #1f2937; cursor: pointer;
      font-family: 'Barlow', sans-serif; font-weight: 600; font-size: 14px;
      padding: 14px 24px; border-radius: 9999px; text-decoration: none;
      transition: color 0.2s, border-color 0.2s;
    }
    .pth-btn-ghost:hover { color: #f1f5f9; border-color: #374151; }

    .pth-step-card:hover { background: #0f172a !important; }
    .pth-feat-card:hover { background: #0a0f1e !important; }

    @keyframes pth-ping {
      0%        { transform: scale(1); opacity: 0.75; }
      75%, 100% { transform: scale(2); opacity: 0; }
    }
    .pth-ping { animation: pth-ping 1.2s cubic-bezier(0,0,0.2,1) infinite; }

    @media (max-width: 768px) {
      .pth-hero-grid  { grid-template-columns: 1fr; gap: 40px; }
      .pth-steps-grid { grid-template-columns: 1fr; }
      .pth-feat-grid  { grid-template-columns: repeat(2, 1fr); }
      .pth-stats-grid { grid-template-columns: 1fr; }
      .pth-hero-pad   { padding: 72px 20px 48px; }
      .pth-sec-pad    { padding: 56px 20px; }
      .pth-nav-inner  { padding: 0 20px; }
      .pth-cta-row    { flex-direction: column; align-items: flex-start; }
      .pth-nav-status { display: none !important; }
    }

    @media (max-width: 480px) {
      .pth-feat-grid { grid-template-columns: 1fr; }
    }
  `}</style>
);

/* ─── Design tokens ───────────────────────────────────────────────────────── */
const C = {
  base:         '#030712',
  surface:      '#0a0f1e',
  card:         '#0f172a',
  border:       '#1f2937',
  borderInner:  '#1e293b',
  orange:       '#f97316',
  red:          '#dc2626',
  orangeBg:     'rgba(249,115,22,0.08)',
  orangeBorder: 'rgba(249,115,22,0.2)',
  text:         '#f1f5f9',
  textMuted:    '#94a3b8',
  textDim:      '#64748b',
  textFaint:    '#475569',
  textDeep:     '#334155',
  green:        '#10b981',
};

const F = {
  display: "'Barlow Condensed', sans-serif",
  body:    "'Barlow', sans-serif",
};

/* ─── Icons ───────────────────────────────────────────────────────────────── */
const WrenchIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const DiagnoseIcon = () => (
  <svg width="22" height="22" viewBox="0 0 28 28" fill="none" aria-hidden="true">
    <circle cx="14" cy="14" r="10" stroke="currentColor" strokeWidth="1.8" />
    <path d="M14 9v6l4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const TireIcon = () => (
  <svg width="22" height="22" viewBox="0 0 28 28" fill="none" aria-hidden="true">
    <circle cx="14" cy="14" r="10" stroke="currentColor" strokeWidth="1.8" />
    <circle cx="14" cy="14" r="4"  stroke="currentColor" strokeWidth="1.8" />
    <path d="M14 4v3M14 21v3M4 14h3M21 14h3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const MapPinIcon = () => (
  <svg width="22" height="22" viewBox="0 0 28 28" fill="none" aria-hidden="true">
    <path d="M14 3C10.13 3 7 6.13 7 10c0 6.25 7 15 7 15s7-8.75 7-15c0-3.87-3.13-7-7-7z"
      stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    <circle cx="14" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.8" />
  </svg>
);

const TowIcon = () => (
  <svg width="22" height="22" viewBox="0 0 28 28" fill="none" aria-hidden="true">
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
  { step: '1', title: 'Describe the issue',      body: 'Type your symptoms or use voice input. Select your make, model, and year — no scanner required.'                                                      },
  { step: '2', title: 'AI analyzes your car',    body: 'Our model cross-references known issues specific to your vehicle and mileage to rank the most likely causes.'                                          },
  { step: '3', title: 'Get a clear action plan', body: "See ranked causes, estimated repair costs, and whether it's DIY-safe or needs a professional."                                                         },
];

const FEATURES = [
  { icon: <DiagnoseIcon />, title: 'AI Diagnosis',    desc: 'Describe your symptoms and get ranked causes with repair cost estimates in seconds.'   },
  { icon: <TireIcon />,     title: 'Tire Tread Scan', desc: 'Upload a photo of your tire and get a wear analysis before it becomes a problem.'      },
  { icon: <MapPinIcon />,   title: 'Find a Mechanic', desc: 'See nearby shops rated by real customers — filtered to what matters most.'             },
  { icon: <TowIcon />,      title: 'Request a Tow',   desc: 'Get towing services dispatched to your location when you need it most.'               },
];

const TRUST_ITEMS = ['End-to-end encrypted', 'OWASP compliant', 'No data sold — ever', 'ADA accessible'];

const DIAG_CAUSES = [
  { rank: '#1', name: 'Worn or glazed serpentine belt',   prob: 'HIGH'        },
  { rank: '#2', name: 'Failing belt tensioner or pulley', prob: 'MEDIUM-HIGH' },
  { rank: '#3', name: 'Accessory component bearing',      prob: 'MEDIUM'      },
];

const NAV_LINKS = [
  { label: 'Privacy', href: '/privacy' },
  { label: 'Terms',   href: '/terms'   },
];

/* ─── Shared logo ─────────────────────────────────────────────────────────── */
const LogoMark: React.FC<{ iconSize?: number; fontSize?: number }> = ({ iconSize = 20, fontSize = 20 }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
    <div style={{
      width: iconSize + 20, height: iconSize + 20, borderRadius: 12,
      background: 'linear-gradient(135deg, #f97316, #dc2626)',
      boxShadow: '0 4px 14px rgba(249,115,22,0.25)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', flexShrink: 0,
    }}>
      <WrenchIcon size={iconSize} />
    </div>
    <div>
      <div style={{ fontFamily: F.display, fontWeight: 900, fontStyle: 'italic', fontSize, letterSpacing: '0.05em', textTransform: 'uppercase', color: C.text, lineHeight: 1 }}>
        POPTHEHOOD
      </div>
      <div style={{ fontFamily: F.body, fontWeight: 800, fontSize: 9, color: C.orange, letterSpacing: '0.2em', textTransform: 'uppercase', marginTop: 3 }}>
        Diagnose Before You Dial
      </div>
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
    <nav
      className="pth-nav-inner"
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        background: scrolled ? 'rgba(3,7,18,0.97)' : C.base,
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: `1px solid ${C.border}`,
        transition: 'background 0.3s',
      }}
      aria-label="Main navigation"
    >
      <LogoMark />

      <div className="pth-nav-right">
        {/* Pinging status indicator */}
        <div className="pth-nav-status" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginRight: 4 }}>
          <span style={{ fontFamily: F.body, fontSize: 9, fontWeight: 800, color: C.textDeep, textTransform: 'uppercase', letterSpacing: '0.15em' }}>
            System Status
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
            <span style={{ position: 'relative', width: 8, height: 8, display: 'inline-block' }}>
              <span className="pth-ping" style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#34d399', opacity: 0.75 }} />
              <span style={{ position: 'absolute', inset: 1, borderRadius: '50%', background: C.green }} />
            </span>
            <span style={{ fontFamily: F.body, fontSize: 11, fontWeight: 800, color: C.green, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Online
            </span>
          </div>
        </div>

        <SignInButton mode="modal">
          <button
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: F.body, fontSize: 11, fontWeight: 700, color: C.textDim, textTransform: 'uppercase', letterSpacing: '0.1em', transition: 'color 0.2s', padding: '8px 12px' }}
            onMouseEnter={e => (e.currentTarget.style.color = C.text)}
            onMouseLeave={e => (e.currentTarget.style.color = C.textDim)}
            aria-label="Sign in to your account"
          >
            Sign In
          </button>
        </SignInButton>

        <SignUpButton mode="modal">
          <button
            style={{ background: 'linear-gradient(135deg, #f97316, #dc2626)', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: F.body, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', padding: '8px 16px', borderRadius: 9999, transition: 'opacity 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            aria-label="Create a new account"
          >
            Sign Up
          </button>
        </SignUpButton>
      </div>
    </nav>
  );
};

/* ─── Hero ────────────────────────────────────────────────────────────────── */
const HeroSection: React.FC<{ onCTAClick: () => void }> = ({ onCTAClick }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    const t = setTimeout(() => {
      el.style.transition = 'opacity 0.65s ease, transform 0.65s ease';
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    }, 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="pth-hero-pad" style={{ background: C.base, borderBottom: `1px solid ${C.border}`, marginTop: 68, position: 'relative', overflow: 'hidden' }}>
      {/* Ambient glow */}
      <div aria-hidden="true" style={{ position: 'absolute', top: '-10%', right: '-5%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(249,115,22,0.06) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none' }} />
      {/* Dot grid */}
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.025, backgroundImage: `radial-gradient(${C.textMuted} 1px, transparent 1px)`, backgroundSize: '28px 28px' }} />

      <div ref={ref} className="pth-hero-grid" style={{ maxWidth: 1040, margin: '0 auto', position: 'relative' }}>

        {/* Left: copy */}
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: C.orangeBg, border: `1px solid ${C.orangeBorder}`, padding: '5px 14px', borderRadius: 9999, marginBottom: 20 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: C.green, display: 'inline-block' }} />
            <span style={{ fontFamily: F.body, fontWeight: 700, fontSize: 11, color: C.orange, letterSpacing: '0.1em' }}>AI-POWERED CAR DIAGNOSTICS</span>
          </div>

          <h1 style={{ fontFamily: F.display, fontWeight: 900, fontStyle: 'italic', fontSize: 'clamp(44px, 6vw, 72px)', lineHeight: 0.92, letterSpacing: '-0.01em', textTransform: 'uppercase', color: C.text, marginBottom: 20 }}>
            Know what's<br />wrong{' '}
            <span className="pth-grad-text">before</span>
            <br />the shop does.
          </h1>

          <p style={{ fontFamily: F.body, fontSize: 16, lineHeight: 1.65, color: C.textMuted, maxWidth: 440, marginBottom: 36 }}>
            Describe your symptoms, snap a photo, and get an instant AI diagnosis — with repair costs and nearby mechanic options.
          </p>

          <div className="pth-cta-row">
            <button className="pth-btn-cta" onClick={onCTAClick} aria-label="Diagnose my car for free">
              Diagnose my car <ArrowRightIcon />
            </button>
            <a href="#how-it-works" className="pth-btn-ghost">How it works</a>
          </div>
        </div>

        {/* Right: mock diagnostic card */}
        <div style={{ background: C.card, border: `1px solid ${C.borderInner}`, borderRadius: 20, padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'nowrap', marginBottom: 18, paddingBottom: 14, borderBottom: `1px solid ${C.borderInner}` }}>
            <div style={{ background: C.orangeBg, border: `1px solid ${C.orangeBorder}`, borderRadius: 6, padding: '5px 12px', fontFamily: F.body, fontSize: 12, fontWeight: 700, color: C.orange, letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
              2012 ACURA TLX
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginLeft: 'auto', fontFamily: F.body, fontSize: 11, fontWeight: 700, color: C.green, whiteSpace: 'nowrap' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.green, display: 'inline-block', flexShrink: 0 }} />
              Analysis complete
            </div>
          </div>

          <p style={{ fontFamily: F.body, fontSize: 13, color: C.textDim, marginBottom: 16, lineHeight: 1.55 }}>
            <strong style={{ color: C.text, fontWeight: 600 }}>Reported:</strong>{' '}Engine light on, rough idle at stops, slight vibration. Worse in the morning.
          </p>

          <div style={{ fontFamily: F.body, fontSize: 10, fontWeight: 700, color: C.textDeep, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
            Top causes ranked by likelihood
          </div>

          {DIAG_CAUSES.map(({ rank, name, prob }) => (
            <div key={rank} style={{ display: 'flex', alignItems: 'center', gap: 10, background: C.base, border: `1px solid ${C.borderInner}`, borderRadius: 8, padding: '10px 14px', marginBottom: 6 }}>
              <span style={{ fontFamily: F.display, fontWeight: 900, fontStyle: 'italic', fontSize: 16, color: C.orange, minWidth: 24, flexShrink: 0 }}>{rank}</span>
              <div style={{ fontFamily: F.body, fontSize: 13, fontWeight: 600, color: C.text, flex: 1, minWidth: 0 }}>{name}</div>
              <span style={{
                fontFamily: F.body, fontSize: 10, fontWeight: 700,
                color: prob === 'HIGH' ? '#f97316' : prob === 'MEDIUM-HIGH' ? '#f59e0b' : '#94a3b8',
                background: prob === 'HIGH' ? 'rgba(249,115,22,0.1)' : prob === 'MEDIUM-HIGH' ? 'rgba(245,158,11,0.1)' : 'rgba(148,163,184,0.1)',
                border: `1px solid ${prob === 'HIGH' ? 'rgba(249,115,22,0.25)' : prob === 'MEDIUM-HIGH' ? 'rgba(245,158,11,0.25)' : 'rgba(148,163,184,0.2)'}`,
                borderRadius: 4, padding: '2px 8px', whiteSpace: 'nowrap', flexShrink: 0,
              }}>{prob}</span>
            </div>
          ))}

          <div style={{ marginTop: 12, padding: '10px 14px', background: C.orangeBg, border: `1px solid ${C.orangeBorder}`, borderRadius: 8, fontFamily: F.body, fontSize: 12, fontWeight: 600, color: C.orange, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            Estimated repair: $150–$900+ · Consult a mechanic
          </div>
        </div>
      </div>
    </section>
  );
};

/* ─── Stats strip ─────────────────────────────────────────────────────────── */
const StatsStrip: React.FC = () => (
  <div className="pth-stats-grid" style={{ background: C.base, borderBottom: `1px solid ${C.border}` }}>
    {STATS.map(({ value, label }, i) => (
      <div key={label} style={{ textAlign: 'center', padding: '22px 12px', borderRight: i < STATS.length - 1 ? `1px solid ${C.border}` : 'none' }}>
        <div className="pth-grad-text" style={{ fontFamily: F.display, fontWeight: 900, fontStyle: 'italic', fontSize: 22 }}>{value}</div>
        <div style={{ fontFamily: F.body, fontSize: 10, fontWeight: 700, color: C.textDeep, letterSpacing: '0.1em', marginTop: 2, textTransform: 'uppercase' }}>{label}</div>
      </div>
    ))}
  </div>
);

/* ─── How It Works ────────────────────────────────────────────────────────── */
const HowItWorksSection: React.FC = () => (
  <section id="how-it-works" className="pth-sec-pad" style={{ background: C.base, borderBottom: `1px solid ${C.border}` }}>
    <div style={{ maxWidth: 1040, margin: '0 auto' }}>
      <p style={{ fontFamily: F.body, fontWeight: 800, fontSize: 10, color: C.orange, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 10 }}>How it works</p>
      <h2 style={{ fontFamily: F.display, fontWeight: 900, fontStyle: 'italic', fontSize: 'clamp(30px, 4vw, 48px)', color: C.text, textTransform: 'uppercase', lineHeight: 1, marginBottom: 40 }}>
        A diagnosis in three steps.
      </h2>
      <div className="pth-steps-grid" style={{ background: C.border, border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden' }}>
        {HOW_IT_WORKS.map(({ step, title, body }) => (
          <div key={step} className="pth-step-card" style={{ background: C.surface, padding: '32px 28px', transition: 'background 0.2s' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #f97316, #dc2626)', boxShadow: '0 3px 12px rgba(249,115,22,0.3)', color: '#fff', fontFamily: F.display, fontWeight: 900, fontStyle: 'italic', fontSize: 22, marginBottom: 18 }}>
              {step}
            </div>
            <h3 style={{ fontFamily: F.display, fontWeight: 900, fontStyle: 'italic', fontSize: 20, color: C.text, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 10 }}>{title}</h3>
            <p style={{ fontFamily: F.body, fontSize: 13, color: C.textDim, lineHeight: 1.7 }}>{body}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

/* ─── Features ────────────────────────────────────────────────────────────── */
const FeaturesSection: React.FC = () => (
  <section className="pth-sec-pad" style={{ background: C.surface, borderBottom: `1px solid ${C.border}` }}>
    <div style={{ maxWidth: 1040, margin: '0 auto' }}>
      <p style={{ fontFamily: F.body, fontWeight: 800, fontSize: 10, color: C.orange, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 10 }}>Features</p>
      <h2 style={{ fontFamily: F.display, fontWeight: 900, fontStyle: 'italic', fontSize: 'clamp(30px, 4vw, 48px)', color: C.text, textTransform: 'uppercase', lineHeight: 1, marginBottom: 40 }}>
        Everything in one place.
      </h2>
      <div className="pth-feat-grid" style={{ background: C.border, border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden' }}>
        {FEATURES.map(({ icon, title, desc }) => (
          <div key={title} className="pth-feat-card" style={{ background: C.surface, padding: '28px 24px', transition: 'background 0.2s' }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: C.orangeBg, border: `1px solid ${C.orangeBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.orange, marginBottom: 16 }}>
              {icon}
            </div>
            <h3 style={{ fontFamily: F.display, fontWeight: 900, fontStyle: 'italic', fontSize: 17, color: C.text, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 8 }}>{title}</h3>
            <p style={{ fontFamily: F.body, fontSize: 12, color: C.textFaint, lineHeight: 1.7 }}>{desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

/* ─── Trust strip ─────────────────────────────────────────────────────────── */
const TrustStrip: React.FC = () => (
  <div className="pth-trust-row" style={{ background: C.base, borderBottom: `1px solid ${C.border}`, padding: '14px 32px' }}>
    {TRUST_ITEMS.map(item => (
      <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true" style={{ color: C.green, flexShrink: 0 }}>
          <path d="M8 2L3 4v4c0 3.31 2.24 5.96 5 7 2.76-1.04 5-3.69 5-7V4L8 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M6 8l1.5 1.5L10 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span style={{ fontFamily: F.body, fontSize: 11, fontWeight: 700, color: C.textDeep, letterSpacing: '0.06em' }}>{item}</span>
      </div>
    ))}
  </div>
);

/* ─── CTA section ─────────────────────────────────────────────────────────── */
const CTASection: React.FC<{ onCTAClick: () => void }> = ({ onCTAClick }) => (
  <section className="pth-sec-pad" style={{ background: C.base }}>
    <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
      <div style={{ background: C.card, border: `1px solid ${C.borderInner}`, borderRadius: 24, padding: '60px 40px', position: 'relative', overflow: 'hidden' }}>
        <div aria-hidden="true" style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, transparent, #f97316, #dc2626, transparent)' }} />
        <div aria-hidden="true" style={{ position: 'absolute', bottom: '-30%', left: '50%', transform: 'translateX(-50%)', width: 400, height: 200, background: 'radial-gradient(ellipse, rgba(249,115,22,0.08), transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontFamily: F.display, fontWeight: 900, fontStyle: 'italic', fontSize: 'clamp(30px, 5vw, 48px)', color: C.text, textTransform: 'uppercase', lineHeight: 1, marginBottom: 14 }}>
            Ready to find out<br />what's going on?
          </h2>
          <p style={{ fontFamily: F.body, fontSize: 15, color: C.textFaint, marginBottom: 32 }}>
            Free to use. No account required to get started.
          </p>
          <button className="pth-btn-cta" onClick={onCTAClick} style={{ fontSize: 22, padding: '18px 40px' }} aria-label="Diagnose my car for free">
            Diagnose my car — it's free <ArrowRightIcon />
          </button>
        </div>
      </div>
    </div>
  </section>
);

/* ─── Footer ──────────────────────────────────────────────────────────────── */
const LandingFooter: React.FC = () => (
  <footer className="pth-footer-row" style={{ background: C.base, borderTop: '1px solid #111827', padding: '28px 32px' }}>
    <LogoMark iconSize={16} fontSize={14} />
    <nav aria-label="Footer navigation" style={{ display: 'flex', gap: 24 }}>
      {NAV_LINKS.map(({ label, href }) => (
        <a key={label} href={href}
          style={{ fontFamily: F.body, fontSize: 12, color: C.textDeep, textDecoration: 'none', transition: 'color 0.2s' }}
          onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.color = C.textMuted)}
          onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.color = C.textDeep)}
          {...(href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        >
          {label}
        </a>
      ))}
    </nav>
    <p style={{ fontFamily: F.body, fontSize: 11, color: '#1e293b' }}>© {new Date().getFullYear()} PopTheHood. All rights reserved.</p>
  </footer>
);

/* ─── Page root ───────────────────────────────────────────────────────────── */
const LandingPage: React.FC<{ onEnterApp: () => void }> = ({ onEnterApp }) => (
  <div className="pth-landing" style={{ background: C.base, minHeight: '100vh' }}>
    <FontLoader />
    <GlobalStyles />
    <NavBar onCTAClick={onEnterApp} />
    <HeroSection onCTAClick={onEnterApp} />
    <StatsStrip />
    <HowItWorksSection />
    <FeaturesSection />
    <TrustStrip />
    <CTASection onCTAClick={onEnterApp} />
    <LandingFooter />
  </div>
);

export default LandingPage;