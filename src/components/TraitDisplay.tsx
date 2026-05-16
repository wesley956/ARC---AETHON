// ============================================================
// ARC: AETHON — TRAIT DISPLAY
// ============================================================

import { PersonalityTraits, TraitKey } from '../types/game';
import { TRAIT_LABELS, TRAIT_EMOJI } from '../constants/gameConstants';

const TRAIT_COLORS: Record<string, string> = { courage: '#ff6b35', gentleness: '#a78bfa', loyalty: '#22c55e', curiosity: '#3b82f6', resilience: '#eab308' };

export default function TraitDisplay({ traits }: { traits: PersonalityTraits }) {
  const activeTraits = (Object.entries(traits) as [TraitKey, number][]).sort((a, b) => b[1] - a[1]).slice(0, 3);
  return (
    <div className="rounded-xl p-4 space-y-3" style={{ background: 'rgba(18,18,26,0.5)', border: '1px solid rgba(42,42,58,0.5)' }}>
      <div className="flex items-center gap-2 mb-2"><span className="text-lg">🧬</span><span className="text-sm font-medium text-[#e8e8ec]">Personalidade</span></div>
      {activeTraits.map(([trait, value]) => {
        const pct = Math.round(value * 100);
        const color = TRAIT_COLORS[trait];
        return (
          <div key={trait}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5"><span>{TRAIT_EMOJI[trait]}</span><span className="text-xs text-[#e8e8ec]">{TRAIT_LABELS[trait]}</span></div>
              <span className="text-xs font-bold" style={{ color }}>{pct}%</span>
            </div>
            <div className="w-full h-2 bg-[#1a1a24] rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
