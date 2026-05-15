// ============================================================
// ARC: AETHON — DEBUG PANEL
// ⚠️ DEV ONLY — Must NEVER be shown in production.
// Mobile-friendly debug controls.
// ============================================================

import { useState } from 'react';
import { useGame } from '../context/GameContext';
import { ELEMENT_EMOJI, MVP_ORB_ELEMENTS, ORB_TRAY_MAX } from '../constants/gameConstants';
import { MvpOrbElement, Orb } from '../types/game';
import { normalizeMaterialInventory, addMaterials } from '../utils/materials';
import { normalizeNestData } from '../utils/nest';

export default function DebugPanel() {
  const { save, clearSave, updateSave, currentScreen } = useGame();
  const [isOpen, setIsOpen] = useState(false);

  // Only show in development
  const isDev = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  
  if (!isDev) return null;

  const addTestOrbs = (count: number) => {
    if (!save?.eggData) return;
    
    const newOrbs: Orb[] = [];
    for (let i = 0; i < count; i++) {
      if (save.eggData.availableOrbs.length + newOrbs.length >= ORB_TRAY_MAX) break;
      const element: MvpOrbElement = MVP_ORB_ELEMENTS[Math.floor(Math.random() * MVP_ORB_ELEMENTS.length)];
      newOrbs.push({
        id: `orb_debug_${Date.now()}_${i}`,
        element,
        createdAt: Date.now(),
      });
    }
    
    if (newOrbs.length > 0) {
      updateSave((prev) => ({
        ...prev,
        eggData: prev.eggData
          ? { ...prev.eggData, availableOrbs: [...prev.eggData.availableOrbs, ...newOrbs] }
          : prev.eggData,
      }));
    }
  };

  const addTestCrystals = () => {
    if (!save?.dragonData) return;
    updateSave((prev) => ({
      ...prev,
      dragonData: prev.dragonData
        ? {
            ...prev.dragonData,
            crystals: {
              fire: prev.dragonData.crystals.fire + 5,
              water: prev.dragonData.crystals.water + 5,
              earth: prev.dragonData.crystals.earth + 5,
              air: prev.dragonData.crystals.air + 2,
              metal: prev.dragonData.crystals.metal + 2,
            },
          }
        : prev.dragonData,
    }));
  };

  const reduceVitality = () => {
    if (!save?.dragonData) return;
    updateSave((prev) => ({
      ...prev,
      dragonData: prev.dragonData
        ? { ...prev.dragonData, vitality: Math.max(0.1, prev.dragonData.vitality - 0.3) }
        : prev.dragonData,
    }));
  };

  const finishExpeditionNow = () => {
    if (!save?.dragonData?.isOnExpedition) return;
    updateSave((prev) => ({
      ...prev,
      dragonData: prev.dragonData
        ? { ...prev.dragonData, expeditionEndTime: Date.now() - 1000 }
        : prev.dragonData,
    }));
  };

  const clearInjury = () => {
    if (!save?.dragonData?.isInjured) return;
    updateSave((prev) => ({
      ...prev,
      dragonData: prev.dragonData
        ? { ...prev.dragonData, isInjured: false, recoveryTime: null }
        : prev.dragonData,
    }));
  };

  const addTestMaterials = () => {
    if (!save?.dragonData) return;
    const existingMaterials = normalizeMaterialInventory(save.dragonData.materials);
    const newMaterials = addMaterials(existingMaterials, {
      living_ash: 2,
      ancient_stone: 2,
      shell_fragment: 1,
      memory_echo: 1,
    });
    updateSave((prev) => ({
      ...prev,
      dragonData: prev.dragonData
        ? { ...prev.dragonData, materials: newMaterials }
        : prev.dragonData,
    }));
  };

  const clearNest = () => {
    if (!save?.dragonData) return;
    const defaultNest = {
      comfort: 0,
      style: 'basic' as const,
      slots: { base: null, comfort: null, relic: null },
      appliedUpgrades: [],
      lastUpdatedAt: null,
    };
    updateSave((prev) => ({
      ...prev,
      dragonData: prev.dragonData
        ? { ...prev.dragonData, nestData: defaultNest }
        : prev.dragonData,
    }));
  };

  const nestData = save?.dragonData ? normalizeNestData(save.dragonData.nestData) : null;

  return (
    <div className="fixed bottom-16 right-2 z-50">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="
          bg-red-900/90 text-red-300 
          text-xs px-3 py-2 rounded-lg 
          border border-red-700 
          font-mono shadow-lg
          active:scale-95 transition-transform
        "
        aria-label={isOpen ? 'Fechar painel de debug' : 'Abrir painel de debug'}
      >
        {isOpen ? '✕ DEV' : '⚙️ DEV'}
      </button>

      {/* Panel */}
      {isOpen && (
        <div className="
          absolute bottom-12 right-0 
          w-72 max-h-[60vh] overflow-y-auto
          bg-gray-950/98 border border-red-800 
          rounded-xl shadow-xl
          p-3 text-xs font-mono text-gray-300
          scrollbar-hide
        ">
          {/* Warning Header */}
          <div className="text-red-400 font-bold mb-3 text-center border border-red-700 rounded-lg py-2 bg-red-950/50">
            ⚠️ DEV ONLY ⚠️
          </div>

          {/* Screen Info */}
          <div className="mb-3 p-2 bg-gray-900 rounded-lg">
            <span className="text-gray-500">Screen: </span>
            <span className="text-yellow-400">{currentScreen}</span>
          </div>

          {/* Save Info */}
          {save && (
            <div className="mb-3 p-2 bg-gray-900 rounded-lg space-y-1">
              <div className="flex gap-2">
                <span className={save.hasEgg ? 'text-green-400' : 'text-gray-600'}>
                  Egg: {String(save.hasEgg)}
                </span>
                <span className={save.hasDragon ? 'text-green-400' : 'text-gray-600'}>
                  Dragon: {String(save.hasDragon)}
                </span>
              </div>

              {save.eggData && (
                <div className="text-cyan-400">
                  Mat: {(save.eggData.maturationProgress * 100).toFixed(0)}%
                  | Orbs: {save.eggData.availableOrbs.length}/{save.eggData.orbsOnEgg.length}
                </div>
              )}

              {save.dragonData && (
                <>
                  <div className="text-purple-400 truncate">
                    {save.dragonData.dragonName}
                  </div>
                  <div>
                    Vit: {(save.dragonData.vitality * 100).toFixed(0)}%
                    | {ELEMENT_EMOJI.fire}{save.dragonData.crystals.fire}
                    {ELEMENT_EMOJI.water}{save.dragonData.crystals.water}
                    {ELEMENT_EMOJI.earth}{save.dragonData.crystals.earth}
                  </div>
                  {nestData && (
                    <div className="text-teal-400">
                      Nest: {nestData.comfort}% | {nestData.style}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-1.5">
            {save?.hasEgg && (
              <>
                <button 
                  onClick={() => addTestOrbs(3)} 
                  className="bg-blue-900 text-blue-300 px-2 py-2 rounded-lg hover:bg-blue-800 active:scale-95"
                >
                  + Orbs
                </button>
                <button
                  onClick={() => {
                    if (!save.eggData) return;
                    updateSave((prev) => ({
                      ...prev,
                      eggData: prev.eggData
                        ? { ...prev.eggData, maturationProgress: 1.0 }
                        : prev.eggData,
                    }));
                  }}
                  className="bg-yellow-900 text-yellow-300 px-2 py-2 rounded-lg hover:bg-yellow-800 active:scale-95"
                >
                  100% Mat
                </button>
              </>
            )}

            {save?.hasDragon && (
              <>
                <button 
                  onClick={addTestCrystals} 
                  className="bg-purple-900 text-purple-300 px-2 py-2 rounded-lg hover:bg-purple-800 active:scale-95"
                >
                  + Cristais
                </button>
                <button 
                  onClick={reduceVitality} 
                  className="bg-orange-900 text-orange-300 px-2 py-2 rounded-lg hover:bg-orange-800 active:scale-95"
                >
                  - Vitalidade
                </button>
                <button 
                  onClick={finishExpeditionNow} 
                  className="bg-green-900 text-green-300 px-2 py-2 rounded-lg hover:bg-green-800 active:scale-95"
                >
                  End Expedition
                </button>
                <button 
                  onClick={clearInjury} 
                  className="bg-pink-900 text-pink-300 px-2 py-2 rounded-lg hover:bg-pink-800 active:scale-95"
                >
                  Heal Injury
                </button>
                <button 
                  onClick={addTestMaterials} 
                  className="bg-teal-900 text-teal-300 px-2 py-2 rounded-lg hover:bg-teal-800 active:scale-95"
                >
                  + Materials
                </button>
                <button 
                  onClick={clearNest} 
                  className="bg-amber-900 text-amber-300 px-2 py-2 rounded-lg hover:bg-amber-800 active:scale-95"
                >
                  Reset Nest
                </button>
              </>
            )}
          </div>

          {/* Clear Save */}
          <button
            onClick={clearSave}
            className="
              w-full mt-3 py-2.5 
              bg-red-900 text-red-300 
              rounded-lg border border-red-700
              hover:bg-red-800 active:scale-95
            "
          >
            🗑️ LIMPAR SAVE
          </button>
        </div>
      )}
    </div>
  );
}
