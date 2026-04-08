import React, { useEffect, useRef, useState } from 'react';
import { SignInButton } from '@clerk/react';
import LogoMark from './LogoMark';

/* ─── Font loader ─────────────────────────────────────────────────────────── */
const FontLoader = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,600;1,700&display=swap');
  `}</style>
);

/* ─── Design tokens ───────────────────────────────────────────────────────── */
const C = {
  base:          '#030712',
  surface:       '#0a0f1e',
  card:          '#0f172a',
  border:        '#1e293b',
  borderFaint:   'rgba(30,41,59,0.6)',
  orange:        '#f97316',
  orangeRed:     '#dc2626',
  orangeBg:      'rgba(249,115,22,0.08)',
  orangeBorder:  'rgba(249,115,22,0.22)',
  text:          '#f1f5f9',
  textSub:       '#cbd5e1',
  textMuted:     '#94a3b8',
  textDim:       '#64748b',
  textFaint:     '#475569',
  green:         '#10b981',
  greenBg:       'rgba(16,185,129,0.1)',
  amber:         '#f59e0b',
  amberBg:       'rgba(245,158,11,0.1)',
  amberBorder:   'rgba(245,158,11,0.25)',
};

/** Open Sans — used throughout */
const F  = "'Open Sans', -apple-system, BlinkMacSystemFont, sans-serif";
/** Open Sans display weight — hero headline, CTAs, prominent labels */
const FC = F;

/* ─── Global styles ───────────────────────────────────────────────────────── */
const GlobalStyles = () => (
  <style>{`
    .pth-landing * { box-sizing: border-box; margin: 0; padding: 0; }

    .pth-hero-grid  { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center; }
    .pth-steps-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
    .pth-feat-grid  { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
    .pth-stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); }
    .pth-footer-row { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; }
    .pth-cta-row    { display: flex; gap: 14px; flex-wrap: wrap; align-items: center; }
    .pth-nav-inner  { display: flex; align-items: center; justify-content: space-between; height: 68px; padding: 0 40px; max-width: 1200px; margin: 0 auto; }

    .pth-hero-pad  { padding: 104px 40px 80px; max-width: 1200px; margin: 0 auto; }
    .pth-sec-inner { max-width: 1200px; margin: 0 auto; }
    .pth-sec-pad   { padding: 88px 40px; }

    .pth-step-card {
      background: ${C.card};
      border: 1px solid ${C.border};
      border-radius: 20px;
      padding: 36px 32px;
      transition: border-color 0.25s, box-shadow 0.25s;
    }
    .pth-step-card:hover {
      border-color: rgba(249,115,22,0.35);
      box-shadow: 0 0 0 1px rgba(249,115,22,0.1), 0 12px 40px rgba(0,0,0,0.5);
    }

    .pth-feat-card {
      background: ${C.card};
      border: 1px solid ${C.border};
      border-radius: 20px;
      padding: 32px 28px;
      transition: border-color 0.25s, transform 0.2s, box-shadow 0.25s;
    }
    .pth-feat-card:hover {
      border-color: rgba(249,115,22,0.3);
      transform: translateY(-3px);
      box-shadow: 0 16px 48px rgba(0,0,0,0.5);
    }

    @keyframes pth-ping {
      0%        { transform: scale(1); opacity: 0.75; }
      75%, 100% { transform: scale(2.2); opacity: 0; }
    }
    .pth-ping { animation: pth-ping 1.4s cubic-bezier(0,0,0.2,1) infinite; }

    @media (max-width: 960px) {
      .pth-hero-grid  { grid-template-columns: 1fr; gap: 48px; }
      .pth-hero-pad   { padding: 88px 24px 64px; }
    }

    @media (max-width: 768px) {
      .pth-steps-grid { grid-template-columns: 1fr; gap: 16px; }
      .pth-feat-grid  { grid-template-columns: repeat(2, 1fr); gap: 16px; }
      .pth-stats-grid { grid-template-columns: 1fr; }
      .pth-sec-pad    { padding: 64px 24px; }
      .pth-nav-inner  { padding: 0 20px; }
      .pth-cta-row    { flex-direction: column; align-items: flex-start; }
      .pth-nav-status { display: none !important; }
      .pth-nav-signin { display: none !important; }
      .pth-footer-row { flex-direction: column; text-align: center; gap: 20px; align-items: center; }
      .pth-stat-item  { border-right: none !important; border-bottom: 1px solid ${C.border}; }
      .pth-stat-item:last-child { border-bottom: none; }
    }

    @media (max-width: 480px) {
      .pth-feat-grid { grid-template-columns: 1fr; }
    }
  `}</style>
);

/* ─── Icons ───────────────────────────────────────────────────────────────── */
const ArrowRightIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const DiagnoseIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 8v5l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const TireIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const MapPinIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 2C8.686 2 6 4.686 6 8c0 5.25 6 13 6 13s6-7.75 6-13c0-3.314-2.686-6-6-6z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="12" cy="8" r="2" stroke="currentColor" strokeWidth="2" />
  </svg>
);

const TowIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect x="2" y="9" width="12" height="7" rx="1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M14 12.5h5l2 3.5H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="7"  cy="18" r="1.8" stroke="currentColor" strokeWidth="2" />
    <circle cx="18" cy="18" r="1.8" stroke="currentColor" strokeWidth="2" />
  </svg>
);

const LightningIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M13 2L4.5 13.5H12L11 22l8.5-11.5H12.5L13 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const StepsIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9 12h6M9 16h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

/* ─── Data ────────────────────────────────────────────────────────────────── */
const STATS = [
  { value: 'No Scanner',  label: 'Required — just describe your symptoms'     },
  { value: 'Any Device',  label: 'Works on your phone, tablet, or desktop'   },
  { value: 'Free',        label: 'To get started — no credit card needed'    },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Describe the issue',
    body:  'Type your symptoms or tap to speak. Select your make, model, and year — no scanner required.',
  },
  {
    step: '02',
    title: 'AI analyzes your car',
    body:  'Our model cross-references known issues specific to your vehicle and mileage, then ranks the most likely causes.',
  },
  {
    step: '03',
    title: 'Get a clear action plan',
    body:  "See ranked causes, estimated repair costs, and whether it's safe to drive or needs a shop immediately.",
  },
];

const FEATURES = [
  { icon: <DiagnoseIcon />, title: 'AI Diagnosis',    desc: 'Describe your symptoms and get ranked causes with repair cost estimates in seconds.'  },
  { icon: <TireIcon />,     title: 'Tire Tread Scan', desc: 'Upload a photo of your tire and get a wear analysis before it becomes a safety issue.' },
  { icon: <MapPinIcon />,   title: 'Find a Mechanic', desc: 'See nearby shops rated by real customers, filtered to what matters most.'              },
  { icon: <TowIcon />,      title: 'Request a Tow',   desc: 'Get towing services dispatched to your location when you need it most.'               },
];

const DIAG_CAUSES = [
  { rank: '01', name: 'Worn spark plugs or failing ignition coils', prob: 'HIGH',        probColor: '#f97316', probBg: 'rgba(249,115,22,0.1)',   probBorder: 'rgba(249,115,22,0.25)' },
  { rank: '02', name: 'Vacuum leak',                                prob: 'MEDIUM-HIGH', probColor: '#f59e0b', probBg: 'rgba(245,158,11,0.1)',   probBorder: 'rgba(245,158,11,0.25)' },
  { rank: '03', name: 'Dirty or clogged fuel injectors',           prob: 'MEDIUM',      probColor: '#94a3b8', probBg: 'rgba(148,163,184,0.08)', probBorder: 'rgba(148,163,184,0.2)' },
];

const NAV_LINKS = [
  { label: 'Privacy', href: '/privacy' },
  { label: 'Terms',   href: '/terms'   },
];

/* ─── Reusable: section header ────────────────────────────────────────────── */
const SectionHead: React.FC<{ icon: React.ReactNode; title: string }> = ({ icon, title }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 52 }}>
    <div style={{
      width: 40, height: 40, borderRadius: 12, flexShrink: 0,
      background: C.orangeBg, border: `1px solid ${C.orangeBorder}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: C.orange,
    }}>
      {icon}
    </div>
    <span style={{
      fontFamily: F, fontWeight: 700, fontSize: 11,
      color: C.textDim, letterSpacing: '0.14em',
      textTransform: 'uppercase', whiteSpace: 'nowrap',
    }}>
      {title}
    </span>
    <div style={{ flex: 1, height: 1, background: C.border }} />
  </div>
);

/* ─── Logo ────────────────────────────────────────────────────────────────── */

/* ─── NavBar ──────────────────────────────────────────────────────────────── */
const NavBar: React.FC<{ onCTAClick: () => void }> = ({ onCTAClick }) => {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
      background: scrolled ? 'rgba(3,7,18,0.96)' : 'rgba(3,7,18,0.6)',
      backdropFilter: 'blur(20px)',
      borderBottom: `1px solid ${scrolled ? C.border : 'transparent'}`,
      transition: 'background 0.3s, border-color 0.3s',
    }}>
      <nav className="pth-nav-inner" aria-label="Main navigation">
        <LogoMark compact />
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          {/* Online status — hidden on mobile */}
          <div className="pth-nav-status" style={{
            display: 'flex', alignItems: 'center', gap: 8, marginRight: 12,
            background: C.greenBg, border: '1px solid rgba(16,185,129,0.2)',
            borderRadius: 9999, padding: '5px 12px',
          }}>
            <span style={{ position: 'relative', width: 8, height: 8, display: 'inline-block' }}>
              <span className="pth-ping" style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: C.green }} />
              <span style={{ position: 'absolute', inset: 1, borderRadius: '50%', background: C.green }} />
            </span>
            <span style={{ fontFamily: F, fontSize: 11, fontWeight: 600, color: C.green, letterSpacing: '0.04em' }}>
              All systems online
            </span>
          </div>

          <SignInButton mode="modal">
            <button
              type="button"
              className="pth-nav-signin"
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: F, fontSize: 13, fontWeight: 600,
                color: C.textMuted, padding: '8px 14px', borderRadius: 8,
                transition: 'color 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = C.text)}
              onMouseLeave={e => (e.currentTarget.style.color = C.textMuted)}
              aria-label="Sign in to your account"
            >
              Sign in
            </button>
          </SignInButton>

          <button
            onClick={onCTAClick}
            type="button"
            style={{
              background: `linear-gradient(135deg, ${C.orange}, ${C.orangeRed})`,
              color: '#fff', border: 'none', cursor: 'pointer',
              fontFamily: FC, fontWeight: 800,
              fontSize: 15, letterSpacing: '0.02em',
              padding: '9px 22px', borderRadius: 9999,
              boxShadow: '0 2px 16px rgba(249,115,22,0.3)',
              transition: 'opacity 0.2s, transform 0.15s',
              whiteSpace: 'nowrap', flexShrink: 0,
            }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.88'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)'; }}
            aria-label="Get started"
          >
            Get started
          </button>
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
    el.style.opacity = '0'; el.style.transform = 'translateY(28px)';
    const t = setTimeout(() => {
      el.style.transition = 'opacity 0.65s ease, transform 0.65s ease';
      el.style.opacity = '1'; el.style.transform = 'translateY(0)';
    }, 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <section style={{
      background: C.base, marginTop: 68, position: 'relative',
      overflow: 'hidden', borderBottom: `1px solid ${C.border}`,
    }}>
      {/* Ambient glow — top right */}
      <div aria-hidden="true" style={{
        position: 'absolute', top: '-20%', right: '-6%',
        width: 700, height: 700, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(249,115,22,0.07) 0%, transparent 62%)',
        filter: 'blur(48px)', pointerEvents: 'none',
      }} />
      {/* Ambient glow — bottom left */}
      <div aria-hidden="true" style={{
        position: 'absolute', bottom: '-10%', left: '-8%',
        width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(220,38,38,0.04) 0%, transparent 65%)',
        filter: 'blur(40px)', pointerEvents: 'none',
      }} />
      {/* Dot grid texture */}
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.02,
        backgroundImage: `radial-gradient(${C.textMuted} 1px, transparent 1px)`,
        backgroundSize: '28px 28px',
      }} />

      <div ref={ref} className="pth-hero-pad">
        <div className="pth-hero-grid">

          {/* Left — headline & CTA */}
          <div>
            {/* Badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: C.orangeBg, border: `1px solid ${C.orangeBorder}`,
              padding: '6px 14px', borderRadius: 9999, marginBottom: 28,
            }}>
              <span style={{
                width: 7, height: 7, borderRadius: '50%',
                background: C.green, display: 'inline-block', flexShrink: 0,
              }} />
              <span style={{
                fontFamily: F, fontWeight: 600, fontSize: 12,
                color: C.orange, letterSpacing: '0.06em',
              }}>
                AI-powered vehicle diagnostics
              </span>
            </div>

            {/* Hero headline — Barlow Condensed Italic 900 */}
            <h1 style={{
              fontFamily: FC, fontWeight: 800,
              fontSize: 'clamp(52px, 7vw, 92px)',
              lineHeight: 0.92, letterSpacing: '-0.01em',
              color: C.text, marginBottom: 28,
            }}>
              Know what's wrong<br />
              <span style={{
                background: `linear-gradient(135deg, ${C.orange}, ${C.orangeRed})`,
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                before
              </span>
              {' '}the shop does.
            </h1>

            <p style={{
              fontFamily: F, fontSize: 17, lineHeight: 1.75,
              color: C.textMuted, maxWidth: 430, marginBottom: 40,
            }}>
              Describe your symptoms and get an instant AI diagnosis — with ranked causes, repair costs, and nearby mechanic options. No scanner needed.
            </p>

            <div className="pth-cta-row">
              {/* Primary CTA — condensed italic */}
              <button
                onClick={onCTAClick}
                type="button"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 10,
                  background: `linear-gradient(135deg, ${C.orange}, ${C.orangeRed})`,
                  color: '#fff', border: 'none', cursor: 'pointer',
                  fontFamily: FC, fontWeight: 800,
                  fontSize: 20, letterSpacing: '0.01em',
                  padding: '14px 32px', borderRadius: 9999,
                  boxShadow: '0 4px 28px rgba(249,115,22,0.4)',
                  transition: 'opacity 0.2s, transform 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)'; }}
                aria-label="Start my diagnosis"
              >
                Find My Problem <ArrowRightIcon size={18} />
              </button>

              {/* Secondary ghost */}
              <a
                href="#how-it-works"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: 'transparent', color: C.textMuted,
                  border: `1px solid ${C.border}`,
                  fontFamily: F, fontWeight: 600, fontSize: 14,
                  padding: '13px 24px', borderRadius: 9999,
                  textDecoration: 'none', transition: 'color 0.2s, border-color 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = C.text; e.currentTarget.style.borderColor = '#334155'; }}
                onMouseLeave={e => { e.currentTarget.style.color = C.textMuted; e.currentTarget.style.borderColor = C.border; }}
              >
                How it works
              </a>
            </div>
          </div>

          {/* Right — diagnostic card mockup */}
          <div style={{
            background: C.card,
            border: `1px solid ${C.border}`,
            borderRadius: 20, padding: 24,
            boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.03)',
          }}>
            {/* Card header row */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              marginBottom: 16, paddingBottom: 16,
              borderBottom: `1px solid ${C.borderFaint}`,
            }}>
              <div style={{
                background: C.orangeBg, border: `1px solid ${C.orangeBorder}`,
                borderRadius: 8, padding: '4px 12px',
                fontFamily: F, fontSize: 11, fontWeight: 700,
                color: C.orange, letterSpacing: '0.08em', textTransform: 'uppercase',
              }}>
                2012 Acura TLX
              </div>
              {/* Drive with caution badge */}
              <div style={{
                marginLeft: 'auto',
                display: 'flex', alignItems: 'center', gap: 6,
                background: C.amberBg, border: `1px solid ${C.amberBorder}`,
                borderRadius: 9999, padding: '4px 10px',
                fontFamily: F, fontSize: 11, fontWeight: 700,
                color: C.amber, whiteSpace: 'nowrap',
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.amber, display: 'inline-block', flexShrink: 0 }} />
                Drive with caution
              </div>
            </div>

            {/* Reported symptom */}
            <div style={{
              background: C.surface, border: `1px solid ${C.borderFaint}`,
              borderRadius: 10, padding: '10px 14px', marginBottom: 16,
            }}>
              <div style={{
                fontFamily: F, fontSize: 10, fontWeight: 700,
                color: C.textDim, letterSpacing: '0.12em',
                textTransform: 'uppercase', marginBottom: 6,
              }}>
                Reported symptom
              </div>
              <p style={{ fontFamily: F, fontSize: 13, color: C.textMuted, lineHeight: 1.6 }}>
                Engine light on, rough idle at stops, slight vibration. Worse when cold.
              </p>
            </div>

            {/* Causes label */}
            <div style={{
              fontFamily: F, fontSize: 10, fontWeight: 700,
              color: C.textDim, letterSpacing: '0.12em',
              textTransform: 'uppercase', marginBottom: 10,
            }}>
              Top causes — ranked by likelihood
            </div>

            {/* Cause rows */}
            {DIAG_CAUSES.map(({ rank, name, prob, probColor, probBg, probBorder }) => (
              <div
                key={rank}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  background: C.surface, border: `1px solid ${C.borderFaint}`,
                  borderRadius: 10, padding: '10px 14px', marginBottom: 6,
                }}
              >
                <span style={{
                  fontFamily: FC, fontWeight: 800,
                  fontSize: 14, color: C.textDim, minWidth: 22, flexShrink: 0,
                }}>
                  {rank}
                </span>
                <div style={{
                  fontFamily: F, fontSize: 13, fontWeight: 500,
                  color: C.textSub, flex: 1, minWidth: 0,
                }}>
                  {name}
                </div>
                <span style={{
                  fontFamily: F, fontSize: 10, fontWeight: 700,
                  color: probColor, background: probBg,
                  border: `1px solid ${probBorder}`,
                  borderRadius: 6, padding: '2px 8px',
                  whiteSpace: 'nowrap', flexShrink: 0,
                  letterSpacing: '0.04em',
                }}>
                  {prob}
                </span>
              </div>
            ))}

            {/* Repair cost footer */}
            <div style={{
              marginTop: 14, padding: '12px 16px',
              background: C.orangeBg, border: `1px solid ${C.orangeBorder}`,
              borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div>
                <div style={{
                  fontFamily: F, fontSize: 10, fontWeight: 700,
                  color: C.textDim, letterSpacing: '0.1em',
                  textTransform: 'uppercase', marginBottom: 3,
                }}>
                  Estimated repair
                </div>
                <div style={{
                  fontFamily: F, fontSize: 15, fontWeight: 700, color: C.orange,
                }}>
                  $250 – $1,300+
                </div>
              </div>
              <div style={{
                fontFamily: F, fontSize: 11, fontWeight: 600,
                color: C.textMuted, textAlign: 'right', lineHeight: 1.5,
              }}>
                Consult a<br />mechanic
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

/* ─── Stats strip ─────────────────────────────────────────────────────────── */
const StatsStrip: React.FC = () => (
  <div
    className="pth-stats-grid"
    style={{ background: C.surface, borderBottom: `1px solid ${C.border}` }}
  >
    {STATS.map(({ value, label }, i) => (
      <div
        key={label}
        className="pth-stat-item"
        style={{
          textAlign: 'center', padding: '28px 20px',
          borderRight: i < STATS.length - 1 ? `1px solid ${C.border}` : 'none',
        }}
      >
        <div style={{
          fontFamily: FC, fontWeight: 800,
          fontSize: 26, letterSpacing: '0.01em',
          background: `linear-gradient(135deg, ${C.orange}, ${C.orangeRed})`,
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          backgroundClip: 'text', marginBottom: 6,
        }}>
          {value}
        </div>
        <div style={{ fontFamily: F, fontSize: 13, fontWeight: 500, color: C.textDim }}>
          {label}
        </div>
      </div>
    ))}
  </div>
);

/* ─── How It Works ────────────────────────────────────────────────────────── */
const HowItWorksSection: React.FC = () => (
  <section id="how-it-works" className="pth-sec-pad" style={{ background: C.base, borderBottom: `1px solid ${C.border}` }}>
    <div className="pth-sec-inner">
      <SectionHead icon={<StepsIcon />} title="How it works" />

      <h2 style={{
        fontFamily: F, fontWeight: 700, fontSize: 'clamp(28px, 4vw, 44px)',
        color: C.text, lineHeight: 1.1, letterSpacing: '-0.02em',
        marginBottom: 48, textTransform: 'uppercase',
      }}>
        A diagnosis in three steps.
      </h2>

      <div className="pth-steps-grid">
        {HOW_IT_WORKS.map(({ step, title, body }) => (
          <div key={step} className="pth-step-card">
            {/* Step number badge — condensed italic (spec-approved) */}
            <div style={{
              fontFamily: FC, fontWeight: 800,
              fontSize: 52, color: C.orange, marginBottom: 16,
              lineHeight: 1, letterSpacing: '-0.02em', opacity: 0.9,
            }}>
              {step}
            </div>
            <h3 style={{
              fontFamily: F, fontWeight: 700, fontSize: 17,
              color: C.text, marginBottom: 10, textTransform: 'uppercase',
              letterSpacing: '0.02em',
            }}>
              {title}
            </h3>
            <p style={{ fontFamily: F, fontSize: 14, color: C.textMuted, lineHeight: 1.7 }}>
              {body}
            </p>
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
      <SectionHead icon={<LightningIcon />} title="Features" />

      <h2 style={{
        fontFamily: F, fontWeight: 700, fontSize: 'clamp(28px, 4vw, 44px)',
        color: C.text, lineHeight: 1.1, letterSpacing: '-0.02em',
        marginBottom: 48, textTransform: 'uppercase',
      }}>
        Everything you need.
      </h2>

      <div className="pth-feat-grid">
        {FEATURES.map(({ icon, title, desc }, i) => (
          <div key={i} className="pth-feat-card">
            {/* Icon badge */}
            <div style={{
              width: 44, height: 44, borderRadius: 12, marginBottom: 20,
              background: C.orangeBg, border: `1px solid ${C.orangeBorder}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: C.orange,
            }}>
              {icon}
            </div>
            <h3 style={{
              fontFamily: F, fontWeight: 700, fontSize: 15,
              color: C.text, marginBottom: 8, textTransform: 'uppercase',
              letterSpacing: '0.03em',
            }}>
              {title}
            </h3>
            <p style={{ fontFamily: F, fontSize: 13, color: C.textMuted, lineHeight: 1.7 }}>
              {desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

/* ─── Bottom CTA ──────────────────────────────────────────────────────────── */
const BottomCTA: React.FC<{ onCTAClick: () => void }> = ({ onCTAClick }) => (
  <section style={{
    background: C.base, borderBottom: `1px solid ${C.border}`,
    padding: '100px 40px', textAlign: 'center', position: 'relative', overflow: 'hidden',
  }}>
    {/* Glow */}
    <div aria-hidden="true" style={{
      position: 'absolute', top: '50%', left: '50%',
      transform: 'translate(-50%, -50%)',
      width: 800, height: 400, borderRadius: '50%',
      background: 'radial-gradient(ellipse, rgba(249,115,22,0.07) 0%, transparent 65%)',
      filter: 'blur(48px)', pointerEvents: 'none',
    }} />
    <div style={{ position: 'relative', maxWidth: 640, margin: '0 auto' }}>
      <h2 style={{
        fontFamily: FC, fontWeight: 800,
        fontSize: 'clamp(36px, 6vw, 72px)',
        lineHeight: 1.1, letterSpacing: '-0.02em', color: C.text,
        marginBottom: 24,
      }}>
        <span style={{ display: 'block' }}>Describe the problem.</span>
        <span style={{ display: 'block' }}>Get the answer.</span>
        <span style={{
          display: 'block',
          background: `linear-gradient(135deg, ${C.orange}, ${C.orangeRed})`,
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          In seconds.
        </span>
      </h2>
      <p style={{
        fontFamily: F, fontSize: 16, color: C.textMuted,
        lineHeight: 1.7, marginBottom: 40,
      }}>
        Get your diagnosis in under 60 seconds. No scanner. No shop visit. No guessing.
      </p>
      <button
        onClick={onCTAClick}
        type="button"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 12,
          background: `linear-gradient(135deg, ${C.orange}, ${C.orangeRed})`,
          color: '#fff', border: 'none', cursor: 'pointer',
          fontFamily: FC, fontWeight: 800,
          fontSize: 22, letterSpacing: '0.01em',
          padding: '16px 40px', borderRadius: 9999,
          boxShadow: '0 6px 36px rgba(249,115,22,0.4)',
          transition: 'opacity 0.2s, transform 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
        onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)'; }}
        aria-label="Start your free diagnosis"
      >
        Find My Problem <ArrowRightIcon size={20} />
      </button>
      <div style={{
        marginTop: 20, fontFamily: F, fontSize: 12,
        color: C.textFaint, letterSpacing: '0.04em',
      }}>
        Free to start · No account required · Works on any device
      </div>
    </div>
  </section>
);

/* ─── Footer ──────────────────────────────────────────────────────────────── */
const Footer: React.FC = () => (
  <footer style={{ background: C.base, borderTop: `1px solid ${C.border}`, padding: '40px 40px' }}>
    <div className="pth-sec-inner">
      <div className="pth-footer-row">
        <LogoMark compact />
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          {NAV_LINKS.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              style={{
                fontFamily: F, fontSize: 13, fontWeight: 600,
                color: C.textMuted, textDecoration: 'none', transition: 'color 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = C.text)}
              onMouseLeave={e => (e.currentTarget.style.color = C.textMuted)}
            >
              {label}
            </a>
          ))}
        </div>
        <div style={{ fontFamily: F, fontSize: 12, color: C.textDim }}>
          © 2025 PopTheHood. All rights reserved.
        </div>
      </div>
    </div>
  </footer>
);

/* ─── Main export ─────────────────────────────────────────────────────────── */
export const LandingPage: React.FC<{ onEnterApp: () => void }> = ({ onEnterApp }) => (
  <div className="pth-landing" style={{ background: C.base, color: C.text, fontFamily: F, minHeight: '100vh' }}>
    <FontLoader />
    <GlobalStyles />
    <NavBar onCTAClick={onEnterApp} />
    <HeroSection onCTAClick={onEnterApp} />
    <StatsStrip />
    <HowItWorksSection />
    <FeaturesSection />
    <BottomCTA onCTAClick={onEnterApp} />
    <Footer />
  </div>
);
