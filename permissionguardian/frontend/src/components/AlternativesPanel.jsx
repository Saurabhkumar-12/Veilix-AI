import React from 'react';
import { ShieldCheck, ExternalLink, Sparkles } from 'lucide-react';

export default function AlternativesPanel({ saferAlternatives = [] }) {
  if (!saferAlternatives || saferAlternatives.length === 0) return null;

  return (
    <div className="p-6 rounded-2xl glass-panel border-green-500/20 space-y-4">
      <div className="flex items-center space-x-3 border-b border-white/10 pb-3">
        <div className="w-8 h-8 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white font-display">Recommended Safer Alternatives</h3>
          <p className="text-xs text-slate-400">Open-source or privacy-focused replacements with minimal permissions</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {saferAlternatives.map((altItem, idx) => {
          let name = altItem;
          let desc = 'Privacy-friendly alternative app.';
          let badge = 'Verified Safe';

          if (typeof altItem === 'string' && altItem.includes(' - ')) {
            const parts = altItem.split(' - ');
            name = parts[0];
            desc = parts.slice(1).join(' - ');
          } else if (typeof altItem === 'object') {
            name = altItem.name || 'Alternative App';
            desc = altItem.desc || desc;
            badge = altItem.badge || badge;
          }

          return (
            <div 
              key={idx}
              className="p-4 rounded-xl bg-black/40 border border-white/10 hover:border-green-500/30 transition-all space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-green-400 font-display group-hover:text-white transition-colors">
                  {name}
                </span>
                <span className="text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                  {badge}
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                {desc}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
