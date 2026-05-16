// ============================================================
// ARC: AETHON — DEBUG PANEL
// ⚠️ DEV ONLY
// ============================================================

import { useState } from 'react';
import { useGame } from '../context/GameContext';
import { MVP_ORB_ELEMENTS, ORB_TRAY_MAX } from '../constants/gameConstants';
import { MvpOrbElement, Orb } from '../types/game';

export default function DebugPanel() {
  const { save, clearSave, updateSave, currentScreen } = useGame();
  const [isOpen, setIsOpen] = useState(false);

  const isDev = typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  if (!isDev) return null;

  const addTestOrbs = (count: number) => {
    if (!save?.eggData) return;
    const newOrbs: Orb[] = [];
    for (let i = 0; i < count; i++) {
      if (save.eggData.availableOrbs.length + newOrbs.length >= ORB_TRAY_MAX) break;
      const element: MvpOrbElement = MVP_ORB_ELEMENTS[Math.floor(Math.random() * MVP_ORB_ELEMENTS.length)];
      newOrbs.push({ id: `orb_debug_${Date.now()}_${i}`, element, createdAt: Date.now() });
    }
    if (newOrbs.length > 0) {
      updateSave((prev) => ({
        ...prev,
        eggData: prev.eggData ? { ...prev.eggData, availableOrbs: [...prev.eggData.availableOrbs, ...newOrbs] } : prev.eggData,
      }));
    }
  };

  return (
    <div className="fixed bottom-16 right-2 z-50">
      <button onClick={() => setIsOpen(!isOpen)}
        className="bg-red-900/90 text-red-300 text-xs px-3 py-2 rounded-lg border border-red-700 font-mono shadow-lg active:scale-95 transition-transform">
        {isOpen ? '✕ DEV' : '⚙️ DEV'}
      </button>

      {isOpen && (
        <div className="absolute bottom-12 right-0 w-72 max-h-[60vh] overflow-y-auto bg-gray-950/98 border border-red-800 rounded-xl shadow-xl p-3 text-xs font-mono text-gray-300 scrollbar-hide">
          <div className="text-red-400 font-bold mb-3 text-center border border-red-700 rounded-lg py-2 bg-red-950/50">⚠️ DEV ONLY ⚠️</div>
          <div className="mb-3 p-2 bg-gray-900 rounded-lg">
            <span className="text-gray-500">Screen: </span>
            <span className="text-yellow-400">{currentScreen}</span>
          </div>

          {save && (
            <div className="mb-3 p-2 bg-gray-900 rounded-lg space-y-1">
              <div className="flex gap-2">
                <span className={save.hasEgg ? 'text-green-400' : 'text-gray-600'}>Egg: {String(save.hasEgg)}</span>
                <span className={save.hasDragon ? 'text-green-400' : 'text-gray-600'}>Dragon: {String(save.hasDragon)}</span>
              </div>
              {save.eggData && (
                <div className="text-cyan-400">Mat: {(save.eggData.maturationProgress * 100).toFixed(0)}% | Orbs: {save.eggData.availableOrbs.length}/{save.eggData.orbsOnEgg.length}</div>
              )}
              {save.dragonData && (
                <div className="text-purple-400 truncate">{save.dragonData.dragonName}</div>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-1.5">
            {save?.hasEgg && (
              <>
                <button onClick={() => addTestOrbs(3)} className="bg-blue-900 text-blue-300 px-2 py-2 rounded-lg hover:bg-blue-800 active:scale-95">+ Orbs</button>
                <button onClick={() => { if (!save.eggData) return; updateSave((prev) => ({ ...prev, eggData: prev.eggData ? { ...prev.eggData, maturationProgress: 1.0 } : prev.eggData })); }}
                  className="bg-yellow-900 text-yellow-300 px-2 py-2 rounded-lg hover:bg-yellow-800 active:scale-95">100% Mat</button>
              </>
            )}
            {save?.hasDragon && (
              <button onClick={() => { updateSave((prev) => ({ ...prev, dragonData: prev.dragonData ? { ...prev.dragonData, crystals: { fire: prev.dragonData.crystals.fire + 5, water: prev.dragonData.crystals.water + 5, earth: prev.dragonData.crystals.earth + 5, air: prev.dragonData.crystals.air + 2, metal: prev.dragonData.crystals.metal + 2 } } : prev.dragonData })); }}
                className="bg-purple-900 text-purple-300 px-2 py-2 rounded-lg hover:bg-purple-800 active:scale-95">+ Cristais</button>
            )}
            <button onClick={clearSave} className="bg-red-900 text-red-300 px-2 py-2 rounded-lg hover:bg-red-800 active:scale-95 col-span-2">🗑️ Clear Save</button>
          </div>
        </div>
      )}
    </div>
  );
}
