// ============================================================
// ARC: AETHON — EXPEDITION PANEL (Stub for Prompt 10)
// ============================================================

import { useGame } from '../context/GameContext';
import { EXPEDITION_ZONES } from '../constants/gameConstants';

export default function ExpeditionPanel() {
  const { save, updateSave } = useGame();
  const dragon = save?.dragonData;
  if (!dragon) return null;

  const isOnExpedition = dragon.isOnExpedition;
  const isInjured = dragon.isInjured;

  const startExpedition = (zoneId: string, layerId: string) => {
    const zone = EXPEDITION_ZONES[zoneId];
    if (!zone) return;
    const layer = zone.layers[layerId as keyof typeof zone.layers];
    if (!layer) return;
    const [minDuration, maxDuration] = layer.durationRange;
    const duration = minDuration + Math.random() * (maxDuration - minDuration);
    const now = Date.now();

    updateSave((prev) => ({
      ...prev,
      dragonData: prev.dragonData ? {
        ...prev.dragonData,
        isOnExpedition: true,
        expeditionZoneId: zoneId as any,
        expeditionLayerId: layerId as any,
        expeditionStartTime: now,
        expeditionEndTime: now + duration,
      } : prev.dragonData,
    }));
  };

  if (isOnExpedition) {
    const endTime = dragon.expeditionEndTime || 0;
    const remaining = Math.max(0, endTime - Date.now());
    const minutes = Math.ceil(remaining / 60000);
    return (
      <div className="bg-[#12121a]/50 rounded-xl border border-[#2a2a3a]/50 p-4 text-center">
        <p className="text-sm text-[#e8e8ec]">🗺️ Em expedição...</p>
        <p className="text-xs text-[#6a6a7a] mt-1">Retorno em ~{minutes} min</p>
      </div>
    );
  }

  if (isInjured) {
    return (
      <div className="bg-[#12121a]/50 rounded-xl border border-[#2a2a3a]/50 p-4 text-center">
        <p className="text-sm text-[#e8e8ec]">🩹 Recuperando de lesão...</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {Object.values(EXPEDITION_ZONES).map((zone) => (
        <div key={zone.id} className="bg-[#12121a]/50 rounded-xl border border-[#2a2a3a]/50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">{zone.emoji}</span>
            <h3 className="font-medium text-[#e8e8ec]">{zone.name}</h3>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {Object.values(zone.layers).map((layer) => (
              <button key={layer.id} onClick={() => startExpedition(zone.id, layer.id)}
                className="py-3 px-2 bg-[#1a1a24] border border-[#2a2a3a] rounded-xl text-sm text-[#e8e8ec] hover:border-[#a78bfa]/50 transition-all active:scale-[0.98]">
                {layer.name}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
