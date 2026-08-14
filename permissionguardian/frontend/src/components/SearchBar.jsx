import React, { useState } from 'react';
import { Search, Upload, Store, Link2, Radar } from 'lucide-react';

const tabs = [
  { id: 'playstore', label: 'Analyze Play Store', icon: Store },
  { id: 'url', label: 'Analyze App URL', icon: Link2 },
  { id: 'apk', label: 'Upload APK', icon: Upload },
  { id: 'compare', label: 'Compare APK Versions', icon: Radar }
];

export default function SearchBar({ onAnalyze }) {
  const [mode, setMode] = useState('playstore'); const [value, setValue] = useState(''); const [file, setFile] = useState(null); const [versions, setVersions] = useState({ before: null, after: null }); const [error, setError] = useState('');
  function submit(event) {
    event.preventDefault(); setError('');
    if (mode === 'apk') { if (!file || !file.name.toLowerCase().endsWith('.apk')) return setError('Choose a valid .apk file (max 20 MB).'); return onAnalyze(file, 'apk'); }
    if (mode === 'compare') { if (!versions.before || !versions.after) return setError('Choose both APK versions.'); return onAnalyze(versions, 'compare'); }
    try { const parsed = mode === 'playstore' && value.startsWith('demo.') ? null : new URL(value); if (parsed && !['http:', 'https:'].includes(parsed.protocol)) throw new Error(); }
    catch { return setError('Enter a valid HTTP(S) URL, Play Store URL, or demo package.'); }
    onAnalyze(value.trim(), mode);
  }
  return <div className="mx-auto w-full max-w-4xl"><div className="rounded-2xl border border-slate-700 bg-slate-900/80 p-4 shadow-2xl shadow-black/20 sm:p-5"><div role="tablist" aria-label="Analysis source" className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">{tabs.map(tab => { const Icon = tab.icon; return <button role="tab" aria-selected={mode === tab.id} onClick={() => { setMode(tab.id); setError(''); }} key={tab.id} className={`flex min-h-12 items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold transition-colors ${mode === tab.id ? 'border-green-500 bg-green-500 text-black' : 'border-slate-700 bg-slate-950/60 text-slate-300 hover:border-green-500/50 hover:text-green-400'}`}><Icon className="h-4 w-4"/>{tab.label}</button>; })}</div><form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row">{mode === 'apk' ? <label className="flex flex-1 cursor-pointer items-center gap-3 rounded-xl border border-dashed border-slate-600 bg-slate-950/60 px-4 py-3 text-left text-sm text-slate-300 hover:border-green-500"><Upload className="h-5 w-5 text-green-500"/><span className="truncate">{file?.name || 'Choose Android APK (static analysis only)'}</span><input className="sr-only" type="file" accept=".apk,application/vnd.android.package-archive" onChange={e => setFile(e.target.files?.[0] || null)}/></label> : mode === 'compare' ? <div className="grid flex-1 gap-2 sm:grid-cols-2">{['before', 'after'].map(key => <label key={key} className="cursor-pointer rounded-xl border border-dashed border-slate-600 bg-slate-950/60 px-3 py-3 text-left text-xs text-slate-300 hover:border-green-500">{key === 'before' ? 'Version 1: ' : 'Version 2: '}{versions[key]?.name || 'choose APK'}<input className="sr-only" type="file" accept=".apk" onChange={e => setVersions(v => ({ ...v, [key]: e.target.files?.[0] || null }))}/></label>)}</div> : <div className="relative flex-1"><Search className="absolute left-4 top-3.5 h-5 w-5 text-green-500"/><input value={value} onChange={e => setValue(e.target.value)} placeholder={mode === 'playstore' ? 'Paste a Play Store URL or demo.weather' : 'Paste an application/software webpage URL'} className="w-full rounded-xl border border-slate-700 bg-slate-950/60 py-3 pl-11 pr-4 text-sm text-slate-100 placeholder:text-slate-500 focus:border-green-500 focus:outline-none"/></div>}<button type="submit" className="btn-primary flex items-center justify-center gap-2 px-6 py-3 text-sm"><Radar className="h-4 w-4"/>{mode === 'compare' ? 'Compare' : 'Analyze'}</button></form>{error && <p className="mt-3 text-left text-xs font-semibold text-rose-300">{error}</p>}<p className="mt-3 text-left text-[11px] leading-4 text-slate-500">APK uploads are validated and inspected as static AndroidManifest data only. Files are never executed or retained.</p></div></div>;
}
