
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import VehicleForm from './components/VehicleForm';
import DiagnosticView from './components/DiagnosticView';
import TireAnalysisView from './components/TireAnalysisView';
import ServicesView from './components/ServicesView';
import { generateDiagnosticReport, analyzeTireTread, searchNearbyServices } from './services/geminiService';
import { VehicleInfo, DiagnosticInput, DiagnosticReport, TireAnalysisReport, ServiceSearchReport } from './types';

// NOTE: The aistudio property on window is assumed to be pre-configured and accessible 
// in the execution context as per guidelines. Redefining it here caused conflicts 
// with the existing AIStudio type provided by the environment.

const STORAGE_KEY = 'underthehood_history';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<DiagnosticReport | null>(null);
  const [tireReport, setTireReport] = useState<TireAnalysisReport | null>(null);
  const [serviceReport, setServiceReport] = useState<ServiceSearchReport | null>(null);
  const [history, setHistory] = useState<(DiagnosticReport | TireAnalysisReport)[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Load history from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }
  }, []);

  const ensureApiKey = async (): Promise<boolean> => {
    try {
      // @ts-ignore - aistudio is pre-configured and accessible in the environment
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        // @ts-ignore
        await window.aistudio.openSelectKey();
        return true; // Proceed assuming selection worked (mitigate race condition)
      }
      return true;
    } catch (e) {
      return false;
    }
  };

  const handleServiceError = async (err: any) => {
    const errorMsg = err.message || "";
    if (errorMsg.includes("Requested entity was not found")) {
      setError("This feature requires a paid API key for Google Maps data. Opening key selection...");
      // @ts-ignore
      await window.aistudio.openSelectKey();
    } else {
      setError(errorMsg || "An unexpected error occurred. Please try again.");
    }
  };

  const saveToHistory = (item: DiagnosticReport | TireAnalysisReport) => {
    setHistory(prev => {
      if (prev.find(i => i.id === item.id)) return prev;
      const newHistory = [item, ...prev].slice(0, 10);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
      return newHistory;
    });
  };

  const clearHistory = () => {
    if (confirm("Clear your diagnostic history?")) {
      setHistory([]);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const handleDiagnose = async (vehicle: VehicleInfo, input: DiagnosticInput) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await generateDiagnosticReport(vehicle, input);
      setReport(result);
      setTireReport(null);
      setServiceReport(null);
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
    try {
      await ensureApiKey();
      const result = await analyzeTireTread(imageData, mimeType);
      setTireReport(result);
      setReport(null);
      setServiceReport(null);
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
    
    try {
      if (!navigator.geolocation) {
        throw new Error("Geolocation is not supported by your browser.");
      }

      await ensureApiKey();

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const result = await searchNearbyServices(type, latitude, longitude);
            setServiceReport(result);
            setReport(null);
            setTireReport(null);
            setIsLoading(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } catch (err: any) {
            await handleServiceError(err);
            setIsLoading(false);
          }
        },
        (err) => {
          setError("Location access denied. Please enable GPS to find nearby help.");
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
    } else {
      setReport(item as DiagnosticReport);
      setTireReport(null);
      setServiceReport(null);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetDiagnosis = () => {
    setReport(null);
    setTireReport(null);
    setServiceReport(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      
      <main className="flex-grow pt-8">
        <div className="max-w-lg md:max-w-4xl mx-auto px-4 mb-8">
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg mb-8 shadow-sm">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-amber-800">
                  <span className="font-bold">Virtual Diagnostic Warning:</span> This tool provides mechanical advice based on AI analysis. It is not a replacement for an in-person safety inspection. If your car is smoking, losing brakes, or shaking violently, <span className="underline">do not drive it.</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="max-w-4xl mx-auto px-4 mb-8">
            <div className="bg-rose-100 border border-rose-200 text-rose-800 p-4 rounded-xl flex items-center justify-between">
              <span>{error}</span>
              <button onClick={() => setError(null)} className="text-rose-900 font-bold ml-4 hover:underline">Dismiss</button>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-6 animate-pulse">
            <div className="w-20 h-20 border-8 border-slate-200 border-t-red-600 rounded-full animate-spin"></div>
            <div className="text-center">
              <h3 className="text-xl font-bold text-slate-900">Locating Help & Running Analysis...</h3>
              <p className="text-slate-500">Retrieving real-time data for your situation.</p>
              <p className="text-xs text-slate-400 mt-4">Note: If this is your first time using Maps tools, you may be prompted to select a key.</p>
            </div>
          </div>
        ) : (
          <>
            {report && (
              <DiagnosticView 
                report={report} 
                onReset={resetDiagnosis} 
                onSave={saveToHistory} 
              />
            )}
            {tireReport && (
              <TireAnalysisView 
                report={tireReport} 
                onReset={resetDiagnosis} 
                onSave={saveToHistory} 
              />
            )}
            {serviceReport && (
              <ServicesView 
                report={serviceReport}
                onReset={resetDiagnosis}
              />
            )}
            {!report && !tireReport && !serviceReport && (
              <VehicleForm 
                onDiagnose={handleDiagnose} 
                onTireScan={handleTireScan}
                onFindServices={handleFindServices}
                isLoading={isLoading} 
                history={history}
                onHistorySelect={handleHistorySelect}
                onHistoryClear={clearHistory}
              />
            )}
          </>
        )}
      </main>

      <footer className="bg-gray-950 border-t border-gray-800 py-8 px-4 mt-20">
        <div className="max-w-lg md:max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-gray-500 text-sm text-center md:text-left">
            <p>© 2026 POPTHEHOOD. All rights reserved.</p>
            <p className="mt-1 text-xs opacity-60">Developed for educational purposes. Technician oversight required.</p>
          </div>
          <div className="flex items-center space-x-6">
            <a href="#" className="text-gray-500 hover:text-white text-sm transition-colors">About</a>
            <a href="#" className="text-gray-500 hover:text-white text-sm transition-colors">Support</a>
            <a href="#" className="text-gray-500 hover:text-white text-sm transition-colors">Privacy</a>
          </div>
        </div>
        <div className="max-w-lg md:max-w-4xl mx-auto mt-8 text-center">
          <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="text-orange-500 hover:text-orange-400 text-xs font-bold transition-colors">Billing & API Key Documentation</a>
        </div>
      </footer>
    </div>
  );
};

export default App;
