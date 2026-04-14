import React, { useState } from 'react';

const CONSENT_KEY = 'popthehood_consent_accepted';

interface ConsentBannerProps {
  onAccept: () => void;
}

/* ─── Typography ──────────────────────────────────────────────────────────── */
const body: React.CSSProperties = { fontFamily: "'Open Sans', sans-serif" };

const ConsentBanner: React.FC<ConsentBannerProps> = ({ onAccept }) => {
  const [ageConfirmed, setAgeConfirmed]   = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const canAccept = ageConfirmed && termsAccepted;

  const handleAccept = () => {
    localStorage.setItem(CONSENT_KEY, 'true');
    onAccept();
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#e2e2e5] border border-[#cdcdd2]/60 rounded-2xl p-8 max-w-md w-full shadow-2xl">

        {/* ── Header ── */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 flex-shrink-0">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            {/* Title: regular Barlow bold — readable at modal size */}
            <h2 className="text-lg font-bold text-[#111113] leading-none" style={body}>
              Before you begin
            </h2>
            <p className="text-xs text-slate-500 mt-1" style={body}>
              Important information
            </p>
          </div>
        </div>

        {/* ── Warning box ── */}
        <div className="bg-amber-500/6 border border-amber-500/20 rounded-xl p-4 mb-6">
          <p className="text-amber-200/70 text-sm leading-relaxed" style={body}>
            <strong className="text-amber-400 font-semibold">AI Diagnostic Tool:</strong>{' '}
            PopTheHood provides AI-generated suggestions based on your description. It is{' '}
            <strong className="text-amber-300 font-semibold">not a replacement</strong> for a certified mechanic.
            Always consult a professional for safety-critical repairs.
          </p>
        </div>

        {/* ── Checkboxes ── */}
        <div className="space-y-4 mb-8">
          {/* Age confirm */}
          <label className="flex items-start gap-3 cursor-pointer">
            <div className="relative mt-0.5 flex-shrink-0">
              <input
                type="checkbox"
                checked={ageConfirmed}
                onChange={e => setAgeConfirmed(e.target.checked)}
                className="sr-only"
              />
              <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${ageConfirmed ? 'bg-orange-500 border-orange-500' : 'border-[#cdcdd2] bg-black/[0.06]'}`}>
                {ageConfirmed && (
                  <svg className="w-3 h-3 text-[#111113]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </div>
            <span className="text-slate-500 text-sm leading-snug" style={body}>
              I confirm that I am{' '}
              <strong className="text-[#111113] font-semibold">13 years of age or older</strong>
            </span>
          </label>

          {/* Terms accept */}
          <label className="flex items-start gap-3 cursor-pointer">
            <div className="relative mt-0.5 flex-shrink-0">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={e => setTermsAccepted(e.target.checked)}
                className="sr-only"
              />
              <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${termsAccepted ? 'bg-orange-500 border-orange-500' : 'border-[#cdcdd2] bg-black/[0.06]'}`}>
                {termsAccepted && (
                  <svg className="w-3 h-3 text-[#111113]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </div>
            <span className="text-slate-500 text-sm leading-snug" style={body}>
              I agree to the{' '}
              <a href="/terms" className="text-orange-400 hover:text-orange-300 underline underline-offset-2 transition-colors">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="/privacy" className="text-orange-400 hover:text-orange-300 underline underline-offset-2 transition-colors">
                Privacy Policy
              </a>
            </span>
          </label>
        </div>

        {/* ── Accept button — condensed italic appropriate for the CTA ── */}
        <button
          onClick={handleAccept}
          disabled={!canAccept}
          className={`not-italic w-full py-3 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-[#f4f4f6]
            ${canAccept
              ? 'bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-[#111113] shadow-lg shadow-orange-500/20 hover:-translate-y-0.5 active:scale-[0.99]'
              : 'bg-black/[0.06] border border-[#cdcdd2] text-slate-400 cursor-not-allowed'
            }`}
          style={{ fontFamily: "'Open Sans', sans-serif", fontWeight: 900, fontSize: 18, letterSpacing: '0.04em', fontStyle: 'normal' }}
        >
          I understand — let's go
        </button>

      </div>
    </div>
  );
};

export default ConsentBanner;