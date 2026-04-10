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

          {/* Auth */}
          {isLoaded && (
            <>
              {isSignedIn ? (
                <UserButton appearance={{ elements: { avatarBox: 'w-9 h-9' } }} />
              ) : (
                <nav aria-label="Authentication" className="flex items-center gap-2 whitespace-nowrap">
                  <SignInButton mode="modal">
                    <button
                      className="text-sm font-medium text-slate-400 hover:text-white transition-colors whitespace-nowrap px-3 py-1.5"
                      aria-label="Sign in to your account"
                    >
                      Sign in
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button
                      className="text-sm font-semibold bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 text-white px-4 py-2 rounded-xl transition-all whitespace-nowrap"
                      aria-label="Create a new account"
                    >
                      Sign up
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