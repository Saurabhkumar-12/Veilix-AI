'use client'
import React, { Suspense, lazy } from 'react'
const Spline = lazy(() => import('@splinetool/react-spline'))

interface SplineSceneProps {
  scene: string
  className?: string
}

export function SplineScene({ scene, className }: SplineSceneProps) {
  return (
    <div className="w-full h-full relative" role="region" aria-label="Interactive 3D Visual Experience">
      <span className="sr-only">
        Interactive 3D Veilix AI Security Intelligence Bot visualizing permission analysis and static vulnerability detection.
      </span>
      <Suspense
        fallback={
          <div 
            className="w-full h-full flex flex-col items-center justify-center min-h-[300px] gap-3"
            aria-live="polite"
            aria-busy="true"
          >
            <div className="w-8 h-8 border-2 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" aria-hidden="true"></div>
            <span className="text-[10px] font-mono text-purple-400 tracking-widest uppercase animate-pulse">
              Loading 3D Environment...
            </span>
          </div>
        }
      >
        <Spline scene={scene} className={className} />
      </Suspense>
    </div>
  )
}
