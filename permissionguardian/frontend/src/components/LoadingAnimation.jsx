import React from 'react';
import { Shield } from 'lucide-react';

export default function LoadingAnimation() {
  return (
    <div className="mx-auto my-16 max-w-md px-6 text-center">
      <div className="rounded-xl border border-white/10 bg-black/80 p-8 shadow-[0_0_50px_rgba(139,92,246,0.15)] backdrop-blur-xl flex flex-col items-center">
        
        {/* Animated Radar Scanning Logo */}
        <div className="relative mb-6 flex h-28 w-28 items-center justify-center">
          <div className="absolute inset-0 animate-ping rounded-full border border-purple-500/25 opacity-75" />
          <div className="absolute inset-2 animate-radar rounded-full border border-dashed border-purple-500/40" />
          <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-purple-500/30 bg-purple-500/10 shadow-[0_0_20px_rgba(168,85,247,0.25)]">
            <img src="/veilix-ai-logo.png" alt="Veilix AI Logo" className="h-10 w-10 animate-pulse object-contain" />
          </div>
        </div>

        {/* Status Text */}
        <h2 className="font-mono mb-2 flex items-center gap-1.5 text-xl font-extrabold text-white tracking-tight">
          Analyzing application<span className="text-purple-400">...</span>
        </h2>
        <p className="mb-6 text-xs text-slate-400 font-sans">
          Performing static permission extraction and security classification
        </p>

        {/* Extraction steps checklist */}
        <div className="w-full space-y-3 rounded-lg border border-slate-800 bg-black/60 p-4 text-left text-xs font-mono">
          <p className="font-semibold text-slate-200 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
            Extracting declared permissions
          </p>
          <p className="font-semibold text-slate-200 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            Mapping app purpose to access
          </p>
          <p className="text-slate-400 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
            Building security dashboard
          </p>
        </div>

        {/* Progress bar */}
        <div className="mt-6 h-1.5 w-full overflow-hidden rounded-full bg-slate-900 border border-slate-800">
          <div className="h-full w-full animate-pulse bg-gradient-to-r from-[#6366F1] via-[#8B5CF6] to-[#A855F7]" />
        </div>

      </div>
    </div>
  );
}
