import React from 'react';
import { BarChart3, PieChart, Layers } from 'lucide-react';

export default function ChartsPanel({ permissions = [] }) {
  // Count by status
  const statusCounts = permissions.reduce((acc, p) => {
    const s = p.status || 'Expected';
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  // Count by risk
  const riskCounts = permissions.reduce((acc, p) => {
    const r = p.risk || 'Low';
    acc[r] = (acc[r] || 0) + 1;
    return acc;
  }, {});

  const total = permissions.length || 1;

  const statusColors = {
    Essential: 'bg-emerald-500',
    Expected: 'bg-green-500',
    Optional: 'bg-green-600/40',
    Suspicious: 'bg-amber-500',
    'High Risk': 'bg-red-500',
  };

  const riskColors = {
    Low: 'bg-emerald-500',
    Medium: 'bg-amber-500',
    High: 'bg-orange-500',
    Critical: 'bg-rose-600',
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      
      {/* Chart 1: Status Breakdown */}
      <div className="p-5 rounded-2xl glass-panel border-white/10 space-y-4">
        <div className="flex items-center space-x-2 border-b border-white/10 pb-3">
          <BarChart3 className="w-4 h-4 text-green-500" />
          <h4 className="text-sm font-bold text-white font-display">Permission Status Distribution</h4>
        </div>

        {/* Stacked Bar */}
        <div className="h-4 w-full bg-black/40 rounded-full overflow-hidden flex p-0.5 border border-white/10">
          {Object.entries(statusCounts).map(([status, count]) => {
            const pct = (count / total) * 100;
            return (
              <div
                key={status}
                style={{ width: `${pct}%` }}
                className={`h-full transition-all ${statusColors[status] || 'bg-slate-500'}`}
                title={`${status}: ${count} (${Math.round(pct)}%)`}
              />
            );
          })}
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2">
          {Object.entries(statusCounts).map(([status, count]) => (
            <div key={status} className="flex items-center space-x-2 text-xs text-slate-300">
              <span className={`w-2.5 h-2.5 rounded-full ${statusColors[status] || 'bg-slate-500'}`} />
              <span className="font-medium">{status}:</span>
              <span className="font-bold text-white font-mono">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Chart 2: Risk Breakdown */}
      <div className="p-5 rounded-2xl glass-panel border-white/10 space-y-4">
        <div className="flex items-center space-x-2 border-b border-white/10 pb-3">
          <PieChart className="w-4 h-4 text-green-500" />
          <h4 className="text-sm font-bold text-white font-display">Sensitivity & Risk Spectrum</h4>
        </div>

        {/* Stacked Bar */}
        <div className="h-4 w-full bg-black/40 rounded-full overflow-hidden flex p-0.5 border border-white/10">
          {Object.entries(riskCounts).map(([risk, count]) => {
            const pct = (count / total) * 100;
            return (
              <div
                key={risk}
                style={{ width: `${pct}%` }}
                className={`h-full transition-all ${riskColors[risk] || 'bg-slate-500'}`}
                title={`${risk}: ${count} (${Math.round(pct)}%)`}
              />
            );
          })}
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
          {['Low', 'Medium', 'High', 'Critical'].map((risk) => {
            const count = riskCounts[risk] || 0;
            return (
              <div key={risk} className="flex items-center space-x-2 text-xs text-slate-300">
                <span className={`w-2.5 h-2.5 rounded-full ${riskColors[risk]}`} />
                <span className="font-medium">{risk}:</span>
                <span className="font-bold text-white font-mono">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
