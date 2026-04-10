import React, { useState } from 'react';
import { ServiceSearchReport } from '../types';

function isSafeUrl(url: string): boolean {
  try {
    const { protocol } = new URL(url);
    return protocol === 'https:' || protocol === 'http:';
  } catch {
    return false;
  }
}

interface ServicesViewProps {
  report: ServiceSearchReport;
  onReset: () => void;
}

/* ─── Typography ──────────────────────────────────────────────────────────── */
const body: React.CSSProperties = { fontFamily: "'Open Sans', sans-serif" };

/* ─── Shared style constants ──────────────────────────────────────────────── */
const S = {
  card:    'bg-gray-950 rounded-2xl p-5 sm:p-8 border border-slate-800/60',
  secIcon: 'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
  secDiv:  'flex-1 h-px bg-slate-800/80',
};

/* ─── Section header ──────────────────────────────────────────────────────── */
const SectionHead: React.FC<{
  icon: React.ReactNode;
  title: string;
  accent?: string;
}> = ({ icon, title, accent = 'text-orange-500 bg-orange-500/10 border-orange-500/20' }) => (
  <div className="flex items-center gap-3 mb-6 overflow-hidden">
    <div className={`${S.secIcon} border ${accent} flex-shrink-0`}>{icon}</div>
    <span
      className="font-bold text-white flex-shrink-0 tracking-wide uppercase"
      style={{ ...body, fontSize: 'clamp(13px, 3.5vw, 16px)' }}
    >
      {title}
    </span>
    <div className={S.secDiv} />
  </div>
);

/* ─── Component ───────────────────────────────────────────────────────────── */
const ServicesView: React.FC<ServicesViewProps> = ({ report, onReset }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const isTowing       = report.type === 'towing';
  const shouldTruncate = report.text.length > 280;

  const accentTowing   = 'text-rose-400 bg-rose-500/10 border-rose-500/20';
  const accentMechanic = 'text-blue-400 bg-blue-500/10 border-blue-500/20';
  const accent         = isTowing ? accentTowing : accentMechanic;

  return (
    <div className="max-w-lg md:max-w-4xl mx-auto px-3 sm:px-4 pb-20 space-y-4 sm:space-y-5">

      {/* ── Header card ──────────────────────────────────────────────────── */}
      <section className={S.card}>
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-xl border flex items-center justify-center flex-shrink-0 ${accent}`}>
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isTowing ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              )}
            </svg>
          </div>
          <div>
            {/* Title: regular Barlow bold */}
            <h2 className="text-xl sm:text-2xl font-bold text-white" style={body}>
              {isTowing ? 'Emergency Towing' : 'Nearby Mechanics'}
            </h2>
            <p className="text-xs text-slate-600 mt-0.5" style={body}>
              Local services near you
            </p>
          </div>
        </div>
      </section>

      {/* ── Expert recommendation ────────────────────────────────────────── */}
      <section className={S.card}>
        <SectionHead
          title="Expert Recommendation"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          }
        />
        <div className="border-l-2 border-orange-500/30 pl-5">
          <p
            className={`text-slate-300 text-sm sm:text-base leading-relaxed italic transition-all duration-300 ${!isExpanded && shouldTruncate ? 'line-clamp-3' : ''}`}
            style={body}
          >
            "{report.text}"
          </p>
          {shouldTruncate && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-3 text-xs font-semibold text-orange-500 hover:text-orange-400 transition-colors focus:outline-none"
              style={body}
            >
              {isExpanded ? 'Show less' : 'Read full analysis'}
            </button>
          )}
        </div>
      </section>

      {/* ── Places list ──────────────────────────────────────────────────── */}
      <section className={S.card}>
        <SectionHead
          title={isTowing ? 'Towing Services' : 'Mechanic Shops'}
          accent={accent}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
          }
        />

        {report.places.length > 0 ? (
          <div className="space-y-3">
            {report.places.map((place, idx) => (
              <a
                key={idx}
                href={isSafeUrl(place.uri) ? place.uri : '#'}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Open ${place.title} in Google Maps`}
                className="group flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 sm:p-5 bg-black/40 border border-slate-800/60 rounded-xl hover:border-orange-500/30 hover:bg-slate-900/60 transition-all focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-950"
              >
                {/* Rank + info */}
                <div className="flex items-start gap-4">
                  <span
                    className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 text-white text-sm font-bold flex items-center justify-center shrink-0 mt-0.5"
                    style={body}
                  >
                    {idx + 1}
                  </span>
                  <div className="min-w-0">
                    {/* Place name: regular semibold — much easier to read */}
                    <h3
                      className="text-sm sm:text-base font-semibold text-white group-hover:text-orange-400 transition-colors mb-1"
                      style={body}
                    >
                      {place.title}
                    </h3>
                    {place.snippet && (
                      <p className="text-xs text-slate-500 italic line-clamp-2" style={body}>
                        "{place.snippet}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Maps CTA */}
                <div
                  className="flex items-center gap-2 bg-black/40 border border-slate-800 group-hover:border-orange-500/30 group-hover:bg-orange-500/8 text-slate-500 group-hover:text-orange-400 px-4 py-2.5 rounded-xl text-xs font-medium shrink-0 transition-all self-start md:self-auto"
                  style={body}
                >
                  Open in Maps
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border-2 border-dashed border-slate-800/60 rounded-xl">
            <p className="text-sm text-slate-700" style={body}>
              No verified map results found in this area.
            </p>
          </div>
        )}
      </section>

      {/* ── Reset CTA — orange button ────────────────────────────────────── */}
      <div className="flex justify-center pt-4">
        <button
          aria-label="Return to dashboard"
          onClick={onReset}
          className="not-italic bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white px-12 py-5 rounded-full font-black transition-all shadow-lg shadow-orange-500/20 hover:-translate-y-0.5 active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-slate-950"
          style={{ fontFamily: "'Open Sans', sans-serif", fontWeight: 900, fontSize: 20, letterSpacing: '0.04em', fontStyle: 'normal' }}
        >
          New Search
        </button>
      </div>

    </div>
  );
};

export default ServicesView;