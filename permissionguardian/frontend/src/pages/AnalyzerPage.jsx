import React from 'react';
import { ArrowLeft, ShieldCheck, Cpu, Lock, FileSearch, ShieldAlert } from 'lucide-react';
import SearchBar from '../components/SearchBar';
import { Spotlight } from '@/components/ui/spotlight';

export default function AnalyzerPage({ onAnalyze, onBack }) {
  return (
    <div className="min-h-[calc(100vh-130px)] bg-[#000000] text-slate-200 relative overflow-hidden px-4 sm:px-6 lg:px-8 py-10 sm:py-14 font-sans selection:bg-purple-500 selection:text-white">
      
      {/* Background Spotlight Lighting (Blue / Purple / Indigo) */}
      <Spotlight
        className="-top-40 left-0 md:left-60 md:-top-20"
        size={550}
        gradient="from-blue-500/30 via-purple-600/20 to-transparent"
      />
      
      {/* Ambient background glows */}
      <div 
        aria-hidden="true" 
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-purple-600/10 blur-[160px] pointer-events-none" 
      />
      <div 
        aria-hidden="true" 
        className="absolute bottom-10 right-10 w-[400px] h-[400px] rounded-full bg-indigo-600/10 blur-[140px] pointer-events-none" 
      />

      <div className="mx-auto max-w-5xl relative z-10">
        
        {/* Navigation / Back Button */}
        {onBack && (
          <div className="mb-8">
            <button 
              onClick={onBack} 
              className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-purple-400 transition-colors px-3 py-1.5 rounded-sm border border-slate-800/80 hover:border-purple-500/30 bg-black/60 backdrop-blur-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 cursor-pointer"
              aria-label="Back to home"
            >
              <ArrowLeft className="h-3.5 w-3.5"/>
              <span>Back to home</span>
            </button>
          </div>
        )}

        {/* Hero / Introduction Header */}
        <section className="text-center mb-10">
          
          {/* Badge */}
          <div className="mx-auto inline-flex items-center gap-2 rounded-sm border border-purple-500/30 bg-purple-500/10 px-3.5 py-1.5 text-[10px] sm:text-xs font-bold text-purple-300 font-mono uppercase tracking-widest shadow-[0_0_15px_rgba(168,85,247,0.15)] mb-4">
            <ShieldCheck className="h-4 w-4 text-purple-400"/>
            <span>[ SECURE STATIC ANALYSIS ENGINE ]</span>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white font-mono tracking-tight mb-4">
            Analyze your{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-indigo-300 to-blue-400">
              application.
            </span>
          </h1>

          {/* Description */}
          <p className="mx-auto max-w-2xl text-xs sm:text-sm md:text-base leading-relaxed text-slate-400 font-sans">
            Upload an APK, paste a public application URL, use a Play Store listing, or compare two APK versions to discover declared permissions and security exposure.
          </p>

        </section>

        {/* Console Search / Input Area */}
        <div className="mb-10">
          <SearchBar onAnalyze={onAnalyze}/>
        </div>

        {/* Technical Capability Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-10">
          
          <div className="p-4 rounded-lg border border-white/5 bg-black/40 backdrop-blur-md flex items-start gap-3">
            <div className="p-2 rounded bg-purple-500/10 border border-purple-500/20 text-purple-400 shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-mono font-bold text-white mb-1">Zero Execution Risk</h3>
              <p className="text-[11px] text-slate-400 leading-normal">
                Files are strictly parsed via static AST metadata. Never executed or run dynamically.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-lg border border-white/5 bg-black/40 backdrop-blur-md flex items-start gap-3">
            <div className="p-2 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shrink-0">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-mono font-bold text-white mb-1">Permission Scoring</h3>
              <p className="text-[11px] text-slate-400 leading-normal">
                Automated classification into Required, Optional, and Unnecessary risk levels.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-lg border border-white/5 bg-black/40 backdrop-blur-md flex items-start gap-3">
            <div className="p-2 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 shrink-0">
              <FileSearch className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-mono font-bold text-white mb-1">Version Diff Engine</h3>
              <p className="text-[11px] text-slate-400 leading-normal">
                Compare baseline vs updated APK manifests to detect permission escalation.
              </p>
            </div>
          </div>

        </div>

        {/* Security / Static Analysis Information Disclaimer */}
        <div className="p-4 rounded-lg border border-slate-800/80 bg-black/50 backdrop-blur-sm flex items-start gap-3 text-xs text-slate-500 font-mono">
          <ShieldAlert className="w-4 h-4 text-purple-400/80 shrink-0 mt-0.5" />
          <p className="leading-relaxed text-[11px]">
            <strong className="text-slate-400">Security Notice:</strong> Veilix AI never executes uploaded APKs. Results describe declared permissions and static analysis only—not observed runtime behavior. Analyzed manifests are processed ephemerally in memory.
          </p>
        </div>

      </div>
    </div>
  );
}
