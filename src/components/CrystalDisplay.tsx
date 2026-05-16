// ============================================================
// ARC: AETHON — CRYSTAL DISPLAY
// ============================================================

import { CrystalInventory } from '../types/game';
import { ELEMENT_EMOJI, ELEMENT_LABELS, ELEMENT_COLORS } from '../constants/gameConstants';

interface CrystalDisplayProps { crystals: CrystalInventory; compact?: boolean; }

export default function CrystalDisplay({ crystals, compact = false }: CrystalDisplayProps) {
  const mvpCrystals: (keyof CrystalInventory)[] = ['fire', 'water', 'earth'];
  if (compact) {
    return (
      <div className="flex items-center justify-center gap-4 p-3 rounded-xl" style={{ background: 'rgba(18,18,26,0.5)', border: '1px solid rgba(42,42,58,0.3)' }}>
        {mvpCrystals.map(el => (<div key={el} className="flex items-center gap-1.5"><span className="text-lg" style={{ filter: `drop-shadow(0 0 4px ${ELEMENT_COLORS[el]}60)` }}>{ELEMENT_EMOJI[el]}</span><span className="text-sm font-bold" style={{ color: ELEMENT_COLORS[el] }}>{crystals[el]}</span></div>))}
      </div>
    );
  }
  const total = mvpCrystals.reduce((s, el) => s + crystals[el], 0);
  return (
    <div className="rounded-xl overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(18,18,26,0.6) 0%, rgba(18,18,26,0.4) 100%)', border: '1px solid rgba(42,42,58,0.5)' }}>
      <div className="flex items-center justify-between p-4 border-b border-[#2a2a3a]/30"><div className="flex items-center gap-2"><span className="text-xl">💎</span><h3 className="font-medium text-[#e8e8ec]">Cristais Elementais</h3></div><span className="text-xs text-[#6a6a7a] px-2 py-1 bg-[#1a1a24] rounded-full">{total} total</span></div>
      <div className="p-3 grid grid-cols-3 gap-2">
        {mvpCrystals.map(el => { const count = crystals[el]; const color = ELEMENT_COLORS[el]; const empty = count === 0;
          return (<div key={el} className="relative overflow-hidden rounded-xl p-3 text-center" style={{ background: empty ? 'rgba(26,26,36,0.5)' : `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`, border: `1px solid ${empty ? 'rgba(42,42,58,0.3)' : color + '30'}` }}>
            <div className="relative"><span className="text-3xl block mb-1" style={{ filter: empty ? 'grayscale(0.5) opacity(0.5)' : `drop-shadow(0 0 8px ${color}60)` }}>{ELEMENT_EMOJI[el]}</span><span className="text-xl font-bold block" style={{ color: empty ? '#4a4a5a' : color }}>{count}</span><span className="text-[10px] uppercase tracking-wide text-[#6a6a7a]">{ELEMENT_LABELS[el]}</span></div></div>);
        })}
      </div>
    </div>
  );
}
