// ============================================================
// ARC: AETHON — MATERIAL DISPLAY
// Mobile-optimized materials inventory.
// ============================================================

import { MaterialId } from '../types/game';
import { MATERIAL_DEFINITIONS } from '../constants/gameConstants';
import { normalizeMaterialInventory, hasMaterials } from '../utils/materials';

interface MaterialDisplayProps {
  materials: unknown;
  compact?: boolean;
}

export default function MaterialDisplay({ materials, compact = false }: MaterialDisplayProps) {
  const safeMaterials = normalizeMaterialInventory(materials);

  const materialsWithQuantity = (Object.entries(safeMaterials) as [MaterialId, number][])
    .filter(([, quantity]) => quantity > 0);

  if (!hasMaterials(safeMaterials)) {
    if (compact) {
      return <span className="text-xs text-[#6a6a7a] italic">Nenhum material</span>;
    }

    return (
      <div className="bg-[#12121a]/50 rounded-xl border border-[#2a2a3a]/50 p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">🎒</span>
          <h3 className="font-medium text-[#e8e8ec]">Materiais</h3>
        </div>
        <div className="text-center py-4">
          <p className="text-sm text-[#6a6a7a] italic mb-2">
            Nenhum material coletado ainda.
          </p>
          <p className="text-xs text-[#6a6a7a]">
            Explore expedições para encontrar materiais!
          </p>
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        {materialsWithQuantity.map(([materialId, quantity]) => {
          const definition = MATERIAL_DEFINITIONS[materialId];
          if (!definition) return null;
          return (
            <div 
              key={materialId} 
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#1a1a24] rounded-lg"
            >
              <span className="text-base">{definition.emoji}</span>
              <span className="text-sm text-[#e8e8ec] font-medium">{quantity}</span>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="bg-[#12121a]/50 rounded-xl border border-[#2a2a3a]/50 p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">🎒</span>
        <h3 className="font-medium text-[#e8e8ec]">Materiais</h3>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {materialsWithQuantity.map(([materialId, quantity]) => {
          const definition = MATERIAL_DEFINITIONS[materialId];
          if (!definition) return null;
          
          const rarityColors: Record<string, string> = {
            common: 'border-[#6a6a7a]/30',
            uncommon: 'border-green-700/30',
            rare: 'border-purple-700/30',
            legendary: 'border-yellow-700/30',
          };
          
          return (
            <div
              key={materialId}
              className={`
                flex items-center gap-3 p-3 rounded-lg bg-[#1a1a24]/50
                border ${rarityColors[definition.rarity] || 'border-[#6a6a7a]/30'}
              `}
            >
              <span className="text-2xl">{definition.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-[#e8e8ec] truncate">{definition.name}</p>
                <p className="text-base font-bold text-[#a78bfa]">x{quantity}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
