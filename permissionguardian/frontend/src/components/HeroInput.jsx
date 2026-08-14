import React from 'react';
import { ShieldCheck, Search, ArrowRight, Zap, RefreshCw, Sparkles, Smartphone, CheckCircle, AlertTriangle, Play } from 'lucide-react';

const QUICK_SAMPLES = [
  { name: 'Spotify', url: 'https://play.google.com/store/apps/details?id=com.spotify.music', label: 'Music Player (Safe)', expectedRisk: 'Safe (12%)' },
  { name: 'Google Maps', url: 'https://play.google.com/store/apps/details?id=com.google.android.apps.maps', label: 'Navigation (Safe)', expectedRisk: 'Safe (18%)' },
  { name: 'WhatsApp', url: 'https://play.google.com/store/apps/details?id=com.whatsapp', label: 'Messaging (Caution)', expectedRisk: 'Caution (24%)' },
  { name: 'Suspicious Calculator', url: 'com.malicious.calculator.demo', isManualSample: true, label: 'Malicious Sample (Avoid)', expectedRisk: 'Critical (92%)' },
  { name: 'Seditious Flashlight', url: 'com.privacy.flashlight.tracker', isManualSample: true, label: 'Spyware Torch (Avoid)', expectedRisk: 'Critical (95%)' },
];

export default function HeroInput({ playStoreUrl, setPlayStoreUrl, onAnalyze, isAnalyzing, onSampleClick }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!playStoreUrl.trim()) return;
    onAnalyze({ playStoreUrl: playStoreUrl.trim() });
  };

  return (
    <section className="relative overflow-hidden py-12 lg:py-16 radial-glow">
      {/* Background ambient light blobs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-green-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[300px] h-[200px] bg-emerald-500/5 rounded-full blur-[90px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 text-center space-y-8 relative z-10">
        
        {/* Top Badge */}
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full glass-pill border-green-500/20 text-green-400 text-xs font-semibold shadow-lg shadow-green-500/5">
          <Sparkles className="w-3.5 h-3.5 text-green-500 animate-pulse" />
          <span>Zero False-Positive Permission Engine</span>
          <span className="text-white/30">•</span>
          <span className="text-green-400 font-bold">Context-Aware AI</span>
        </div>

        {/* Hero Headlines */}
        <div className="space-y-4 max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1] font-display">
            Analyze Android App Permissions with <span className="text-green-500">Contextual AI</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-400 font-normal leading-relaxed max-w-2xl mx-auto">
            Move beyond simple permission counters. Veilix AI evaluates available app information and functional necessity to provide evidence-based guidance.
          </p>
        </div>

        {/* Search Input Box */}
        <div className="max-w-2xl mx-auto">
          <div className="glass-panel p-2.5 rounded-2xl border-white/10 shadow-2xl relative group">
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-2">
              <div className="relative flex-1 w-full">
                <Search className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  disabled={isAnalyzing}
                  placeholder="Paste Google Play URL or Package ID (e.g. com.spotify.music)..."
                  value={playStoreUrl}
                  onChange={(e) => setPlayStoreUrl(e.target.value)}
                  className="w-full h-12 pl-11 pr-4 rounded-xl bg-[#09090B]/90 border border-white/10 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all font-sans"
                />
              </div>

              <button
                type="submit"
                disabled={isAnalyzing || !playStoreUrl.trim()}
                className="w-full sm:w-auto h-12 px-7 bg-green-500 hover:bg-green-400 text-black font-bold rounded-xl text-sm transition-all shadow-lg shadow-green-500/10 flex items-center justify-center space-x-2 shrink-0 disabled:opacity-40 active:scale-[0.98]"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <span>Scan App</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Quick sample chips */}
          <div className="mt-5 space-y-2 text-center">
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">
              Try Test Samples:
            </span>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {QUICK_SAMPLES.map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => onSampleClick(sample)}
                  className="text-xs px-3 py-1.5 rounded-xl bg-white/5 hover:bg-green-500/10 border border-white/10 hover:border-green-500/30 text-slate-300 hover:text-white transition-all flex items-center space-x-1.5"
                >
                  <Play className="w-3 h-3 text-green-500 fill-green-500" />
                  <span className="font-semibold">{sample.name}</span>
                  <span className="text-[10px] opacity-60">({sample.expectedRisk})</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 max-w-4xl mx-auto text-left">
          <div className="p-4 rounded-2xl glass-panel border-white/5 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">Zero False Positives</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Spotify requesting Bluetooth or Maps requesting Location are expected. We evaluate context over raw count.
            </p>
          </div>

          <div className="p-4 rounded-2xl glass-panel border-white/5 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400">
              <Zap className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">Multi-Factor Risk Engine</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Weighs installs, ratings, developer identity, SDK signatures, and permission justification.
            </p>
          </div>

          <div className="p-4 rounded-2xl glass-panel border-white/5 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">Explainable Privacy AI</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Clear plain-language explanations for every decision so non-technical users know what to grant or deny.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
