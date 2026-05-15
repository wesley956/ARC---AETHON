// ============================================================
// ARC: AETHON — TRAIT DISPLAY
// Shows personality traits of the dragon.
// ============================================================

import { PersonalityTraits, TraitKey } from '../types/game';
import { TRAIT_LABELS, TRAIT_EMOJI } from '../constants/gameConstants';

interface TraitDisplayProps {
  traits: PersonalityTraits;
  showAll?: boolean;
}

export default function TraitDisplay({ traits, showAll = false }: TraitDisplayProps) {
  // Get traits sorted by value
  const sortedTraits = (Object.entries(traits) as [TraitKey, number][])
    .sort((a, b) => b[1] - a[1]);

  // Show top 3 or all
  const visibleTraits = showAll ? sortedTraits : sortedTraits.slice(0, 3);

  // Only show traits above base level (0.1)
  const activeTraits = visibleTraits.filter(([, value]) => value > 0.15);

  if (activeTraits.length === 0) {
    return (
      <div className="bg-[#12121a]/50 rounded-xl border border-[#2a2a3a]/50 p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">🧠</span>
          <h3 className="font-medium text-[#e8e8ec]">Personalidade</h3>
        </div>
        <p className="text-sm text-[#6a6a7a] italic">
          A personalidade ainda está se formando...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#12121a]/50 rounded-xl border border-[#2a2a3a]/50 p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">🧠</span>
        <h3 className="font-medium text-[#e8e8ec]">Personalidade</h3>
      </div>
      <div className="space-y-2">
        {activeTraits.map(([trait, value]) => {
          const percentage = Math.round(value * 100);
          const emoji = TRAIT_EMOJI[trait] || '✨';
          const label = TRAIT_LABELS[trait] || trait;

          return (
            <div key={trait} className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{emoji}</span>
                  <span className="text-sm text-[#e8e8ec]">{label}</span>
                </div>
                <span className="text-xs text-[#6a6a7a]">{percentage}%</span>
              </div>
              <div className="w-full h-1.5 bg-[#1a1a24] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#a78bfa] to-[#c4b5fd] rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
