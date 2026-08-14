import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, Shield, Lock, Terminal, ShieldCheck, 
  Cpu, CheckCircle, AlertTriangle, Eye, Sparkles, 
  GitCompare, Swords, MessageSquare, Database, Layers
} from 'lucide-react';

export default function HomePage({ onOpenAnalyzer }) {
  const [terminalLine, setTerminalLine] = useState(0);

  // Terminal log simulator lines
  const LOGS = [
    '[01] Reading AndroidManifest.xml',
    '[02] Extracting permissions',
    '[03] Normalizing permission metadata',
    '[04] Checking application purpose',
    '[05] Running deterministic risk engine',
    '[06] Preparing evidence',
    '[07] Generating AI explanation',
    '● ANALYSIS COMPLETE. STATUS: HIGH RISK DETECTED.'
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setTerminalLine(prev => (prev + 1) % (LOGS.length + 3));
    }, 1500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="achilles-bg text-slate-200 min-h-screen font-sans antialiased relative selection:bg-green-500 selection:text-black">
      
      {/* BACKGROUND EFFECTS */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-grid-lines opacity-20" />

        {/* Ambient green glows */}
        <div className="absolute top-[-10%] left-[10%] w-[55%] h-[60%] rounded-full bg-green-500/5 blur-[120px] pointer-events-none" />
        <div className="absolute top-[20%] right-[-5%] w-[45%] h-[70%] rounded-full bg-emerald-500/5 blur-[140px] pointer-events-none" />

        {/* 3 vertical green light columns inspired by reference */}
        <div className="absolute inset-0 flex justify-around opacity-25">
          <div className="w-[1px] h-full bg-gradient-to-b from-green-500/0 via-green-500/20 to-green-500/0 blur-[2px] light-beam-active" style={{ animationDelay: '0s' }} />
          <div className="w-[2px] h-full bg-gradient-to-b from-green-500/0 via-green-500/30 to-green-500/0 blur-[4px] light-beam-active" style={{ animationDelay: '2s' }} />
          <div className="w-[1px] h-full bg-gradient-to-b from-green-500/0 via-green-500/15 to-green-500/0 blur-[1px] light-beam-active" style={{ animationDelay: '4s' }} />
          <div className="w-[3px] h-full bg-gradient-to-b from-green-500/0 via-green-500/25 to-green-500/0 blur-[5px] light-beam-active" style={{ animationDelay: '1s' }} />
        </div>
      </div>

      {/* 4. Navbar */}
      <nav className="border-b border-white/5 bg-[#030712]/80 sticky top-0 z-50 backdrop-blur-xl relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/veilix-ai-logo.png" alt="Veilix AI Logo" className="w-8 h-8 object-contain" />
            <span className="font-heading font-extrabold text-xl text-white tracking-tight">
              VEILIX <span className="text-green-500 font-mono">AI</span>
            </span>
            <span className="hidden sm:inline-flex items-center text-[9px] tracking-widest font-mono text-green-400">
              ● AI PERMISSION INTELLIGENCE
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-[11px] font-mono tracking-widest text-slate-400 uppercase">
            <a href="#features" className="hover:text-green-400 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-green-400 transition-colors">How It Works</a>
            <a href="#showcase" className="hover:text-green-400 transition-colors">Analyzer</a>
            <a href="#architecture" className="hover:text-green-400 transition-colors">Security</a>
          </div>

          <button 
            onClick={onOpenAnalyzer}
            className="border border-green-500/35 bg-green-500/5 text-green-400 px-4 py-2 font-mono text-xs tracking-wider uppercase hover:bg-green-500 hover:text-black transition-all rounded-sm shadow-[0_0_10px_rgba(34,197,94,0.05)]"
          >
            Analyze an App →
          </button>
        </div>
      </nav>

      {/* 5. Hero Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 z-10">
        <div className="text-center max-w-3xl mx-auto">
          <img src="/veilix-ai-logo.png" alt="Veilix AI Logo" className="w-24 h-24 mx-auto mb-6 object-contain" />
          
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 border border-green-500/25 bg-green-500/5 rounded-none text-xs font-mono text-green-400 mb-6 uppercase tracking-widest">
            [ AI PERMISSION INTELLIGENCE ]
          </span>
          
          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-white mb-2 leading-none font-mono">
            Uncover what app
          </h1>
          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-white mb-6 leading-none font-mono">
            can <span className="text-green-500">access.</span>
          </h1>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-300 mb-6 font-mono">
            Before you trust it.
          </h2>

          <p className="text-slate-400 text-sm sm:text-base mb-10 leading-relaxed font-sans max-w-2xl mx-auto">
            Veilix AI analyzes APKs, application URLs, and Play Store apps to uncover permission risks, privacy exposure, and purpose-permission mismatches.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button 
              onClick={onOpenAnalyzer}
              className="bg-green-500 text-black font-mono font-bold tracking-wider uppercase px-8 py-4 text-xs hover:bg-green-400 transition-all flex items-center justify-center gap-2 rounded-sm shadow-[0_0_15px_rgba(34,197,94,0.2)]"
            >
              Analyze an App <ArrowRight className="w-4 h-4" />
            </button>
            <a 
              href="#how-it-works"
              className="border border-slate-800 bg-[#070b15]/60 text-slate-300 font-mono tracking-wider uppercase px-8 py-4 text-xs hover:border-slate-600 transition-all flex items-center justify-center rounded-sm"
            >
              See How It Works
            </a>
          </div>
        </div>
      </section>

      {/* 7. Product UI Preview Panel */}
      <section className="max-w-5xl mx-auto px-4 pb-24 z-10 relative">
        <div className="border border-slate-900 bg-[#050811] p-6 relative rounded-sm shadow-2xl">
          {/* Top visual green accent line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-green-500/80 via-slate-900 to-slate-900" />
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch font-mono">
            
            {/* Visual Panel Left (Console Table) */}
            <div className="lg:col-span-7 border border-slate-900 bg-[#03060c] p-5 text-xs text-slate-300 flex flex-col justify-between rounded-sm">
              <div>
                <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-4">
                  <span className="text-white font-extrabold text-[13px] tracking-wide">VEILIX AI // SECURITY ANALYSIS</span>
                  <span className="text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 font-bold uppercase">● ANALYSIS COMPLETE</span>
                </div>
                
                <div className="space-y-1.5 mb-6 text-[11px]">
                  <div className="flex justify-between"><span className="text-slate-500">APPLICATION:</span> <span className="text-white">Example Application</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">SECURITY SCORE:</span> <span className="text-red-500 font-extrabold">72 / 100 HIGH RISK</span></div>
                </div>

                <div className="border-t border-slate-900 pt-4 space-y-2.5">
                  <div className="flex justify-between text-[10px] text-slate-500 font-bold border-b border-slate-900 pb-1">
                    <span>PERMISSION</span>
                    <span>CLASSIFICATION</span>
                    <span>CONFIDENCE</span>
                  </div>
                  
                  <div className="flex justify-between text-[11px]">
                    <span className="text-white">CAMERA</span>
                    <span className="text-slate-400">UNKNOWN</span>
                    <span className="text-yellow-500 font-bold">MEDIUM</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-white">LOCATION</span>
                    <span className="text-green-500">REQUIRED</span>
                    <span className="text-green-500 font-bold">HIGH</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-white">CONTACTS</span>
                    <span className="text-red-500">SUSPICIOUS</span>
                    <span className="text-green-500 font-bold">HIGH</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-white">MICROPHONE</span>
                    <span className="text-yellow-500">OPTIONAL</span>
                    <span className="text-yellow-500 font-bold">MEDIUM</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-slate-900 text-[9px] text-slate-600 uppercase tracking-widest">
                [ STATIC SCAN ACTIVE // NO SANDBOX OVERRIDE ]
              </div>
            </div>

            {/* Terminal Visual Right */}
            <div className="lg:col-span-5 bg-black border border-slate-950 p-5 text-xs flex flex-col justify-between min-h-[300px] rounded-sm">
              <div className="flex items-center gap-2 border-b border-slate-950 pb-3 mb-4 text-green-500">
                <Terminal className="w-3.5 h-3.5 animate-pulse" />
                <span className="text-slate-500 text-[10px] uppercase tracking-wider">[ RUNTIME LOG ]</span>
              </div>

              <div className="flex-1 space-y-2">
                {LOGS.map((log, index) => {
                  let visible = terminalLine >= index;
                  let isComplete = index === LOGS.length - 1;
                  return (
                    <div 
                      key={log} 
                      className={`transition-all duration-300 ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'} ${isComplete ? 'text-red-400 font-bold' : 'text-green-500/80'}`}
                    >
                      {visible ? log : ''}
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-950 text-slate-600 text-[9px] uppercase tracking-widest">
                [ SECURE SCAN PIPELINE ]
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 9. Capabilities Features */}
      <section id="features" className="border-t border-white/5 bg-slate-950/20 py-24 z-10 relative">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-green-500 font-mono text-xs uppercase tracking-widest">[ CAPABILITIES ]</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2 font-mono">See what sits behind every permission.</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Card 1 */}
            <div className="border border-slate-900 bg-[#050811] p-6 flex flex-col justify-between min-h-[220px] rounded-sm hover:border-green-500/30 transition-all group">
              <div>
                <span className="font-mono text-xs text-green-500 block mb-4">[ 01 ]</span>
                <h3 className="text-sm font-bold uppercase font-mono text-white mb-2 tracking-wider">APP ANALYSIS</h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Analyze APKs, Play Store apps, and supported application URLs without executing source codes.
                </p>
              </div>
              <div className="mt-6 text-[9px] font-mono text-slate-600">[ METADATA INGESTION ]</div>
            </div>

            {/* Card 2 */}
            <div className="border border-slate-900 bg-[#050811] p-6 flex flex-col justify-between min-h-[220px] rounded-sm hover:border-green-500/30 transition-all group">
              <div>
                <span className="font-mono text-xs text-green-500 block mb-4">[ 02 ]</span>
                <h3 className="text-sm font-bold uppercase font-mono text-white mb-2 tracking-wider">PERMISSION INTELLIGENCE</h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Understand which sensitive permissions an application requests and details of manifest parameters.
                </p>
              </div>
              <div className="mt-6 text-[9px] font-mono text-slate-600">[ STATIC VERIFICATION ]</div>
            </div>

            {/* Card 3 */}
            <div className="border border-slate-900 bg-[#050811] p-6 flex flex-col justify-between min-h-[220px] rounded-sm hover:border-green-500/30 transition-all group">
              <div>
                <span className="font-mono text-xs text-green-500 block mb-4">[ 03 ]</span>
                <h3 className="text-sm font-bold uppercase font-mono text-white mb-2 tracking-wider">EVIDENCE-FIRST AI</h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  AI explanations are grounded in extracted evidence instead of invented application runtime behavior.
                </p>
              </div>
              <div className="mt-6 text-[9px] font-mono text-slate-600">[ ZERO HALLUCINATIONS ]</div>
            </div>

            {/* Card 4 */}
            <div className="border border-slate-900 bg-[#050811] p-6 flex flex-col justify-between min-h-[220px] rounded-sm hover:border-green-500/30 transition-all group">
              <div>
                <span className="font-mono text-xs text-green-500 block mb-4">[ 04 ]</span>
                <h3 className="text-sm font-bold uppercase font-mono text-white mb-2 tracking-wider">RISK SCORING</h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Convert complex permission signals into an understandable security score based on expected categories.
                </p>
              </div>
              <div className="mt-6 text-[9px] font-mono text-slate-600">[ DYNAMIC SCORE MATRIX ]</div>
            </div>

            {/* Card 5 */}
            <div className="border border-slate-900 bg-[#050811] p-6 flex flex-col justify-between min-h-[220px] rounded-sm hover:border-green-500/30 transition-all group">
              <div>
                <span className="font-mono text-xs text-green-500 block mb-4">[ 05 ]</span>
                <h3 className="text-sm font-bold uppercase font-mono text-white mb-2 tracking-wider">PRIVACY IMPACT</h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Understand what sensitive device access could potentially expose with threat sandbox vectors.
                </p>
              </div>
              <div className="mt-6 text-[9px] font-mono text-slate-600">[ THREAT VECTOR MAP ]</div>
            </div>

            {/* Card 6 */}
            <div className="border border-slate-900 bg-[#050811] p-6 flex flex-col justify-between min-h-[220px] rounded-sm hover:border-green-500/30 transition-all group">
              <div>
                <span className="font-mono text-xs text-green-500 block mb-4">[ 06 ]</span>
                <h3 className="text-sm font-bold uppercase font-mono text-white mb-2 tracking-wider">VERSION CHANGES</h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Compare permission changes between application versions to detect newly introduced access vectors.
                </p>
              </div>
              <div className="mt-6 text-[9px] font-mono text-slate-600">[ TIME MACHINE ENGINE ]</div>
            </div>

          </div>
        </div>
      </section>

      {/* 10. How It Works */}
      <section id="how-it-works" className="py-24 max-w-6xl mx-auto px-4 z-10 relative">
        <div className="text-center mb-16">
          <span className="text-green-500 font-mono text-xs uppercase tracking-widest">[ HOW IT WORKS ]</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2 font-mono">Three steps. Then know what you're trusting.</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="border border-slate-900 bg-[#050811] p-6 rounded-sm">
            <div className="w-10 h-10 bg-green-500/10 border border-green-500/30 text-green-400 flex items-center justify-center font-mono font-bold text-sm mb-4 rounded-sm shadow-[0_0_10px_rgba(34,197,94,0.1)]">
              01
            </div>
            <h3 className="text-white font-mono font-bold uppercase tracking-wider mb-2 text-sm">SUBMIT</h3>
            <p className="text-slate-400 text-xs leading-relaxed font-sans">
              Upload an APK or enter a supported application URL (Play Store or custom link).
            </p>
          </div>

          <div className="border border-slate-900 bg-[#050811] p-6 rounded-sm">
            <div className="w-10 h-10 bg-green-500/10 border border-green-500/30 text-green-400 flex items-center justify-center font-mono font-bold text-sm mb-4 rounded-sm shadow-[0_0_10px_rgba(34,197,94,0.1)]">
              02
            </div>
            <h3 className="text-white font-mono font-bold uppercase tracking-wider mb-2 text-sm">ANALYZE</h3>
            <p className="text-slate-400 text-xs leading-relaxed font-sans">
              Veilix AI extracts permissions and evaluates sensitivity, purpose relevance, and evidence.
            </p>
          </div>

          <div className="border border-slate-900 bg-[#050811] p-6 rounded-sm">
            <div className="w-10 h-10 bg-green-500/10 border border-green-500/30 text-green-400 flex items-center justify-center font-mono font-bold text-sm mb-4 rounded-sm shadow-[0_0_10px_rgba(34,197,94,0.1)]">
              03
            </div>
            <h3 className="text-white font-mono font-bold uppercase tracking-wider mb-2 text-sm">UNDERSTAND</h3>
            <p className="text-slate-400 text-xs leading-relaxed font-sans">
              Get risk scores, classifications, confidence level indexes, evidence, and recommendations.
            </p>
          </div>

        </div>
      </section>

      {/* 11. Evidence-First Section */}
      <section className="border-t border-white/5 bg-slate-950/20 py-24 z-10 relative">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="mb-12">
            <span className="text-green-500 font-mono text-xs uppercase tracking-widest">[ SECURITY ASSURANCE ]</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2 font-mono">
              AI explains the evidence.<br />
              It doesn't invent the evidence.
            </h2>
          </div>

          {/* Code pipeline design layout */}
          <div className="border border-slate-900 bg-black p-6 font-mono text-xs text-green-400 inline-block text-left w-full max-w-xl mx-auto rounded-sm">
            <div className="flex items-center justify-between border-b border-slate-950 pb-2 mb-4 text-slate-500 text-[10px]">
              <span>VEILIX ARCHITECTURE MAP</span>
              <span>v1.0.0</span>
            </div>
            <div className="space-y-2 text-center uppercase">
              <div className="bg-[#050811] border border-slate-900 py-2.5 px-4 font-bold text-white">TRUSTED FACTS</div>
              <div className="text-green-500 font-extrabold">↓</div>
              <div className="bg-[#050811] border border-slate-900 py-2.5 px-4">NORMALIZATION</div>
              <div className="text-green-500 font-extrabold">↓</div>
              <div className="bg-[#050811] border border-slate-900 py-2.5 px-4">DETERMINISTIC CLASSIFICATION</div>
              <div className="text-green-500 font-extrabold">↓</div>
              <div className="bg-[#050811] border border-slate-900 py-2.5 px-4">RISK ENGINE</div>
              <div className="text-green-500 font-extrabold">↓</div>
              <div className="bg-[#050811] border border-slate-900 py-2.5 px-4">AI EXPLANATION</div>
              <div className="text-green-500 font-extrabold">↓</div>
              <div className="bg-green-500 text-black font-extrabold py-2.5 px-4">FINAL RESULT</div>
            </div>
          </div>

          <p className="text-slate-400 text-sm mt-8 leading-relaxed max-w-2xl mx-auto">
            Veilix AI separates verified application facts from AI interpretation, helping prevent fabricated security findings and providing a transparent pipeline trace.
          </p>
        </div>
      </section>

      {/* 12. Permission Analysis Showcase */}
      <section id="showcase" className="py-24 max-w-6xl mx-auto px-4 z-10 relative">
        <div className="text-center mb-16">
          <span className="text-green-500 font-mono text-xs uppercase tracking-widest">[ STATIC ANALYSIS REPORT ]</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2 font-mono">Detailed Analysis Showcase</h2>
        </div>

        <div className="border border-slate-900 bg-[#050811] p-6 rounded-sm font-mono text-xs text-slate-300">
          <div className="flex justify-between border-b border-slate-900 pb-3 mb-6">
            <div>
              <span className="text-slate-500 uppercase">APPLICATION:</span> <span className="text-white font-bold">Example App</span>
            </div>
            <div>
              <span className="text-slate-500 uppercase">SECURITY SCORE:</span> <span className="text-red-500 font-extrabold">72 / 100 HIGH</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Camera Card */}
            <div className="border border-slate-900 bg-[#03060c] p-4 rounded-sm">
              <div className="flex justify-between border-b border-slate-950 pb-2 mb-3">
                <span className="text-white font-bold">CAMERA</span>
                <span className="px-2 py-0.5 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 text-[10px]">UNKNOWN // MEDIUM CONFIDENCE</span>
              </div>
              <div className="space-y-2 text-[11px] text-slate-400">
                <div><span className="text-slate-500">Evidence:</span> Requested in AndroidManifest.xml but no core feature is cited.</div>
                <div><span className="text-slate-500">Recommendation:</span> Review whether camera functionality is required.</div>
              </div>
            </div>

            {/* Location Card */}
            <div className="border border-slate-900 bg-[#03060c] p-4 rounded-sm">
              <div className="flex justify-between border-b border-slate-950 pb-2 mb-3">
                <span className="text-white font-bold">LOCATION</span>
                <span className="px-2 py-0.5 bg-green-500/10 text-green-400 border border-green-500/20 text-[10px]">REQUIRED // HIGH CONFIDENCE</span>
              </div>
              <div className="space-y-2 text-[11px] text-slate-400">
                <div><span className="text-slate-500">Evidence:</span> Application metadata indicates location-based tracking is expected.</div>
                <div><span className="text-slate-500">Recommendation:</span> Allow access if navigation features are needed.</div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 13. AI Security Assistant (Terminal/chat-style UI) */}
      <section className="border-t border-white/5 bg-slate-950/20 py-24 z-10 relative">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
            
            <div className="lg:col-span-5 flex flex-col justify-center">
              <span className="text-green-500 font-mono text-xs uppercase tracking-widest">[ AI SECURITY ASSISTANT ]</span>
              <h2 className="text-3xl font-extrabold text-white mt-2 mb-4 font-mono">Ask the security question.</h2>
              <p className="text-slate-400 text-sm leading-relaxed mb-6 font-sans">
                Veilix AI incorporates conversational memory to analyze follow-ups and clarify permission questions based exclusively on grounded static findings.
              </p>
              <span className="font-mono text-slate-600 text-[10px] uppercase tracking-wider">[ INTERACTIVE CONSOLE CHAT ]</span>
            </div>

            <div className="lg:col-span-7 border border-slate-900 bg-black p-6 font-mono text-xs text-slate-300 rounded-sm">
              <div className="flex items-center gap-2 border-b border-slate-950 pb-3 mb-4 text-green-500">
                <MessageSquare className="w-4 h-4" />
                <span className="text-slate-500 text-[10px] uppercase tracking-wider">VEILIX AI CHAT TERMINAL</span>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="text-green-500 font-bold mb-1">[USER]</div>
                  <p className="bg-[#050811] p-3 border border-slate-900 rounded-sm">
                    "Which permission is the biggest concern?"
                  </p>
                </div>

                <div>
                  <div className="text-white font-extrabold mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-green-500" /> [VEILIX AI]
                  </div>
                  <div className="bg-green-500/5 p-4 border border-green-500/10 text-green-400 space-y-3 rounded-sm leading-relaxed text-[11px]">
                    <p>
                      Based on the current static analysis, <strong>CONTACTS</strong> has the highest permission risk.
                    </p>
                    <div className="border-t border-green-500/10 pt-2 space-y-1 text-slate-400 text-[10px]">
                      <div><strong className="text-green-500">Evidence:</strong> READ_CONTACTS requested, High sensitivity, Weak purpose relevance.</div>
                      <div><strong className="text-green-500">Confidence:</strong> HIGH CONFIDENCE</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 14. Permission Time Machine (Version Comparison) */}
      <section className="border-t border-white/5 py-24 max-w-6xl mx-auto px-4 z-10 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-7 border border-slate-900 bg-[#050811] p-6 font-mono text-xs text-slate-300 rounded-sm">
            <div className="flex justify-between border-b border-slate-900 pb-3 mb-5 text-[11px] font-bold">
              <span>VERSION COMPARISON INDEX</span>
              <span className="text-green-400">● DELTA SCANNED</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-11 items-center gap-4 text-center">
              <div className="sm:col-span-4 border border-slate-850 p-4 bg-black rounded-sm">
                <div className="text-slate-500 text-[9px] uppercase tracking-wider">VERSION 1.0</div>
                <div className="text-green-500 font-extrabold text-lg mt-1">38 / 100</div>
              </div>

              <div className="sm:col-span-3 text-green-500 text-lg font-bold flex flex-col items-center justify-center">
                <span>→</span>
                <span className="text-[10px] text-red-400 font-bold mt-1">DELTA: +29</span>
              </div>

              <div className="sm:col-span-4 border border-slate-850 p-4 bg-black rounded-sm">
                <div className="text-slate-500 text-[9px] uppercase tracking-wider">VERSION 2.0</div>
                <div className="text-red-500 font-extrabold text-lg mt-1">67 / 100</div>
              </div>
            </div>

            <div className="border-t border-slate-900 pt-4 mt-6 space-y-2 text-[10px]">
              <div className="text-red-400 font-bold uppercase tracking-wider">NEW PERMISSIONS:</div>
              <div className="text-slate-400 bg-red-950/20 border border-red-900/10 px-3 py-1.5 rounded-sm">
                + android.permission.ACCESS_FINE_LOCATION<br />
                + android.permission.READ_CONTACTS
              </div>
              <div className="text-slate-500 font-bold uppercase tracking-wider mt-3">REMOVED:</div>
              <div className="text-slate-400 bg-slate-950/30 border border-white/5 px-3 py-1.5 rounded-sm">
                - android.permission.READ_CALENDAR
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <span className="text-green-500 font-mono text-xs uppercase tracking-widest">[ TIME MACHINE ]</span>
            <h2 className="text-3xl font-extrabold text-white mt-2 mb-4 font-mono">See what changed.</h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-6 font-sans">
              Compare differences between application builds to instantly detect newly added background syncs or geolocation tracking codes.
            </p>
            <span className="font-mono text-slate-600 text-[10px] uppercase tracking-wider">[ VERSION CONTROL DIFFS ]</span>
          </div>

        </div>
      </section>

      {/* 15. Privacy Impact Simulation */}
      <section className="border-t border-white/5 bg-slate-950/20 py-24 z-10 relative">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-green-500 font-mono text-xs uppercase tracking-widest">[ PRIVACY IMPACT ]</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2 font-mono">Threat Exposure Mapping</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 font-mono text-xs">
            
            {/* Camera */}
            <div className="border border-slate-900 bg-[#050811] p-5 rounded-sm">
              <span className="text-green-400 font-bold block mb-3 uppercase tracking-wider">CAMERA</span>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Potential image/video capture exposure. Could expose environmental media if accessed continuously.
              </p>
            </div>

            {/* Mic */}
            <div className="border border-slate-900 bg-[#050811] p-5 rounded-sm">
              <span className="text-green-400 font-bold block mb-3 uppercase tracking-wider">MICROPHONE</span>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Potential environmental audio exposure. Could capture ambient sound records without active UI notices.
              </p>
            </div>

            {/* GPS */}
            <div className="border border-slate-900 bg-[#050811] p-5 rounded-sm">
              <span className="text-green-400 font-bold block mb-3 uppercase tracking-wider">LOCATION</span>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Potential movement tracking. Could establish detailed location logs if background coordinates are queried.
              </p>
            </div>

            {/* Contacts */}
            <div className="border border-slate-900 bg-[#050811] p-5 rounded-sm">
              <span className="text-green-400 font-bold block mb-3 uppercase tracking-wider">CONTACTS</span>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Potential social graph exposure. Could collect contact lists and relational mappings from storage.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 16. Final CTA */}
      <section className="border-t border-white/5 bg-black py-24 text-center z-10 relative">
        {/* Subtle green ambient light glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-[70%] rounded-full bg-green-500/5 blur-[120px] pointer-events-none" />

        <div className="max-w-3xl mx-auto px-4 relative z-25">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 border border-green-500/25 bg-green-500/5 text-[10px] font-mono text-green-400 mb-6 uppercase tracking-widest rounded-none">
            [ VEILIX AI ]
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-4 font-mono uppercase tracking-wide">Uncover what app can access.</h2>
          <p className="text-slate-400 text-sm mb-10 font-sans max-w-xl mx-auto">
            Analyze before you trust. Check privacy postures, classification markers, and evidence relevancy.
          </p>
          <button 
            onClick={onOpenAnalyzer}
            className="bg-green-500 text-black font-mono font-bold tracking-wider uppercase px-12 py-5 text-xs hover:bg-green-400 transition-all inline-flex items-center gap-2 rounded-sm shadow-[0_0_15px_rgba(34,197,94,0.15)]"
          >
            Analyze an App →
          </button>
        </div>
      </section>

      {/* 17. Footer */}
      <footer className="border-t border-white/5 bg-[#030712] py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 font-mono text-xs text-slate-500">
          <div className="flex flex-col items-center md:items-start gap-2">
            <img src="/veilix-ai-logo.png" alt="Veilix AI Logo" className="w-16 h-16 object-contain" />
            <div className="text-[10px] text-slate-600">"Uncover what app can access."</div>
          </div>
          <div className="flex gap-8 uppercase tracking-widest text-[10px]">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
            <span className="cursor-pointer hover:text-white transition-colors" onClick={onOpenAnalyzer}>Analyzer</span>
          </div>
          <div>
            © {new Date().getFullYear()} VEILIX AI. ALL RIGHTS RESERVED.
          </div>
        </div>
      </footer>

    </div>
  );
}
