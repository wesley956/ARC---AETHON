// ============================================================
// ARC: AETHON — VITALITY BAR
// Prompt 11: Beautiful vitality display with emotional feedback.
// ============================================================

interface VitalityBarProps {
  vitality: number;
  showLabel?: boolean;
}

export default function VitalityBar({ vitality, showLabel = true }: VitalityBarProps) {
  const percentage = Math.round(vitality * 100);
  
  // Determine color based on vitality level
  const getVitalityColor = () => {
    if (vitality >= 0.7) return { from: '#22c55e', to: '#4ade80', glow: 'rgba(34, 197, 94, 0.3)' };
    if (vitality >= 0.4) return { from: '#eab308', to: '#facc15', glow: 'rgba(234, 179, 8, 0.3)' };
    return { from: '#ef4444', to: '#f87171', glow: 'rgba(239, 68, 68, 0.3)' };
  };

  const colors = getVitalityColor();
  
  // Emotional message based on vitality
  const getMessage = () => {
    if (vitality >= 0.9) return 'Radiante e cheio de energia';
    if (vitality >= 0.7) return 'Saudável e satisfeito';
    if (vitality >= 0.5) return 'Bem, mas poderia comer';
    if (vitality >= 0.3) return 'Com fome... olha para você';
    return 'Fraco... precisa de cuidados';
  };

  return (
    <div 
      className="rounded-xl p-4"
      style={{
        background: 'linear-gradient(135deg, rgba(18, 18, 26, 0.6) 0%, rgba(18, 18, 26, 0.4) 100%)',
        border: '1px solid rgba(42, 42, 58, 0.5)',
      }}
    >
      {showLabel && (
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">❤️</span>
            <span className="text-sm font-medium text-[#e8e8ec]">Vitalidade</span>
          </div>
          <span 
            className="text-sm font-bold"
            style={{ color: colors.from }}
          >
            {percentage}%
          </span>
        </div>
      )}
      
      {/* Progress bar container */}
      <div className="relative w-full h-3 bg-[#1a1a24] rounded-full overflow-hidden">
        {/* Background subtle pattern */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%)',
            backgroundSize: '20px 100%',
          }}
        />
        
        {/* Vitality fill */}
        <div 
          className="relative h-full rounded-full transition-all duration-700 ease-out"
          style={{ 
            width: `${percentage}%`,
            background: `linear-gradient(90deg, ${colors.from} 0%, ${colors.to} 100%)`,
            boxShadow: `0 0 10px ${colors.glow}`,
          }}
        >
          {/* Shine effect */}
          <div 
            className="absolute inset-0 rounded-full"
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.3) 0%, transparent 50%)',
            }}
          />
        </div>
      </div>
      
      {/* Message */}
      {showLabel && (
        <p className="text-xs text-[#6a6a7a] mt-2 italic">
          {getMessage()}
        </p>
      )}
    </div>
  );
}
