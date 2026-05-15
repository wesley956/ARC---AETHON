// ============================================================
// ARC: AETHON — DEBUG PANEL
// ⚠️ DEV ONLY — Must NEVER be shown in production.
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
  
  // Also show if explicitly set (for testing in deployed environments)
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

  // DEV ONLY: Clear nest data
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
    <div className="fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute bottom-2 right-2 bg-red-900/80 text-red-300 text-xs px-2 py-1 rounded border border-red-700 font-mono"
      >
        {isOpen ? '✕ DEV' : '⚙ DEV'}
      </button>

      {isOpen && (
        <div className="bg-gray-950/95 border-t border-red-800 p-3 text-xs font-mono text-gray-300 max-h-[50vh] overflow-y-auto">
          <div className="text-red-400 font-bold mb-2 text-center border border-red-700 rounded py-1 bg-red-950/50">
            ⚠️ DEV ONLY — NÃO É RECURSO DO JOGO ⚠️
          </div>

          <div className="mb-2">
            <span className="text-gray-500">Screen:</span>{' '}
            <span className="text-yellow-400">{currentScreen}</span>
          </div>

          {save && (
            <div className="mb-2 space-y-1">
              <div>
                <span className="text-gray-500">Account:</span>{' '}
                <span className="text-blue-400">{save.accountId.slice(0, 20)}...</span>
              </div>
              <div>
                <span className="text-gray-500">hasEgg:</span>{' '}
                <span className={save.hasEgg ? 'text-green-400' : 'text-gray-600'}>{String(save.hasEgg)}</span>
                {' | '}
                <span className="text-gray-500">hasDragon:</span>{' '}
                <span className={save.hasDragon ? 'text-green-400' : 'text-gray-600'}>{String(save.hasDragon)}</span>
              </div>

              {save.eggData && (
                <div className="bg-gray-900 p-2 rounded mt-1">
                  <div className="text-purple-400 mb-1">Egg Data:</div>
                  <div>Maturation: {(save.eggData.maturationProgress * 100).toFixed(1)}%</div>
                  <div>
                    {ELEMENT_EMOJI.fire} {save.eggData.fireEnergy.toFixed(2)} |{' '}
                    {ELEMENT_EMOJI.water} {save.eggData.waterEnergy.toFixed(2)} |{' '}
                    {ELEMENT_EMOJI.earth} {save.eggData.earthEnergy.toFixed(2)}
                  </div>
                  <div>Orbs (tray): {save.eggData.availableOrbs.length}</div>
                </div>
              )}

              {save.dragonData && (
                <div className="bg-gray-900 p-2 rounded mt-1">
                  <div className="text-purple-400 mb-1">Dragon Data:</div>
                  <div>Name: {save.dragonData.dragonName}</div>
                  <div>Type: {save.dragonData.dragonType}</div>
                  <div>Vitality: {(save.dragonData.vitality * 100).toFixed(1)}%</div>
                  <div>
                    Crystals: {ELEMENT_EMOJI.fire}{save.dragonData.crystals.fire} |{' '}
                    {ELEMENT_EMOJI.water}{save.dragonData.crystals.water} |{' '}
                    {ELEMENT_EMOJI.earth}{save.dragonData.crystals.earth}
                  </div>
                  <div>Diary entries: {(save.dragonData.diaryEntries ?? []).length}</div>
                  <div>Expedition: {save.dragonData.isOnExpedition ? '🗺️ Em curso' : '—'}</div>
                  <div>Injured: {save.dragonData.isInjured ? '🩹 Sim' : '—'}</div>
                  {nestData && (
                    <div className="mt-1 border-t border-gray-700 pt-1">
                      <div className="text-cyan-400">Nest:</div>
                      <div>Comfort: {nestData.comfort}%</div>
                      <div>Style: {nestData.style}</div>
                      <div>Base: {nestData.slots.base?.name || '—'}</div>
                      <div>Comfort Slot: {nestData.slots.comfort?.name || '—'}</div>
                      <div>Relic: {nestData.slots.relic?.name || '—'}</div>
                      <div>Upgrades: {nestData.appliedUpgrades.join(', ') || '—'}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-1 mt-2">
            {save?.hasEgg && (
              <>
                <button onClick={() => addTestOrbs(3)} className="bg-blue-900 text-blue-300 px-2 py-1.5 rounded text-xs hover:bg-blue-800">
                  + 3 Orbs
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
                  className="bg-yellow-900 text-yellow-300 px-2 py-1.5 rounded text-xs hover:bg-yellow-800"
                >
                  Max Maturation
                </button>
              </>
            )}

            {save?.hasDragon && (
              <>
                <button onClick={addTestCrystals} className="bg-purple-900 text-purple-300 px-2 py-1.5 rounded text-xs hover:bg-purple-800">
                  + Cristais
                </button>
                <button onClick={reduceVitality} className="bg-orange-900 text-orange-300 px-2 py-1.5 rounded text-xs hover:bg-orange-800">
                  - Vitalidade
                </button>
                <button onClick={finishExpeditionNow} className="bg-green-900 text-green-300 px-2 py-1.5 rounded text-xs hover:bg-green-800">
                  Finish Expedition
                </button>
                <button onClick={clearInjury} className="bg-pink-900 text-pink-300 px-2 py-1.5 rounded text-xs hover:bg-pink-800">
                  Clear Injury
                </button>
                <button onClick={addTestMaterials} className="bg-teal-900 text-teal-300 px-2 py-1.5 rounded text-xs hover:bg-teal-800">
                  + Materiais
                </button>
                <button onClick={clearNest} className="bg-amber-900 text-amber-300 px-2 py-1.5 rounded text-xs hover:bg-amber-800">
                  Clear Ninho
                </button>
              </>
            )}
          </div>

          <button
            onClick={clearSave}
            className="w-full mt-2 bg-red-900 text-red-300 px-2 py-1.5 rounded text-xs hover:bg-red-800 border border-red-700"
          >
            🗑️ LIMPAR SAVE (DEV ONLY)
          </button>
        </div>
      )}
    </div>
  );
}
