
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-gray-950 text-white py-6 px-4 shadow-2xl sticky top-0 z-50 border-b border-gray-800">
      <div className="max-w-lg md:max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="bg-gradient-to-br from-orange-500 to-red-600 p-2.5 rounded-xl shadow-lg shadow-orange-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter uppercase italic">POPTHEHOOD</h1>
            <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.3em] leading-none mt-1">Diagnose Before You Dial</p>
          </div>
        </div>
        <div className="hidden sm:flex flex-col items-end">
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">System Status</div>
          <div className="flex items-center space-x-2 mt-1">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold text-emerald-500 uppercase tracking-tighter">Online</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
