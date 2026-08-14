import React, { useState, useEffect } from 'react';
import { Shield, Sparkles, CheckCircle2, RefreshCw, Search, Database } from 'lucide-react';

const SCAN_STEPS = [
  { label: '[01] Reading application metadata', icon: Database },
  { label: '[02] Extracting permissions', icon: Search },
  { label: '[03] Normalizing permission data', icon: Shield },
  { label: '[04] Running risk analysis', icon: Sparkles },
  { label: '[05] Preparing evidence', icon: Sparkles },
  { label: '[06] Generating AI explanation', icon: Sparkles }
];

export default function ScanProgressModal({ isAnalyzing }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    if (!isAnalyzing) {
      setCurrentStepIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentStepIndex(prev => {
        if (prev < SCAN_STEPS.length - 1) return prev + 1;
        return prev;
      });
    }, 700);

    return () => clearInterval(interval);
  }, [isAnalyzing]);

  if (!isAnalyzing) return null;

  const currentStep = SCAN_STEPS[currentStepIndex];
  const StepIcon = currentStep.icon;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="glass-panel p-8 rounded-3xl border border-green-500/30 max-w-md w-full shadow-2xl space-y-6 text-center relative overflow-hidden">
        
        {/* Animated Background Glow */}
        <div className="absolute -inset-px bg-gradient-to-r from-green-500/10 to-emerald-555/10 rounded-3xl opacity-50 blur-xl pointer-events-none animate-pulse" />

        {/* Center Spinner Icon */}
        <div className="relative z-10 flex flex-col items-center space-y-4">
          <div className="relative w-20 h-20">
            <img src="/veilix-ai-logo.png" alt="Veilix AI Logo" className="w-20 h-20 object-contain animate-pulse" />
          </div>

          <div className="space-y-1">
            <h3 className="text-xl font-extrabold text-white font-display">
              Veilix <span className="text-green-500">AI</span>
            </h3>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Preparing your security report
            </p>
          </div>
        </div>

        {/* Step List */}
        <div className="relative z-10 space-y-2.5 text-left bg-slate-950/60 p-4 rounded-2xl border border-white/5">
          {SCAN_STEPS.map((step, idx) => {
            const isDone = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;

            return (
              <div
                key={idx}
                className={`flex items-center space-x-3 text-xs transition-all ${
                  isDone
                    ? 'text-emerald-400 font-medium'
                    : isCurrent
                    ? 'text-white font-bold'
                    : 'text-slate-600'
                }`}
              >
                <div className="w-4 h-4 flex items-center justify-center shrink-0">
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : isCurrent ? (
                    <RefreshCw className="w-3.5 h-3.5 text-green-400 animate-spin" />
                  ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                  )}
                </div>
                <span className="truncate">{step.label}</span>
              </div>
            );
          })}
        </div>

        {/* Progress Bar */}
        <div className="relative z-10 space-y-1.5">
          <div className="h-2 w-full bg-black/50 rounded-full overflow-hidden border border-white/10">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-500 rounded-full"
              style={{ width: `${((currentStepIndex + 1) / SCAN_STEPS.length) * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>Step {currentStepIndex + 1} of {SCAN_STEPS.length}</span>
            <span>{Math.round(((currentStepIndex + 1) / SCAN_STEPS.length) * 100)}%</span>
          </div>
        </div>

      </div>
    </div>
  );
}
