// ============================================================
// ARC: AETHON — NEST PANEL
// Prompt 11: Emotional nest as dragon's home.
// ============================================================

import { useGame } from '../context/GameContext';
import { normalizeNestData, getComfortDescription } from '../utils/nest';
import { normalizeMaterialInventory } from '../utils/materials';
import { NEST_UPGRADES, NestUpgradeDefinition } from '../data/nestUpgrades';
import { MATERIAL_DEFINITIONS } from '../constants/gameConstants';
import { applyNestUpgrade, canApplyUpgrade } from '../systems/NestSystem';
import { useState } from 'react';
import FloatingNotification from './FloatingNotification';

// Style colors
const STYLE_VISUALS = {
  basic: { emoji: '🏠', name: 'Simples', color: '#6a6a7a' },
  warm: { emoji: '🔥', name: 'Aquecido', color: '#ff6b35' },
  stone: { emoji: '🪨', name: 'Rochoso', color: '#a78bfa' },
  memory: { emoji: '✨', name: 'Memória', color: '#fbbf24' },
};

export default function NestPanel() {
  const { save, updateSave } = useGame();
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  const dragon = save?.dragonData;
  if (!dragon) return null;

  const nest = normalizeNestData(dragon.nestData);
  const materials = normalizeMaterialInventory(dragon.materials);
  const styleVisual = STYLE_VISUALS[nest.style];

  const handleApplyUpgrade = (upgrade: NestUpgradeDefinition) => {
    const result = applyNestUpgrade(dragon, upgrade);
    
    if (result.success && result.newDragonData) {
      updateSave((prev) => ({
        ...prev,
        dragonData: result.newDragonData!,
      }));
      setNotification({ message: result.message, type: 'success' });
    } else {
      setNotification({ message: result.message, type: 'error' });
    }
  };

  // Group upgrades by slot
  const upgradesBySlot = {
    base: NEST_UPGRADES.filter(u => u.slotType === 'base'),
    comfort: NEST_UPGRADES.filter(u => u.slotType === 'comfort'),
    relic: NEST_UPGRADES.filter(u => u.slotType === 'relic'),
  };

  return (
    <div className="space-y-4">
      {notification && (
        <FloatingNotification 
          message={notification.message} 
          type={notification.type} 
          onClose={() => setNotification(null)}
        />
      )}

      {/* Nest overview card */}
      <div 
        className="relative overflow-hidden rounded-xl"
        style={{
          background: `linear-gradient(135deg, rgba(18, 18, 26, 0.8) 0%, ${styleVisual.color}10 100%)`,
          border: `1px solid ${styleVisual.color}30`,
        }}
      >
        {/* Ambient glow */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            background: `radial-gradient(ellipse at bottom, ${styleVisual.color}40 0%, transparent 70%)`,
          }}
        />

        <div className="relative p-5 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div 
                className="w-14 h-14 rounded-xl flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${styleVisual.color}30 0%, ${styleVisual.color}10 100%)`,
                  border: `1px solid ${styleVisual.color}40`,
                  boxShadow: `0 0 20px ${styleVisual.color}20`,
                }}
              >
                <span className="text-3xl">{styleVisual.emoji}</span>
              </div>
              <div>
                <h3 className="font-semibold text-[#e8e8ec]">Ninho de {dragon.dragonName}</h3>
                <p className="text-xs" style={{ color: styleVisual.color }}>
                  Estilo: {styleVisual.name}
                </p>
              </div>
            </div>
          </div>

          {/* Comfort bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#a0a0b8]">Conforto</span>
              <span className="font-medium" style={{ color: styleVisual.color }}>
                {nest.comfort}%
              </span>
            </div>
            <div className="w-full h-3 bg-[#1a1a24] rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-700"
                style={{ 
                  width: `${nest.comfort}%`,
                  background: `linear-gradient(90deg, ${styleVisual.color} 0%, ${styleVisual.color}aa 100%)`,
                  boxShadow: nest.comfort > 0 ? `0 0 10px ${styleVisual.color}40` : 'none',
                }}
              />
            </div>
            <p className="text-xs text-[#6a6a7a] italic">
              {getComfortDescription(nest.comfort)}
            </p>
          </div>

          {/* Active slots preview */}
          {(nest.slots.base || nest.slots.comfort || nest.slots.relic) && (
            <div className="flex flex-wrap gap-2 pt-2 border-t border-[#2a2a3a]/30">
              {nest.slots.base && (
                <span className="text-xs px-2 py-1 rounded-full bg-[#1a1a24] text-[#a0a0b8]">
                  🪨 {nest.slots.base.name}
                </span>
              )}
              {nest.slots.comfort && (
                <span className="text-xs px-2 py-1 rounded-full bg-[#1a1a24] text-[#a0a0b8]">
                  🔥 {nest.slots.comfort.name}
                </span>
              )}
              {nest.slots.relic && (
                <span className="text-xs px-2 py-1 rounded-full bg-[#1a1a24] text-[#a0a0b8]">
                  ✨ {nest.slots.relic.name}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Available upgrades */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-[#a0a0b8] px-1">
          Melhorias Disponíveis
        </h4>

        {Object.entries(upgradesBySlot).map(([slotType, upgrades]) => (
          <div key={slotType} className="space-y-2">
            {upgrades.map((upgrade) => {
              const canApply = canApplyUpgrade(dragon, upgrade);
              const isApplied = nest.slots[upgrade.slotType]?.id === upgrade.id;
              const materialId = Object.keys(upgrade.cost)[0];
              const materialAmount = Object.values(upgrade.cost)[0] || 1;
              const materialDef = MATERIAL_DEFINITIONS[materialId as keyof typeof MATERIAL_DEFINITIONS];
              const hasEnough = (materials[materialId as keyof typeof materials] || 0) >= materialAmount;

              return (
                <div 
                  key={upgrade.id}
                  className="rounded-xl overflow-hidden"
                  style={{
                    background: isApplied 
                      ? `linear-gradient(135deg, ${STYLE_VISUALS[upgrade.style].color}15 0%, rgba(18, 18, 26, 0.6) 100%)`
                      : 'linear-gradient(135deg, rgba(18, 18, 26, 0.6) 0%, rgba(18, 18, 26, 0.4) 100%)',
                    border: `1px solid ${isApplied ? STYLE_VISUALS[upgrade.style].color + '40' : 'rgba(42, 42, 58, 0.5)'}`,
                  }}
                >
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{upgrade.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h5 className="font-medium text-[#e8e8ec]">{upgrade.name}</h5>
                          {isApplied && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#4ade80]/20 text-[#4ade80]">
                              Ativo
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#6a6a7a] mt-1">{upgrade.description}</p>
                        
                        {/* Cost and effect */}
                        <div className="flex items-center gap-3 mt-2 text-xs">
                          <span style={{ color: hasEnough ? '#4ade80' : '#f87171' }}>
                            {materialDef?.emoji} {materialAmount}× {materialDef?.name}
                          </span>
                          <span className="text-[#a78bfa]">
                            +{upgrade.comfortBonus}% conforto
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Apply button */}
                    {!isApplied && (
                      <button
                        onClick={() => handleApplyUpgrade(upgrade)}
                        disabled={!canApply.canApply}
                        className="w-full mt-3 py-2.5 rounded-xl text-sm font-medium transition-all active:scale-[0.98]"
                        style={{
                          background: canApply.canApply 
                            ? `linear-gradient(135deg, ${STYLE_VISUALS[upgrade.style].color} 0%, ${STYLE_VISUALS[upgrade.style].color}bb 100%)`
                            : 'rgba(42, 42, 58, 0.5)',
                          color: canApply.canApply ? 'white' : '#6a6a7a',
                          cursor: canApply.canApply ? 'pointer' : 'not-allowed',
                        }}
                      >
                        {canApply.canApply ? 'Aplicar ao Ninho' : canApply.reason || 'Indisponível'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Future hint */}
      <div 
        className="rounded-xl p-4 text-center"
        style={{
          background: 'rgba(18, 18, 26, 0.4)',
          border: '1px dashed rgba(42, 42, 58, 0.5)',
        }}
      >
        <p className="text-xs text-[#4a4a5a] italic">
          O ninho influenciará o futuro de {dragon.dragonName}...
        </p>
      </div>
    </div>
  );
}
