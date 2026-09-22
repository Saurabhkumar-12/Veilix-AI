import React, { useState } from 'react';
import { Clock, X, ArrowRight, Sparkles, PlusCircle, MinusCircle, CheckCircle2, AlertOctagon } from 'lucide-react';
import { compareAnalyses as compareVersionsApi } from '../services/api';

const PRESET_VERSIONS = [
  { label: 'Weather App v1 vs v2 (Location / Camera / Mic)', oldUrl: 'demo.weather', newUrl: 'demo.weather.v2' }
];

export default function TimeMachineModal({ isOpen, onClose }) {
  const [oldInput, setOldInput] = useState('');
  const [newInput, setNewInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [comparison, setComparison] = useState(null);

  if (!isOpen) return null;

  const handleCompare = async (presetOld, presetNew) => {
    const beforeReport = presetOld || oldInput.trim();
    const afterReport = presetNew || newInput.trim();

    if (!beforeReport || !afterReport) {
      setError('Please enter valid package IDs or Play Store URLs for both versions.');
      return;
    }

    setLoading(true);
    setError('');
    setComparison(null);

    try {
      if (!beforeReport || !afterReport) {
        throw new Error('Please enter valid package IDs or Play Store URLs for both versions.');
      }

      const res = await compareVersionsApi(beforeReport, afterReport);
      setComparison(res);
    } catch (err) {
      console.error('[Time Machine Compare Error]:', err.message);
      setError(err.message || 'Failed to compare permissions between versions.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6">
      <div className="bg-[#030712] border border-white/10 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.9)] w-full max-w-4xl max-h-[90vh] overflow-y-auto text-slate-200 font-sans">
        
        {/* Header */}
        <div className="sticky top-0 bg-[#000000]/90 backdrop-blur-md text-white p-5 sm:p-6 flex items-center justify-between z-10 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-heading font-extrabold text-lg sm:text-xl text-white tracking-tight">
                ⏳ Permission Time Machine
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Compare permissions across APK & app versions</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors border border-white/10"
            title="Close Time Machine"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">

          {/* Version Input Controls */}
          <div className="p-5 rounded-2xl bg-black/60 border border-white/10 space-y-4">
            <h3 className="font-heading font-bold text-sm text-white flex items-center gap-2">
              <span>Select APK / App Versions to Compare</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono font-bold text-slate-400 mb-1">
                  VERSION 1.0 (Old APK / App)
                </label>
                <input
                  type="text"
                  value={oldInput}
                  onChange={(e) => setOldInput(e.target.value)}
                  placeholder="e.g. demo.weather or Old Play Store URL"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 text-xs bg-black/80 text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-slate-400 mb-1">
                  VERSION 2.0 (New APK / App)
                </label>
                <input
                  type="text"
                  value={newInput}
                  onChange={(e) => setNewInput(e.target.value)}
                  placeholder="e.g. demo.weather.v2 or New Play Store URL"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 text-xs bg-black/80 text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="text-slate-400 font-bold">Presets:</span>
                {PRESET_VERSIONS.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => {
                      setOldInput(preset.oldUrl);
                      setNewInput(preset.newUrl);
                      handleCompare(preset.oldUrl, preset.newUrl);
                    }}
                    className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-slate-300 text-[11px] font-mono border border-white/10 transition-colors"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              <button
                onClick={() => handleCompare()}
                disabled={loading}
                className="bg-emerald-500 hover:bg-emerald-400 text-black px-6 py-2.5 text-xs font-mono font-bold tracking-wider uppercase transition-all flex items-center gap-2 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-[1.02]"
              >
                {loading ? (
                  <span>Comparing Versions...</span>
                ) : (
                  <>
                    <Clock className="w-4 h-4" />
                    <span>Run Time Machine</span>
                  </>
                )}
              </button>
            </div>

            {error && (
              <p className="text-xs font-semibold text-rose-400 bg-rose-950/20 p-3 rounded-lg border border-rose-900/30">
                ⚠️ {error}
              </p>
            )}
          </div>

          {/* Comparison Results */}
          {comparison && (
            <div className="space-y-6">

              {/* Score Change Hero Card */}
              <div className="p-6 rounded-2xl bg-black/80 text-white border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="text-center sm:text-left">
                  <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                    Risk Score Change
                  </span>
                  <div className="flex items-center justify-center sm:justify-start gap-4 mt-2">
                    <div>
                      <div className="text-[10px] font-mono text-slate-400 uppercase">Version 1.0</div>
                      <div className="font-heading font-black text-3xl text-slate-200">{comparison.oldScore} / 100</div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-500" />
                    <div>
                      <div className="text-[10px] font-mono text-slate-400 uppercase">Version 2.0</div>
                      <div className="font-heading font-black text-3xl text-rose-400">{comparison.newScore} / 100</div>
                    </div>
                  </div>
                </div>

                <div className="bg-black/60 p-4 rounded-xl border border-white/10 text-center shrink-0">
                  <div className="text-xs font-mono font-bold text-slate-300 mb-1">Risk Difference</div>
                  <div className={`font-heading font-black text-3xl ${comparison.riskChange > 0 ? 'text-rose-400' : comparison.riskChange < 0 ? 'text-emerald-400' : 'text-slate-350'}`}>
                    {comparison.riskChange > 0 ? `+${comparison.riskChange}` : comparison.riskChange} Points
                  </div>
                  <div className="text-[11px] font-bold mt-1 text-slate-400">
                    Risk {comparison.riskTrend}
                  </div>
                </div>
              </div>

              {/* 🚨 NEW SENSITIVE ACCESS ALERT */}
              {comparison.hasNewSensitiveAlert && (
                <div className="p-5 rounded-2xl bg-rose-950/30 border border-rose-500/30 text-rose-200 space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0" />
                    <h3 className="font-heading font-extrabold text-sm text-rose-300 uppercase tracking-wide">
                      🚨 NEW SENSITIVE ACCESS DETECTED
                    </h3>
                  </div>
                  <p className="text-xs leading-relaxed text-rose-200 font-sans">
                    Version 2.0 introduced high-sensitivity permissions that were not present in Version 1.0:
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {comparison.newSensitivePermissions.map((sp) => (
                      <span key={sp.label} className="px-3 py-1 rounded-lg bg-rose-900/60 text-white font-mono text-xs font-bold border border-rose-700/50">
                        ⚠️ {sp.label}
                      </span>
                    ))}
                  </div>
                  <p className="text-[11px] text-rose-300 pt-1 font-sans">
                    Why this matters: Adding sensitive capabilities in updates can silently expand data access after users have already trusted the application.
                  </p>
                </div>
              )}

              {/* AI Version Analysis */}
              <div className="p-5 rounded-2xl bg-black/80 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <h3 className="font-heading font-bold text-sm text-white">
                    Ask AI: What Changed?
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                  "{comparison.aiExplanation}"
                </p>
              </div>

              {/* Time Machine Visual Timeline */}
              <div className="p-5 rounded-2xl bg-black/80 border border-white/10">
                <h3 className="font-heading font-bold text-sm text-white mb-4">
                  Time Machine Version Timeline
                </h3>

                <div className="relative pl-6 border-l-2 border-white/10 space-y-6">
                  {comparison.timeline.map((tl) => (
                    <div key={tl.version} className="relative">
                      <span className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-purple-500 border-2 border-black shadow-[0_0_10px_rgba(168,85,247,0.4)]"></span>
                      <div className="bg-black/60 p-4 rounded-xl border border-white/10">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-heading font-extrabold text-sm text-white">{tl.version}</span>
                          <span className="font-mono font-bold text-xs bg-white/10 px-2 py-0.5 rounded text-slate-300 border border-white/5">
                            Score: {tl.score}/100
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">
                          {tl.permissionsCount} permissions requested. {tl.note}
                        </p>
                        {tl.newSensitiveCount > 0 && (
                          <span className="inline-block mt-2 text-[10px] font-mono font-bold text-rose-400 bg-rose-950/40 px-2 py-0.5 rounded border border-rose-900/30">
                            +{tl.newSensitiveCount} New Sensitive Access Rights
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Three Permission Change Categories */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* 🆕 New Permissions */}
                <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/20 space-y-3">
                  <div className="flex items-center gap-2 border-b border-emerald-500/20 pb-2">
                    <PlusCircle className="w-4 h-4 text-emerald-400" />
                    <h4 className="font-heading font-bold text-xs text-emerald-400 uppercase tracking-wider">
                      🆕 New Permissions ({comparison.addedPermissions.length})
                    </h4>
                  </div>
                  {comparison.addedPermissions.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">No new permissions added.</p>
                  ) : (
                    <ul className="space-y-1.5 text-xs text-slate-300 font-mono">
                      {comparison.addedPermissions.map((p) => (
                        <li key={p.label} className="flex items-center gap-1.5 font-bold">
                          <span>🆕</span>
                          <span>{p.label}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* ➖ Removed Permissions */}
                <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/20 space-y-3">
                  <div className="flex items-center gap-2 border-b border-rose-500/20 pb-2">
                    <MinusCircle className="w-4 h-4 text-rose-400" />
                    <h4 className="font-heading font-bold text-xs text-rose-400 uppercase tracking-wider">
                      ➖ Removed Permissions ({comparison.removedPermissions.length})
                    </h4>
                  </div>
                  {comparison.removedPermissions.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">No permissions removed.</p>
                  ) : (
                    <ul className="space-y-1.5 text-xs text-slate-400 font-mono">
                      {comparison.removedPermissions.map((p) => (
                        <li key={p.label} className="flex items-center gap-1.5 font-bold line-through">
                          <span>➖</span>
                          <span>{p.label}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* ✓ Unchanged Permissions */}
                <div className="p-4 rounded-xl bg-black/60 border border-white/10 space-y-3">
                  <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                    <CheckCircle2 className="w-4 h-4 text-slate-400" />
                    <h4 className="font-heading font-bold text-xs text-slate-200 uppercase tracking-wider">
                      ✓ Unchanged ({comparison.unchangedPermissions.length})
                    </h4>
                  </div>
                  {comparison.unchangedPermissions.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">No unchanged permissions.</p>
                  ) : (
                    <ul className="space-y-1.5 text-xs text-slate-400 font-mono">
                      {comparison.unchangedPermissions.map((p) => (
                        <li key={p.label} className="flex items-center gap-1.5">
                          <span className="text-emerald-500">✓</span>
                          <span>{p.label}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-[#000000]/90 border-t border-white/10 text-right">
          <button
            onClick={onClose}
            className="border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-slate-200 px-6 py-2.5 text-xs font-mono font-bold tracking-wider uppercase transition-all rounded-xl"
          >
            Close Time Machine
          </button>
        </div>

      </div>
    </div>
  );
}
