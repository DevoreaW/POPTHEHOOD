import React, { useState } from 'react';
import { DiagnosticReport, Severity } from '../types';

interface DiagnosticViewProps {
  report: DiagnosticReport;
  onReset: () => void;
  onSave?: (report: DiagnosticReport) => Promise<void> | void;
}

/* ─── Shared style constants ──────────────────────────────────────────────── */
const S = {
  card:      'bg-gray-950 rounded-2xl p-8 border border-slate-800/60',
  secIcon:   'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
  secTitle:  'font-black italic uppercase tracking-wider text-white text-xl',
  secDiv:    'flex-1 h-px bg-slate-800/80',
  fieldLabel:'text-[9px] font-black text-slate-600 uppercase tracking-[0.18em]',
  subCard:   'bg-black/40 border border-slate-800/60 rounded-xl p-5',
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

/* ─── Severity badge ──────────────────────────────────────────────────────── */
const SeverityBadge: React.FC<{ severity: Severity }> = ({ severity }) => {
  const map = {
    [Severity.GREEN]:  { cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25', label: 'Safe to Drive',       icon: '✓' },
    [Severity.YELLOW]: { cls: 'bg-amber-500/10  text-amber-400  border-amber-500/25',  label: 'Drive with Caution', icon: '⚠' },
    [Severity.RED]:    { cls: 'bg-rose-500/10   text-rose-400   border-rose-500/25',    label: 'Do Not Drive',       icon: '✕' },
  };
  const { cls, label, icon } = map[severity];
  return (
    <span
      className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest border ${cls}`}
      style={condensed}
    >
      <span>{icon}</span>
      {label}
    </span>
  );
};

/* ─── Save button ─────────────────────────────────────────────────────────── */
const saveStyles = {
  idle:   'bg-black/40 text-slate-400 hover:border-orange-500/40 hover:text-orange-400 border border-slate-800',
  saving: 'bg-black/40 text-slate-600 border border-slate-800 cursor-not-allowed',
  saved:  'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25',
  error:  'bg-rose-500/10   text-rose-400   border border-rose-500/25',
};
const saveLabels = { idle: 'Save Report', saving: 'Saving…', saved: 'Saved!', error: 'Save Failed' };

/* ─── Component ───────────────────────────────────────────────────────────── */
const DiagnosticView: React.FC<DiagnosticViewProps> = ({ report, onReset, onSave }) => {
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const handleSave = async () => {
    if (!onSave || saveState === 'saving' || saveState === 'saved') return;
    setSaveState('saving');
    try {
      await onSave(report);
      setSaveState('saved');
      setTimeout(() => setSaveState('idle'), 3000);
    } catch {
      setSaveState('error');
      setTimeout(() => setSaveState('idle'), 3000);
    }
  };

  return (
    <div className="space-y-5 max-w-lg md:max-w-4xl mx-auto px-4 pb-20">

      {/* ── Assessment header ────────────────────────────────────────────── */}
      <section className={S.card}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-2xl font-black text-white uppercase italic" style={condensed}>
              Diagnostic Assessment
            </h2>
            {/* Save button */}
            <button
              aria-label={saveLabels[saveState]}
              onClick={handleSave}
              disabled={saveState === 'saving' || saveState === 'saved'}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-950 ${saveStyles[saveState]}`}
            >
              {saveState === 'saving' && (
                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              {saveState === 'saved' && (
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
              {saveState === 'idle' && (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
              )}
              {saveState === 'error' && (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
              {saveLabels[saveState]}
            </button>
          </div>
          <SeverityBadge severity={report.severity} />
        </div>

        {/* Summary quote */}
        <div className="border-l-2 border-orange-500/30 pl-5">
          <p className="text-slate-300 leading-relaxed text-lg italic font-medium">
            "{report.analysisSummary}"
          </p>
        </div>
      </section>

      {/* ── Most Likely Causes ───────────────────────────────────────────── */}
      <section className={S.card}>
        <SectionHead
          title="Most Likely Causes"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {report.mostLikelyCauses.map((cause, idx) => (
            <div key={idx} className={S.subCard}>
              <div className="flex justify-between items-start mb-3 gap-2">
                <h4
                  className="font-black text-white uppercase text-sm italic"
                  style={condensed}
                >
                  {cause.issue}
                </h4>
                <span className="text-[9px] font-black px-2 py-1 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 uppercase tracking-widest shrink-0">
                  {cause.probability}
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">{cause.reasoning}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Recommended Actions ──────────────────────────────────────────── */}
      <section className={S.card}>
        <SectionHead
          title="Recommended Actions"
          accent="text-blue-400 bg-blue-500/10 border-blue-500/20"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          }
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {report.recommendedActions.map((action, idx) => (
            <div key={idx} className="flex items-start gap-4 bg-black/40 border border-slate-800/60 p-4 rounded-xl">
              <span
                className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-500 to-red-600 text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5"
                style={condensed}
              >
                {idx + 1}
              </span>
              <span className="text-slate-300 text-sm leading-relaxed font-medium">{action}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Cost Estimate ────────────────────────────────────────────────── */}
      <section className={`${S.card} relative overflow-hidden`}>
        <div aria-hidden="true" className="absolute top-0 right-0 w-64 h-64 bg-orange-500/4 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
        <SectionHead
          title="Cost Estimate"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
          <div className={S.subCard}>
            <p className={`${S.fieldLabel} mb-2`}>Estimated Parts</p>
            <p className="text-xl font-black text-white tracking-tight" style={condensed}>{report.costEstimate.parts}</p>
          </div>
          <div className={S.subCard}>
            <p className={`${S.fieldLabel} mb-2`}>Estimated Labor</p>
            <p className="text-xl font-black text-white tracking-tight" style={condensed}>{report.costEstimate.labor}</p>
          </div>
          <div className="bg-orange-500/8 border border-orange-500/20 rounded-xl p-5">
            <p className="text-[9px] font-black text-orange-500/70 uppercase tracking-[0.18em] mb-2">Total Est. Repair</p>
            <p
              className="text-xl font-black tracking-tight bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent"
              style={condensed}
            >
              {report.costEstimate.total}
            </p>
          </div>
        </div>
        <p className="mt-5 text-[9px] text-slate-700 font-bold uppercase tracking-widest">
          * Prices vary by region and vehicle year. Diagnostics usually cost 1 hour of labor.
        </p>
      </section>

      {/* ── DIY vs Pro ───────────────────────────────────────────────────── */}
      <section className={S.card}>
        <SectionHead
          title="DIY vs Professional"
          accent="text-purple-400 bg-purple-500/10 border-purple-500/20"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          }
          right={
            <span
              className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shrink-0 ${report.diyVsPro.canDiy ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25' : 'bg-rose-500/10 text-rose-400 border-rose-500/25'}`}
              style={condensed}
            >
              {report.diyVsPro.canDiy ? 'DIY Friendly' : 'Pro Needed'}
            </span>
          }
        />

        <p className="text-slate-300 text-sm leading-relaxed mb-5 font-medium">{report.diyVsPro.explanation}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Safety warnings */}
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-5">
            <h4 className="text-amber-400 text-[9px] font-black flex items-center gap-2 mb-4 uppercase tracking-widest">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Safety Warnings
            </h4>
            <ul className="space-y-2">
              {report.diyVsPro.safetyWarnings.map((w, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-amber-200/60 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500/50 mt-1.5 shrink-0" />
                  {w}
                </li>
              ))}
            </ul>
          </div>

          {/* Mechanical breakdown */}
          <div className={S.subCard}>
            <h4
              className="font-black text-white text-sm italic uppercase tracking-wide mb-3"
              style={condensed}
            >
              Mechanical Breakdown
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">{report.mechanicalExplanation}</p>
            <div className="pt-4 border-t border-slate-800/60">
              <p className={`${S.fieldLabel} mb-2`}>Urgency & Timeline</p>
              <p className="text-xs text-slate-300 font-medium">
                <span className="text-white font-black uppercase tracking-tight mr-1" style={condensed}>Next Steps:</span>
                {report.urgency.timeline}
              </p>
              <p className="text-xs text-rose-400 mt-2 font-black uppercase tracking-tight italic" style={condensed}>
                {report.urgency.risksOfDelay}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Additional Context ───────────────────────────────────────────── */}
      <section className={S.card}>
        <SectionHead
          title="Additional Context"
          accent="text-slate-400 bg-slate-500/10 border-slate-500/20"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <p className={`${S.fieldLabel} mb-2`}>Known Issues</p>
            <p className="text-sm text-slate-300 font-medium leading-relaxed">{report.additionalContext.commonModelIssues}</p>
          </div>
          <div className="sm:border-l sm:border-slate-800/60 sm:pl-6">
            <p className={`${S.fieldLabel} mb-2`}>Recall Alert</p>
            <p className="text-sm text-slate-300 font-medium leading-relaxed">{report.additionalContext.recallPotential}</p>
          </div>
          <div className="sm:border-l sm:border-slate-800/60 sm:pl-6">
            <p className={`${S.fieldLabel} mb-2`}>Prevention</p>
            <p className="text-sm text-slate-300 font-medium leading-relaxed">{report.additionalContext.prevention}</p>
          </div>
        </div>
      </section>

      {/* ── Follow-up questions ──────────────────────────────────────────── */}
      <section className={S.card}>
        <SectionHead
          title="Narrow It Down"
          accent="text-orange-500 bg-orange-500/10 border-orange-500/20"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {report.followUpQuestions.map((q, i) => (
            <div key={i} className="flex items-start gap-3 bg-black/40 border border-slate-800/60 p-4 rounded-xl">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-2 shrink-0 shadow-sm shadow-orange-500/30" />
              <span className="text-slate-400 text-sm font-medium leading-relaxed">{q}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Reset CTA ────────────────────────────────────────────────────── */}
      <div className="flex flex-col items-center gap-5 pt-4">
        <button
          aria-label="Start a new diagnostic session"
          onClick={onReset}
          className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white px-12 py-5 rounded-full font-black uppercase tracking-widest transition-all shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 hover:-translate-y-0.5 active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-slate-950"
          style={{ fontFamily: "'Barlow Condensed', sans-serif", fontStyle: 'italic', fontSize: 20 }}
        >
          Start New Diagnostic
        </button>
        <p className="text-[9px] text-slate-700 max-w-lg text-center leading-relaxed font-bold uppercase tracking-widest">
          AI-assisted preliminary diagnosis only. A physical inspection by a certified mechanic is recommended for accurate diagnosis and repair.
        </p>
      </div>

    </div>
  );
};

export default DiagnosticView;