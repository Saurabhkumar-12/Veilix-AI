import React from 'react';

export default function RiskGauge({ score = 0, overallRisk = 'Very Safe' }) {
  // Score clamped between 0 and 100
  const validScore = Math.min(100, Math.max(0, Math.round(score)));

  // SVG Gauge calculations
  // Arc angle: 180 degrees (semicircle) from -90 to +90
  const radius = 80;
  const strokeWidth = 14;
  const center = 100;
  const circumference = Math.PI * radius; // Full semicircle length
  const strokeDashoffset = circumference - (validScore / 100) * circumference;

  // Determine status color gradient
  let strokeGradient = 'url(#gauge-green)';
  let scoreColor = 'text-emerald-400';
  let badgeBg = 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300';

  if (validScore > 80) {
    strokeGradient = 'url(#gauge-darkred)';
    scoreColor = 'text-rose-500';
    badgeBg = 'bg-rose-500/15 border-rose-500/40 text-rose-300';
  } else if (validScore > 60) {
    strokeGradient = 'url(#gauge-red)';
    scoreColor = 'text-red-400';
    badgeBg = 'bg-red-500/15 border-red-500/30 text-red-300';
  } else if (validScore > 40) {
    strokeGradient = 'url(#gauge-orange)';
    scoreColor = 'text-orange-400';
    badgeBg = 'bg-orange-500/15 border-orange-500/30 text-orange-300';
  } else if (validScore > 20) {
    strokeGradient = 'url(#gauge-yellow)';
    scoreColor = 'text-amber-400';
    badgeBg = 'bg-amber-500/15 border-amber-500/30 text-amber-300';
  }

  return (
    <div className="flex flex-col items-center justify-center relative select-none">
      <div className="relative w-56 h-32 flex items-center justify-center overflow-hidden">
        <svg className="w-56 h-56 transform rotate-[180deg]" viewBox="0 0 200 200">
          <defs>
            <linearGradient id="gauge-green" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#34d399" />
            </linearGradient>
            <linearGradient id="gauge-yellow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#fbbf24" />
            </linearGradient>
            <linearGradient id="gauge-orange" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#fb923c" />
            </linearGradient>
            <linearGradient id="gauge-red" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#f87171" />
            </linearGradient>
            <linearGradient id="gauge-darkred" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#be123c" />
              <stop offset="100%" stopColor="#e11d48" />
            </linearGradient>
          </defs>

          {/* Background Arc */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={0}
            strokeLinecap="round"
          />

          {/* Progress Arc */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={strokeGradient}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1.2s ease-in-out' }}
          />
        </svg>

        {/* Numeric Center Content */}
        <div className="absolute top-12 flex flex-col items-center text-center">
          <span className={`text-4xl font-black font-mono tracking-tight ${scoreColor}`}>
            {validScore}%
          </span>
          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mt-0.5">
            Privacy Risk Index
          </span>
        </div>
      </div>

      {/* Risk Badge */}
      <div className={`mt-2 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider border ${badgeBg}`}>
        {overallRisk}
      </div>
    </div>
  );
}
