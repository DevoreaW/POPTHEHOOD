import React from 'react';
import { SignInButton, SignUpButton, UserButton, useUser } from '@clerk/react';
import LogoMark from './LogoMark';

interface HeaderProps {
  onLogoClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLogoClick }) => {
  const { isSignedIn, isLoaded } = useUser();

  return (
    <header
      className="bg-gray-950 text-white py-4 px-4 sticky top-0 z-50 border-b border-slate-800/60"
      role="banner"
    >
      <div className="max-w-lg md:max-w-4xl mx-auto flex items-center justify-between">

        {/* ── Logo — clickable, goes back to landing ── */}
        <button
          onClick={onLogoClick}
          className="flex items-center gap-3 bg-transparent border-none cursor-pointer p-0 text-left focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-950 rounded-xl group"
          aria-label="Go to home screen"
        >
          <LogoMark compact />
        </button>

        {/* ── Right side ── */}
        <div className="flex items-center gap-3 flex-shrink-0">

          {/* System status */}
          <div className="hidden sm:flex flex-col items-end mr-1" aria-hidden="true">
            <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.15em]">
              System Status
            </span>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <span className="text-[11px] font-black text-emerald-500 uppercase tracking-wide">
                Online
              </span>
            </div>
          </div>

          {/* Auth */}
          {isLoaded && (
            <>
              {isSignedIn ? (
                <UserButton appearance={{ elements: { avatarBox: 'w-9 h-9' } }} />
              ) : (
                <nav aria-label="Authentication" className="flex items-center gap-2 whitespace-nowrap">
                  <SignInButton mode="modal">
                    <button
                      className="text-[11px] font-bold text-slate-500 hover:text-white uppercase tracking-widest transition-colors whitespace-nowrap px-2 py-1"
                      aria-label="Sign in to your account"
                    >
                      Sign In
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button
                      className="text-[11px] font-bold bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white px-4 py-2 rounded-full uppercase tracking-widest transition-all whitespace-nowrap"
                      aria-label="Create a new account"
                    >
                      Sign Up
                    </button>
                  </SignUpButton>
                </nav>
              )}
            </>
          )}
        </div>

      </div>
    </header>
  );
};

export default Header;