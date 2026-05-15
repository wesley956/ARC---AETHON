// ============================================================
// ARC: AETHON — TRAIT DISPLAY
// ============================================================

import { PersonalityTraits, TraitKey } from '../types/game';
import { TRAIT_LABELS, TRAIT_EMOJI } from '../constants/gameConstants';

interface TraitDisplayProps {
  traits: PersonalityTraits;
  showAll?: boolean;
}

export default function TraitDisplay({ traits, showAll = false }: TraitDisplayProps) {
  const sortedTraits = (Object.entries(traits) as [TraitKey, number][]).sort((a, b) => b[1] - a[1]);
  const visibleTraits = showAll ? sortedTraits : sortedTraits.slice(0, 3);
  const activeTraits = visibleTraits.filter(([, value]) => value > 0.15);

  if (activeTraits.length === 0) {
    return (
      <div className="bg-[#12121a]/50 rounded-xl border border-[#2a2a3a]/50 p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">🧠</span>
          <h3 className="font-medium text-[#e8e8ec]">Personalidade</h3>
        </div>
        <p className="text-sm text-[#6a6a7a] italic text-center py-2">A personalidade ainda está se formando...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#12121a]/50 rounded-xl border border-[#2a2a3a]/50 p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">🧠</span>
        <h3 className="font-medium text-[#e8e8ec]">Personalidade</h3>
      </div>
      <div className="space-y-3">
        {activeTraits.map(([trait, value]) => {
          const percentage = Math.round(value * 100);
          return (
            <div key={trait} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base">{TRAIT_EMOJI[trait] || '✨'}</span>
                  <span className="text-sm text-[#e8e8ec]">{TRAIT_LABELS[trait] || trait}</span>
                </div>
                <span className="text-xs text-[#6a6a7a]">{percentage}%</span>
              </div>
              <div className="w-full h-2 bg-[#1a1a24] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#a78bfa] to-[#c4b5fd] rounded-full transition-all duration-500" style={{ width: `${percentage}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
