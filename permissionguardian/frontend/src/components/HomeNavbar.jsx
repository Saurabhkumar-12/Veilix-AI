import React, { useState } from 'react';
import { ArrowRight, Menu, X, User, LogIn, LogOut, ShieldCheck, Sparkles } from 'lucide-react';
import { Spotlight } from '@/components/ui/spotlight';

export default function HomeNavbar({ onGetStarted, onOpenLogin, onLogout, currentUser }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleScroll = (selector) => {
    setMobileMenuOpen(false);
    if (selector === '#home' || selector === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const el = document.querySelector(selector);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleAction = () => {
    setMobileMenuOpen(false);
    if (onGetStarted) {
      onGetStarted();
    } else if (onOpenLogin) {
      onOpenLogin();
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#000000]/90 backdrop-blur-md border-b border-white/10 font-sans select-none overflow-hidden">
      
      {/* Subtle Navbar Spotlight for Cursor Tracking */}
      <Spotlight
        className="-top-14 left-1/4"
        size={300}
        gradient="from-blue-500/15 via-purple-600/10 to-transparent"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between gap-4 relative z-10">
        
        {/* LEFT SIDE — VEILIX AI BRAND */}
        <div 
          onClick={() => handleScroll('top')}
          className="flex items-center gap-3 cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 rounded-sm shrink-0"
          tabIndex={0}
          role="button"
          aria-label="Veilix AI Home"
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleScroll('top'); }}
        >
          <img 
            src="/veilix-ai-logo.png" 
            alt="Veilix AI Logo" 
            className="w-8 h-8 sm:w-9 sm:h-9 object-contain transition-transform duration-200 group-hover:scale-105" 
          />
          <div className="flex items-center gap-2">
            <span className="font-mono font-extrabold text-base sm:text-lg text-white tracking-tight">
              VEILIX <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-300">AI</span>
            </span>
          </div>
        </div>

        {/* CENTER — PUBLIC INFORMATION NAVIGATION */}
        <nav 
          className="hidden md:flex items-center gap-1 lg:gap-2 px-3.5 py-1.5 rounded-full border border-white/5 bg-white/[0.02] backdrop-blur-sm"
          aria-label="Public Navigation"
        >
          {/* HOME (Active Public State) */}
          <button
            onClick={() => handleScroll('top')}
            className="px-3.5 py-1.5 text-xs font-mono font-semibold text-white bg-white/10 rounded-full transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 flex items-center gap-1.5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" aria-hidden="true" />
            <span>HOME</span>
          </button>

          {/* FEATURES */}
          <button
            onClick={() => handleScroll('#features')}
            className="px-3.5 py-1.5 text-xs font-mono font-medium text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
          >
            FEATURES
          </button>

          {/* HOW IT WORKS */}
          <button
            onClick={() => handleScroll('#how-it-works')}
            className="px-3.5 py-1.5 text-xs font-mono font-medium text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
          >
            HOW IT WORKS
          </button>

          {/* SECURITY */}
          <button
            onClick={() => handleScroll('#product-preview')}
            className="px-3.5 py-1.5 text-xs font-mono font-medium text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
          >
            SECURITY
          </button>
        </nav>

        {/* RIGHT SIDE — AUTHENTICATION CTA */}
        <div className="hidden md:flex items-center gap-3">
          {currentUser ? (
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-mono">
                <User className="w-3.5 h-3.5 text-purple-400" />
                <span className="max-w-[110px] truncate font-semibold">{currentUser.name || currentUser.email}</span>
              </div>

              {onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  title="Sign out of Veilix AI"
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-mono text-slate-400 hover:text-red-400 border border-slate-800 hover:border-red-500/30 rounded-sm bg-black/60 hover:bg-red-500/10 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              )}

              <button
                onClick={handleAction}
                className="group relative inline-flex items-center justify-center gap-1.5 px-4 sm:px-5 py-2 text-xs font-mono font-bold uppercase tracking-wider text-white bg-gradient-to-r from-[#6366F1] via-[#8B5CF6] to-[#A855F7] hover:from-[#4F46E5] hover:via-[#7C3AED] hover:to-[#9333EA] rounded-sm shadow-[0_0_25px_rgba(139,92,246,0.35)] hover:shadow-[0_0_35px_rgba(139,92,246,0.6)] transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
              >
                <span>OPEN DASHBOARD</span>
                <ArrowRight className="w-3.5 h-3.5 text-white group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {onOpenLogin && (
                <button
                  type="button"
                  onClick={onOpenLogin}
                  className="text-xs font-mono text-slate-300 hover:text-white px-3.5 py-1.5 rounded-sm hover:bg-white/5 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
                >
                  LOGIN
                </button>
              )}

              {/* Main Auth CTA: GET STARTED (Reference Gradient) */}
              <button
                onClick={handleAction}
                className="group relative inline-flex items-center justify-center gap-1.5 px-5 sm:px-6 py-2.5 text-xs font-mono font-bold uppercase tracking-wider text-white bg-gradient-to-r from-[#6366F1] via-[#8B5CF6] to-[#A855F7] hover:from-[#4F46E5] hover:via-[#7C3AED] hover:to-[#9333EA] rounded-sm shadow-[0_0_25px_rgba(139,92,246,0.35)] hover:shadow-[0_0_35px_rgba(139,92,246,0.6)] transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
              >
                <span>GET STARTED</span>
                <ArrowRight className="w-3.5 h-3.5 text-white group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          )}
        </div>

        {/* MOBILE MENU & QUICK ACTION */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={handleAction}
            className="inline-flex items-center gap-1 px-3.5 py-2 text-[11px] font-mono font-bold uppercase tracking-wider text-white bg-gradient-to-r from-[#6366F1] via-[#8B5CF6] to-[#A855F7] rounded-sm shadow-[0_0_15px_rgba(139,92,246,0.3)]"
          >
            <span>{currentUser ? 'Dashboard' : 'Get Started'}</span>
            <ArrowRight className="w-3 h-3 text-white" />
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-400 hover:text-white border border-slate-800 rounded-sm bg-black/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
            aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* MOBILE DROPDOWN MENU */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-black/95 px-5 py-5 space-y-4 font-mono text-xs z-50">
          
          {/* Main Action Group */}
          <div className="space-y-1.5 pb-3 border-b border-white/10">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">
              [ ACCESS PORTAL ]
            </span>
            
            {/* Action CTA */}
            <button
              onClick={handleAction}
              className="w-full text-left px-4 py-3 rounded-sm text-white bg-gradient-to-r from-[#6366F1] via-[#8B5CF6] to-[#A855F7] font-bold flex items-center justify-between shadow-[0_0_20px_rgba(139,92,246,0.3)]"
            >
              <span>{currentUser ? 'OPEN DASHBOARD' : 'GET STARTED / SIGN UP'}</span>
              <ArrowRight className="w-3.5 h-3.5 text-white" />
            </button>

            {currentUser && onLogout ? (
              <button
                onClick={() => { setMobileMenuOpen(false); onLogout(); }}
                className="w-full text-left px-3.5 py-2 rounded-md text-red-400 hover:text-red-300 hover:bg-red-500/10 flex items-center gap-2"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>LOGOUT FROM ACCOUNT</span>
              </button>
            ) : !currentUser && onOpenLogin ? (
              <button
                onClick={() => { setMobileMenuOpen(false); onOpenLogin(); }}
                className="w-full text-left px-3.5 py-2 rounded-md text-slate-300 hover:text-white hover:bg-white/5"
              >
                LOGIN TO ACCOUNT
              </button>
            ) : null}
          </div>

          {/* Informational Links */}
          <div className="space-y-1">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-1">
              [ INFORMATION & SECTIONS ]
            </span>

            <button
              onClick={() => handleScroll('top')}
              className="w-full text-left px-3.5 py-2 rounded-md text-slate-300 hover:text-white hover:bg-white/5"
            >
              HOME
            </button>

            <button
              onClick={() => handleScroll('#features')}
              className="w-full text-left px-3.5 py-2 rounded-md text-slate-300 hover:text-white hover:bg-white/5"
            >
              FEATURES
            </button>

            <button
              onClick={() => handleScroll('#how-it-works')}
              className="w-full text-left px-3.5 py-2 rounded-md text-slate-300 hover:text-white hover:bg-white/5"
            >
              HOW IT WORKS
            </button>

            <button
              onClick={() => handleScroll('#product-preview')}
              className="w-full text-left px-3.5 py-2 rounded-md text-slate-300 hover:text-white hover:bg-white/5"
            >
              SECURITY
            </button>
          </div>

        </div>
      )}

    </header>
  );
}
