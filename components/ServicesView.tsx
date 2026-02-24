
import React from 'react';
import { ServiceSearchReport } from '../types';

interface ServicesViewProps {
  report: ServiceSearchReport;
  onReset: () => void;
}

const ServicesView: React.FC<ServicesViewProps> = ({ report, onReset }) => {
  const isTowing = report.type === 'towing';
  const [isExpanded, setIsExpanded] = React.useState(false);
  const shouldTruncate = report.text.length > 280;

  return (
    <div className="max-w-lg md:max-w-4xl mx-auto px-4 pb-20 space-y-12 animate-in slide-in-from-bottom-4 duration-500">
      <div className="bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-800">
        <div className={`p-10 text-white relative border-b border-white/5 ${isTowing ? 'bg-gradient-to-br from-rose-600 to-red-800' : 'bg-gradient-to-br from-blue-600 to-indigo-800'}`}>
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <h2 className="text-3xl font-black uppercase tracking-tighter italic">
                {isTowing ? 'Emergency Towing' : 'Nearby Mechanics'}
              </h2>
              <p className="text-white/70 font-black uppercase tracking-[0.2em] text-[10px] mt-2">Verified local services near your location</p>
            </div>
            <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/20 shadow-inner">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isTowing ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                )}
              </svg>
            </div>
          </div>
        </div>

        <div className="p-10">
          {/* Refactored Description as "Expert Note" */}
          <div className="mb-12">
            <div className="flex items-center space-x-3 mb-4">
              <div className="h-[1px] flex-grow bg-slate-800"></div>
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] whitespace-nowrap">Expert Recommendation</h3>
              <div className="h-[1px] flex-grow bg-slate-800"></div>
            </div>
            <div className="relative group">
              <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-orange-500 to-transparent rounded-full opacity-50"></div>
              <div className="px-4">
                <p className={`text-slate-300 text-base md:text-lg leading-relaxed italic font-medium transition-all duration-500 ${!isExpanded && shouldTruncate ? 'line-clamp-3' : ''}`}>
                  "{report.text}"
                </p>
                {shouldTruncate && (
                  <button 
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="mt-4 text-[10px] font-black text-orange-500 uppercase tracking-widest hover:text-orange-400 transition-colors focus:outline-none"
                  >
                    {isExpanded ? 'Show Less' : 'Read Full Analysis'}
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {report.places.length > 0 ? (
              report.places.map((place, idx) => (
                <a 
                  key={idx}
                  href={place.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Open ${place.title} in Google Maps`}
                  className="group flex flex-col md:flex-row md:items-center justify-between p-8 bg-slate-800 border border-slate-700 rounded-3xl hover:border-orange-500/40 hover:shadow-2xl transition-all focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                >
                  <div className="flex-grow">
                    <h3 className="text-xl font-black text-white group-hover:text-orange-500 transition-colors mb-3 uppercase tracking-tight">
                      {place.title}
                    </h3>
                    {place.snippet && (
                      <p className="text-sm text-slate-500 line-clamp-2 italic font-medium">
                        "{place.snippet}"
                      </p>
                    )}
                  </div>
                  <div className="mt-6 md:mt-0 md:ml-8 flex items-center space-x-3 bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shrink-0 group-hover:bg-orange-600 transition-all shadow-lg">
                    <span>Open in Maps</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                  </div>
                </a>
              ))
            ) : (
              <div className="text-center py-16 bg-slate-800/30 rounded-3xl border-2 border-dashed border-slate-800">
                <p className="text-slate-500 font-black uppercase tracking-widest text-xs">No verified map results found in this area.</p>
              </div>
            )}
          </div>
        </div>

        <div className="p-10 bg-slate-950 border-t border-slate-800 flex justify-center">
          <button 
            aria-label="Return to dashboard"
            onClick={onReset}
            className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white px-12 py-5 rounded-full font-black uppercase tracking-widest transition-all shadow-2xl hover:shadow-orange-500/20 active:scale-95 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-slate-950"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServicesView;
