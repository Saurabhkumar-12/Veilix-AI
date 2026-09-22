'use client'
import React from 'react';
import { SplineScene } from "@/components/ui/splite";
import { Spotlight } from "@/components/ui/spotlight";
import { ArrowRight, ShieldCheck, Sparkles, Lock, ChevronDown } from "lucide-react";

interface SplineSceneBasicProps {
  className?: string;
  onOpenAnalyzer?: () => void;
  onGetStarted?: () => void;
  sceneUrl?: string;
}

export function SplineSceneBasic({
  className = '',
  onOpenAnalyzer,
  onGetStarted,
  sceneUrl = "https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
}: SplineSceneBasicProps) {
  const handleCta = onGetStarted || onOpenAnalyzer;
  return (
    <div 
      className={`w-full min-h-[calc(100svh-4rem)] min-h-[calc(100dvh-4rem)] bg-[#000000] relative overflow-hidden flex flex-col justify-between pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] ${className}`}
      role="banner"
    >
      {/* Enhanced Interactive Spotlight Effect */}
      <Spotlight
        className="-top-40 left-0 md:left-40 md:-top-20"
        size={480}
        gradient="from-blue-500/35 via-purple-600/25 to-transparent"
      />
      
      {/* Futuristic Ambient Glow System */}
      <div 
        aria-hidden="true" 
        className="absolute top-1/2 right-0 -translate-y-1/2 w-[min(650px,50vw)] h-[min(650px,50vw)] rounded-full bg-gradient-to-br from-blue-600/15 via-purple-600/15 to-indigo-500/10 blur-[140px] pointer-events-none" 
      />
      <div 
        aria-hidden="true" 
        className="absolute bottom-10 left-10 w-[min(450px,40vw)] h-[min(450px,40vw)] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" 
      />

      {/* Main Hero Container — Viewport-balanced for Desktop, Tablet, and Mobile */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-4 sm:py-6 lg:py-8 flex-1 flex flex-col lg:flex-row items-center justify-center lg:justify-between gap-6 sm:gap-8 lg:gap-12 relative z-10">
        
        {/* Left / Top Content Column */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center text-left max-w-2xl lg:max-w-none">
          
          {/* Badge with glowing cyber accent */}
          <div 
            className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 border border-purple-500/30 bg-purple-500/10 rounded-sm text-[10px] sm:text-xs font-mono text-purple-300 mb-3 sm:mb-4 lg:mb-5 uppercase tracking-widest w-fit shadow-[0_0_15px_rgba(168,85,247,0.15)]"
            aria-label="Status: AI Permission Intelligence Active"
          >
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" aria-hidden="true"></span>
            <span>[ AI PERMISSION INTELLIGENCE ]</span>
          </div>

          {/* Main Headings — Fluid viewport typography */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-extrabold tracking-tight text-white mb-1.5 sm:mb-2 leading-[1.1] font-mono">
            Uncover what apps
          </h1>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-extrabold tracking-tight text-white mb-2.5 sm:mb-3.5 leading-[1.1] font-mono">
            can <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 drop-shadow-[0_0_25px_rgba(99,102,241,0.35)]">access.</span>
          </h1>

          <h2 className="text-base sm:text-lg lg:text-xl font-bold tracking-tight text-slate-300 mb-3 sm:mb-4 lg:mb-5 font-mono">
            Before you trust it.
          </h2>

          {/* Supporting Description */}
          <p className="text-slate-400 text-xs sm:text-sm lg:text-base mb-5 sm:mb-6 lg:mb-8 leading-relaxed font-sans max-w-xl">
            Veilix AI analyzes APKs, application URLs, and Play Store apps to uncover permission risks, privacy exposure, and purpose-permission mismatches.
          </p>

          {/* Action CTAs with Accessible Focus States */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
            {handleCta && (
              <button 
                type="button"
                onClick={handleCta}
                aria-label="Get Started with Veilix AI"
                className="bg-gradient-to-r from-[#6366F1] via-[#8B5CF6] to-[#A855F7] hover:from-[#4F46E5] hover:via-[#7C3AED] hover:to-[#9333EA] text-white font-mono font-bold tracking-wider uppercase px-7 sm:px-9 py-3.5 sm:py-4 text-xs sm:text-sm transition-all flex items-center justify-center gap-2 rounded-sm shadow-[0_0_25px_rgba(139,92,246,0.4)] hover:shadow-[0_0_35px_rgba(139,92,246,0.65)] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black min-h-[44px]"
              >
                <span>Get Started</span> <ArrowRight className="w-4 h-4 text-white" aria-hidden="true" />
              </button>
            )}
            <a 
              href="#how-it-works"
              aria-label="Scroll to See How It Works section"
              className="border border-slate-800 bg-[#000000] text-slate-300 font-mono tracking-wider uppercase px-6 sm:px-8 py-3.5 sm:py-4 text-xs hover:border-slate-600 hover:text-white transition-all flex items-center justify-center rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black min-h-[44px]"
            >
              See How It Works
            </a>
          </div>

          {/* Trust indicator markers */}
          <div className="mt-5 sm:mt-6 lg:mt-8 pt-4 sm:pt-5 border-t border-white/10 flex flex-wrap items-center gap-4 sm:gap-6 text-[10px] sm:text-[11px] font-mono text-slate-500 uppercase tracking-wider">
            <span className="flex items-center gap-1.5 text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400" aria-hidden="true" /> Static Scan
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400" aria-hidden="true" /> Evidence-Grounded
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400" aria-hidden="true" /> Zero Hallucinations
            </span>
          </div>

        </div>

        {/* Central / Right Interactive 3D Bot — Dynamically sized to fit viewports cleanly */}
        <div className="w-full lg:w-1/2 h-[240px] xs:h-[280px] sm:h-[340px] md:h-[380px] lg:h-[min(560px,calc(100svh-12rem))] xl:h-[min(640px,calc(100svh-10rem))] relative flex items-center justify-center shrink-0">
          <div className="w-full h-full relative rounded-2xl overflow-hidden bg-[#000000]">
            <SplineScene 
              scene={sceneUrl}
              className="w-full h-full"
            />
          </div>
        </div>

      </div>

      {/* Clean Bottom Section Transition with Scroll Hint */}
      <div className="w-full flex flex-col items-center justify-center pb-2 relative z-10 pointer-events-none">
        <a 
          href="#features" 
          aria-label="Scroll to features section"
          className="pointer-events-auto text-slate-500 hover:text-purple-400 transition-colors p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 rounded-full"
        >
          <ChevronDown className="w-4 h-4 animate-bounce opacity-60 hover:opacity-100" aria-hidden="true" />
        </a>
      </div>

      {/* Subtle Bottom Section Transition Border */}
      <div 
        aria-hidden="true"
        className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/20 to-transparent pointer-events-none"
      />
    </div>
  );
}
