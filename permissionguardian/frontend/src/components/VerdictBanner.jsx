import React from 'react';
import { ShieldCheck, AlertTriangle, ShieldAlert, XCircle, AlertCircle } from 'lucide-react';

const VERDICT_CONFIG = {
  SAFE_TO_INSTALL: {
    title: '🟢 Safe to Install',
    badge: 'Verified Low Risk',
    bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
    iconBg: 'bg-emerald-600 text-white',
    Icon: ShieldCheck,
    desc: 'All requested permissions strictly match expectations for this app category and functionality.'
  },
  INSTALL_WITH_CAUTION: {
    title: '🟡 Install with Caution',
    badge: 'Minor Caution',
    bg: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
    iconBg: 'bg-amber-600 text-white',
    Icon: AlertTriangle,
    desc: 'App requests a few sensitive or optional permissions. Review permissions during initial setup.'
  },
  MODERATE_RISK: {
    title: '🟠 Moderate Privacy Risk',
    badge: 'Moderate Risk',
    bg: 'bg-orange-500/10 border-orange-500/30 text-orange-300',
    iconBg: 'bg-orange-600 text-white',
    Icon: AlertCircle,
    desc: 'Requests permissions that extend beyond typical requirements for this app type. Proceed attentively.'
  },
  HIGH_RISK: {
    title: '🔴 High Privacy Risk',
    badge: 'High Risk Flagged',
    bg: 'bg-red-500/10 border-red-500/30 text-red-300',
    iconBg: 'bg-red-600 text-white',
    Icon: ShieldAlert,
    desc: 'Requests multiple unnecessary permissions such as Contacts, SMS, or Location with no functional justification.'
  },
  AVOID: {
    title: '🚫 Avoid Installing',
    badge: 'Critical Security Warning',
    bg: 'bg-rose-950/40 border-rose-600/50 text-rose-300 shadow-xl shadow-rose-950/50',
    iconBg: 'bg-rose-600 text-white animate-pulse',
    Icon: XCircle,
    desc: 'High probability of spyware or excessive data harvesting. Key requested permissions do not align with app features.'
  }
};

export default function VerdictBanner({ verdict, recommendation, summary }) {
  const config = VERDICT_CONFIG[verdict] || VERDICT_CONFIG.SAFE_TO_INSTALL;
  const IconComponent = config.Icon;

  return (
    <div className={`p-6 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all shadow-xl ${config.bg}`}>
      <div className="flex items-start space-x-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${config.iconBg}`}>
          <IconComponent className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center space-x-3">
            <h3 className="text-xl font-extrabold text-white tracking-wide font-display">
              {config.title}
            </h3>
            <span className="text-[10px] uppercase font-extrabold tracking-widest px-3 py-1 rounded-full bg-white/10 border border-white/10 text-white">
              {config.badge}
            </span>
          </div>
          <p className="text-sm font-medium leading-relaxed opacity-90 max-w-2xl">
            {summary || config.desc}
          </p>
        </div>
      </div>

      <div className="shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-white/10 text-right">
        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block mb-1">
          Recommendation
        </span>
        <span className="text-sm font-extrabold px-4 py-2 rounded-xl bg-white/10 border border-white/10 text-white inline-block">
          {recommendation || config.title.substring(2)}
        </span>
      </div>
    </div>
  );
}
