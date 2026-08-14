import React from 'react';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import SearchBar from '../components/SearchBar';

export default function AnalyzerPage({ onAnalyze, onBack }) {
  return <div className="min-h-[calc(100vh-128px)] bg-[#050811] px-5 py-14 text-slate-100"><div className="mx-auto max-w-5xl"><button onClick={onBack} className="flex items-center gap-2 text-sm text-slate-400 hover:text-green-400"><ArrowLeft className="h-4 w-4"/>Back to home</button><section className="mt-14 text-center"><div className="mx-auto inline-flex items-center gap-2 rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1.5 text-xs font-bold text-green-400 font-mono"><ShieldCheck className="h-3.5 w-3.5"/>SECURE STATIC ANALYSIS</div><h1 className="mt-6 text-4xl font-black sm:text-5xl">Analyze your application.</h1><p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-400">Upload an APK, paste a public application URL, use a Play Store listing, or compare two APK versions.</p><div className="mt-10"><SearchBar onAnalyze={onAnalyze}/></div><p className="mx-auto mt-8 max-w-2xl text-xs leading-5 text-slate-500">Veilix AI never executes uploaded APKs. Results describe declared permissions and static analysis only—not observed runtime behavior.</p></section></div></div>;
}
