import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, ShieldCheck } from 'lucide-react';

export default function IndicatorsPanel({
  positiveIndicators = [],
  privacyConcerns = [],
  negativeIndicators = []
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      
      {/* 1. POSITIVE INDICATORS */}
      <div className="p-5 rounded-2xl glass-panel border-emerald-500/20 space-y-3">
        <div className="flex items-center space-x-2 border-b border-emerald-500/20 pb-3">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-bold text-emerald-300 tracking-wide font-display">
            Positive Indicators ({positiveIndicators.length})
          </h4>
        </div>

        {positiveIndicators.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-2">No specific positive signals recorded.</p>
        ) : (
          <ul className="space-y-2.5">
            {positiveIndicators.map((item, idx) => (
              <li key={idx} className="flex items-start space-x-2.5 text-xs text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span className="leading-snug">{item}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 2. PRIVACY CONCERNS */}
      <div className="p-5 rounded-2xl glass-panel border-amber-500/20 space-y-3">
        <div className="flex items-center space-x-2 border-b border-amber-500/20 pb-3">
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-bold text-amber-300 tracking-wide font-display">
            Privacy Concerns ({privacyConcerns.length})
          </h4>
        </div>

        {privacyConcerns.length === 0 ? (
          <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-emerald-300 text-xs flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Zero excessive privacy risks detected!</span>
          </div>
        ) : (
          <ul className="space-y-2.5">
            {privacyConcerns.map((item, idx) => (
              <li key={idx} className="flex items-start space-x-2.5 text-xs text-slate-300">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span className="leading-snug">{item}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 3. NEGATIVE FLAGS */}
      <div className="p-5 rounded-2xl glass-panel border-rose-500/20 space-y-3">
        <div className="flex items-center space-x-2 border-b border-rose-500/20 pb-3">
          <div className="w-7 h-7 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <XCircle className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-bold text-rose-300 tracking-wide font-display">
            Negative Indicators ({negativeIndicators.length})
          </h4>
        </div>

        {negativeIndicators.length === 0 ? (
          <div className="p-3 rounded-xl bg-slate-900/50 border border-white/5 text-slate-400 text-xs">
            No critical security flags detected.
          </div>
        ) : (
          <ul className="space-y-2.5">
            {negativeIndicators.map((item, idx) => (
              <li key={idx} className="flex items-start space-x-2.5 text-xs text-slate-300">
                <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                <span className="leading-snug">{item}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

    </div>
  );
}
