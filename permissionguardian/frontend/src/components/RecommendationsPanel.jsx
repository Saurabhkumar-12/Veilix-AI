import React from 'react';
import { Lightbulb, ArrowRight, Shield } from 'lucide-react';

export default function RecommendationsPanel({ recommendations = [] }) {
  if (!recommendations || recommendations.length === 0) return null;

  return (
    <div className="p-6 rounded-2xl glass-panel border-green-500/20 space-y-4">
      <div className="flex items-center space-x-3 border-b border-white/10 pb-3">
        <div className="w-8 h-8 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400">
          <Lightbulb className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white font-display">Actionable Privacy Recommendations</h3>
          <p className="text-xs text-slate-400">Steps you can take before or after installing this app</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {recommendations.map((rec, idx) => (
          <div 
            key={idx}
            className="p-3.5 rounded-xl bg-black/30 border border-white/5 flex items-start space-x-3 text-xs text-slate-200 hover:border-green-500/30 transition-colors"
          >
            <span className="w-5 h-5 rounded-full bg-green-500/10 text-green-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
              {idx + 1}
            </span>
            <p className="leading-relaxed font-medium">{rec}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
