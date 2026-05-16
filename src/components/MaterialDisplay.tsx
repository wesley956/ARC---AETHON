// ============================================================
// ARC: AETHON — MATERIAL DISPLAY
// ============================================================

import { MaterialInventory } from '../types/game';
import { MATERIAL_DEFINITIONS } from '../constants/gameConstants';

interface MaterialDisplayProps { materials: MaterialInventory; compact?: boolean; }

const RARITY_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  common: { bg: 'rgba(107,114,128,0.15)', border: 'rgba(107,114,128,0.3)', text: '#9ca3af' },
  uncommon: { bg: 'rgba(34,197,94,0.15)', border: 'rgba(34,197,94,0.3)', text: '#4ade80' },
  rare: { bg: 'rgba(168,85,247,0.15)', border: 'rgba(168,85,247,0.3)', text: '#a855f7' },
  legendary: { bg: 'rgba(251,191,36,0.15)', border: 'rgba(251,191,36,0.3)', text: '#fbbf24' },
};

export default function MaterialDisplay({ materials, compact = false }: MaterialDisplayProps) {
  const hasMats = Object.values(materials).some(q => q > 0);
  if (!hasMats) return (<div className="rounded-xl p-5 text-center" style={{ background: 'rgba(18,18,26,0.5)', border: '1px solid rgba(42,42,58,0.5)' }}><span className="text-3xl mb-2 block">📦</span><p className="text-sm text-[#6a6a7a] italic">Nenhum material coletado ainda...</p></div>);
  if (compact) return (<div className="flex flex-wrap gap-2">{Object.entries(materials).filter(([, q]) => q > 0).map(([id, qty]) => { const def = MATERIAL_DEFINITIONS[id]; if (!def) return null; const c = RARITY_COLORS[def.rarity]; return (<div key={id} className="flex items-center gap-1.5 px-2 py-1 rounded-lg" style={{ background: c.bg, border: `1px solid ${c.border}` }}><span className="text-sm">{def.emoji}</span><span className="text-xs font-medium" style={{ color: c.text }}>{qty}</span></div>); })}</div>);
  return (
    <div className="rounded-xl overflow-hidden" style={{ background: 'rgba(18,18,26,0.5)', border: '1px solid rgba(42,42,58,0.5)' }}>
      <div className="flex items-center justify-between p-4 border-b border-[#2a2a3a]/30"><span className="text-xl">📦</span><h3 className="font-medium text-[#e8e8ec]">Materiais</h3></div>
      <div className="p-3 grid grid-cols-2 gap-2">
        {Object.entries(materials).filter(([, q]) => q > 0).map(([id, qty]) => { const def = MATERIAL_DEFINITIONS[id]; if (!def) return null; const c = RARITY_COLORS[def.rarity]; return (<div key={id} className="rounded-xl p-3 flex items-center gap-2" style={{ background: c.bg, border: `1px solid ${c.border}` }}><span className="text-2xl" style={{ filter: `drop-shadow(0 0 4px ${c.text}40)` }}>{def.emoji}</span><div className="flex-1"><p className="text-sm font-medium text-[#e8e8ec]">{def.name}</p></div><span className="text-lg font-bold" style={{ color: c.text }}>×{qty}</span></div>); })}
      </div>
    </div>
  );
}
