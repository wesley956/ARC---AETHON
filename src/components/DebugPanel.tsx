// ============================================================
// ARC: AETHON — DEBUG PANEL
// ⚠️ DEV ONLY — Must NEVER be shown in production.
// ⚠️ All buttons here are for development testing only.
// ⚠️ No public reset or narrative-breaking actions allowed.
// ============================================================

import { useState } from 'react';
import { useGame } from '../context/GameContext';
import { ELEMENT_EMOJI, MVP_ORB_ELEMENTS, ORB_TRAY_MAX } from '../constants/gameConstants';
import { MvpOrbElement, Orb } from '../types/game';
import { normalizeMaterialInventory, addMaterials } from '../utils/materials';

export default function DebugPanel() {
  const { save, clearSave, updateSave, currentScreen, navigateTo } = useGame();
  const [isOpen, setIsOpen] = useState(false);

  // Only show in development - check for Vite dev mode
  const isDev = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  
  if (!isDev) {
    return null;
  }

  // Helper to add orbs for testing
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
          ? {
              ...prev.eggData,
              availableOrbs: [...prev.eggData.availableOrbs, ...newOrbs],
            }
          : prev.eggData,
      }));
    }
  };

  // Helper to add crystals for testing
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

  // Helper to reduce vitality for testing feeding
  const reduceVitality = () => {
    if (!save?.dragonData) return;
    
    updateSave((prev) => ({
      ...prev,
      dragonData: prev.dragonData
        ? {
            ...prev.dragonData,
            vitality: Math.max(0.1, prev.dragonData.vitality - 0.3),
          }
        : prev.dragonData,
    }));
  };

  // Helper to finish expedition instantly (DEV ONLY)
  const finishExpeditionNow = () => {
    if (!save?.dragonData?.isOnExpedition) return;
    
    updateSave((prev) => ({
      ...prev,
      dragonData: prev.dragonData
        ? {
            ...prev.dragonData,
            expeditionEndTime: Date.now() - 1000, // Set to past
          }
        : prev.dragonData,
    }));
  };

  // Helper to clear injury (DEV ONLY)
  const clearInjury = () => {
    if (!save?.dragonData?.isInjured) return;
    
    updateSave((prev) => ({
      ...prev,
      dragonData: prev.dragonData
        ? {
            ...prev.dragonData,
            isInjured: false,
            recoveryTime: null,
          }
        : prev.dragonData,
    }));
  };

  // Helper to add test materials (DEV ONLY)
  const addTestMaterials = () => {
    if (!save?.dragonData) return;
    
    // Use normalization to handle any old save format
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
        ? {
            ...prev.dragonData,
            materials: newMaterials,
          }
        : prev.dragonData,
    }));
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto">
      {/* Toggle Button - clearly marked as DEV */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute bottom-2 right-2 bg-red-900/80 text-red-300 text-xs px-2 py-1 rounded border border-red-700 font-mono"
      >
        {isOpen ? '✕ DEV' : '⚙ DEV'}
      </button>

      {/* Panel */}
      {isOpen && (
        <div className="bg-gray-950/95 border-t border-red-800 p-3 text-xs font-mono text-gray-300 max-h-[50vh] overflow-y-auto">
          {/* Clear warning header */}
          <div className="text-red-400 font-bold mb-2 text-center border border-red-700 rounded py-1 bg-red-950/50">
            ⚠️ DEV ONLY — NÃO É RECURSO DO JOGO ⚠️
          </div>

          {/* Current Screen */}
          <div className="mb-2">
            <span className="text-gray-500">Screen:</span>{' '}
            <span className="text-yellow-400">{currentScreen}</span>
          </div>

          {/* Save Info */}
          {save && (
            <div className="mb-2 space-y-1">
              <div>
                <span className="text-gray-500">Account:</span>{' '}
                <span className="text-blue-400">{save.accountId.slice(0, 20)}...</span>
              </div>
              <div>
                <span className="text-gray-500">lastDayKey:</span>{' '}
                <span className="text-cyan-400">{save.lastDayKey}</span>
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
                  <div>
                    {ELEMENT_EMOJI.void} Void: {save.eggData.voidEnergy.toFixed(2)}
                  </div>
                  <div>Orbs (tray): {save.eggData.availableOrbs.length}</div>
                  <div>Orbs (egg): {save.eggData.orbsOnEgg.length}</div>
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
                  <div>
                    Expedition: {save.dragonData.isOnExpedition ? '🗺️ Em curso' : '—'}
                  </div>
                  <div>
                    Injured: {save.dragonData.isInjured ? '🩹 Sim' : '—'}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* DEV Actions - all clearly marked */}
          <div className="border border-red-800 rounded p-2 mt-2 bg-red-950/30">
            <div className="text-red-500 text-center mb-2 text-[10px]">
              ⚠️ AÇÕES DE DESENVOLVIMENTO ⚠️
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={clearSave}
                className="bg-red-900 text-red-200 px-2 py-1 rounded text-xs border border-red-700 hover:bg-red-800"
              >
                🗑 Limpar Save (DEV)
              </button>

              {save?.hasEgg && save.eggData && (
                <>
                  <button
                    onClick={() => addTestOrbs(3)}
                    className="bg-green-900 text-green-200 px-2 py-1 rounded text-xs border border-green-700 hover:bg-green-800"
                  >
                    +3 Orbs (DEV)
                  </button>

                  <button
                    onClick={() => {
                      updateSave((prev) => ({
                        ...prev,
                        eggData: prev.eggData
                          ? { ...prev.eggData, maturationProgress: 1.0 }
                          : prev.eggData,
                      }));
                      navigateTo('HatchScene');
                    }}
                    className="bg-yellow-900 text-yellow-200 px-2 py-1 rounded text-xs border border-yellow-700 hover:bg-yellow-800"
                  >
                    🥚→100% (DEV)
                  </button>

                  <button
                    onClick={() => {
                      updateSave((prev) => ({
                        ...prev,
                        eggData: prev.eggData
                          ? {
                              ...prev.eggData,
                              maturationProgress: Math.min(1, prev.eggData.maturationProgress + 0.1),
                            }
                          : prev.eggData,
                      }));
                    }}
                    className="bg-blue-900 text-blue-200 px-2 py-1 rounded text-xs border border-blue-700 hover:bg-blue-800"
                  >
                    +10% Mat (DEV)
                  </button>
                </>
              )}

              {save?.hasDragon && save.dragonData && (
                <>
                  <button
                    onClick={addTestCrystals}
                    className="bg-purple-900 text-purple-200 px-2 py-1 rounded text-xs border border-purple-700 hover:bg-purple-800"
                  >
                    💎 +5 Cristais (DEV)
                  </button>

                  <button
                    onClick={reduceVitality}
                    className="bg-orange-900 text-orange-200 px-2 py-1 rounded text-xs border border-orange-700 hover:bg-orange-800"
                  >
                    ❤️ -30% Vitalidade (DEV)
                  </button>

                  <button
                    onClick={addTestMaterials}
                    className="bg-teal-900 text-teal-200 px-2 py-1 rounded text-xs border border-teal-700 hover:bg-teal-800"
                  >
                    🎒 +Materiais (DEV)
                  </button>

                  {save.dragonData.isOnExpedition && (
                    <button
                      onClick={finishExpeditionNow}
                      className="bg-cyan-900 text-cyan-200 px-2 py-1 rounded text-xs border border-cyan-700 hover:bg-cyan-800"
                    >
                      ⏩ Finalizar Expedição (DEV)
                    </button>
                  )}

                  {save.dragonData.isInjured && (
                    <button
                      onClick={clearInjury}
                      className="bg-pink-900 text-pink-200 px-2 py-1 rounded text-xs border border-pink-700 hover:bg-pink-800"
                    >
                      🩹 Curar Lesão (DEV)
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
