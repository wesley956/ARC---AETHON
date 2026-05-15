// ============================================================
// ARC: AETHON — VITALITY BAR
// Visual representation of dragon vitality.
// ============================================================

interface VitalityBarProps {
  vitality: number; // 0 to 1
  showLabel?: boolean;
}

export default function VitalityBar({ vitality, showLabel = true }: VitalityBarProps) {
  const percentage = Math.round(vitality * 100);
  const isLow = vitality < 0.3;
  const isMedium = vitality >= 0.3 && vitality < 0.6;

  const barColor = isLow
    ? 'bg-gradient-to-r from-red-600 to-orange-500'
    : isMedium
    ? 'bg-gradient-to-r from-yellow-500 to-green-400'
    : 'bg-gradient-to-r from-green-500 to-emerald-400';

  const glowColor = isLow
    ? 'shadow-red-500/30'
    : isMedium
    ? 'shadow-yellow-500/30'
    : 'shadow-green-500/30';

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-[#6a6a7a]">Vitalidade</span>
          <span className={`text-xs font-medium ${isLow ? 'text-red-400' : 'text-green-400'}`}>
            {percentage}%
          </span>
        </div>
      )}
      <div className="w-full h-3 bg-[#1a1a24] rounded-full overflow-hidden border border-[#2a2a3a]">
        <div
          className={`h-full ${barColor} rounded-full transition-all duration-500 ease-out shadow-lg ${glowColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
