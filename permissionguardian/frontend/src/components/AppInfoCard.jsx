import React from 'react';
import { Star, Download, Tag, User, Smartphone } from 'lucide-react';

export default function AppInfoCard({ name, developer, category, rating, installs, icon }) {
  return (
    <div className="sec-card p-6 sm:p-7 mb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
        {/* Icon */}
        {icon ? (
          <img
            src={icon}
            alt={name}
            referrerPolicy="no-referrer"
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl border border-[#E5E7EB] shadow-sm object-cover shrink-0"
          />
        ) : (
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-[#F8FAFC] border border-[#E5E7EB] flex items-center justify-center text-[#6B7280] shrink-0">
            <Smartphone className="w-10 h-10 text-[#16A34A]" />
          </div>
        )}

        {/* Info */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-[#F8FAFC] text-[#16A34A] border border-[#E5E7EB]">
              TARGET APP
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-[#111827] tracking-tight mb-2">
            {name}
          </h1>

          <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-sm text-[#6B7280]">
            <span className="flex items-center gap-1.5 font-medium">
              <User className="w-4 h-4 text-[#16A34A]" />
              {developer}
            </span>
            <span className="hidden sm:inline text-[#E5E7EB]">•</span>
            <span className="flex items-center gap-1.5 font-medium">
              <Tag className="w-4 h-4 text-[#16A34A]" />
              {category}
            </span>
          </div>

          {/* Metrics */}
          <div className="flex items-center gap-4 sm:gap-6 mt-4">
            <div className="flex items-center gap-1.5 bg-[#F8FAFC] px-3.5 py-1.5 rounded-lg border border-[#E5E7EB]">
              <Star className="w-4 h-4 fill-[#F59E0B] text-[#F59E0B]" />
              <span className="text-xs font-mono font-bold text-[#111827]">{rating} / 5.0</span>
            </div>

            <div className="flex items-center gap-1.5 bg-[#F8FAFC] px-3.5 py-1.5 rounded-lg border border-[#E5E7EB]">
              <Download className="w-4 h-4 text-[#16A34A]" />
              <span className="text-xs font-mono font-bold text-[#111827]">{installs}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
