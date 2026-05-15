// ============================================================
// ARC: AETHON — NEST PANEL (Simplified for Prompt 10)
// ============================================================

import { useGame } from '../context/GameContext';
import { normalizeNestData, getComfortDescription, getStyleDescription } from '../utils/nest';

export default function NestPanel() {
  const { save } = useGame();
  const dragon = save?.dragonData;
  if (!dragon) return null;

  const nest = normalizeNestData(dragon.nestData);

  return (
    <div className="bg-[#12121a]/50 rounded-xl border border-[#2a2a3a]/50 p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">🏠</span>
        <h3 className="font-medium text-[#e8e8ec]">Ninho</h3>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-[#6a6a7a]">Conforto</span>
          <span className="text-sm font-medium text-[#e8e8ec]">{nest.comfort}%</span>
        </div>
        <div className="w-full h-2 bg-[#1a1a24] rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#a78bfa] to-[#c4b5fd] rounded-full transition-all" style={{ width: `${nest.comfort}%` }} />
        </div>
        <p className="text-xs text-[#6a6a7a] italic">{getComfortDescription(nest.comfort)}</p>
        <p className="text-xs text-[#6a6a7a]">{getStyleDescription(nest.style)}</p>
      </div>
    </div>
  );
}
