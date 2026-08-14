import React from 'react';
import { ShieldCheck, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

export default function StatCard({ counts = { total: 0, required: 0, optional: 0, unnecessary: 0 } }) {
  return (
    <div className="sec-card p-6 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-[#E5E7EB]">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#16A34A]" />
          <h2 className="font-heading font-bold text-lg text-[#111827]">
            Permission Analysis Breakdown
          </h2>
        </div>
        
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#F8FAFC] border border-[#E5E7EB] font-mono text-xs font-bold text-[#111827]">
          <span>Total Permissions Analyzed:</span>
          <span className="text-[#16A34A] font-black text-sm">{counts.total}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Required */}
        <div className="p-4 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#DCFCE7] flex items-center justify-center text-[#22C55E]">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#15803D]">Required</div>
              <div className="text-[11px] text-[#6B7280]">Core Functionality</div>
            </div>
          </div>
          <span className="font-heading font-black text-2xl text-[#15803D]">{counts.required}</span>
        </div>

        {/* Optional */}
        <div className="p-4 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#FEF3C7] flex items-center justify-center text-[#F59E0B]">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#B45309]">Optional</div>
              <div className="text-[11px] text-[#6B7280]">Secondary Features</div>
            </div>
          </div>
          <span className="font-heading font-black text-2xl text-[#B45309]">{counts.optional}</span>
        </div>

        {/* Unnecessary */}
        <div className="p-4 rounded-xl bg-[#FEF2F2] border border-[#FECDD3] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#FEE2E2] flex items-center justify-center text-[#EF4444]">
              <XCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#B91C1C]">Unnecessary</div>
              <div className="text-[11px] text-[#6B7280]">Excessive Access</div>
            </div>
          </div>
          <span className="font-heading font-black text-2xl text-[#B91C1C]">{counts.unnecessary}</span>
        </div>
      </div>
    </div>
  );
}
