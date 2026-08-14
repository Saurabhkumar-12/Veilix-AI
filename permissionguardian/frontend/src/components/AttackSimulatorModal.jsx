import React from 'react';
import { Shield, AlertTriangle, CheckCircle, Info, X, Sword, ArrowRight } from 'lucide-react';

const severityBadgeStyles = {
  SAFE: 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/30',
  MODERATE: 'bg-amber-950/40 text-amber-400 border border-amber-900/30',
  HIGH: 'bg-rose-950/40 text-rose-400 border border-rose-900/30',
  CRITICAL: 'bg-red-950/40 text-red-400 border border-red-900/30'
};

const severityBarColors = {
  SAFE: 'bg-emerald-500',
  MODERATE: 'bg-amber-500',
  HIGH: 'bg-rose-500',
  CRITICAL: 'bg-red-600'
};

export default function AttackSimulatorModal({ simulation, onClose }) {
  if (!simulation) return null;

  const {
    appName,
    attackSurfaceScore,
    attackSurfaceLevel,
    impacts = [],
    scenarios = [],
    chartData = [],
    aiExplanation,
    staticNotice
  } = simulation;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6">
      <div className="bg-[#0a0e1a] border border-[#1e293b] rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto text-slate-200 font-sans">
        
        {/* Header */}
        <div className="sticky top-0 bg-[#050811] text-white p-5 sm:p-6 flex items-center justify-between z-10 border-b border-[#1e293b]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <Sword className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading font-extrabold text-lg sm:text-xl text-white tracking-tight">
                  ⚔️ Privacy Attack Simulator
                </h2>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-950/40 text-rose-350 border border-rose-900/30">
                  SAFE SIMULATION
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Target: {appName}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
            title="Close Simulator"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">

          {/* Non-invasive Notice */}
          <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-900/30 text-amber-250 text-xs flex items-start gap-2.5">
            <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Non-Invasive Safety Guarantee:</strong> {staticNotice}
            </p>
          </div>

          {/* Top Score Banner */}
          <div className="bg-slate-950 text-white rounded-2xl p-6 border border-[#1e293b] flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex-1 text-center sm:text-left">
              <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                Simulated Attack Surface Score
              </span>
              <div className="flex items-baseline justify-center sm:justify-start gap-3 mt-1">
                <span className="font-heading font-black text-4xl sm:text-5xl text-rose-450">
                  {attackSurfaceScore}
                </span>
                <span className="text-slate-400 text-lg">/ 100</span>
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${severityBadgeStyles[attackSurfaceLevel]}`}>
                  {attackSurfaceLevel} ATTACK SURFACE
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-2">
                Evaluated from permission sensitivity, combination risks, and category alignment.
              </p>
            </div>

            {/* Score Gauge Visual */}
            <div className="w-full sm:w-48 bg-[#03060c] p-3.5 rounded-xl border border-slate-800 text-xs space-y-2">
              <div className="flex justify-between text-slate-300">
                <span>Threat Exposure</span>
                <span className="font-mono font-bold">{attackSurfaceScore}%</span>
              </div>
              <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${severityBarColors[attackSurfaceLevel]}`} 
                  style={{ width: `${attackSurfaceScore}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>Safe</span>
                <span>Critical</span>
              </div>
            </div>
          </div>

          {/* AI Cautious Explanation */}
          <div className="p-5 rounded-2xl bg-[#03060c] border border-slate-800">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-green-400" />
              <h3 className="font-heading font-bold text-sm text-white">
                AI Attack Surface Assessment
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
              "{aiExplanation}"
            </p>
          </div>

          {/* Impact Chart */}
          {chartData.length > 0 && (
            <div className="p-5 rounded-2xl bg-[#03060c] border border-slate-800">
              <h3 className="font-heading font-bold text-sm text-white mb-4 flex items-center justify-between">
                <span>Potential Privacy Impact by Permission</span>
                <span className="text-xs font-mono font-normal text-slate-505">Deterministic Risk Engine Data</span>
              </h3>

              <div className="space-y-3">
                {chartData.map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium text-slate-300">
                      <span className="font-bold">{item.permission}</span>
                      <span className="font-mono font-bold">{item.impactScore} / 100 ({item.severity})</span>
                    </div>
                    <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
                      <div 
                        className={`h-full ${severityBarColors[item.severity] || 'bg-emerald-500'}`}
                        style={{ width: `${item.impactScore}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Visual Scenario Flows */}
          {scenarios.length > 0 && (
            <div className="p-5 rounded-2xl bg-slate-950 text-white border border-[#1e293b]">
              <h3 className="font-heading font-bold text-sm text-white mb-4">
                Visual Threat Exposure Flow
              </h3>
              
              <div className="space-y-3">
                {scenarios.slice(0, 4).map((sc, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-[#03060c] border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-mono">
                    <span className="font-bold text-green-400 shrink-0">{sc.appName}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 hidden sm:block" />
                    <span className="text-amber-300 font-bold bg-slate-900 px-2.5 py-1 rounded border border-slate-700">{sc.permission}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 hidden sm:block" />
                    <span className="text-rose-300 font-semibold">{sc.potentialExposure}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 hidden sm:block" />
                    <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${severityBadgeStyles[sc.severity]}`}>
                      {sc.severity} IMPACT
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Detailed Permission Impact Cards */}
          <div className="space-y-4">
            <h3 className="font-heading font-bold text-base text-white">
              Potential Impact Breakdown ({impacts.length} Permissions Evaluated)
            </h3>

            <div className="grid grid-cols-1 gap-4">
              {impacts.map((imp, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-slate-800 bg-[#03060c] hover:bg-[#070b14] transition-colors space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                      <h4 className="font-heading font-bold text-sm text-white">
                        {imp.permission}
                      </h4>
                      <span className="text-xs text-slate-500 font-mono">({imp.potentialImpact})</span>
                    </div>
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border self-start sm:self-auto ${severityBadgeStyles[imp.severity]}`}>
                      {imp.severity} SEVERITY
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    <strong>Explanation:</strong> {imp.explanation}
                  </p>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    <strong>Why It Matters:</strong> {imp.whyItMatters}
                  </p>
                  <div className="text-xs text-green-400 bg-green-950/20 p-2.5 rounded-lg border border-green-900/25 flex items-start gap-1.5 mt-2">
                    <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                    <span><strong>Recommended Protection:</strong> {imp.recommendedProtection}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-[#050811] border-t border-slate-800 text-right">
          <button
            onClick={onClose}
            className="border border-[#1e293b] hover:border-slate-650 bg-[#090d16] text-slate-350 px-6 py-2.5 text-xs tracking-wider uppercase transition-all rounded-sm"
          >
            Close Simulator
          </button>
        </div>

      </div>
    </div>
  );
}
