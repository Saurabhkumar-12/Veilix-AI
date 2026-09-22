import React, { useState } from 'react';
import { Search, Upload, Store, Link2, Radar, AlertCircle, FileCode, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';

const tabs = [
  { id: 'playstore', label: 'Analyze Play Store', icon: Store, description: 'Google Play Store URL or package ID' },
  { id: 'url', label: 'Analyze App URL', icon: Link2, description: 'Direct application or software webpage' },
  { id: 'apk', label: 'Upload APK', icon: Upload, description: 'Direct Android APK file static inspection' },
  { id: 'compare', label: 'Compare APK Versions', icon: Radar, description: 'Diff permissions between two versions' }
];

const samplePackages = [
  { label: 'demo.weather', desc: 'Weather Radar Pro' },
  { label: 'demo.flashlight', desc: 'Bright Flashlight App' },
  { label: 'demo.fitness', desc: 'TrackFit Health Tracker' }
];

export default function SearchBar({ onAnalyze }) {
  const [mode, setMode] = useState('playstore');
  const [value, setValue] = useState('');
  const [file, setFile] = useState(null);
  const [versions, setVersions] = useState({ before: null, after: null });
  const [error, setError] = useState('');

  function submit(event) {
    event.preventDefault();
    setError('');

    if (mode === 'apk') {
      if (!file || !file.name.toLowerCase().endsWith('.apk')) {
        return setError('Choose a valid .apk file (max 20 MB).');
      }
      return onAnalyze(file, 'apk');
    }

    if (mode === 'compare') {
      if (!versions.before || !versions.after) {
        return setError('Choose both Version 1 (Base) and Version 2 (Target) APK files.');
      }
      return onAnalyze(versions, 'compare');
    }

    if (!value || !value.trim()) {
      return setError(mode === 'playstore' ? 'Please provide a Play Store URL or sample package ID.' : 'Please provide an application URL.');
    }

    try {
      const parsed = mode === 'playstore' && value.startsWith('demo.') ? null : new URL(value);
      if (parsed && !['http:', 'https:'].includes(parsed.protocol)) throw new Error();
    } catch {
      return setError('Enter a valid HTTP(S) URL, Play Store URL, or demo package (e.g. demo.weather).');
    }

    onAnalyze(value.trim(), mode);
  }

  return (
    <div className="mx-auto w-full max-w-4xl">
      {/* Main Console Panel */}
      <div className="relative rounded-xl border border-white/10 bg-black/75 p-5 sm:p-7 shadow-[0_0_50px_rgba(0,0,0,0.85)] backdrop-blur-xl transition-all">
        
        {/* Glow Accent Header */}
        <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-5">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            <span className="text-white font-bold tracking-wider uppercase">[ SOURCE SELECTOR ]</span>
          </div>
          <span className="text-[11px] font-mono text-slate-500 hidden sm:inline-block">
            {tabs.find(t => t.id === mode)?.description}
          </span>
        </div>

        {/* Mode Selector Tabs */}
        <div 
          role="tablist" 
          aria-label="Analysis source" 
          className="mb-6 grid grid-cols-2 gap-2.5 sm:grid-cols-4"
        >
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = mode === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                type="button"
                aria-selected={isActive}
                onClick={() => { setMode(tab.id); setError(''); }}
                className={`flex flex-col sm:flex-row items-center justify-center gap-2 rounded-md border p-3 text-xs font-mono transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 ${
                  isActive
                    ? 'border-purple-500/60 bg-purple-500/15 text-purple-300 font-bold shadow-[0_0_20px_rgba(168,85,247,0.25)]'
                    : 'border-slate-800/80 bg-black/60 text-slate-400 hover:border-slate-700 hover:text-slate-200 hover:bg-slate-900/40'
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 transition-transform ${isActive ? 'text-purple-400 scale-110' : 'text-slate-400'}`} />
                <span className="text-center sm:text-left truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Input & Form Area */}
        <form onSubmit={submit} className="space-y-4">
          
          {/* APK UPLOAD MODE */}
          {mode === 'apk' && (
            <div className="space-y-3">
              <label 
                className={`flex flex-col items-center justify-center p-8 rounded-lg border-2 border-dashed transition-all cursor-pointer group ${
                  file 
                    ? 'border-purple-500/60 bg-purple-950/20' 
                    : 'border-slate-800 hover:border-purple-500/50 bg-black/60 hover:bg-slate-950/80'
                }`}
              >
                <div className="p-3 rounded-full bg-purple-500/10 border border-purple-500/20 mb-3 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                  <Upload className="h-6 w-6 text-purple-400" />
                </div>
                
                {file ? (
                  <div className="text-center">
                    <p className="text-sm font-mono font-bold text-purple-300 flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-purple-400" />
                      {file.name}
                    </p>
                    <p className="text-[11px] font-mono text-slate-400 mt-1">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB • Ready for static inspection
                    </p>
                    <span className="inline-block mt-2 text-[10px] font-mono text-purple-400/80 underline">
                      Click to choose a different APK
                    </span>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-sm font-mono font-bold text-white mb-1">
                      Select or drop Android APK package
                    </p>
                    <p className="text-xs text-slate-400">
                      Standard .apk format (maximum file size 20 MB)
                    </p>
                  </div>
                )}
                
                <input 
                  className="sr-only" 
                  type="file" 
                  accept=".apk,application/vnd.android.package-archive" 
                  onChange={e => setFile(e.target.files?.[0] || null)}
                />
              </label>
            </div>
          )}

          {/* COMPARE APK VERSIONS MODE */}
          {mode === 'compare' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                
                {/* Version 1 */}
                <label 
                  className={`flex flex-col items-center justify-center p-5 rounded-lg border-2 border-dashed transition-all cursor-pointer ${
                    versions.before 
                      ? 'border-indigo-500/60 bg-indigo-950/20' 
                      : 'border-slate-800 hover:border-indigo-500/50 bg-black/60 hover:bg-slate-950/80'
                  }`}
                >
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-indigo-400 mb-2">
                    [ BASELINE VERSION 1.0 ]
                  </span>
                  <FileCode className="h-5 w-5 text-slate-400 mb-2" />
                  <p className="text-xs font-mono text-center text-slate-200 truncate max-w-[200px]">
                    {versions.before?.name || 'Select Base APK'}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1">
                    {versions.before ? `${(versions.before.size / (1024 * 1024)).toFixed(2)} MB` : 'Original version'}
                  </p>
                  <input 
                    className="sr-only" 
                    type="file" 
                    accept=".apk" 
                    onChange={e => setVersions(v => ({ ...v, before: e.target.files?.[0] || null }))}
                  />
                </label>

                {/* Version 2 */}
                <label 
                  className={`flex flex-col items-center justify-center p-5 rounded-lg border-2 border-dashed transition-all cursor-pointer ${
                    versions.after 
                      ? 'border-purple-500/60 bg-purple-950/20' 
                      : 'border-slate-800 hover:border-purple-500/50 bg-black/60 hover:bg-slate-950/80'
                  }`}
                >
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-purple-400 mb-2">
                    [ TARGET VERSION 2.0 ]
                  </span>
                  <FileCode className="h-5 w-5 text-slate-400 mb-2" />
                  <p className="text-xs font-mono text-center text-slate-200 truncate max-w-[200px]">
                    {versions.after?.name || 'Select Updated APK'}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1">
                    {versions.after ? `${(versions.after.size / (1024 * 1024)).toFixed(2)} MB` : 'Newer release version'}
                  </p>
                  <input 
                    className="sr-only" 
                    type="file" 
                    accept=".apk" 
                    onChange={e => setVersions(v => ({ ...v, after: e.target.files?.[0] || null }))}
                  />
                </label>

              </div>
            </div>
          )}

          {/* PLAY STORE & URL MODES */}
          {(mode === 'playstore' || mode === 'url') && (
            <div className="space-y-2">
              <div className="relative flex items-center">
                {mode === 'playstore' ? (
                  <Store className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-purple-400" />
                ) : (
                  <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-purple-400" />
                )}
                
                <input
                  type="text"
                  value={value}
                  onChange={e => setValue(e.target.value)}
                  placeholder={
                    mode === 'playstore' 
                      ? 'Paste a Play Store URL or demo.weather' 
                      : 'https://example.com/software or direct application page'
                  }
                  className="w-full rounded-md border border-slate-800 bg-black/80 py-3.5 pl-12 pr-4 text-xs sm:text-sm text-white placeholder:text-slate-600 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50 font-mono transition-all"
                />
              </div>

              {/* Sample Package Quick Select (Play Store mode) */}
              {mode === 'playstore' && (
                <div className="flex items-center gap-2 pt-1 flex-wrap">
                  <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-purple-400" />
                    Quick Demo Apps:
                  </span>
                  {samplePackages.map(pkg => (
                    <button
                      key={pkg.label}
                      type="button"
                      onClick={() => { setValue(pkg.label); setError(''); }}
                      className="text-[10px] font-mono px-2 py-0.5 rounded border border-slate-800 hover:border-purple-500/50 bg-black/60 text-slate-400 hover:text-purple-300 transition-colors cursor-pointer"
                    >
                      {pkg.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Action Trigger Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#6366F1] via-[#8B5CF6] to-[#A855F7] hover:from-[#4F46E5] hover:via-[#7C3AED] hover:to-[#9333EA] text-white font-mono font-bold tracking-wider uppercase py-4 text-xs sm:text-sm rounded-sm transition-all shadow-[0_0_25px_rgba(139,92,246,0.4)] hover:shadow-[0_0_35px_rgba(139,92,246,0.65)] flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
            >
              <Radar className="h-4 w-4 text-white" />
              <span>
                {mode === 'compare' ? 'COMPARE APK VERSIONS' : 'ANALYZE APPLICATION'}
              </span>
              <ArrowRight className="h-4 w-4 text-white" />
            </button>
          </div>

        </form>

        {/* Error Notification */}
        {error && (
          <div 
            role="alert" 
            className="mt-4 flex items-center gap-2 p-3 rounded-md bg-red-500/10 border border-red-500/30 text-red-300 font-mono text-xs"
          >
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Security & Static Analysis Footer Note */}
        <div className="mt-5 pt-4 border-t border-white/5 flex items-start gap-2 text-[11px] font-mono text-slate-500 leading-relaxed">
          <span className="text-purple-400 shrink-0 font-bold">[!]</span>
          <span>
            APK uploads are inspected as static <strong className="text-slate-400">AndroidManifest.xml</strong> metadata only. Files are never executed on the host, retained, or redistributed.
          </span>
        </div>

      </div>
    </div>
  );
}
