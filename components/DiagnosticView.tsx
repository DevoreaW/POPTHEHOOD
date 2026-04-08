import React, { useState } from 'react';
import { DiagnosticReport, Severity } from '../types';

interface DiagnosticViewProps {
  report: DiagnosticReport;
  onReset: () => void;
  onSave?: (report: DiagnosticReport) => Promise<void> | void;
  onFindServices?: (type: 'mechanic' | 'towing') => void;
  onAskFollowUp?: (question: string, report: DiagnosticReport, userAnswer: string) => Promise<string>;
}

/* ─── Typography ──────────────────────────────────────────────────────────── */
const display: React.CSSProperties = { fontFamily: "'Open Sans', sans-serif" };
const body: React.CSSProperties    = { fontFamily: "'Open Sans', sans-serif" };

/* ─── Shared style constants ──────────────────────────────────────────────── */
const S = {
  card:      'bg-gray-950 rounded-2xl p-5 sm:p-8 border border-slate-800/60',
  secIcon:   'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
  secDiv:    'flex-1 h-px bg-slate-800/80',
  subCard:   'bg-black/40 border border-slate-800/60 rounded-xl p-5',
  fieldLabel:'text-[10px] font-bold text-slate-500 uppercase tracking-widest',
};

/* ─── Section header ──────────────────────────────────────────────────────── */
const SectionHead: React.FC<{
  icon: React.ReactNode;
  title: string;
  accent?: string;
  right?: React.ReactNode;
}> = ({ icon, title, accent = 'text-orange-500 bg-orange-500/10 border-orange-500/20', right }) => (
  <div className="flex items-center gap-3 mb-6 overflow-hidden">
    <div className={`${S.secIcon} border ${accent} flex-shrink-0`}>{icon}</div>
    <span className="font-bold text-white flex-shrink-0 tracking-wide uppercase" style={{ ...body, fontSize: 'clamp(13px, 3.5vw, 16px)' }}>
      {title}
    </span>
    <div className={S.secDiv} />
    {right && <div className="flex-shrink-0 ml-1">{right}</div>}
  </div>
);

/* ─── Severity badge ──────────────────────────────────────────────────────── */
const SeverityBadge: React.FC<{ severity: Severity }> = ({ severity }) => {
  const map = {
    [Severity.GREEN]:  { cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25', label: 'Safe to Drive'      },
    [Severity.YELLOW]: { cls: 'bg-amber-500/10  text-amber-400  border-amber-500/25',     label: 'Drive with Caution' },
    [Severity.RED]:    { cls: 'bg-rose-500/10   text-rose-400   border-rose-500/25',       label: 'Do Not Drive'       },
  };
  const { cls, label } = map[severity];
  return (
    <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold border ${cls}`} style={body}>
      {label}
    </span>
  );
};

/* ─── Probability badge colors (spec §3.5) ────────────────────────────────── */
const getProbStyle = (prob: string): string => {
  const p = prob.toUpperCase();
  if (p === 'HIGH')                           return 'text-orange-400 bg-orange-500/10 border-orange-500/25';
  if (p.includes('MEDIUM-HIGH') || p.includes('MEDIUM HIGH')) return 'text-amber-400 bg-amber-500/10 border-amber-500/25';
  if (p === 'MEDIUM')                         return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
  if (p.includes('LOW') && p.includes('MEDIUM')) return 'text-slate-500 bg-slate-500/10 border-slate-500/20';
  return 'text-slate-600 bg-slate-800/60 border-slate-700/40'; // LOW
};

/* ─── Save button states ──────────────────────────────────────────────────── */
const saveStyles = {
  idle:   'bg-black/40 text-slate-400 hover:border-orange-500/40 hover:text-orange-400 border border-slate-800',
  saving: 'bg-black/40 text-slate-600 border border-slate-800 cursor-not-allowed',
  saved:  'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25',
  error:  'bg-rose-500/10   text-rose-400   border border-rose-500/25',
};
const saveLabels = { idle: 'Save report', saving: 'Saving…', saved: 'Saved!', error: 'Save failed' };

/* ─── Component ───────────────────────────────────────────────────────────── */
const DiagnosticView: React.FC<DiagnosticViewProps> = ({ report, onReset, onSave, onFindServices, onAskFollowUp }) => {
  const [saveState, setSaveState]                   = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [shareState, setShareState]                 = useState<'idle' | 'copied'>('idle');
  const [reportedInaccuracy, setReportedInaccuracy] = useState(false);
  type FollowUpEntry = { status: 'idle' | 'open' | 'loading' | 'done'; userInput: string; answer: string | null; error: string | null };
  const [followUpState, setFollowUpState] = useState<Record<number, FollowUpEntry>>({});

  const getEntry = (i: number): FollowUpEntry =>
    followUpState[i] ?? { status: 'idle', userInput: '', answer: null, error: null };

  const setEntry = (i: number, patch: Partial<FollowUpEntry>) =>
    setFollowUpState(prev => ({ ...prev, [i]: { ...getEntry(i), ...patch } }));

  const handleQuestionClick = (i: number) => {
    const entry = getEntry(i);
    if (entry.status === 'idle') setEntry(i, { status: 'open' });
  };

  const handleSubmitAnswer = async (question: string, i: number) => {
    const entry = getEntry(i);
    if (!onAskFollowUp || !entry.userInput.trim() || entry.status === 'loading') return;
    setEntry(i, { status: 'loading', error: null });
    try {
      const answer = await onAskFollowUp(question, report, entry.userInput.trim());
      setEntry(i, { status: 'done', answer, error: null });
    } catch (err: any) {
      setEntry(i, { status: 'open', error: err.message || 'Failed to get answer. Please try again.' });
    }
  };

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

  const handleShare = async () => {
    const v = `${report.vehicle.year} ${report.vehicle.make} ${report.vehicle.model}`;
    const text = `PopTheHood Diagnosis — ${v}\n\n${report.analysisSummary}\n\nMost likely cause: ${report.mostLikelyCauses[0]?.issue}\nEstimated repair: ${report.costEstimate.total}\n\nGet your own free diagnosis at popthehood.app`;
    try {
      if (navigator.share) {
        await navigator.share({ title: `${v} Diagnosis`, text });
      } else {
        await navigator.clipboard.writeText(text);
        setShareState('copied');
        setTimeout(() => setShareState('idle'), 2500);
      }
    } catch { /* user cancelled */ }
  };

  const youtubeUrl = () =>
    `https://www.youtube.com/results?search_query=${encodeURIComponent(
      `${report.vehicle.year} ${report.vehicle.make} ${report.vehicle.model} ${report.mostLikelyCauses[0]?.issue ?? ''} repair how to`
    )}`;

  return (
    <div className="space-y-4 sm:space-y-5 max-w-lg md:max-w-4xl mx-auto px-3 sm:px-4 pb-20">

      {/* ── Assessment header ────────────────────────────────────────────── */}
      <section className={S.card}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-xl sm:text-2xl font-bold text-white" style={body}>Diagnostic Assessment</h2>

            {/* Save */}
            <button
              aria-label={saveLabels[saveState]}
              onClick={handleSave}
              disabled={saveState === 'saving' || saveState === 'saved'}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-950 ${saveStyles[saveState]}`}
              style={body}
            >
              {saveState === 'saving' && <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>}
              {saveState === 'saved'  && <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
              {saveState === 'idle'   && <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>}
              {saveState === 'error'  && <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>}
              {saveLabels[saveState]}
            </button>

            {/* Share */}
            <button
              aria-label="Share this diagnosis"
              onClick={handleShare}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-950 bg-black/40 border border-slate-800 hover:border-orange-500/40 hover:text-orange-400 text-slate-400"
              style={body}
            >
              {shareState === 'copied' ? (
                <><svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>Copied!</>
              ) : (
                <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>Share</>
              )}
            </button>
          </div>
          <SeverityBadge severity={report.severity} />
        </div>

        <div className="border-l-2 border-orange-500/30 pl-5">
          <p className="text-slate-300 leading-relaxed text-base sm:text-lg italic font-medium" style={body}>
            "{report.analysisSummary}"
          </p>
        </div>
      </section>

      {/* ── Most Likely Causes ───────────────────────────────────────────── */}
      <section className={S.card}>
        <SectionHead
          title="Most Likely Causes"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
        />
        <div className="flex flex-col gap-3">
          {report.mostLikelyCauses.map((cause, idx) => (
            <div key={idx} className={S.subCard}>
              <div className="flex justify-between items-start mb-3 gap-2">
                <h4 className="font-semibold text-white text-sm leading-snug" style={body}>{cause.issue}</h4>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full border shrink-0 ${getProbStyle(cause.probability)}`} style={body}>{cause.probability}</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed" style={body}>{cause.reasoning}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Recommended Actions ──────────────────────────────────────────── */}
      <section className={S.card}>
        <SectionHead
          title="Recommended Actions"
          accent="text-blue-400 bg-blue-500/10 border-blue-500/20"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
        />
        <div className="flex flex-col gap-3">
          {report.recommendedActions.map((action, idx) => (
            <div key={idx} className="flex items-start gap-4 bg-black/40 border border-slate-800/60 p-4 rounded-xl">
              <span className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-500 to-red-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5" style={body}>{idx + 1}</span>
              <span className="text-slate-300 text-sm leading-relaxed font-medium" style={body}>{action}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Next Steps ───────────────────────────────────────────────────── */}
      <section className={S.card}>
        <SectionHead
          title="Next Steps"
          accent="text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>}
        />

        {report.severity === Severity.RED && (
          <div className="bg-rose-500/8 border border-rose-500/25 rounded-xl p-4 mb-4 flex items-start gap-3">
            <svg className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
            <p className="text-sm text-rose-300/80" style={body}>
              <span className="font-bold text-rose-400">Do not drive this vehicle.</span> Get professional help immediately — continuing to drive risks making the problem significantly worse or dangerous.
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          {report.diyVsPro.canDiy ? (
            <>
              <a
                href={youtubeUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-500 text-white px-5 py-3.5 rounded-xl font-bold text-sm transition-all"
                style={body}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
                Watch repair tutorial
              </a>
              {onFindServices && (
                <button
                  type="button"
                  onClick={() => onFindServices('mechanic')}
                  className="flex-1 flex items-center justify-center gap-2 bg-black/40 hover:border-blue-500/40 hover:text-blue-400 text-slate-400 border border-slate-800 px-5 py-3.5 rounded-xl font-bold text-sm transition-all"
                  style={body}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><circle cx="12" cy="11" r="3" /></svg>
                  Find a mechanic anyway
                </button>
              )}
            </>
          ) : (
            <>
              {onFindServices && (
                <button
                  type="button"
                  onClick={() => onFindServices('mechanic')}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white px-5 py-3.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-500/20"
                  style={body}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><circle cx="12" cy="11" r="3" /></svg>
                  Find a mechanic near me
                </button>
              )}
              <a
                href={youtubeUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 bg-black/40 hover:border-rose-500/40 hover:text-rose-400 text-slate-400 border border-slate-800 px-5 py-3.5 rounded-xl font-bold text-sm transition-all"
                style={body}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
                Watch repair tutorial
              </a>
            </>
          )}
        </div>
      </section>

      {/* ── Cost Estimate ────────────────────────────────────────────────── */}
      <section className={`${S.card} relative overflow-hidden`}>
        <div aria-hidden="true" className="absolute top-0 right-0 w-64 h-64 bg-orange-500/4 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
        <SectionHead
          title="Cost Estimate"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
          <div className={S.subCard}>
            <p className={`${S.fieldLabel} mb-2`} style={body}>Estimated Parts</p>
            <p className="text-xl font-bold text-white" style={body}>{report.costEstimate.parts}</p>
          </div>
          <div className={S.subCard}>
            <p className={`${S.fieldLabel} mb-2`} style={body}>Estimated Labor</p>
            <p className="text-xl font-bold text-white" style={body}>{report.costEstimate.labor}</p>
          </div>
          <div className="bg-orange-500/8 border border-orange-500/20 rounded-xl p-5">
            <p className={`${S.fieldLabel} text-orange-500/70 mb-2`} style={body}>Total Est. Repair</p>
            <p className="text-xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent" style={body}>{report.costEstimate.total}</p>
          </div>
        </div>
        <div className="mt-4 p-3 bg-amber-500/5 border border-amber-500/15 rounded-xl">
          <p className="text-xs text-amber-200/50 leading-relaxed" style={body}>
            <span className="font-semibold text-amber-400/70">Regional note:</span> The same repair can cost 2–3x more in a major city vs. a rural area. Use these as a ballpark — always get 2–3 quotes from local shops before committing.
          </p>
        </div>
      </section>

      {/* ── DIY vs Pro ───────────────────────────────────────────────────── */}
      <section className={S.card}>
        <SectionHead
          title="DIY vs Professional"
          accent="text-purple-400 bg-purple-500/10 border-purple-500/20"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>}
          right={
            <span className={`px-3 py-1.5 rounded-full text-xs font-bold border shrink-0 ${report.diyVsPro.canDiy ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25' : 'bg-rose-500/10 text-rose-400 border-rose-500/25'}`} style={body}>
              {report.diyVsPro.canDiy ? 'DIY friendly' : 'Pro needed'}
            </span>
          }
        />
        <p className="text-slate-300 text-sm leading-relaxed mb-5" style={body}>{report.diyVsPro.explanation}</p>
        <div className="flex flex-col gap-4">
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-5">
            <h4 className="text-amber-400 text-xs font-bold flex items-center gap-2 mb-4" style={body}>
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              Safety warnings
            </h4>
            <ul className="space-y-2">
              {report.diyVsPro.safetyWarnings.map((w, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-amber-200/60" style={body}>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500/50 mt-1.5 shrink-0" />{w}
                </li>
              ))}
            </ul>
          </div>
          <div className={S.subCard}>
            <h4 className="font-semibold text-white text-sm mb-3" style={body}>Mechanical breakdown</h4>
            <p className="text-xs text-slate-500 leading-relaxed mb-4" style={body}>{report.mechanicalExplanation}</p>
            <div className="pt-4 border-t border-slate-800/60">
              <p className={`${S.fieldLabel} mb-2`} style={body}>Urgency & timeline</p>
              <p className="text-xs text-slate-300" style={body}><span className="font-semibold text-white mr-1">Next steps:</span>{report.urgency.timeline}</p>
              <p className="text-xs text-rose-400 mt-2 font-semibold" style={body}>{report.urgency.risksOfDelay}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Additional Context ───────────────────────────────────────────── */}
      <section className={S.card}>
        <SectionHead
          title="Additional Context"
          accent="text-slate-400 bg-slate-500/10 border-slate-500/20"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <p className={`${S.fieldLabel} mb-2`} style={body}>Known issues</p>
            <p className="text-sm text-slate-300 leading-relaxed" style={body}>{report.additionalContext.commonModelIssues}</p>
          </div>
          <div className="sm:border-l sm:border-slate-800/60 sm:pl-6">
            <p className={`${S.fieldLabel} mb-2`} style={body}>Recall alert</p>
            <p className="text-sm text-slate-300 leading-relaxed" style={body}>{report.additionalContext.recallPotential}</p>
          </div>
          <div className="sm:border-l sm:border-slate-800/60 sm:pl-6">
            <p className={`${S.fieldLabel} mb-2`} style={body}>Prevention</p>
            <p className="text-sm text-slate-300 leading-relaxed" style={body}>{report.additionalContext.prevention}</p>
          </div>
        </div>
      </section>

      {/* ── Follow-up questions ──────────────────────────────────────────── */}
      <section className={S.card}>
        <SectionHead
          title="Narrow It Down"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <p className="text-xs text-slate-600 mb-4" style={body}>Tap a question, answer it, and the AI will respond based on what you say.</p>
        <div className="flex flex-col gap-3">
          {report.followUpQuestions.map((q, i) => {
            const entry = getEntry(i);
            return (
              <div key={i} className="rounded-xl overflow-hidden border border-slate-800/60">
                {/* Question row */}
                <button
                  type="button"
                  onClick={() => handleQuestionClick(i)}
                  disabled={!onAskFollowUp || entry.status !== 'idle'}
                  className="flex items-start gap-3 bg-black/40 hover:bg-slate-900/60 p-4 text-left w-full transition-all group disabled:cursor-default disabled:hover:bg-black/40"
                  style={body}
                >
                  <span className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${entry.status === 'done' ? 'bg-emerald-500' : 'bg-orange-500 group-hover:bg-orange-400'}`} />
                  <span className="text-slate-400 text-sm leading-relaxed flex-1 group-hover:text-slate-300">{q}</span>
                  {entry.status === 'done' ? (
                    <svg className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                  ) : entry.status === 'idle' && onAskFollowUp ? (
                    <svg className="w-4 h-4 text-slate-700 group-hover:text-orange-500 shrink-0 mt-0.5 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                  ) : null}
                </button>

                {/* User input area */}
                {(entry.status === 'open' || entry.status === 'loading') && (
                  <div className="px-4 pb-4 pt-3 bg-slate-900/40 border-t border-slate-800/60 flex flex-col gap-3">
                    <p className="text-xs text-slate-500" style={body}>Your answer:</p>
                    <textarea
                      autoFocus
                      rows={3}
                      value={entry.userInput}
                      onChange={e => setEntry(i, { userInput: e.target.value })}
                      onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmitAnswer(q, i); }}
                      placeholder="Type your answer here…"
                      disabled={entry.status === 'loading'}
                      className="w-full bg-black/40 border border-slate-700/60 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600 resize-none focus:outline-none focus:border-orange-500/50 disabled:opacity-50"
                      style={body}
                    />
                    {entry.error && <p className="text-xs text-rose-400" style={body}>{entry.error}</p>}
                    <button
                      type="button"
                      onClick={() => handleSubmitAnswer(q, i)}
                      disabled={!entry.userInput.trim() || entry.status === 'loading'}
                      className="self-end flex items-center gap-2 bg-orange-500 hover:bg-orange-400 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-2 rounded-full transition-colors"
                      style={body}
                    >
                      {entry.status === 'loading' ? (
                        <><div className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Analyzing…</>
                      ) : 'Ask AI'}
                    </button>
                  </div>
                )}

                {/* AI answer */}
                {entry.status === 'done' && entry.answer && (
                  <div className="px-4 pb-4 pt-3 bg-slate-900/40 border-t border-slate-800/60">
                    <p className="text-xs text-slate-500 mb-2" style={body}>Your answer: <span className="text-slate-400">{entry.userInput}</span></p>
                    <p className="text-sm text-slate-300 leading-relaxed" style={body}>{entry.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Reset CTA ────────────────────────────────────────────────────── */}
      <div className="flex flex-col items-center gap-4 pt-4">
        <button
          aria-label="Start a new diagnostic session"
          onClick={onReset}
          className="not-italic bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white px-12 py-5 rounded-full font-black transition-all shadow-lg shadow-orange-500/20 hover:-translate-y-0.5 active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-slate-950"
          style={{ fontFamily: "'Open Sans', sans-serif", fontWeight: 900, fontSize: 20, letterSpacing: '0.04em', fontStyle: 'normal' }}
        >
          Start New Diagnostic
        </button>
        <p className="text-xs text-slate-700 max-w-lg text-center leading-relaxed" style={body}>
          AI-assisted preliminary diagnosis only. Always confirm with a certified mechanic before making repairs.
        </p>
        <button
          onClick={() => setReportedInaccuracy(true)}
          disabled={reportedInaccuracy}
          className="text-xs text-slate-800 hover:text-slate-500 transition-colors disabled:cursor-default disabled:hover:text-slate-800"
          style={body}
        >
          {reportedInaccuracy ? '✓ Thanks for the feedback' : 'Report inaccurate diagnosis'}
        </button>
      </div>

    </div>
  );
};

export default DiagnosticView;
