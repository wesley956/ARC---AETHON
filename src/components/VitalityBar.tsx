// ============================================================
// ARC: AETHON — VITALITY BAR
// ============================================================

interface VitalityBarProps {
  vitality: number; // 0 to 1
  showLabel?: boolean;
}

export default function VitalityBar({ vitality, showLabel = true }: VitalityBarProps) {
  const percentage = Math.round(vitality * 100);
  const isLow = vitality < 0.3;
  const isMedium = vitality >= 0.3 && vitality < 0.7;

  const barColor = isLow
    ? 'bg-red-500'
    : isMedium
    ? 'bg-yellow-500'
    : 'bg-green-500';

  return (
    <div className="space-y-1">
      {showLabel && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-[#6a6a7a]">Vitalidade</span>
          <span className={`text-xs font-medium ${isLow ? 'text-red-400' : 'text-[#e8e8ec]'}`}>
            {percentage}%
          </span>
        </div>
      )}
      <div className="w-full h-2 bg-[#1a1a24] rounded-full overflow-hidden">
        <div
          className={`h-full ${barColor} rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
