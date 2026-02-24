
import React, { useState } from 'react';
import { DiagnosticReport, Severity } from '../types';

interface DiagnosticViewProps {
  report: DiagnosticReport;
  onReset: () => void;
  onSave?: (report: DiagnosticReport) => void;
}

const SeverityBadge: React.FC<{ severity: Severity }> = ({ severity }) => {
  const colors = {
    [Severity.GREEN]: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    [Severity.YELLOW]: 'bg-amber-100 text-amber-800 border-amber-200',
    [Severity.RED]: 'bg-rose-100 text-rose-800 border-rose-200',
  };

  const labels = {
    [Severity.GREEN]: 'SAFE TO DRIVE',
    [Severity.YELLOW]: 'DRIVE WITH CAUTION',
    [Severity.RED]: 'DO NOT DRIVE',
  };

  const icons = {
    [Severity.GREEN]: (
      <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
    ),
    [Severity.YELLOW]: (
      <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
    ),
    [Severity.RED]: (
      <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
    ),
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold border shadow-sm ${colors[severity]}`}>
      {icons[severity]}
      {labels[severity]}
    </span>
  );
};

const DiagnosticView: React.FC<DiagnosticViewProps> = ({ report, onReset, onSave }) => {
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    if (onSave) {
      onSave(report);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-500 max-w-lg md:max-w-4xl mx-auto px-4 pb-20">
      {/* Header Info */}
      <section className="bg-slate-900 rounded-3xl shadow-2xl border border-slate-800 overflow-hidden py-12">
        <div className="p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 mt-8">
            <div className="flex items-center space-x-4">
               <h2 className="text-2xl font-black text-white uppercase tracking-tight">Diagnostic Assessment</h2>
               <button 
                  aria-label="Save report to history"
                  onClick={handleSave}
                  className={`p-3 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${isSaved ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                  title="Save to History"
               >
                 {isSaved ? (
                   <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                 ) : (
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/></svg>
                 )}
               </button>
            </div>
            <SeverityBadge severity={report.severity} />
          </div>
          <p className="text-slate-300 leading-relaxed text-xl italic font-medium">
            "{report.analysisSummary}"
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Likely Causes */}
        <section className="bg-slate-900 rounded-3xl p-8 shadow-2xl border border-slate-800 py-12">
          <h3 className="text-xl font-bold text-white mt-8 mb-6 flex items-center uppercase tracking-wider">
            <span className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center mr-4 border border-orange-500/20">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            </span>
            Most Likely Causes
          </h3>
          <div className="space-y-4">
            {report.mostLikelyCauses.map((cause, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-slate-800 border border-slate-700">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-black text-white uppercase tracking-tight">{cause.issue}</h4>
                  <span className="text-[10px] font-black px-3 py-1 rounded-full bg-slate-900 text-slate-400 uppercase tracking-widest border border-slate-700">
                    {cause.probability} Prob.
                  </span>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed font-medium">{cause.reasoning}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Action Plan */}
        <section className="bg-slate-900 rounded-3xl p-8 shadow-2xl border border-slate-800 py-12">
          <h3 className="text-xl font-bold text-white mt-8 mb-6 flex items-center uppercase tracking-wider">
            <span className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center mr-4 border border-blue-500/20">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
            </span>
            Recommended Actions
          </h3>
          <ul className="space-y-4">
            {report.recommendedActions.map((action, idx) => (
              <li key={idx} className="flex items-start bg-slate-800/50 p-4 rounded-2xl border border-slate-800">
                <span className="w-8 h-8 rounded-full bg-blue-600 text-white text-xs font-black flex items-center justify-center mr-4 mt-0.5 shrink-0 shadow-lg">
                  {idx + 1}
                </span>
                <span className="text-slate-300 leading-tight font-medium">{action}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Cost Estimate Box */}
      <section className="bg-slate-900 rounded-3xl p-10 text-white shadow-2xl relative overflow-hidden border border-slate-800 py-16">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="text-center md:text-left">
            <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-3">Estimated Parts</h3>
            <p className="text-3xl font-black tracking-tighter">{report.costEstimate.parts}</p>
          </div>
          <div className="text-center md:text-left">
            <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-3">Estimated Labor</h3>
            <p className="text-3xl font-black tracking-tighter">{report.costEstimate.labor}</p>
          </div>
          <div className="text-center md:text-left bg-white/5 p-6 rounded-2xl backdrop-blur-md border border-white/10 shadow-inner">
            <h3 className="text-orange-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Total Est. Repair</h3>
            <p className="text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">{report.costEstimate.total}</p>
          </div>
        </div>
        <p className="mt-8 text-[10px] text-slate-500 font-bold uppercase tracking-widest text-center md:text-left opacity-60">
          * Prices vary by region and vehicle year. Diagnostics usually cost 1 hour of labor.
        </p>
      </section>

      {/* DIY Section */}
      <section className="bg-slate-900 rounded-3xl p-8 shadow-2xl border border-slate-800 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mt-8 mb-8">
          <h3 className="text-xl font-bold text-white flex items-center uppercase tracking-wider">
            <span className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center mr-4 border border-purple-500/20">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/></svg>
            </span>
            DIY vs Professional Help
          </h3>
          <span className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-lg ${report.diyVsPro.canDiy ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'}`}>
            {report.diyVsPro.canDiy ? 'DIY FRIENDLY' : 'PROFESSIONAL NEEDED'}
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div>
            <p className="text-slate-300 leading-relaxed mb-6 font-medium">{report.diyVsPro.explanation}</p>
            <div className="bg-amber-500/5 border border-amber-500/20 p-6 rounded-2xl">
              <h4 className="text-amber-500 text-xs font-black flex items-center mb-3 uppercase tracking-widest">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                Safety Warnings
              </h4>
              <ul className="text-sm text-amber-200/70 space-y-2 list-disc list-inside font-medium">
                {report.diyVsPro.safetyWarnings.map((w, i) => <li key={i}>{w}</li>)}
              </ul>
            </div>
          </div>
          <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-inner">
            <h4 className="font-black text-white mb-4 uppercase tracking-tight">Mechanical Breakdown</h4>
            <p className="text-sm text-slate-400 leading-relaxed font-medium">{report.mechanicalExplanation}</p>
            <div className="mt-6 pt-6 border-t border-slate-700">
              <h5 className="text-[10px] font-black text-slate-500 mb-3 uppercase tracking-widest">Urgency & Timeline</h5>
              <p className="text-sm text-slate-300 font-medium"><span className="text-white font-black uppercase tracking-tighter mr-2">Next Steps:</span> {report.urgency.timeline}</p>
              <p className="text-sm text-rose-500 mt-2 font-black uppercase tracking-tighter italic">{report.urgency.risksOfDelay}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Context */}
      <section className="bg-slate-900 rounded-3xl p-8 border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-8 shadow-2xl">
        <div className="p-4">
          <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Known Issues</h4>
          <p className="text-sm text-slate-300 font-medium leading-relaxed">{report.additionalContext.commonModelIssues}</p>
        </div>
        <div className="p-4 border-t sm:border-t-0 sm:border-l border-slate-800">
          <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Recall Alert</h4>
          <p className="text-sm text-slate-300 font-medium leading-relaxed">{report.additionalContext.recallPotential}</p>
        </div>
        <div className="p-4 border-t sm:border-t-0 sm:border-l border-slate-800">
          <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Prevention</h4>
          <p className="text-sm text-slate-300 font-medium leading-relaxed">{report.additionalContext.prevention}</p>
        </div>
      </section>

      {/* Follow-ups */}
      <section className="bg-slate-900 rounded-3xl p-8 shadow-2xl border border-slate-800 py-12">
        <h3 className="font-black text-white mb-6 uppercase tracking-wider mt-8">To narrow this down, check for these:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {report.followUpQuestions.map((q, i) => (
            <div key={i} className="flex items-center text-slate-400 text-sm bg-slate-800 p-4 rounded-2xl border border-slate-700 font-medium">
              <span className="w-2 h-2 rounded-full bg-orange-500 mr-4 shadow-lg shadow-orange-500/20"></span>
              {q}
            </div>
          ))}
        </div>
      </section>

      <div className="flex flex-col items-center justify-center space-y-6 pt-12">
        <button 
          aria-label="Start a new diagnostic session"
          onClick={onReset}
          className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white px-12 py-5 rounded-full font-black uppercase tracking-widest transition-all shadow-2xl hover:shadow-orange-500/20 active:scale-95 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-slate-900"
        >
          Start New Diagnostic
        </button>
        <p className="text-[10px] text-slate-500 max-w-lg text-center leading-relaxed font-bold uppercase tracking-widest opacity-60">
          This is an AI-assisted preliminary diagnosis. A physical inspection by a certified mechanic is recommended for accurate diagnosis and repair.
        </p>
      </div>
    </div>
  );
};

export default DiagnosticView;
