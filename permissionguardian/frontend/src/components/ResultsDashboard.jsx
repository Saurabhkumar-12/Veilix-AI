import React from 'react';
import { Smartphone, Star, Award, Info, MessageSquare, ShieldCheck, Download, Sparkles } from 'lucide-react';
import VerdictBanner from './VerdictBanner';
import RiskGauge from './RiskGauge';
import PermissionTable from './PermissionTable';
import IndicatorsPanel from './IndicatorsPanel';
import RecommendationsPanel from './RecommendationsPanel';
import ChartsPanel from './ChartsPanel';
import AlternativesPanel from './AlternativesPanel';

export default function ResultsDashboard({ appData, riskResult, onOpenChat }) {
  if (!appData || !riskResult) return null;

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ appData, riskResult }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${appData.packageId || 'privacy_report'}_security_report.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto">

      {/* 1. APP METADATA HEADER CARD */}
      <div className="p-6 rounded-2xl glass-panel border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl relative overflow-hidden">
        <div className="flex items-center space-x-5">
          {appData.icon ? (
            <img 
              src={appData.icon} 
              alt={appData.appName} 
              referrerPolicy="no-referrer"
              className="w-16 h-16 rounded-2xl border border-white/10 object-cover shadow-lg shrink-0" 
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0 shadow-lg">
              <Smartphone className="w-8 h-8" />
            </div>
          )}

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-extrabold text-white tracking-tight font-display">
                {appData.appName}
              </h2>
              {appData.trustTier === 'ESTABLISHED' && (
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 font-extrabold uppercase tracking-wider flex items-center gap-1">
                  <Award className="w-3.5 h-3.5" /> Verified Publisher
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400 font-medium">
              <span className="text-indigo-300 font-semibold">{appData.developer}</span>
              <span>•</span>
              <span className="text-slate-300 font-mono">{appData.installs || 'N/A'} Installs</span>
              <span>•</span>
              <span className="flex items-center gap-1 text-amber-400 font-mono">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                {appData.score ? appData.score.toFixed(1) : 'N/A'}
              </span>
            </div>

            <div className="pt-1 flex items-center space-x-2">
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Category:</span>
              <span className="text-xs px-3 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 font-bold uppercase tracking-wider">
                {riskResult.category || appData.category}
              </span>
            </div>
          </div>
        </div>

        {/* Export & Actions */}
        <div className="flex items-center space-x-3 shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-white/10">
          <button
            onClick={handleExportJSON}
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-200 transition-all flex items-center space-x-2 shadow-md"
          >
            <Download className="w-4 h-4 text-indigo-400" />
            <span>Export JSON Report</span>
          </button>

          <button
            onClick={onOpenChat}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-bold transition-all flex items-center space-x-2 shadow-lg shadow-indigo-600/30"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Ask AI Assistant</span>
          </button>
        </div>
      </div>

      {/* 2. VERDICT BANNER (5-Tier) */}
      <VerdictBanner
        verdict={riskResult.verdict}
        recommendation={riskResult.recommendation}
        summary={riskResult.summary}
      />

      {/* 3. DASHBOARD GRID: RISK GAUGE & AI SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Risk Gauge */}
        <div className="p-6 rounded-2xl glass-panel border border-white/10 flex flex-col items-center justify-center text-center shadow-xl">
          <RiskGauge
            score={riskResult.riskScore}
            overallRisk={riskResult.overallRisk}
          />
          <div className="mt-4 pt-4 border-t border-white/5 w-full flex items-center justify-center space-x-2 text-xs font-semibold text-slate-400">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <span>Assessment: evidence-based security analysis</span>
          </div>
        </div>

        {/* Right: AI Explanation Summary */}
        <div className="p-6 rounded-2xl glass-panel border border-white/10 md:col-span-2 flex flex-col justify-between shadow-xl space-y-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-2 border-b border-white/10 pb-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <h3 className="text-base font-bold text-white tracking-wide font-display">
                AI Contextual Reasoning Summary
              </h3>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed font-sans bg-black/40 p-4 rounded-xl border border-white/5">
              {riskResult.summary}
            </p>
          </div>

          <div className="flex items-center space-x-3 text-xs text-slate-400 bg-white/2 p-3 rounded-xl border border-white/5">
            <Info className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>
              {riskResult.source === 'ai-assisted'
                ? 'Assessment uses available application information and declared permission context.'
                : 'Assessment uses permission patterns and category-based security guidance.'}
            </span>
          </div>
        </div>
      </div>

      {/* 4. PERMISSION TABLE */}
      <div className="p-6 rounded-2xl glass-panel border border-white/10 shadow-xl">
        <PermissionTable permissions={riskResult.permissions || []} />
      </div>

      {/* 5. INDICATORS PANEL */}
      <IndicatorsPanel
        positiveIndicators={riskResult.positiveIndicators || []}
        privacyConcerns={riskResult.privacyConcerns || []}
        negativeIndicators={riskResult.negativeIndicators || []}
      />

      {/* 6. CHARTS PANEL */}
      <ChartsPanel permissions={riskResult.permissions || []} />

      {/* 7. ACTIONABLE RECOMMENDATIONS */}
      <RecommendationsPanel recommendations={riskResult.recommendations || []} />

      {/* 8. SAFER ALTERNATIVES */}
      <AlternativesPanel saferAlternatives={riskResult.saferAlternatives || []} />

    </div>
  );
}
