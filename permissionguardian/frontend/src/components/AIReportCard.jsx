import React from 'react';
import { Bot, ShieldAlert, Check } from 'lucide-react';

export default function AIReportCard({ summary }) {
  if (!summary) return null;

  return (
    <div className="sec-card p-6 border-[#E5E7EB] mb-8">
      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-[#E5E7EB]">
        <div className="w-9 h-9 rounded-lg bg-[#F0FDF4] border border-[#BBF7D0] flex items-center justify-center text-[#16A34A]">
          <Bot className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-heading font-bold text-base text-[#111827] flex items-center gap-2">
            AI Security & Privacy Assessment
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#F8FAFC] text-[#16A34A] border border-[#E5E7EB]">
              AUTOMATED REPORT
            </span>
          </h3>
          <p className="text-xs text-[#6B7280]">Security assessment summary</p>
        </div>
      </div>

      {/* Summary Narrative */}
      <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] text-sm text-[#111827] leading-relaxed mb-4">
        {summary}
      </div>

      {/* Recommendations */}
      <div className="space-y-2">
        <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#6B7280] mb-2 flex items-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 text-[#16A34A]" />
          Security Recommendations
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-[#475569]">
          <div className="flex items-start gap-2 p-3 rounded-lg bg-[#F8FAFC] border border-[#E5E7EB]">
            <Check className="w-4 h-4 text-[#22C55E] shrink-0 mt-0.5" />
            <span>Review and deny any permissions marked as <strong>Unnecessary</strong> in device settings.</span>
          </div>

          <div className="flex items-start gap-2 p-3 rounded-lg bg-[#F8FAFC] border border-[#E5E7EB]">
            <Check className="w-4 h-4 text-[#22C55E] shrink-0 mt-0.5" />
            <span>Ensure <strong>Location</strong> & <strong>Microphone</strong> are set to "Only While Using App".</span>
          </div>
        </div>
      </div>
    </div>
  );
}
