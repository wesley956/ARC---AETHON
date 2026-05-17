// ============================================================
// ARC: AETHON — CRYSTAL DISPLAY
// Prompt 11: Beautiful crystal inventory with glow effects.
// ============================================================

import { CrystalInventory } from '../types/game';
import { ELEMENT_EMOJI, ELEMENT_LABELS, ELEMENT_COLORS } from '../constants/gameConstants';

interface CrystalDisplayProps {
  crystals: CrystalInventory;
  compact?: boolean;
}

export default function CrystalDisplay({ crystals, compact = false }: CrystalDisplayProps) {
  const mvpCrystals: (keyof CrystalInventory)[] = ['fire', 'water', 'earth'];
  const totalCrystals = mvpCrystals.reduce((sum, el) => sum + crystals[el], 0);

  if (compact) {
    return (
      <div 
        className="flex items-center justify-center gap-4 p-3 rounded-xl"
        style={{
          background: 'linear-gradient(135deg, rgba(18, 18, 26, 0.5) 0%, rgba(18, 18, 26, 0.3) 100%)',
          border: '1px solid rgba(42, 42, 58, 0.3)',
        }}
      >
        {mvpCrystals.map((element) => (
          <div key={element} className="flex items-center gap-1.5">
            <span 
              className="text-lg"
              style={{
                filter: `drop-shadow(0 0 4px ${ELEMENT_COLORS[element]}60)`,
              }}
            >
              {ELEMENT_EMOJI[element]}
            </span>
            <span 
              className="text-sm font-bold"
              style={{ color: ELEMENT_COLORS[element] }}
            >
              {crystals[element]}
            </span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div 
      className="rounded-xl overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(18, 18, 26, 0.6) 0%, rgba(18, 18, 26, 0.4) 100%)',
        border: '1px solid rgba(42, 42, 58, 0.5)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#2a2a3a]/30">
        <div className="flex items-center gap-2">
          <span className="text-xl">💎</span>
          <h3 className="font-medium text-[#e8e8ec]">Cristais Elementais</h3>
        </div>
        <span className="text-xs text-[#6a6a7a] px-2 py-1 bg-[#1a1a24] rounded-full">
          {totalCrystals} total
        </span>
      </div>

      {/* Crystal grid */}
      <div className="p-3 grid grid-cols-3 gap-2">
        {mvpCrystals.map((element) => {
          const count = crystals[element];
          const color = ELEMENT_COLORS[element];
          const isEmpty = count === 0;

          return (
            <div 
              key={element} 
              className="relative overflow-hidden rounded-xl p-3 text-center"
              style={{
                background: isEmpty 
                  ? 'rgba(26, 26, 36, 0.5)'
                  : `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
                border: `1px solid ${isEmpty ? 'rgba(42, 42, 58, 0.3)' : color + '30'}`,
              }}
            >
              {/* Glow effect for non-empty */}
              {!isEmpty && (
                <div 
                  className="absolute inset-0 opacity-30"
                  style={{
                    background: `radial-gradient(circle at center, ${color}30 0%, transparent 70%)`,
                  }}
                />
              )}

              <div className="relative">
                <span 
                  className="text-3xl block mb-1"
                  style={{
                    filter: isEmpty ? 'grayscale(0.5) opacity(0.5)' : `drop-shadow(0 0 8px ${color}60)`,
                  }}
                >
                  {ELEMENT_EMOJI[element]}
                </span>
                <span 
                  className="text-xl font-bold block"
                  style={{ color: isEmpty ? '#4a4a5a' : color }}
                >
                  {count}
                </span>
                <span className="text-[10px] uppercase tracking-wide text-[#6a6a7a]">
                  {ELEMENT_LABELS[element]}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Hint */}
      <div className="px-4 pb-3">
        <p className="text-[10px] text-[#4a4a5a] text-center">
          Cristais são usados para alimentar seu dragão
        </p>
      </div>
    </div>
  );
}
