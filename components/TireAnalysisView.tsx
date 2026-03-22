import React, { useState } from 'react';
import { TireAnalysisReport } from '../types';

interface TireAnalysisViewProps {
  report: TireAnalysisReport;
  onReset: () => void;
  onSave?: (report: TireAnalysisReport) => void;
}

/* ─── Shared style constants ──────────────────────────────────────────────── */
const S = {
  card:     'bg-gray-950 rounded-2xl p-8 border border-slate-800/60',
  secIcon:  'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
  secTitle: 'font-black italic uppercase tracking-wider text-white text-xl',
  secDiv:   'flex-1 h-px bg-slate-800/80',
  subCard:  'bg-black/40 border border-slate-800/60 rounded-xl p-5',
  label:    'text-[9px] font-black text-slate-600 uppercase tracking-[0.18em]',
};

const condensed: React.CSSProperties = { fontFamily: "'Barlow Condensed', sans-serif" };

/* ─── Section header ──────────────────────────────────────────────────────── */
const SectionHead: React.FC<{
  icon: React.ReactNode;
  title: string;
  accent?: string;
  right?: React.ReactNode;
}> = ({ icon, title, accent = 'text-orange-500 bg-orange-500/10 border-orange-500/20', right }) => (
  <div className="flex items-center gap-3 mb-7">
    <div className={`${S.secIcon} border ${accent}`}>{icon}</div>
    <span className={S.secTitle} style={condensed}>{title}</span>
    <div className={S.secDiv} />
    {right}
  </div>
);

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
const getConditionColor = (cond: string) => {
  switch (cond) {
    case 'Excellent':
    case 'Good':        return 'text-emerald-400';
    case 'Fair':        return 'text-amber-400';
    case 'Replace Soon': return 'text-orange-400';
    case 'Dangerous':   return 'text-rose-400';
    default:            return 'text-slate-400';
  }
};

const getScoreGradient = (score: number) => {
  if (score >= 80) return 'from-emerald-500 to-emerald-400';
  if (score >= 50) return 'from-amber-500 to-amber-400';
  return 'from-rose-500 to-rose-400';
};

const getScoreBg = (score: number) => {
  if (score >= 80) return 'bg-emerald-500';
  if (score >= 50) return 'bg-amber-500';
  return 'bg-rose-500';
};

/* ─── Component ───────────────────────────────────────────────────────────── */
const TireAnalysisView: React.FC<TireAnalysisViewProps> = ({ report, onReset, onSave }) => {
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    if (onSave) {
      onSave(report);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    }
  };

  return (
    <div className="max-w-lg md:max-w-4xl mx-auto px-4 pb-20 space-y-5">

      {/* ── Header card ──────────────────────────────────────────────────── */}
      <section className={S.card}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Title + save */}
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-2xl font-black text-white uppercase italic" style={condensed}>
                Tire Scan Results
              </h2>
              <button
                aria-label={isSaved ? 'Saved' : 'Save tire report to history'}
                onClick={handleSave}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-950
                  ${isSaved
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                    : 'bg-black/40 text-slate-500 border-slate-800 hover:border-orange-500/40 hover:text-orange-400'
                  }`}
              >
                {isSaved ? (
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                )}
                {isSaved ? 'Saved!' : 'Save Report'}
              </button>
            </div>
            <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">
              Digital Tread Analysis Report
            </p>
          </div>

          {/* Health score */}
          <div className="flex items-center gap-5 bg-black/40 border border-slate-800/60 px-6 py-4 rounded-xl self-start md:self-auto">
            <div className="text-center">
              <p className={`${S.label} mb-1`}>Health Score</p>
              <p
                className={`text-5xl font-black bg-gradient-to-br ${getScoreGradient(report.healthScore)} bg-clip-text text-transparent`}
                style={condensed}
              >
                {report.healthScore}%
              </p>
            </div>
            <div className="relative w-14 h-14">
              <div className="absolute inset-0 rounded-full border-4 border-slate-800" />
              <div className={`absolute inset-2 rounded-full ${getScoreBg(report.healthScore)} animate-pulse shadow-lg`} />
            </div>
          </div>
        </div>
      </section>

      {/* ── Condition + Tread Depth ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Condition */}
        <section className={S.card}>
          <p className={`${S.label} mb-4`}>Current Condition</p>
          <p
            className={`text-5xl font-black uppercase italic mb-4 ${getConditionColor(report.condition)}`}
            style={condensed}
          >
            {report.condition}
          </p>
          <p className="text-slate-400 text-sm leading-relaxed font-medium">{report.recommendation}</p>
        </section>

        {/* Tread depth */}
        <section className={S.card}>
          <p className={`${S.label} mb-4`}>Tread Depth Est.</p>
          <p className="text-5xl font-black text-white mb-6 italic" style={condensed}>
            {report.estimatedTreadDepth}
          </p>
          <div className="w-full bg-black/40 border border-slate-800/60 h-3 rounded-full overflow-hidden">
            <div
              className={`h-full ${getScoreBg(report.healthScore)} transition-all duration-1000`}
              style={{ width: `${report.healthScore}%` }}
            />
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest">Replace</span>
            <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest">Marginal</span>
            <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest">Healthy</span>
          </div>
        </section>
      </div>

      {/* ── Detailed Findings ────────────────────────────────────────────── */}
      <section className={S.card}>
        <SectionHead
          title="Detailed Findings"
          accent="text-slate-400 bg-slate-500/10 border-slate-500/20"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {report.findings.map((finding, i) => (
            <div key={i} className="flex items-start gap-3 bg-black/40 border border-slate-800/60 p-4 rounded-xl">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2 shrink-0 shadow-sm shadow-orange-500/30" />
              <span className="text-slate-400 text-sm font-medium leading-relaxed">{finding}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Visual Alerts ────────────────────────────────────────────────── */}
      {report.visualAnomalies.length > 0 && (
        <section className={S.card}>
          <SectionHead
            title="Visual Alerts"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            }
          />
          <div className="flex flex-wrap gap-2">
            {report.visualAnomalies.map((anomaly, i) => (
              <span
                key={i}
                className="px-4 py-2 bg-orange-500/8 text-orange-400 rounded-full text-[9px] font-black border border-orange-500/20 uppercase tracking-widest"
                style={condensed}
              >
                {anomaly}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* ── Safety Warning ───────────────────────────────────────────────── */}
      {report.safetyWarning && (
        <div className="bg-rose-500/8 border border-rose-500/25 rounded-2xl p-6">
          <div className="flex gap-4">
            <div className="shrink-0 w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3
                className="text-[9px] font-black text-rose-400 uppercase tracking-[0.2em] mb-2"
                style={condensed}
              >
                Urgent Safety Warning
              </h3>
              <p className="text-sm text-rose-200/60 font-medium leading-relaxed">{report.safetyWarning}</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Reset CTA ────────────────────────────────────────────────────── */}
      <div className="flex flex-col items-center gap-4 pt-4">
        <button
          aria-label="Scan another tire"
          onClick={onReset}
          className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white px-12 py-5 rounded-full font-black uppercase tracking-widest transition-all shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 hover:-translate-y-0.5 active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-slate-950"
          style={{ fontFamily: "'Barlow Condensed', sans-serif", fontStyle: 'italic', fontSize: 20 }}
        >
          Scan Another Tire
        </button>
        <p className="text-[9px] text-slate-700 font-black uppercase tracking-widest text-center">
          AI-Assisted Visual Inspection · For Estimation Only
        </p>
      </div>

    </div>
  );
};

export default TireAnalysisView;