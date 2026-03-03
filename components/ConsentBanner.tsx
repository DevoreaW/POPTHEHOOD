import React, { useState, useEffect } from 'react';

const CONSENT_KEY = 'popthehood_consent_accepted';

interface ConsentBannerProps {
  onAccept: () => void;
}

const ConsentBanner: React.FC<ConsentBannerProps> = ({ onAccept }) => {
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const canAccept = ageConfirmed && termsAccepted;

  const handleAccept = () => {
    localStorage.setItem(CONSENT_KEY, 'true');
    onAccept();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl p-8 max-w-md w-full shadow-2xl">
        
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-orange-500/20 p-3 rounded-2xl">
            <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-black text-white uppercase tracking-tight">Before You Begin</h2>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Important Information</p>
          </div>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 mb-6">
          <p className="text-amber-200 text-sm font-medium leading-relaxed">
            <strong className="text-amber-400">AI Diagnostic Tool:</strong> PopTheHood provides AI-generated suggestions based on your description. It is <strong>not a replacement</strong> for a certified mechanic. Always consult a professional for safety-critical repairs.
          </p>
        </div>

        <div className="space-y-4 mb-8">
          <label className="flex items-start space-x-3 cursor-pointer group">
            <div className="relative mt-0.5">
              <input
                type="checkbox"
                checked={ageConfirmed}
                onChange={(e) => setAgeConfirmed(e.target.checked)}
                className="sr-only"
              />
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${ageConfirmed ? 'bg-orange-500 border-orange-500' : 'border-slate-600 bg-slate-800'}`}>
                {ageConfirmed && (
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/>
                  </svg>
                )}
              </div>
            </div>
            <span className="text-slate-300 text-sm font-medium">I confirm that I am <strong className="text-white">13 years of age or older</strong></span>
          </label>

          <label className="flex items-start space-x-3 cursor-pointer group">
            <div className="relative mt-0.5">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="sr-only"
              />
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${termsAccepted ? 'bg-orange-500 border-orange-500' : 'border-slate-600 bg-slate-800'}`}>
                {termsAccepted && (
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/>
                  </svg>
                )}
              </div>
            </div>
            <span className="text-slate-300 text-sm font-medium">I agree to the <a href="/terms" className="text-orange-400 hover:text-orange-300 underline">Terms of Service</a> and <a href="/privacy" className="text-orange-400 hover:text-orange-300 underline">Privacy Policy</a></span>
          </label>
        </div>

        <button
          onClick={handleAccept}
          disabled={!canAccept}
          className={`w-full py-4 rounded-full font-black text-sm uppercase tracking-widest transition-all ${canAccept ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white hover:from-orange-400 hover:to-red-500' : 'bg-slate-800 text-slate-600 cursor-not-allowed'}`}
        >
          I Understand — Let's Go
        </button>
      </div>
    </div>
  );
};

export default ConsentBanner;