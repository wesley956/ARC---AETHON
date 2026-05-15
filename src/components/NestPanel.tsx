// ============================================================
// ARC: AETHON — NEST PANEL
// Shows nest status, slots, and available upgrades.
// ============================================================

import { useState } from 'react';
import { DragonData, NestSlotType } from '../types/game';
import { normalizeNestData, getComfortDescription, getStyleDescription } from '../utils/nest';
import { normalizeMaterialInventory } from '../utils/materials';
import { NEST_UPGRADES, NestUpgradeDefinition } from '../data/nestUpgrades';
import { MATERIAL_DEFINITIONS } from '../constants/gameConstants';
import { canApplyUpgrade, applyNestUpgrade } from '../systems/NestSystem';

interface NestPanelProps {
  dragon: DragonData;
  onUpdate: (newDragonData: DragonData) => void;
  onNotify: (message: string, type: 'success' | 'error' | 'info') => void;
}

export default function NestPanel({ dragon, onUpdate, onNotify }: NestPanelProps) {
  const [confirmUpgrade, setConfirmUpgrade] = useState<string | null>(null);

  // Normalize nest data safely
  const nestData = normalizeNestData(dragon.nestData);
  const materials = normalizeMaterialInventory(dragon.materials);
  const comfortPercent = Math.round(nestData.comfort);
  const comfortDescription = getComfortDescription(nestData.comfort);
  const styleDescription = getStyleDescription(nestData.style);

  // Handle upgrade application
  const handleApplyUpgrade = (upgrade: NestUpgradeDefinition) => {
    if (confirmUpgrade !== upgrade.id) {
      // First click: show confirmation
      setConfirmUpgrade(upgrade.id);
      return;
    }

    // Second click: apply
    setConfirmUpgrade(null);
    const result = applyNestUpgrade(dragon, upgrade);

    if (result.success && result.newDragonData) {
      onUpdate(result.newDragonData);
      onNotify(result.message, 'success');
    } else {
      onNotify(result.message, 'error');
    }
  };

  const slotConfig: { type: NestSlotType; label: string; emoji: string }[] = [
    { type: 'base', label: 'Base', emoji: '🪨' },
    { type: 'comfort', label: 'Conforto', emoji: '🔥' },
    { type: 'relic', label: 'Relíquia', emoji: '✨' },
  ];

  return (
    <div className="space-y-4">
      {/* Nest Header */}
      <div className="bg-[#12121a]/50 rounded-xl border border-[#2a2a3a]/50 p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">🏠</span>
          <h3 className="font-medium text-[#e8e8ec]">Ninho</h3>
        </div>

        <p className="text-sm text-[#a0a0b0] mb-4">
          {comfortDescription}
        </p>

        {/* Comfort Bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#6a6a7a]">Conforto</span>
            <span className="text-xs font-medium text-[#a78bfa]">{comfortPercent}%</span>
          </div>
          <div className="w-full h-2 bg-[#1a1a24] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{
                width: `${comfortPercent}%`,
                background: nestData.comfort > 0
                  ? 'linear-gradient(to right, #a78bfa, #c4b5fd)'
                  : '#2a2a3a',
              }}
            />
          </div>
        </div>

        {/* Style indicator */}
        {nestData.style !== 'basic' && (
          <p className="text-xs text-[#6a6a7a] mt-2">{styleDescription}</p>
        )}
      </div>

      {/* Slots */}
      <div className="space-y-3">
        {slotConfig.map(({ type, label, emoji }) => {
          const slot = nestData.slots[type];
          const upgradesForSlot = NEST_UPGRADES.filter(u => u.slotType === type);

          return (
            <div
              key={type}
              className="bg-[#12121a]/50 rounded-xl border border-[#2a2a3a]/50 p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{emoji}</span>
                <h4 className="font-medium text-[#e8e8ec]">{label}</h4>
              </div>

              {/* Current slot content */}
              {slot ? (
                <div className="bg-[#1a1a24]/50 rounded-lg p-3 mb-3 border border-[#2a2a3a]/30">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-[#c4b5fd]">{slot.name}</span>
                    <span className="text-xs px-1.5 py-0.5 rounded bg-[#a78bfa]/20 text-[#a78bfa]">
                      +{slot.comfortBonus}
                    </span>
                  </div>
                  <p className="text-xs text-[#a0a0b0] italic">{slot.description}</p>
                </div>
              ) : (
                <p className="text-xs text-[#6a6a7a] italic mb-3">
                  Slot vazio — aplique um material para melhorar.
                </p>
              )}

              {/* Available upgrades for this slot */}
              {upgradesForSlot.map((upgrade) => {
                const checkResult = canApplyUpgrade(dragon, upgrade);
                const isAlreadyApplied = slot?.id === upgrade.id;
                const isConfirming = confirmUpgrade === upgrade.id;

                // Get cost info
                const costEntries = Object.entries(upgrade.cost);

                return (
                  <div
                    key={upgrade.id}
                    className={`
                      rounded-lg p-3 border transition-all
                      ${isAlreadyApplied
                        ? 'bg-[#a78bfa]/5 border-[#a78bfa]/30'
                        : 'bg-[#1a1a24]/30 border-[#2a2a3a]/30'
                      }
                    `}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span>{upgrade.emoji}</span>
                          <span className="text-sm font-medium text-[#e8e8ec]">{upgrade.name}</span>
                        </div>
                        <p className="text-xs text-[#a0a0b0] mb-2">{upgrade.description}</p>

                        {/* Cost */}
                        <div className="flex items-center gap-2 flex-wrap">
                          {costEntries.map(([matId, amount]) => {
                            const def = MATERIAL_DEFINITIONS[matId as keyof typeof MATERIAL_DEFINITIONS];
                            const available = materials[matId as keyof typeof materials] || 0;
                            const hasEnough = available >= (amount || 0);

                            return (
                              <div key={matId} className="flex items-center gap-1">
                                <span className="text-xs">{def?.emoji || '?'}</span>
                                <span className={`text-xs ${hasEnough ? 'text-[#e8e8ec]' : 'text-red-400'}`}>
                                  {def?.name}: {available}/{amount}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Apply button */}
                      <div className="flex-shrink-0">
                        {isAlreadyApplied ? (
                          <span className="text-xs px-2 py-1 rounded bg-[#a78bfa]/10 text-[#a78bfa]">
                            ✓ Aplicado
                          </span>
                        ) : (
                          <button
                            onClick={() => handleApplyUpgrade(upgrade)}
                            disabled={!checkResult.canApply}
                            className={`
                              text-xs px-3 py-1.5 rounded-lg transition-all font-medium
                              ${!checkResult.canApply
                                ? 'bg-[#2a2a3a] text-[#6a6a7a] cursor-not-allowed'
                                : isConfirming
                                  ? 'bg-green-700 hover:bg-green-600 text-white'
                                  : 'bg-[#a78bfa] hover:bg-[#9171e8] text-white'
                              }
                            `}
                          >
                            {isConfirming ? 'Confirmar' : 'Aplicar'}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Show reason if can't apply */}
                    {!checkResult.canApply && !isAlreadyApplied && checkResult.reason && (
                      <p className="text-xs text-red-400/70 mt-2 italic">
                        {checkResult.reason}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Materials inventory (compact in nest context) */}
      <div className="bg-[#12121a]/50 rounded-xl border border-[#2a2a3a]/50 p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">🎒</span>
          <h3 className="font-medium text-[#e8e8ec]">Materiais Disponíveis</h3>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {(Object.entries(materials) as [string, number][]).map(([matId, qty]) => {
            const def = MATERIAL_DEFINITIONS[matId as keyof typeof MATERIAL_DEFINITIONS];
            if (!def) return null;

            const rarityColors: Record<string, string> = {
              common: 'border-[#6a6a7a]/30',
              uncommon: 'border-green-700/30',
              rare: 'border-purple-700/30',
              legendary: 'border-yellow-700/30',
            };

            return (
              <div
                key={matId}
                className={`
                  flex items-center gap-2 p-2 rounded-lg bg-[#1a1a24]/50
                  border ${rarityColors[def.rarity] || 'border-[#6a6a7a]/30'}
                  ${qty === 0 ? 'opacity-40' : ''}
                `}
              >
                <span className="text-xl">{def.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[#e8e8ec] truncate">{def.name}</p>
                  <p className="text-sm font-bold text-[#a78bfa]">x{qty}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Future profession hint */}
      <div className="bg-[#12121a]/30 rounded-xl border border-[#2a2a3a]/30 p-4">
        <p className="text-xs text-[#6a6a7a] text-center italic">
          Com o tempo, o ninho poderá influenciar o chamado do dragão.
        </p>
      </div>
    </div>
  );
}
