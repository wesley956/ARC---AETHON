// ============================================================
// ARC: AETHON — MATERIAL DISPLAY
// Prompt 11: Clear, beautiful material inventory.
// ============================================================

import { MaterialInventory } from '../types/game';
import { MATERIAL_DEFINITIONS } from '../constants/gameConstants';

interface MaterialDisplayProps {
  materials: MaterialInventory;
  compact?: boolean;
}

// Rarity colors
const RARITY_COLORS = {
  common: { bg: 'rgba(107, 114, 128, 0.15)', border: 'rgba(107, 114, 128, 0.3)', text: '#9ca3af' },
  uncommon: { bg: 'rgba(34, 197, 94, 0.15)', border: 'rgba(34, 197, 94, 0.3)', text: '#4ade80' },
  rare: { bg: 'rgba(168, 85, 247, 0.15)', border: 'rgba(168, 85, 247, 0.3)', text: '#a855f7' },
  legendary: { bg: 'rgba(251, 191, 36, 0.15)', border: 'rgba(251, 191, 36, 0.3)', text: '#fbbf24' },
};

export default function MaterialDisplay({ materials, compact = false }: MaterialDisplayProps) {
  const hasMaterials = Object.values(materials).some(qty => qty > 0);
  const totalMaterials = Object.values(materials).reduce((sum, qty) => sum + qty, 0);

  if (!hasMaterials) {
    return (
      <div 
        className="rounded-xl p-5 text-center"
        style={{
          background: 'linear-gradient(135deg, rgba(18, 18, 26, 0.6) 0%, rgba(18, 18, 26, 0.4) 100%)',
          border: '1px solid rgba(42, 42, 58, 0.5)',
        }}
      >
        <span className="text-3xl mb-2 block">📦</span>
        <p className="text-sm text-[#6a6a7a] italic">
          Nenhum material coletado ainda...
        </p>
        <p className="text-xs text-[#4a4a5a] mt-2">
          Envie seu dragão em expedições para coletar.
        </p>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="flex flex-wrap gap-2">
        {Object.entries(materials).filter(([, qty]) => qty > 0).map(([id, qty]) => {
          const def = MATERIAL_DEFINITIONS[id as keyof typeof MATERIAL_DEFINITIONS];
          if (!def) return null;
          const colors = RARITY_COLORS[def.rarity];
          
          return (
            <div 
              key={id}
              className="flex items-center gap-1.5 px-2 py-1 rounded-lg"
              style={{
                background: colors.bg,
                border: `1px solid ${colors.border}`,
              }}
            >
              <span className="text-sm">{def.emoji}</span>
              <span className="text-xs font-medium" style={{ color: colors.text }}>
                {qty}
              </span>
            </div>
          );
        })}
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
          <span className="text-xl">📦</span>
          <h3 className="font-medium text-[#e8e8ec]">Materiais</h3>
        </div>
        <span className="text-xs text-[#6a6a7a] px-2 py-1 bg-[#1a1a24] rounded-full">
          {totalMaterials} total
        </span>
      </div>

      {/* Materials grid */}
      <div className="p-3 grid grid-cols-2 gap-2">
        {Object.entries(materials).filter(([, qty]) => qty > 0).map(([id, qty]) => {
          const def = MATERIAL_DEFINITIONS[id as keyof typeof MATERIAL_DEFINITIONS];
          if (!def) return null;
          const colors = RARITY_COLORS[def.rarity];

          return (
            <div 
              key={id} 
              className="relative overflow-hidden rounded-xl p-3"
              style={{
                background: colors.bg,
                border: `1px solid ${colors.border}`,
              }}
            >
              {/* Subtle glow */}
              <div 
                className="absolute top-0 right-0 w-16 h-16 opacity-30"
                style={{
                  background: `radial-gradient(circle at top right, ${colors.text}30 0%, transparent 70%)`,
                }}
              />

              <div className="relative flex items-center gap-2">
                <span 
                  className="text-2xl"
                  style={{
                    filter: `drop-shadow(0 0 4px ${colors.text}40)`,
                  }}
                >
                  {def.emoji}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#e8e8ec] truncate">
                    {def.name}
                  </p>
                  <p className="text-[10px] uppercase tracking-wide" style={{ color: colors.text }}>
                    {def.rarity === 'common' && 'Comum'}
                    {def.rarity === 'uncommon' && 'Incomum'}
                    {def.rarity === 'rare' && 'Raro'}
                    {def.rarity === 'legendary' && 'Lendário'}
                  </p>
                </div>
                <span 
                  className="text-lg font-bold"
                  style={{ color: colors.text }}
                >
                  ×{qty}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Hint */}
      <div className="px-4 pb-3">
        <p className="text-[10px] text-[#4a4a5a] text-center">
          Materiais são usados para melhorar o ninho
        </p>
      </div>
    </div>
  );
}
