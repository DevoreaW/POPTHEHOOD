import React from 'react';
import { SignInButton, SignUpButton, UserButton, useUser } from '@clerk/react';

const Header: React.FC = () => {
  const { isSignedIn, isLoaded } = useUser();

  return (
    <header className="bg-gray-950 text-white py-4 px-4 shadow-2xl sticky top-0 z-50 border-b border-gray-800">
      <div className="max-w-lg md:max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-br from-orange-500 to-red-600 p-2.5 rounded-xl shadow-lg shadow-orange-500/20 flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-black tracking-tighter uppercase italic leading-none">POPTHEHOOD</h1>
            <p className="text-[9px] font-black text-orange-500 uppercase tracking-[0.2em] leading-none mt-1 whitespace-nowrap">Diagnose Before You Dial</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 flex-shrink-0">
          <div className="hidden sm:flex flex-col items-end mr-2">
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">System Status</div>
            <div className="flex items-center space-x-2 mt-1">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-bold text-emerald-500 uppercase tracking-tighter">Online</span>
            </div>
          </div>

          {isLoaded && (
            <>
              {isSignedIn ? (
                <UserButton appearance={{
                  elements: {
                    avatarBox: "w-9 h-9"
                  }
                }} />
              ) : (
                <div className="flex items-center space-x-2 whitespace-nowrap">
                  <SignInButton mode="modal">
                    <button className="text-xs font-bold text-slate-300 hover:text-white uppercase tracking-wide transition-colors whitespace-nowrap">
                      Sign In
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button className="text-xs font-bold bg-gradient-to-r from-orange-500 to-red-600 text-white px-3 py-2 rounded-full uppercase tracking-wide hover:from-orange-400 hover:to-red-500 transition-all whitespace-nowrap">
                      Sign Up
                    </button>
                  </SignUpButton>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;