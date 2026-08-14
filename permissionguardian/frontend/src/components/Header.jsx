import React from 'react';
import { Shield, Lock, PlusCircle } from 'lucide-react';

export default function Header({ onReset }) {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-[#030712]/95 font-sans backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Left Branding */}
        <div 
          onClick={onReset}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <img src="/veilix-ai-logo.png" alt="Veilix AI Logo" className="w-9 h-9 object-contain transition-transform duration-200 group-hover:scale-105" />

          <div className="flex items-center gap-2.5">
            <span className="font-heading font-extrabold text-lg text-[#F8FAFC] tracking-tight">
              Veilix <span className="text-green-500">AI</span>
            </span>
            <span className="hidden sm:inline-flex items-center text-[10px] font-mono tracking-widest uppercase px-2.5 py-0.5 rounded bg-green-500/10 text-green-400 border border-green-500/20">
              ● AI PERMISSION INTELLIGENCE
            </span>
          </div>
        </div>

        {/* Right Navigation */}
        <div className="flex items-center gap-3">
          <button
            onClick={onReset}
            className="btn-primary flex items-center gap-1.5 px-4 py-2 text-xs shadow-md shadow-emerald-950/20"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>New Analysis</span>
          </button>
        </div>

      </div>
    </header>
  );
}
