
import React, { useState } from 'react';
import { TireAnalysisReport } from '../types';

interface TireAnalysisViewProps {
  report: TireAnalysisReport;
  onReset: () => void;
  onSave?: (report: TireAnalysisReport) => void;
}

const TireAnalysisView: React.FC<TireAnalysisViewProps> = ({ report, onReset, onSave }) => {
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    if (onSave) {
      onSave(report);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    }
  };

  const getConditionColor = (cond: string) => {
    switch (cond) {
      case 'Excellent':
      case 'Good': return 'text-emerald-500';
      case 'Fair': return 'text-amber-500';
      case 'Replace Soon': return 'text-orange-500';
      case 'Dangerous': return 'text-rose-500';
      default: return 'text-slate-500';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 50) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div className="max-w-lg md:max-w-4xl mx-auto px-4 pb-20 space-y-12 animate-in zoom-in-95 duration-500">
      <div className="bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-800">
        <div className="bg-slate-950 p-10 text-white relative border-b border-slate-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div>
              <div className="flex items-center space-x-4 mb-2">
                <h2 className="text-3xl font-black uppercase tracking-tighter italic">Tire Scan Results</h2>
                <button 
                  aria-label="Save tire report to history"
                  onClick={handleSave}
                  className={`p-3 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${isSaved ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
                  title="Save to History"
                >
                   {isSaved ? (
                     <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                   ) : (
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/></svg>
                   )}
                </button>
              </div>
              <p className="text-slate-500 font-black uppercase tracking-[0.2em] text-xs">Digital Tread Analysis Report</p>
            </div>
            <div className="flex items-center gap-6 bg-white/5 p-6 rounded-2xl backdrop-blur-md border border-white/10 shadow-inner">
              <div className="text-center">
                <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-black mb-1">Health Score</div>
                <div className="text-5xl font-black tracking-tighter">{report.healthScore}%</div>
              </div>
              <div className="w-16 h-16 rounded-full border-4 border-slate-800 flex items-center justify-center shadow-2xl">
                <div className={`w-10 h-10 rounded-full ${getScoreColor(report.healthScore)} shadow-[0_0_20px_rgba(0,0,0,0.5)] animate-pulse`}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-16">
            <div>
              <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mb-6">Current Condition</h3>
              <div className={`text-5xl font-black mb-4 tracking-tighter uppercase italic ${getConditionColor(report.condition)}`}>
                {report.condition}
              </div>
              <p className="text-slate-400 leading-relaxed text-lg font-medium">
                {report.recommendation}
              </p>
            </div>
            <div className="bg-slate-800/50 rounded-3xl p-8 border border-slate-800 flex flex-col justify-center shadow-inner">
              <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mb-6">Tread Depth Est.</h3>
              <div className="text-6xl font-black text-white mb-4 tracking-tighter">
                {report.estimatedTreadDepth}
              </div>
              <div className="w-full bg-slate-900 h-4 rounded-full overflow-hidden mt-6 border border-slate-800">
                <div 
                  className={`h-full ${getScoreColor(report.healthScore)} transition-all duration-1000 shadow-[0_0_15px_rgba(0,0,0,0.5)]`} 
                  style={{ width: `${report.healthScore}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-[10px] font-black text-slate-500 mt-4 uppercase tracking-widest">
                <span>Replace</span>
                <span>Marginal</span>
                <span>Healthy</span>
              </div>
            </div>
          </div>

          <div className="space-y-10">
            <div>
              <h3 className="text-white font-black mb-6 flex items-center uppercase tracking-widest">
                <svg className="w-6 h-6 mr-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                Detailed Findings
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {report.findings.map((finding, i) => (
                  <div key={i} className="flex items-start p-5 bg-slate-800/50 rounded-2xl text-sm text-slate-300 font-medium border border-slate-800">
                    <span className="w-2 h-2 rounded-full bg-orange-500 mr-4 mt-1.5 shrink-0 shadow-lg shadow-orange-500/20"></span>
                    {finding}
                  </div>
                ))}
              </div>
            </div>

            {report.visualAnomalies.length > 0 && (
              <div>
                <h3 className="text-white font-black mb-6 flex items-center uppercase tracking-widest">
                  <svg className="w-6 h-6 mr-3 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                  Visual Alerts
                </h3>
                <div className="flex flex-wrap gap-3">
                  {report.visualAnomalies.map((anomaly, i) => (
                    <span key={i} className="px-5 py-2 bg-orange-500/10 text-orange-500 rounded-full text-[10px] font-black border border-orange-500/20 uppercase tracking-[0.2em] shadow-lg">
                      {anomaly}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {report.safetyWarning && (
              <div className="bg-rose-500/10 border-l-4 border-rose-500 p-8 rounded-r-3xl shadow-2xl">
                <div className="flex">
                  <div className="shrink-0">
                    <svg className="h-8 w-8 text-rose-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1-1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xs font-black text-rose-500 uppercase tracking-[0.3em]">Urgent Safety Warning</h3>
                    <div className="mt-3 text-sm text-rose-200/70 font-medium leading-relaxed">
                      {report.safetyWarning}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="p-10 bg-slate-950 border-t border-slate-800 flex flex-col items-center">
          <button 
            aria-label="Scan another tire"
            onClick={onReset}
            className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white px-12 py-5 rounded-full font-black uppercase tracking-widest transition-all shadow-2xl hover:shadow-orange-500/20 active:scale-95 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-slate-950 mb-6"
          >
            Scan Another Tire
          </button>
          <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.3em] text-center opacity-60">
            AI-Assisted Visual Inspection • For Estimation Only
          </p>
        </div>
      </div>
    </div>
  );
};

export default TireAnalysisView;
