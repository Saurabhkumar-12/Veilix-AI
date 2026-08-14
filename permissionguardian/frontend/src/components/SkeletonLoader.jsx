import React from 'react';

export default function SkeletonLoader() {
  return (
    <div className="space-y-8 max-w-6xl mx-auto mt-8 animate-pulse">
      {/* Top Banner Skeleton */}
      <div className="glass-panel p-6 rounded-2xl border-l-4 border-green-500/30 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-4 w-full">
          <div className="w-14 h-14 rounded-2xl bg-white/10 shrink-0" />
          <div className="space-y-2 w-1/2">
            <div className="h-5 bg-white/10 rounded-lg w-3/4" />
            <div className="h-3 bg-white/5 rounded-lg w-1/3" />
          </div>
        </div>
        <div className="h-8 bg-white/10 rounded-xl w-36 hidden sm:block" />
      </div>

      {/* Grid Skeleton */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-2xl flex flex-col items-center justify-center h-[260px]">
          <div className="w-40 h-40 rounded-full border-8 border-white/10 flex items-center justify-center" />
          <div className="h-4 bg-white/10 rounded w-1/2 mt-4" />
        </div>

        <div className="glass-panel p-6 rounded-2xl md:col-span-2 flex flex-col justify-between h-[260px]">
          <div className="space-y-3">
            <div className="h-5 bg-white/10 rounded w-1/3 border-b border-white/5 pb-2" />
            <div className="h-3 bg-white/5 rounded w-full" />
            <div className="h-3 bg-white/5 rounded w-full" />
            <div className="h-3 bg-white/5 rounded w-4/5" />
          </div>
          <div className="h-8 bg-white/5 rounded-xl w-3/4" />
        </div>
      </div>

      {/* Permission Table Skeleton */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <div className="h-5 bg-white/10 rounded w-1/4" />
        <div className="space-y-2">
          <div className="h-12 bg-white/5 rounded-xl" />
          <div className="h-12 bg-white/5 rounded-xl" />
          <div className="h-12 bg-white/5 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
