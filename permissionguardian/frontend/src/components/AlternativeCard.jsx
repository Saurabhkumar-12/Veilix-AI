import React from 'react';
import { Shield, Download } from 'lucide-react';

export default function AlternativeCard({ saferAlternatives = [] }) {
  // Parse incoming alternatives strings or objects
  const parsedAlternatives = saferAlternatives.map((alt) => {
    if (typeof alt === 'object' && alt !== null) {
      return {
        name: alt.name || 'Alternative App',
        desc: alt.desc || 'No description available.',
        badge: alt.badge || 'Privacy Verified'
      };
    }

    if (typeof alt === 'string') {
      const splitIndex = alt.indexOf(' - ');
      if (splitIndex !== -1) {
        return {
          name: alt.substring(0, splitIndex).trim(),
          desc: alt.substring(splitIndex + 3).trim(),
          badge: 'Privacy Verified'
        };
      }
      return {
        name: alt.trim(),
        desc: 'A secure, privacy-focused alternative for this application type.',
        badge: 'Privacy Verified'
      };
    }

    return {
      name: 'Secure Alternative',
      desc: 'A privacy-respecting alternative to keep your data safe.',
      badge: 'Privacy Verified'
    };
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 border-b border-indigo-500/10 pb-2">
        <Shield className="w-5 h-5 text-indigo-400" />
        <h3 className="text-base font-bold text-indigo-300 tracking-wide">
          Recommended Privacy Alternatives ({parsedAlternatives.length})
        </h3>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {parsedAlternatives.map((app, index) => (
          <div
            key={index}
            className="glass-card glass-card-hover p-5 rounded-2xl flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white tracking-wide font-display">
                  {app.name}
                </h4>
                <span className="text-[9px] uppercase tracking-wider font-extrabold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                  {app.badge}
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mt-3 font-sans">
                {app.desc}
              </p>
            </div>

            {/* Custom styled mock download/store badge */}
            <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between">
              <span className="text-[10px] text-slate-500 font-semibold flex items-center">
                <Shield className="w-3.5 h-3.5 mr-1 text-emerald-500/80" /> Verified Safe
              </span>
              <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/10 border border-indigo-500/20 hover:bg-indigo-600/20 text-indigo-300 hover:text-white transition-all text-xs font-bold cursor-default select-none">
                <Download className="w-3.5 h-3.5" />
                <span>Get App</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
