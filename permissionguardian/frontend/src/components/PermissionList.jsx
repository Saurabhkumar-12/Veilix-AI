import React, { useState } from 'react';
import { AlertTriangle, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';

/**
 * PermissionList
 *
 * Accepts either:
 *   (a) permissionDecisions: [{permission, verdict:"ALLOW"|"DENY", reason}]  ← from AI
 *   (b) requestedPermissions + unnecessaryPermissions                         ← legacy / rule-based fallback
 */
export default function PermissionList({
  permissionDecisions = null,     // NEW: AI per-permission decisions
  requestedPermissions = [],      // legacy
  unnecessaryPermissions = [],    // legacy
}) {
  const [showAllowed, setShowAllowed] = useState(false);

  // ── Normalise to a unified shape ──────────────────────────────────────────
  let deniedList  = [];
  let allowedList = [];

  if (permissionDecisions && permissionDecisions.length > 0) {
    // AI path — use the decisions directly
    deniedList  = permissionDecisions.filter(d => d.verdict === 'DENY');
    allowedList = permissionDecisions.filter(d => d.verdict === 'ALLOW');
  } else {
    // Legacy / fallback path — reconstruct from old props
    const flaggedNames = unnecessaryPermissions.map(up => up.permission.toLowerCase());

    deniedList = unnecessaryPermissions.map(up => ({
      permission: up.permission,
      verdict: 'DENY',
      reason: up.reason,
    }));

    allowedList = requestedPermissions
      .filter(rp => {
        const pName = (rp.permissionId || rp.permission || '').toLowerCase();
        const full  = (rp.permission || '').toLowerCase();
        return !flaggedNames.some(fn =>
          pName === fn || full === fn ||
          pName.endsWith('.' + fn) || fn.endsWith('.' + pName)
        );
      })
      .map(rp => ({
        permission: rp.permissionId || rp.permission.split('.').pop() || rp.permission,
        verdict: 'ALLOW',
        reason: rp.description || '',
      }));
  }

  return (
    <div className="space-y-6">

      {/* ── DENIED / EXCESSIVE PERMISSIONS ─────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2 border-b border-red-500/10 pb-2">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          <h3 className="text-base font-bold text-red-400 tracking-wide">
            Unnecessary / Excessive Permissions ({deniedList.length})
          </h3>
        </div>

        {deniedList.length === 0 ? (
          <div className="flex items-center p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-emerald-300 text-sm font-medium">
            <ShieldCheck className="w-4 h-4 mr-2 text-emerald-400" />
            No unnecessary permissions detected. This app requested minimal access!
          </div>
        ) : (
          <div className="grid gap-3">
            {deniedList.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-red-500/5 border border-red-500/20 text-slate-200 transition-all hover:bg-red-500/8"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                  <span className="text-sm font-bold font-mono text-red-400 tracking-wide select-all">
                    {(item.permission || '').split('.').pop() || item.permission}
                  </span>
                  <span className="text-xs uppercase font-extrabold tracking-wider text-red-200 bg-red-900/60 border border-red-500/40 px-3 py-1 rounded-full self-start sm:self-auto">
                    ❌ DO NOT ALLOW
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1.5 font-mono break-all leading-tight">
                  {item.permission}
                </p>
                <p className="text-sm text-slate-300 leading-relaxed font-sans bg-black/20 p-2.5 rounded-lg border border-white/5 mt-2">
                  {item.reason}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── ALLOWED / EXPECTED PERMISSIONS ─────────────────────────────────── */}
      <div className="space-y-3">
        <button
          onClick={() => setShowAllowed(!showAllowed)}
          type="button"
          className="w-full flex items-center justify-between py-2 border-b border-emerald-500/10 hover:opacity-80 transition-opacity"
        >
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            <h3 className="text-base font-bold text-emerald-400 tracking-wide">
              Expected / Safe Permissions ({allowedList.length})
            </h3>
          </div>
          {showAllowed
            ? <ChevronUp   className="w-4 h-4 text-emerald-400" />
            : <ChevronDown className="w-4 h-4 text-emerald-400" />}
        </button>

        {showAllowed && (
          <div className="grid gap-2 animate-fadeIn">
            {allowedList.length === 0 ? (
              <p className="text-xs text-slate-500 italic p-2">No baseline permissions requested.</p>
            ) : (
              allowedList.map((item, idx) => (
                <div
                  key={idx}
                  className="flex flex-col p-3 rounded-lg bg-emerald-500/2 border border-emerald-500/10 text-slate-300"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold font-mono text-emerald-400">
                      {(item.permission || '').split('.').pop() || item.permission}
                    </span>
                    <span className="text-xs uppercase tracking-wider text-emerald-200 font-bold bg-emerald-900/60 border border-emerald-500/40 px-2.5 py-1 rounded-full">
                      ✅ SAFE TO ALLOW
                    </span>
                  </div>
                  {item.reason && (
                    <p className="text-xs text-slate-400 mt-1.5 font-sans leading-snug">
                      {item.reason}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

    </div>
  );
}
