// ============================================================
// ARC: AETHON — CRYSTAL DISPLAY
// Shows crystal inventory.
// ============================================================

import { CrystalInventory } from '../types/game';
import { ELEMENT_EMOJI, ELEMENT_LABELS } from '../constants/gameConstants';

interface CrystalDisplayProps {
  crystals: CrystalInventory;
  compact?: boolean;
}

export default function CrystalDisplay({ crystals, compact = false }: CrystalDisplayProps) {
  // Only show MVP crystals (fire, water, earth)
  const mvpCrystals: (keyof CrystalInventory)[] = ['fire', 'water', 'earth'];

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        {mvpCrystals.map((element) => (
          <div key={element} className="flex items-center gap-1">
            <span className="text-sm">{ELEMENT_EMOJI[element]}</span>
            <span className="text-sm font-medium text-[#e8e8ec]">
              {crystals[element]}
            </span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-[#12121a]/50 rounded-xl border border-[#2a2a3a]/50 p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">💎</span>
        <h3 className="font-medium text-[#e8e8ec]">Cristais</h3>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {mvpCrystals.map((element) => (
          <div
            key={element}
            className="flex flex-col items-center gap-1 p-2 bg-[#1a1a24]/50 rounded-lg"
          >
            <span className="text-2xl">{ELEMENT_EMOJI[element]}</span>
            <span className="text-lg font-bold text-[#e8e8ec]">
              {crystals[element]}
            </span>
            <span className="text-[10px] text-[#6a6a7a] uppercase tracking-wide">
              {ELEMENT_LABELS[element]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
