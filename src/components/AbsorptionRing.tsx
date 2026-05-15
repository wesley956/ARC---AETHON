// ============================================================
// ARC: AETHON — ABSORPTION RING
// Visual progress indicator for the 2-second hold absorption.
// ============================================================

interface AbsorptionRingProps {
  progress: number; // 0 to 1
  isActive: boolean;
}

export default function AbsorptionRing({ progress, isActive }: AbsorptionRingProps) {
  if (!isActive) return null;

  // SVG circle parameters
  const size = 160;
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
      {/* Background glow */}
      <div 
        className="absolute w-40 h-40 rounded-full animate-absorption-pulse"
        style={{
          background: 'radial-gradient(circle, rgba(192, 132, 252, 0.2) 0%, transparent 70%)',
        }}
      />

      {/* Progress ring */}
      <svg
        width={size}
        height={size}
        className="absolute transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(124, 92, 191, 0.2)"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#absorption-gradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: 'stroke-dashoffset 50ms linear' }}
        />
        <defs>
          <linearGradient id="absorption-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7c5cbf" />
            <stop offset="100%" stopColor="#c084fc" />
          </linearGradient>
        </defs>
      </svg>

      {/* Percentage text */}
      <div className="absolute text-aethon-glow text-sm font-medium">
        {Math.round(progress * 100)}%
      </div>
    </div>
  );
}
