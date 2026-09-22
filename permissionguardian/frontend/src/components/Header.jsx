import React from 'react';
import { PlusCircle, User, LogIn, LogOut } from 'lucide-react';

export default function Header({ onReset, currentUser, onOpenLogin, onLogout }) {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/80 font-sans backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Left Branding */}
        <div 
          onClick={onReset}
          className="flex items-center gap-3 cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 rounded-sm"
          tabIndex={0}
          role="button"
          aria-label="Return to Veilix AI Home"
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onReset && onReset(); }}
        >
          <img 
            src="/veilix-ai-logo.png" 
            alt="Veilix AI Logo" 
            className="w-8 h-8 object-contain transition-transform duration-200 group-hover:scale-105" 
          />

          <div className="flex items-center gap-2.5">
            <span className="font-mono font-extrabold text-lg text-white tracking-tight">
              Veilix <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-300">AI</span>
            </span>
            <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] font-mono tracking-widest uppercase px-2.5 py-0.5 rounded-sm bg-purple-500/10 text-purple-300 border border-purple-500/20 shadow-[0_0_12px_rgba(168,85,247,0.15)]">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
              <span>PERMISSION INTELLIGENCE</span>
            </span>
          </div>
        </div>

        {/* Right Navigation */}
        <div className="flex items-center gap-3">
          {currentUser ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-sm bg-purple-950/40 border border-purple-500/30 text-purple-300 text-xs font-mono shadow-[0_0_15px_rgba(168,85,247,0.15)]">
                <User className="w-3.5 h-3.5 text-purple-400" />
                <span className="max-w-[130px] truncate font-semibold">{currentUser.name || currentUser.email}</span>
              </div>
              
              {onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  title="Log out of Veilix AI"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-slate-400 hover:text-red-400 border border-slate-800 hover:border-red-500/30 rounded-sm bg-black/60 hover:bg-red-500/10 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              )}
            </div>
          ) : onOpenLogin ? (
            <button
              type="button"
              onClick={onOpenLogin}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 rounded-sm bg-black/60 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5 text-slate-400" />
              <span>Sign In</span>
            </button>
          ) : null}

          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-mono font-bold tracking-wider uppercase rounded-sm bg-gradient-to-r from-[#6366F1] via-[#8B5CF6] to-[#A855F7] hover:from-[#4F46E5] hover:via-[#7C3AED] hover:to-[#9333EA] text-white transition-all shadow-[0_0_20px_rgba(139,92,246,0.35)] hover:shadow-[0_0_25px_rgba(139,92,246,0.55)] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
          >
            <PlusCircle className="w-3.5 h-3.5 text-white" />
            <span>New Analysis</span>
          </button>
        </div>

      </div>
    </header>
  );
}
