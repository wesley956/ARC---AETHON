// ============================================================
// ARC: AETHON — NEST PANEL
// ============================================================

import { useState } from 'react';
import { DragonData } from '../types/game';
import { NEST_UPGRADES } from '../data/nestUpgrades';
import { MATERIAL_DEFINITIONS } from '../constants/gameConstants';
import { canApplyUpgrade, applyNestUpgrade } from '../systems/NestSystem';
import { getComfortDescription } from '../utils/nest';
import { useGame } from '../context/GameContext';
import FloatingNotification from './FloatingNotification';

export default function NestPanel({ dragon }: { dragon: DragonData }) {
  const { updateSave } = useGame();
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const nest = dragon.nestData;

  const handleApply = (upgradeId: string) => {
    const upgrade = NEST_UPGRADES.find(u => u.id === upgradeId);
    if (!upgrade) return;
    const result = applyNestUpgrade(dragon, upgrade);
    if (result.success && result.newDragonData) {
      updateSave(prev => ({ ...prev, dragonData: result.newDragonData! }));
      setNotification({ message: result.message, type: 'success' });
    } else {
      setNotification({ message: result.message, type: 'error' });
    }
  };

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl" style={{ background: 'rgba(18,18,26,0.5)', border: '1px solid rgba(42,42,58,0.5)' }}>
        <div className="flex items-center justify-between mb-3"><span className="text-lg">🏠</span><span className="text-sm text-[#e8e8ec]">Conforto: {nest.comfort}%</span></div>
        <p className="text-xs text-[#6a6a7a] mb-2">{getComfortDescription(nest.comfort)}</p>
        <div className="flex gap-2 text-xs text-[#6a6a7a]">
          {(['base', 'comfort', 'relic'] as const).map(slotType => {
            const slot = nest.slots[slotType];
            return (<div key={slotType} className="flex-1 text-center p-2 rounded-lg" style={{ background: slot ? 'rgba(167,139,250,0.1)' : 'rgba(26,26,36,0.5)', border: `1px solid ${slot ? 'rgba(167,139,250,0.3)' : 'rgba(42,42,58,0.3)'}` }}><p className="text-[10px] uppercase">{slotType === 'base' ? 'Base' : slotType === 'comfort' ? 'Conforto' : 'Relíquia'}</p><p className="text-sm mt-1">{slot ? '✅' : '➖'}</p></div>);
          })}
        </div>
      </div>
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-[#e8e8ec]">Melhorias Disponíveis</h3>
        {NEST_UPGRADES.map(upgrade => {
          const canResult = canApplyUpgrade(dragon, upgrade);
          const isApplied = nest.appliedUpgrades.includes(upgrade.id);
          const materialId = Object.keys(upgrade.cost)[0];
          const matDef = MATERIAL_DEFINITIONS[materialId];
          return (
            <div key={upgrade.id} className="p-3 rounded-xl" style={{ background: 'rgba(18,18,26,0.5)', border: `1px solid ${canResult.canApply ? 'rgba(167,139,250,0.3)' : 'rgba(42,42,58,0.3)'}` }}>
              <div className="flex items-center gap-2 mb-2"><span>{upgrade.emoji}</span><span className="text-sm font-medium text-[#e8e8ec]">{upgrade.name}</span></div>
              <p className="text-xs text-[#6a6a7a] mb-1">{upgrade.description}</p>
              <p className="text-xs text-[#6a6a7a] mb-2">{matDef?.emoji} {Object.values(upgrade.cost)[0]}× {matDef?.name} · +{upgrade.comfortBonus}% conforto</p>
              <button onClick={() => handleApply(upgrade.id)} disabled={!canResult.canApply} className="w-full py-2 text-sm font-semibold rounded-lg transition-all active:scale-[0.98]" style={{ background: isApplied ? 'rgba(34,197,94,0.2)' : canResult.canApply ? '#a78bfa' : 'rgba(42,42,58,0.5)', color: isApplied ? '#4ade80' : canResult.canApply ? 'white' : '#6a6a7a' }}>
                {isApplied ? '✅ Aplicado' : canResult.canApply ? 'Aplicar' : 'Materiais insuficientes'}
              </button>
            </div>
          );
        })}
      </div>
      {notification && <FloatingNotification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}
    </div>
  );
}
