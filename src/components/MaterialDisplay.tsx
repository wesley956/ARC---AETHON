// ============================================================
// ARC: AETHON — MATERIAL DISPLAY
// ============================================================

import { MaterialInventory } from '../types/game';
import { MATERIAL_DEFINITIONS } from '../constants/gameConstants';

interface MaterialDisplayProps {
  materials: MaterialInventory;
}

export default function MaterialDisplay({ materials }: MaterialDisplayProps) {
  const hasMaterials = Object.values(materials).some(qty => qty > 0);

  if (!hasMaterials) {
    return (
      <div className="bg-[#12121a]/50 rounded-xl border border-[#2a2a3a]/50 p-4 text-center">
        <p className="text-sm text-[#6a6a7a] italic">Nenhum material coletado ainda...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#12121a]/50 rounded-xl border border-[#2a2a3a]/50 p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">📦</span>
        <h3 className="font-medium text-[#e8e8ec]">Materiais</h3>
      </div>
      <div className="space-y-2">
        {Object.entries(materials).filter(([, qty]) => qty > 0).map(([id, qty]) => {
          const def = MATERIAL_DEFINITIONS[id as keyof typeof MATERIAL_DEFINITIONS];
          if (!def) return null;
          return (
            <div key={id} className="flex items-center justify-between p-2 bg-[#1a1a24]/50 rounded-lg">
              <div className="flex items-center gap-2">
                <span>{def.emoji}</span>
                <span className="text-sm text-[#e8e8ec]">{def.name}</span>
              </div>
              <span className="text-sm font-medium text-[#a78bfa]">x{qty}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
