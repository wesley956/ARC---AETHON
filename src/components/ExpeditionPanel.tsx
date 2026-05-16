// ============================================================
// ARC: AETHON — EXPEDITION PANEL
// ============================================================

import { useState, useEffect } from 'react';
import { DragonData } from '../types/game';
import { EXPEDITION_ZONES } from '../constants/gameConstants';
import { canStartExpedition, startExpedition, isExpeditionReady, getExpeditionTimeRemaining, collectExpeditionRewards, checkInjuryRecovery, getInjuryTimeRemaining, formatTimeRemaining } from '../systems/ExpeditionSystem';
import { useGame } from '../context/GameContext';
import FloatingNotification from './FloatingNotification';

export default function ExpeditionPanel({ dragon }: { dragon: DragonData }) {
  const { updateSave } = useGame();
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);

  const zone = EXPEDITION_ZONES['ruinas_de_ignareth'];
  if (!zone) return null;

  // Check injury recovery
  const checkedDragon = checkInjuryRecovery(dragon);
  if (checkedDragon.isInjured !== dragon.isInjured) updateSave(prev => ({ ...prev, dragonData: checkedDragon }));

  if (dragon.isOnExpedition && dragon.expeditionEndTime) {
    const remaining = getExpeditionTimeRemaining(dragon);
    if (remaining <= 0) {
      return (<div className="space-y-4"><div className="text-center p-6 rounded-xl" style={{ background: 'rgba(18,18,26,0.5)', border: '1px solid rgba(42,42,58,0.5)' }}><span className="text-4xl block mb-3">🏛️</span><p className="text-lg text-[#c4b5fd] mb-2">Expedição concluída!</p><button onClick={() => { const result = collectExpeditionRewards(dragon); if (result.newDragonData) updateSave(prev => ({ ...prev, dragonData: result.newDragonData })); setNotification({ message: result.message, type: result.success ? 'success' : 'error' }); }} className="py-3 px-6 bg-[#a78bfa] hover:bg-[#9171e8] text-white font-semibold rounded-xl transition-all active:scale-[0.98]">Coletar Recompensas</button></div>{notification && <FloatingNotification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}</div>);
    }
    const layer = dragon.expeditionLayerId ? zone.layers[dragon.expeditionLayerId as 'fronteira' | 'interior'] : null;
    return (<div className="text-center p-6 rounded-xl" style={{ background: 'rgba(18,18,26,0.5)', border: '1px solid rgba(42,42,58,0.5)' }}><span className="text-4xl block mb-3 animate-float">🗺️</span><p className="text-sm text-[#6a6a7a] mb-1">Em expedição: {layer?.name || 'Desconhecido'}</p><p className="text-2xl font-mono text-[#a78bfa]">{formatTimeRemaining(remaining)}</p></div>);
  }

  if (dragon.isInjured) {
    const recoveryRemaining = getInjuryTimeRemaining(dragon);
    if (recoveryRemaining > 0) return (<div className="text-center p-6 rounded-xl" style={{ background: 'rgba(18,18,26,0.5)', border: '1px solid rgba(239,68,68,0.3)' }}><span className="text-4xl block mb-3">🩹</span><p className="text-[#e8e8ec] mb-2">{dragon.dragonName} está machucado.</p><p className="text-sm text-[#6a6a7a]">Recuperação: {formatTimeRemaining(recoveryRemaining)}</p></div>);
  }

  return (
    <div className="space-y-3">
      <div className="p-4 rounded-xl" style={{ background: 'rgba(18,18,26,0.5)', border: '1px solid rgba(42,42,58,0.5)' }}>
        <div className="flex items-center gap-2 mb-2"><span className="text-xl">{zone.emoji}</span><h3 className="font-medium text-[#e8e8ec]">{zone.name}</h3></div>
        <p className="text-xs text-[#6a6a7a] mb-3">{zone.description}</p>
        {(['fronteira', 'interior'] as const).map(layerId => { const layer = zone.layers[layerId]; return (
          <div key={layerId} className="mb-3 last:mb-0 p-3 rounded-lg" style={{ background: 'rgba(26,26,36,0.5)', border: '1px solid rgba(42,42,58,0.3)' }}>
            <div className="flex items-center justify-between mb-2"><span className="text-sm font-medium text-[#e8e8ec]">{layer.name}</span><span className="text-xs text-[#6a6a7a]">{layer.injuryChance > 0 ? '⚠️ Perigoso' : '✅ Seguro'}</span></div>
            <p className="text-xs text-[#6a6a7a] mb-2">{layer.description}</p>
            <button onClick={() => { const result = startExpedition(dragon, 'ruinas_de_ignareth', layerId); if (result.newDragonData) updateSave(prev => ({ ...prev, dragonData: result.newDragonData })); setNotification({ message: result.message, type: result.success ? 'info' : 'error' }); }} className="w-full py-2.5 bg-[#a78bfa] hover:bg-[#9171e8] text-white text-sm font-semibold rounded-lg transition-all active:scale-[0.98]">Enviar Expedição</button>
          </div>
        ); })}
      </div>
      {notification && <FloatingNotification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}
    </div>
  );
}
