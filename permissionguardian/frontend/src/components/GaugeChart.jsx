import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const RADIAN = Math.PI / 180;

const data = [
  { name: 'Low Risk', value: 33, color: '#10B981' },    // Emerald Green
  { name: 'Medium Risk', value: 33, color: '#F59E0B' }, // Amber Yellow
  { name: 'High Risk', value: 34, color: '#EF4444' }     // Rose Red
];

// Center calculations and needle rendering
const renderNeedle = (value, cx, cy, iR, oR, color) => {
  const total = 100;
  const angle = 180 * (1 - value / total); // 180 to 0 degrees
  const r = (iR + oR) / 2;
  const xp = cx + r * Math.cos(angle * RADIAN);
  const yp = cy - r * Math.sin(angle * RADIAN);

  // Perpendicular angles for tapered base
  const xBase1 = cx + 6 * Math.cos((angle - 90) * RADIAN);
  const yBase1 = cy - 6 * Math.sin((angle - 90) * RADIAN);
  const xBase2 = cx + 6 * Math.cos((angle + 90) * RADIAN);
  const yBase2 = cy - 6 * Math.sin((angle + 90) * RADIAN);

  return [
    <polygon
      key="needle"
      points={`${xBase1},${yBase1} ${xp},${yp} ${xBase2},${yBase2}`}
      fill={color}
      stroke="none"
    />,
    <circle
      key="pivot"
      cx={cx}
      cy={cy}
      r={8}
      fill={color}
      stroke="#0B0F19"
      strokeWidth={3}
    />
  ];
};

export default function GaugeChart({ score = 0 }) {
  // Enforce score bounds
  const cleanScore = Math.max(0, Math.min(100, score));

  // Determine active color based on score zones
  let activeColor = '#10B981'; // Green
  let statusText = 'Low Risk';
  
  if (cleanScore >= 67) {
    activeColor = '#EF4444'; // Red
    statusText = 'High Risk';
  } else if (cleanScore >= 34) {
    activeColor = '#F59E0B'; // Yellow
    statusText = 'Moderate Risk';
  }

  // Visual constants
  const cx = 120;
  const cy = 120;
  const iR = 60;
  const oR = 90;

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="relative w-[240px] h-[150px]">
        <ResponsiveContainer width="100%" h="100%">
          <PieChart>
            <Pie
              dataKey="value"
              startAngle={180}
              endAngle={0}
              data={data}
              cx={cx}
              cy={cy}
              innerRadius={iR}
              outerRadius={oR}
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} opacity={0.3} />
              ))}
            </Pie>
            
            {/* Active Sector Track overlay */}
            <Pie
              dataKey="value"
              startAngle={180}
              endAngle={180 - (180 * (cleanScore / 100))}
              data={[{ value: cleanScore }]}
              cx={cx}
              cy={cy}
              innerRadius={iR}
              outerRadius={oR}
              fill={activeColor}
              stroke="none"
              isAnimationActive={true}
              animationDuration={800}
            />
            
            {/* Custom SVG needle elements */}
            <g>
              {renderNeedle(cleanScore, cx, cy, iR, oR, activeColor)}
            </g>
          </PieChart>
        </ResponsiveContainer>

        {/* Center Text overlays */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
          <span className="text-4xl font-bold tracking-tight font-display" style={{ color: activeColor }}>
            {cleanScore}%
          </span>
          <span className="text-xs uppercase tracking-widest text-slate-400 mt-1 font-semibold">
            {statusText}
          </span>
        </div>
      </div>
    </div>
  );
}
