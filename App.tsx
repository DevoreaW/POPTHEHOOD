import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import VehicleForm from './components/VehicleForm';
import DiagnosticView from './components/DiagnosticView';
import TireAnalysisView from './components/TireAnalysisView';
import ServicesView from './components/ServicesView';
import ConsentBanner from './components/ConsentBanner';
import { LandingPage } from './components/LandingPage';
import { useUser, useAuth } from '@clerk/react';
import { generateDiagnosticReport, analyzeTireTread, searchNearbyServices, askFollowUpQuestion } from './services/geminiService';
import { saveDiagnostic, saveTireScan, getUserDiagnostics, getUserTireScans } from './services/supabaseService';
import { VehicleInfo, DiagnosticInput, DiagnosticReport, TireAnalysisReport, ServiceSearchReport } from './types';

const STORAGE_KEY = 'popthehood_history';

const App: React.FC = () => {
  const { isSignedIn, user } = useUser();
  const { getToken } = useAuth();
  const [showLanding, setShowLanding] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<DiagnosticReport | null>(null);
  const [tireReport, setTireReport] = useState<TireAnalysisReport | null>(null);
  const [serviceReport, setServiceReport] = useState<ServiceSearchReport | null>(null);
  const [history, setHistory] = useState<(DiagnosticReport | TireAnalysisReport)[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState<string>('');
const [consentGiven, setConsentGiven] = useState<boolean>(() => {
    return localStorage.getItem('popthehood_consent_accepted') === 'true';
  });

  useEffect(() => {
    const loadHistory = async () => {
      if (isSignedIn && user) {
        try {
          const token = await getToken();
          if (!token) throw new Error('Not authenticated');
          const [diagnostics, tireScans] = await Promise.all([
            getUserDiagnostics(token),
            getUserTireScans(token)
          ]);
          const diagReports = (diagnostics || []).map((d: any) => ({ ...d.report, id: d.id, timestamp: new Date(d.created_at).getTime(), vehicle: { make: d.vehicle_make, model: d.vehicle_model, year: d.vehicle_year, mileage: d.vehicle_mileage } }));
          const tireReports = (tireScans || []).map((t: any) => ({ ...t.report, id: t.id, timestamp: new Date(t.created_at).getTime() }));
          const combined = [...diagReports, ...tireReports].sort((a, b) => b.timestamp - a.timestamp).slice(0, 10);
          setHistory(combined);
        } catch (err) {
          console.error('Failed to load history from Supabase:', err);
          const saved = localStorage.getItem(STORAGE_KEY);
          if (saved) { try { setHistory(JSON.parse(saved)); } catch (e) {} }
        }
      } else {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) { try { setHistory(JSON.parse(saved)); } catch (e) {} }
      }
    };
    loadHistory();
  }, [isSignedIn, user]);

  useEffect(() => {
    if (isSignedIn === false) {
      setHistory([]);
      setReport(null);
      setTireReport(null);
      setServiceReport(null);
    }
  }, [isSignedIn]);

  const announce = (message: string) => {
    setAnnouncement('');
    setTimeout(() => setAnnouncement(message), 100);
  };

  const handleServiceError = async (err: any) => {
    const errorMsg = err.message || '';
    setError(errorMsg || 'An unexpected error occurred. Please try again.');
    announce('An error occurred. Please try again.');
  };

  const saveToHistory = async (item: DiagnosticReport | TireAnalysisReport) => {
    if (isSignedIn && user) {
      try {
        const token = await getToken();
        if (!token) throw new Error('Not authenticated');
        if ('healthScore' in item) {
          await saveTireScan(token, item);
        } else {
          const diagItem = item as DiagnosticReport;
          await saveDiagnostic(token, diagItem.vehicle, diagItem);
        }
        const [diagnostics, tireScans] = await Promise.all([
          getUserDiagnostics(token),
          getUserTireScans(token)
        ]);
        const diagReports = (diagnostics || []).map((d: any) => ({ ...d.report, id: d.id, timestamp: new Date(d.created_at).getTime(), vehicle: { make: d.vehicle_make, model: d.vehicle_model, year: d.vehicle_year, mileage: d.vehicle_mileage } }));
        const tireReports = (tireScans || []).map((t: any) => ({ ...t.report, id: t.id, timestamp: new Date(t.created_at).getTime() }));
        const combined = [...diagReports, ...tireReports].sort((a, b) => b.timestamp - a.timestamp).slice(0, 10);
        setHistory(combined);
      } catch (err) {
        console.error('Failed to save to Supabase:', err);
      }
    } else {
      setHistory(prev => {
        if (prev.find(i => i.id === item.id)) return prev;
        const newHistory = [item, ...prev].slice(0, 10);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
        return newHistory;
      });
    }
  };

  const clearHistory = () => {
    if (confirm('Clear your diagnostic history?')) {
      setHistory([]);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const handleDiagnose = async (vehicle: VehicleInfo, input: DiagnosticInput) => {
    setIsLoading(true);
    setError(null);
    announce('Running AI diagnosis. Please wait.');
    try {
      const result = await generateDiagnosticReport(vehicle, input);
      setReport(result);
      setTireReport(null);
      setServiceReport(null);
      saveToHistory(result);
      announce('Diagnosis complete. Results are now available.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      await handleServiceError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTireScan = async (imageData: string, mimeType: string) => {
    setIsLoading(true);
    setError(null);
    announce('Scanning tire tread. Please wait.');
    try {
      const result = await analyzeTireTread(imageData, mimeType);
      setTireReport(result);
      setReport(null);
      setServiceReport(null);
      saveToHistory(result);
      announce('Tire scan complete. Results are now available.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      await handleServiceError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFindServices = async (type: 'mechanic' | 'towing') => {
    setIsLoading(true);
    setError(null);
    announce(`Searching for nearby ${type === 'mechanic' ? 'mechanics' : 'towing services'}. Please wait.`);
    try {
      if (!navigator.geolocation) throw new Error('Geolocation is not supported by your browser.');
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const result = await searchNearbyServices(type, latitude, longitude);
            setServiceReport(result);
            setReport(null);
            setTireReport(null);
            setIsLoading(false);
            announce(`Found nearby ${type === 'mechanic' ? 'mechanics' : 'towing services'}. Results are now available.`);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } catch (err: any) {
            await handleServiceError(err);
            setIsLoading(false);
          }
        },
        () => {
          setError('Location access denied. Please enable GPS to find nearby help.');
          announce('Location access denied. Please enable GPS to find nearby help.');
          setIsLoading(false);
        },
        { timeout: 10000 }
      );
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  const handleHistorySelect = (item: DiagnosticReport | TireAnalysisReport) => {
    if ('healthScore' in item) {
      setTireReport(item as TireAnalysisReport);
      setReport(null);
      setServiceReport(null);
      announce('Tire scan report loaded.');
    } else {
      setReport(item as DiagnosticReport);
      setTireReport(null);
      setServiceReport(null);
      announce('Diagnostic report loaded.');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetDiagnosis = () => {
    setReport(null);
    setTireReport(null);
    setServiceReport(null);
    setError(null);
    announce('Returned to main form.');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogoClick = () => {
    setReport(null);
    setTireReport(null);
    setServiceReport(null);
    setError(null);
    setShowLanding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── Landing page ──────────────────────────────────────────────────────────
  if (showLanding) {
    return (
      <>
        <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
          {announcement}
        </div>
        {!consentGiven && <ConsentBanner onAccept={() => setConsentGiven(true)} />}
        <LandingPage onEnterApp={() => setShowLanding(false)} />
      </>
    );
  }

  // ── Main app ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#030712' }}>
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </div>

      {!consentGiven && <ConsentBanner onAccept={() => setConsentGiven(true)} />}

      <Header onLogoClick={handleLogoClick} />

      <main id="main-content" className="flex-grow pt-8" tabIndex={-1}>

        {/* Diagnostic warning banner */}
        <div className="max-w-lg md:max-w-4xl mx-auto px-4 mb-8">
          <div
            role="alert"
            className="border-l-4 border-amber-500/60 p-4 rounded-r-xl"
            style={{ background: 'rgba(245,158,11,0.06)' }}
          >
            <div className="flex gap-3">
              <svg className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <p className="text-sm text-amber-200/70" style={{ fontFamily: "'Open Sans', sans-serif" }}>
                <span className="font-semibold text-amber-400">Virtual Diagnostic Warning:</span>{' '}
                This tool provides mechanical advice based on AI analysis. It is not a replacement for an in-person safety inspection. If your car is smoking, losing brakes, or shaking violently,{' '}
                <span className="underline">do not drive it.</span>
              </p>
            </div>
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div role="alert" aria-live="assertive" className="max-w-4xl mx-auto px-4 mb-8">
            <div className="bg-rose-500/10 border border-rose-500/25 text-rose-400 p-4 rounded-xl flex items-center justify-between">
              <span className="text-sm" style={{ fontFamily: "'Open Sans', sans-serif" }}>{error}</span>
              <button
                onClick={() => setError(null)}
                className="text-rose-400 font-semibold ml-4 hover:text-rose-300 transition-colors text-sm"
                aria-label="Dismiss error message"
                style={{ fontFamily: "'Open Sans', sans-serif" }}
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Loading */}
        {isLoading ? (
          <div
            role="status"
            aria-label="Loading. Please wait."
            className="flex flex-col items-center justify-center py-20 gap-6"
          >
            <div
              aria-hidden="true"
              className="w-16 h-16 rounded-full border-4 border-slate-800 border-t-orange-500 animate-spin"
            />
            <div className="text-center">
              <h3 className="text-lg font-bold text-white mb-1" style={{ fontFamily: "'Open Sans', sans-serif" }}>
                Running analysis…
              </h3>
              <p className="text-slate-500 text-sm" style={{ fontFamily: "'Open Sans', sans-serif" }}>
                Our AI is reviewing your vehicle information.
              </p>
            </div>
          </div>
        ) : (
          <>
            {report && (
              <DiagnosticView
                report={report}
                onReset={resetDiagnosis}
                onSave={saveToHistory}
                onFindServices={handleFindServices}
                onAskFollowUp={(q, r, ans) => askFollowUpQuestion(q, r, ans)}
              />
            )}
            {tireReport && (
              <TireAnalysisView report={tireReport} onReset={resetDiagnosis} onSave={saveToHistory} />
            )}
            {serviceReport && (
              <ServicesView report={serviceReport} onReset={resetDiagnosis} />
            )}
            {!report && !tireReport && !serviceReport && (
              <>
                {!isSignedIn && (
                  <div className="max-w-lg md:max-w-4xl mx-auto px-4 mb-6">
                    <div className="flex items-center justify-between gap-4 bg-orange-500/5 border border-orange-500/20 rounded-xl px-5 py-3.5">
                      <p className="text-sm text-slate-400" style={{ fontFamily: "'Open Sans', sans-serif" }}>
                        <span className="font-semibold text-orange-400">Save your history permanently.</span> Sign up free — your diagnoses won't disappear when you clear your browser.
                      </p>
                    </div>
                  </div>
                )}
                <VehicleForm
                  onDiagnose={handleDiagnose}
                  onTireScan={handleTireScan}
                  onFindServices={handleFindServices}
                  isLoading={isLoading}
                  history={history}
                  onHistorySelect={handleHistorySelect}
                  onHistoryClear={clearHistory}
                />
              </>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 py-8 px-4 mt-20" style={{ background: '#030712' }}>
        <div className="max-w-lg md:max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <p className="text-slate-600 text-sm" style={{ fontFamily: "'Open Sans', sans-serif" }}>
              © 2026 POPTHEHOOD. All rights reserved.
            </p>
            <p className="text-slate-700 text-xs mt-1" style={{ fontFamily: "'Open Sans', sans-serif" }}>
              Developed for educational purposes. Technician oversight required.
            </p>
          </div>
          <nav aria-label="Footer navigation">
            <div className="flex items-center gap-6">
              <a href="/privacy" className="text-slate-600 hover:text-slate-300 text-sm transition-colors" style={{ fontFamily: "'Open Sans', sans-serif" }}>Privacy</a>
              <a href="/terms"   className="text-slate-600 hover:text-slate-300 text-sm transition-colors" style={{ fontFamily: "'Open Sans', sans-serif" }}>Terms</a>
            </div>
          </nav>
        </div>
      </footer>
    </div>
  );
};

export default App;