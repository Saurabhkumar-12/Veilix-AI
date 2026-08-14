import React from 'react';
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

export default function PermissionCard({ permission, status, reason }) {
  if (status === 'Required') {
    return (
      <div className="perm-card-required p-4 font-sans transition-all">
        <div className="flex items-center gap-2 mb-1.5">
          <CheckCircle className="w-5 h-5 text-[#22C55E] shrink-0" />
          <h4 className="font-heading font-bold text-sm text-[#111827]">
            ✔ {permission}
          </h4>
        </div>
        <p className="text-xs text-[#475569] leading-relaxed pl-7">
          <strong className="text-[#15803D] font-semibold">Reason: </strong>
          {reason}
        </p>
      </div>
    );
  }

  if (status === 'Optional') {
    return (
      <div className="perm-card-optional p-4 font-sans transition-all">
        <div className="flex items-center gap-2 mb-1.5">
          <AlertTriangle className="w-5 h-5 text-[#F59E0B] shrink-0" />
          <h4 className="font-heading font-bold text-sm text-[#111827]">
            ⚠ {permission}
          </h4>
        </div>
        <p className="text-xs text-[#475569] leading-relaxed pl-7">
          <strong className="text-[#B45309] font-semibold">Reason: </strong>
          {reason}
        </p>
      </div>
    );
  }

  // Default: Unnecessary
  return (
    <div className="perm-card-unnecessary p-4 font-sans transition-all">
      <div className="flex items-center gap-2 mb-1.5">
        <XCircle className="w-5 h-5 text-[#EF4444] shrink-0" />
        <h4 className="font-heading font-bold text-sm text-[#111827]">
          ❌ {permission}
        </h4>
      </div>
      <p className="text-xs text-[#475569] leading-relaxed pl-7">
        <strong className="text-[#B91C1C] font-semibold">Reason: </strong>
        {reason}
      </p>
    </div>
  );
}
