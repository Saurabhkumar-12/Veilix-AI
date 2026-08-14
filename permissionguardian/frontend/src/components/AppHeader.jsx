import React from 'react';
import { Shield, Sparkles, Terminal, Activity, Layers } from 'lucide-react';

export default function AppHeader({ onReset, currentScan, activeTab, setActiveTab }) {
  return (
    <header className="border-b border-white/10 bg-[#030712]/85 backdrop-blur-xl sticky top-0 z-40 transition-all">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand logo & tagline */}
        <button 
          onClick={onReset}
          className="flex items-center space-x-3 group text-left focus:outline-none"
        >
          <img src="/veilix-ai-logo.png" alt="Veilix AI Logo" className="w-10 h-10 object-contain group-hover:scale-105 transition-transform" />
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-extrabold text-white tracking-tight font-display">
                Veilix <span className="text-green-500">AI</span>
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400">
                v2.0 Enterprise
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Uncover what app can access</p>
          </div>
        </button>

        {/* Center Nav Tabs */}
        <nav className="hidden md:flex items-center space-x-1 bg-white/5 p-1 rounded-xl border border-white/10 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-1.5 rounded-lg transition-all flex items-center space-x-2 ${
              activeTab === 'dashboard'
                ? 'bg-green-500 text-black'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Analyzer</span>
          </button>
          
          <button
            onClick={() => setActiveTab('manual')}
            className={`px-4 py-1.5 rounded-lg transition-all flex items-center space-x-2 ${
              activeTab === 'manual'
                ? 'bg-green-500 text-black'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Manual Input</span>
          </button>
        </nav>

        {/* Right Status Badge & Actions */}
        <div className="flex items-center space-x-3">
          <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Security analysis available</span>
          </div>

          {currentScan && (
            <button
              onClick={onReset}
              className="text-xs px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-semibold transition-all"
            >
              New Analysis
            </button>
          )}
        </div>

      </div>
    </header>
  );
}
