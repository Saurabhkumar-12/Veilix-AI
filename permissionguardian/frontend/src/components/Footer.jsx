import React from 'react';
import { Lock, ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-white/10 bg-black/90 py-6 font-sans">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 text-xs text-slate-400 sm:flex-row">
        
        <div className="flex items-center gap-2.5">
          <img src="/veilix-ai-logo.png" alt="Veilix AI Logo" className="h-5 w-5 object-contain" />
          <span className="font-mono font-bold text-white tracking-tight">Veilix AI</span>
          <span className="text-slate-600 font-mono">|</span>
          <span className="text-slate-400 font-mono text-[11px]">Android Static Permission Intelligence</span>
        </div>

        <div className="flex items-center gap-4 text-[11px] font-mono">
          <span className="flex items-center gap-1.5 font-medium text-purple-300">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
            Static Engine Online
          </span>
          <span className="text-slate-800">•</span>
          <span className="text-slate-500">© {new Date().getFullYear()} Veilix AI Platform</span>
        </div>

      </div>
    </footer>
  );
}
