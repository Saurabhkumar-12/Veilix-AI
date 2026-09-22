import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, Shield, Lock, Terminal, ShieldCheck, 
  Cpu, CheckCircle, AlertTriangle, Eye, Sparkles, 
  GitCompare, Swords, MessageSquare, Database, Layers, Clock, ChevronDown,
  Camera, Mic, MapPin, Users, History, Activity, Zap
} from 'lucide-react';
import { SplineSceneBasic } from '@/components/ui/demo';
import { Spotlight } from '@/components/ui/spotlight';
import HomeNavbar from '@/components/HomeNavbar';

export default function HomePage({ onGetStarted, onOpenAnalyzer, onOpenLogin, onLogout, currentUser }) {
  const [terminalLine, setTerminalLine] = useState(0);

  const handleAction = onGetStarted || onOpenAnalyzer || onOpenLogin;

  const LOGS = [
    '[01] Reading AndroidManifest.xml',
    '[02] Extracting permissions & intent filters',
    '[03] Normalizing permission metadata',
    '[04] Cross-referencing declared application category',
    '[05] Running deterministic risk evaluation engine',
    '[06] Synthesizing static evidence citations',
    '● ANALYSIS COMPLETE: STATIC VERIFICATION REPORT READY'
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setTerminalLine(prev => (prev + 1) % (LOGS.length + 2));
    }, 1600);
    return () => clearInterval(timer);
  }, [LOGS.length]);

  const coreCapabilities = [
    {
      num: '01',
      badge: 'STATIC INSPECTION',
      title: 'APP PERMISSION ANALYSIS',
      desc: 'Inspect APK files, Play Store packages, and application URLs without running untrusted code in an uncontained sandbox.',
      meta: 'ZERO EXECUTION RISK'
    },
    {
      num: '02',
      badge: 'RISK INTELLIGENCE',
      title: 'PURPOSE-PERMISSION MATRIX',
      desc: 'Automatically flag sensitive permissions (Camera, Microphone, GPS, Contacts) that do not align with an app’s declared functionality.',
      meta: 'EVIDENCE-FIRST CLASSIFICATION'
    },
    {
      num: '03',
      badge: 'DIFF ENGINE',
      title: 'APP COMPARISON & TIME MACHINE',
      desc: 'Compare permissions across different build versions to catch silent privilege escalations before deploying updates.',
      meta: 'VERSION DELTA SCANS'
    },
    {
      num: '04',
      badge: 'THREAT SIMULATION',
      title: 'ENVIRONMENTAL PRIVACY LEAKS',
      desc: 'Simulate data exposure vectors to assess what background telemetry could be harvested if specific permissions are granted.',
      meta: 'EXPOSURE MODELING'
    }
  ];

  return (
    <div className="bg-[#000000] text-slate-200 min-h-screen font-sans antialiased relative selection:bg-purple-500 selection:text-white">
      
      {/* 0. Home Page Header / Navigation (Minimal Dark Navbar) */}
      <HomeNavbar 
        onGetStarted={handleAction} 
        onOpenLogin={onOpenLogin} 
        onLogout={onLogout}
        currentUser={currentUser} 
      />

      {/* 1. Full-Screen Interactive 3D Hero */}
      <section className="relative w-full z-10" aria-label="Veilix AI Hero Introduction">
        <SplineSceneBasic 
          onGetStarted={handleAction} 
          onOpenAnalyzer={onOpenAnalyzer} 
        />
      </section>

      {/* 2. Visual Overview / Live Pipeline Trace */}
      <section id="product-preview" className="relative py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden z-10">
        {/* Section Spotlight & Ambient Glow */}
        <Spotlight 
          className="-top-24 left-1/4" 
          size={500} 
          gradient="from-purple-500/20 via-blue-600/10 to-transparent" 
        />
        <div 
          aria-hidden="true" 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-purple-600/5 blur-[150px] pointer-events-none" 
        />

        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 border border-purple-500/30 bg-purple-500/10 rounded-sm text-[10px] sm:text-xs font-mono text-purple-300 mb-3 uppercase tracking-widest shadow-[0_0_12px_rgba(168,85,247,0.15)]">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" aria-hidden="true" />
            <span>[ WHAT VEILIX DOES ]</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white font-mono tracking-tight">
            Deterministic Static Intelligence
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-3 max-w-xl mx-auto font-sans leading-relaxed">
            Veilix AI parses raw manifest files and evaluates declared permissions against actual features with zero hallucinations.
          </p>
        </div>

        {/* Live Panel Grid */}
        <div className="max-w-5xl mx-auto border border-slate-800/80 bg-[#050811]/90 backdrop-blur-md p-5 sm:p-7 relative rounded-xl shadow-2xl overflow-hidden">
          {/* Top visual gradient accent */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-600" />
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch font-mono">
            
            {/* Visual Panel Left (Sample Analysis Output) */}
            <div className="lg:col-span-7 border border-slate-800/70 bg-[#03060c]/90 p-5 text-xs text-slate-300 flex flex-col justify-between rounded-lg">
              <div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                  <span className="text-white font-extrabold text-[13px] tracking-wide">VEILIX AI // ANALYSIS PREVIEW</span>
                  <span className="text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 font-bold uppercase rounded-sm">● HIGH RISK DETECTED</span>
                </div>
                
                <div className="space-y-2 mb-6 text-[11px]">
                  <div className="flex justify-between"><span className="text-slate-500">TARGET:</span> <span className="text-white font-bold">Sample Utility Application</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">RISK INDEX:</span> <span className="text-red-400 font-extrabold">72 / 100 HIGH RISK</span></div>
                </div>

                <div className="border-t border-slate-800 pt-4 space-y-2.5">
                  <div className="flex justify-between text-[10px] text-slate-500 font-bold border-b border-slate-800 pb-1">
                    <span>PERMISSION</span>
                    <span>CLASSIFICATION</span>
                    <span>CONFIDENCE</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-white font-medium">CAMERA</span>
                    <span className="px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 text-[10px]">UNKNOWN</span>
                    <span className="text-yellow-400 font-bold">MEDIUM</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-white font-medium">ACCESS_FINE_LOCATION</span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px]">REQUIRED</span>
                    <span className="text-emerald-400 font-bold">HIGH</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-white font-medium">READ_CONTACTS</span>
                    <span className="px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 text-[10px]">SUSPICIOUS</span>
                    <span className="text-emerald-400 font-bold">HIGH</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-slate-800 text-[10px] text-slate-500 uppercase tracking-widest flex items-center justify-between">
                <span>[ STATIC CODELESS SCAN ]</span>
                <button 
                  onClick={handleAction} 
                  className="text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
                >
                  <span>Get Started</span>
                  <span>→</span>
                </button>
              </div>
            </div>

            {/* Terminal Visual Right */}
            <div className="lg:col-span-5 bg-black border border-slate-900 p-5 text-xs flex flex-col justify-between min-h-[300px] rounded-lg">
              <div className="flex items-center gap-2 border-b border-slate-900 pb-3 mb-4 text-purple-400">
                <Terminal className="w-3.5 h-3.5 animate-pulse" />
                <span className="text-slate-400 text-[10px] uppercase tracking-wider">[ RUNTIME PIPELINE TRACE ]</span>
              </div>

              <div className="flex-1 space-y-2">
                {LOGS.map((log, index) => {
                  const visible = terminalLine >= index;
                  const isComplete = index === LOGS.length - 1;
                  return (
                    <div 
                      key={log} 
                      className={`transition-all duration-300 ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'} ${isComplete ? 'text-emerald-400 font-bold' : 'text-purple-400/90'}`}
                    >
                      {visible ? log : ''}
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-900 text-slate-600 text-[9px] uppercase tracking-widest">
                [ VERIFIED STATIC ENGINE ]
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. Core Capabilities */}
      <section id="features" className="relative py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/5 z-10 overflow-hidden">
        {/* Section Spotlight */}
        <Spotlight 
          className="-top-24 right-1/4" 
          size={520} 
          gradient="from-blue-500/20 via-purple-600/10 to-transparent" 
        />

        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 border border-purple-500/30 bg-purple-500/10 rounded-sm text-[10px] sm:text-xs font-mono text-purple-300 mb-3 uppercase tracking-widest shadow-[0_0_12px_rgba(168,85,247,0.15)]">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" aria-hidden="true" />
            <span>[ KEY CAPABILITIES ]</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white font-mono tracking-tight">
            Built for Privacy & Security Teams
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-3 max-w-xl mx-auto font-sans leading-relaxed">
            Everything you need to audit mobile software permissions, track build versions, and simulate environmental exposure.
          </p>
        </div>

        {/* 4 Focused Capabilities Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto font-mono">
          {coreCapabilities.map((card) => (
            <div 
              key={card.num}
              onClick={handleAction}
              tabIndex={0}
              role="button"
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleAction && handleAction(); }}
              className="border border-slate-800/80 bg-[#050811]/90 backdrop-blur-md p-6 flex flex-col justify-between min-h-[220px] rounded-xl hover:border-purple-500/50 hover:shadow-[0_0_30px_rgba(168,85,247,0.12)] transition-all duration-300 group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs text-purple-400 font-bold tracking-wider">[ {card.num} // {card.badge} ]</span>
                  <ArrowRight className="w-4 h-4 text-purple-400 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                </div>
                <h3 className="text-base font-bold uppercase text-white mb-2 tracking-wide group-hover:text-purple-300 transition-colors">
                  {card.title}
                </h3>
                <p className="text-slate-400 text-xs leading-relaxed font-sans">
                  {card.desc}
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-500 uppercase tracking-wider">
                <span>[ {card.meta} ]</span>
                <span className="text-purple-400 group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. How It Works */}
      <section id="how-it-works" className="relative py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/5 z-10 overflow-hidden">
        {/* Section Spotlight */}
        <Spotlight 
          className="-top-24 left-1/3" 
          size={480} 
          gradient="from-purple-500/20 via-indigo-600/10 to-transparent" 
        />

        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 border border-purple-500/30 bg-purple-500/10 rounded-sm text-[10px] sm:text-xs font-mono text-purple-300 mb-3 uppercase tracking-widest shadow-[0_0_12px_rgba(168,85,247,0.15)]">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" aria-hidden="true" />
            <span>[ THREE SIMPLE STEPS ]</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white font-mono tracking-tight">
            How Veilix AI Works
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-3 max-w-xl mx-auto font-sans leading-relaxed">
            From raw application artifact to structured permission intelligence in seconds.
          </p>
        </div>

        {/* 3 Step Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto font-mono">
          
          <div className="border border-slate-800/80 bg-[#050811]/90 backdrop-blur-md p-6 rounded-xl relative hover:border-purple-500/40 transition-all shadow-xl">
            <div className="w-10 h-10 bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center font-mono font-bold text-sm mb-4 rounded-lg shadow-[0_0_15px_rgba(168,85,247,0.2)]">
              01
            </div>
            <h3 className="text-white font-mono font-bold uppercase tracking-wider mb-2 text-sm">SUBMIT</h3>
            <p className="text-slate-400 text-xs leading-relaxed font-sans">
              Provide an APK file or input a supported Google Play Store package URL.
            </p>
          </div>

          <div className="border border-slate-800/80 bg-[#050811]/90 backdrop-blur-md p-6 rounded-xl relative hover:border-purple-500/40 transition-all shadow-xl">
            <div className="w-10 h-10 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center font-mono font-bold text-sm mb-4 rounded-lg shadow-[0_0_15px_rgba(99,102,241,0.2)]">
              02
            </div>
            <h3 className="text-white font-mono font-bold uppercase tracking-wider mb-2 text-sm">ANALYZE</h3>
            <p className="text-slate-400 text-xs leading-relaxed font-sans">
              Our deterministic engine maps requested permissions against stated application functionality.
            </p>
          </div>

          <div className="border border-slate-800/80 bg-[#050811]/90 backdrop-blur-md p-6 rounded-xl relative hover:border-purple-500/40 transition-all shadow-xl">
            <div className="w-10 h-10 bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center font-mono font-bold text-sm mb-4 rounded-lg shadow-[0_0_15px_rgba(168,85,247,0.2)]">
              03
            </div>
            <h3 className="text-white font-mono font-bold uppercase tracking-wider mb-2 text-sm">UNDERSTAND</h3>
            <p className="text-slate-400 text-xs leading-relaxed font-sans">
              Review clear risk ratings, sensitivity classifications, and evidence-grounded insights.
            </p>
          </div>

        </div>
      </section>

      {/* 5. Evidence-First Architecture Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/5 z-10 overflow-hidden">
        {/* Section Spotlight */}
        <Spotlight 
          className="-top-24 right-1/3" 
          size={500} 
          gradient="from-indigo-500/20 via-purple-600/10 to-transparent" 
        />

        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 border border-purple-500/30 bg-purple-500/10 rounded-sm text-[10px] sm:text-xs font-mono text-purple-300 mb-3 uppercase tracking-widest shadow-[0_0_12px_rgba(168,85,247,0.15)]">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" aria-hidden="true" />
              <span>[ SECURITY ASSURANCE ]</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white font-mono tracking-tight">
              AI explains the evidence.<br />
              It doesn't invent it.
            </h2>
          </div>

          {/* Architecture Pipeline Flow */}
          <div className="border border-slate-800/80 bg-black/90 backdrop-blur-md p-6 font-mono text-xs text-purple-400 inline-block text-left w-full max-w-xl mx-auto rounded-xl shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4 text-slate-500 text-[10px]">
              <span>VEILIX ARCHITECTURE MAP</span>
              <span className="text-purple-400 font-bold">● ZERO HALLUCINATIONS</span>
            </div>
            <div className="space-y-2 text-center uppercase">
              <div className="bg-[#050811] border border-slate-800/80 py-2.5 px-4 font-bold text-white rounded-md">VERIFIED MANIFEST FACTS</div>
              <div className="text-purple-400 font-extrabold">↓</div>
              <div className="bg-[#050811] border border-slate-800/80 py-2.5 px-4 text-slate-300 rounded-md">NORMALIZATION & METADATA</div>
              <div className="text-purple-400 font-extrabold">↓</div>
              <div className="bg-[#050811] border border-slate-800/80 py-2.5 px-4 text-slate-300 rounded-md">DETERMINISTIC RISK ENGINE</div>
              <div className="text-purple-400 font-extrabold">↓</div>
              <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 text-white font-extrabold py-2.5 px-4 rounded-md shadow-[0_0_20px_rgba(147,51,234,0.35)]">EVIDENCE-GROUNDED REPORT</div>
            </div>
          </div>

          <p className="text-slate-400 text-xs sm:text-sm mt-8 leading-relaxed max-w-2xl mx-auto font-sans">
            Veilix AI strictly separates verified application facts from natural language summaries, ensuring every warning is backed by direct manifest citations.
          </p>
        </div>
      </section>

      {/* 6. Final Call to Action */}
      <section className="relative py-28 px-4 sm:px-6 lg:px-8 border-t border-white/5 bg-black text-center z-10 overflow-hidden">
        {/* Section Spotlight */}
        <Spotlight 
          className="-top-24 left-1/2 -translate-x-1/2" 
          size={550} 
          gradient="from-purple-500/25 via-blue-600/15 to-transparent" 
        />
        <div 
          aria-hidden="true" 
          className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 w-[650px] h-[350px] bg-purple-600/10 blur-[150px] pointer-events-none" 
        />

        <div className="max-w-3xl mx-auto relative z-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 border border-purple-500/30 bg-purple-500/10 rounded-sm text-[10px] sm:text-xs font-mono text-purple-300 mb-6 uppercase tracking-widest shadow-[0_0_15px_rgba(168,85,247,0.2)]">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" aria-hidden="true" />
            <span>[ VEILIX AI PLATFORM ]</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4 font-mono tracking-tight leading-tight">
            Start Inspecting App <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-indigo-300 to-blue-400">Permissions.</span>
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm lg:text-base mb-8 font-sans max-w-xl mx-auto leading-relaxed">
            Create an account or sign in to analyze APKs, compare application builds, and simulate privacy exposure.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              type="button"
              onClick={handleAction}
              className="w-full sm:w-auto bg-gradient-to-r from-[#6366F1] via-[#8B5CF6] to-[#A855F7] hover:from-[#4F46E5] hover:via-[#7C3AED] hover:to-[#9333EA] text-white font-mono font-bold tracking-wider uppercase px-10 sm:px-12 py-4 text-xs sm:text-sm rounded-sm transition-all shadow-[0_0_25px_rgba(139,92,246,0.4)] hover:shadow-[0_0_35px_rgba(139,92,246,0.65)] cursor-pointer flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black min-h-[44px]"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </button>

            {!currentUser && onOpenLogin && (
              <button
                type="button"
                onClick={onOpenLogin}
                className="w-full sm:w-auto border border-slate-800 hover:border-slate-700 bg-black/80 hover:bg-slate-900/50 text-slate-300 hover:text-white font-mono text-xs px-8 py-4 rounded-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 cursor-pointer min-h-[44px]"
              >
                Sign In to Platform
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="border-t border-white/5 bg-[#000000] py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 font-mono text-xs text-slate-500">
          <div className="flex flex-col items-center md:items-start gap-2">
            <img src="/veilix-ai-logo.png" alt="Veilix AI Logo" className="w-10 h-10 object-contain" />
            <div className="text-[10px] text-slate-600">"Uncover what apps can access."</div>
          </div>
          <div className="flex gap-8 uppercase tracking-widest text-[10px]">
            <a href="#features" className="hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400">How It Works</a>
            <a href="#product-preview" className="hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400">Security</a>
            {!currentUser && onOpenLogin && (
              <span className="cursor-pointer hover:text-purple-400 transition-colors" onClick={onOpenLogin}>Sign In</span>
            )}
          </div>
          <div>
            © {new Date().getFullYear()} VEILIX AI. ALL RIGHTS RESERVED.
          </div>
        </div>
      </footer>

    </div>
  );
}
