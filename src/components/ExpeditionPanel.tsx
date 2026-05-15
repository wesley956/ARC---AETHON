// ============================================================
// ARC: AETHON — EXPEDITION PANEL
// ============================================================

import { useState, useEffect } from 'react';
import { DragonData, ExpeditionZoneId, ExpeditionLayerId } from '../types/game';
import { EXPEDITION_ZONES } from '../constants/gameConstants';
import {
  canStartExpedition,
  startExpedition,
  isExpeditionReady,
  getExpeditionTimeRemaining,
  collectExpeditionRewards,
  getInjuryTimeRemaining,
  formatTimeRemaining,
  getLayerConfig,
} from '../systems/ExpeditionSystem';

interface ExpeditionPanelProps {
  dragon: DragonData;
  onUpdate: (newDragonData: DragonData) => void;
  onNotify: (message: string, type: 'success' | 'error' | 'info') => void;
}

export default function ExpeditionPanel({ dragon, onUpdate, onNotify }: ExpeditionPanelProps) {
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [injuryTime, setInjuryTime] = useState<string>('');

  const isOnExpedition = dragon.isOnExpedition ?? false;
  const isInjured = dragon.isInjured ?? false;
  const expeditionReady = isOnExpedition && isExpeditionReady(dragon);
  const canStart = canStartExpedition(dragon);

  // Update timers
  useEffect(() => {
    const interval = setInterval(() => {
      if (isOnExpedition) {
        const remaining = getExpeditionTimeRemaining(dragon);
        setTimeRemaining(formatTimeRemaining(remaining));
      }
      if (isInjured) {
        const remaining = getInjuryTimeRemaining(dragon);
        setInjuryTime(formatTimeRemaining(remaining));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [dragon, isOnExpedition, isInjured]);

  const handleStartExpedition = (zoneId: ExpeditionZoneId, layerId: ExpeditionLayerId) => {
    const result = startExpedition(dragon, zoneId, layerId);
    if (result.success && result.newDragonData) {
      onUpdate(result.newDragonData);
      onNotify(result.message, 'success');
    } else {
      onNotify(result.message, 'error');
    }
  };

  const handleCollect = () => {
    const result = collectExpeditionRewards(dragon);
    if (result.success && result.newDragonData) {
      onUpdate(result.newDragonData);
      onNotify(result.message, 'success');
    } else {
      onNotify(result.message, 'error');
    }
  };

  const zone = EXPEDITION_ZONES['ruinas_de_ignareth'];
  const currentLayerConfig = dragon.expeditionLayerId
    ? getLayerConfig(dragon.expeditionZoneId as ExpeditionZoneId, dragon.expeditionLayerId as ExpeditionLayerId)
    : null;

  // If on expedition, show expedition status
  if (isOnExpedition) {
    return (
      <div className="bg-[#12121a]/50 rounded-xl border border-blue-700/30 p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">{zone.emoji}</span>
          <span className="font-medium text-[#e8e8ec]">{zone.name}</span>
          <span className="text-xs text-blue-300 bg-blue-900/30 px-2 py-0.5 rounded">
            {currentLayerConfig?.name || 'Camada desconhecida'}
          </span>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-blue-300">
            {dragon.dragonName} está explorando...
          </p>
          <p className="text-xs text-[#6a6a7a] italic">
            "Ele está longe, entre cinzas antigas."
          </p>
        </div>

        {expeditionReady ? (
          <button
            onClick={handleCollect}
            className="w-full mt-4 py-3 bg-green-700 hover:bg-green-600 text-white font-semibold rounded-xl transition-colors"
          >
            🎁 Coletar Recompensas
          </button>
        ) : (
          <div className="mt-4 text-center">
            <span className="text-xs text-[#6a6a7a]">Retorna em</span>
            <p className="text-lg font-mono text-blue-300">{timeRemaining || '--:--:--'}</p>
          </div>
        )}
      </div>
    );
  }

  // If injured, show recovery
  if (isInjured) {
    return (
      <div className="bg-[#12121a]/50 rounded-xl border border-red-700/30 p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">🩹</span>
          <span className="font-medium text-red-300">Machucado</span>
        </div>
        <p className="text-sm text-[#6a6a7a]">
          {dragon.dragonName} precisa descansar antes de explorar novamente.
        </p>
        <div className="mt-3 text-center">
          <span className="text-xs text-[#6a6a7a]">Recuperação em</span>
          <p className="text-lg font-mono text-red-300">{injuryTime || '--:--:--'}</p>
        </div>
      </div>
    );
  }

  // Show expedition options
  return (
    <div className="space-y-4">
      <div className="bg-[#12121a]/50 rounded-xl border border-[#2a2a3a]/50 p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">{zone.emoji}</span>
          <h3 className="font-medium text-[#e8e8ec]">{zone.name}</h3>
        </div>
        <p className="text-sm text-[#6a6a7a] mb-4">{zone.description}</p>

        <div className="space-y-3">
          {/* Fronteira */}
          <div className="bg-[#1a1a24]/50 rounded-lg p-3 border border-[#2a2a3a]/30">
            <h4 className="text-sm font-medium text-[#e8e8ec] mb-1">
              🌅 {zone.layers.fronteira.name}
            </h4>
            <p className="text-xs text-[#6a6a7a] mb-2">{zone.layers.fronteira.description}</p>
            <div className="flex items-center gap-2 mb-2 text-xs text-[#6a6a7a]">
              <span>⏱️ 30min - 2h</span>
              <span>🛡️ Seguro</span>
            </div>
            <button
              onClick={() => handleStartExpedition('ruinas_de_ignareth', 'fronteira')}
              disabled={!canStart.canStart}
              className={`
                w-full py-2 rounded-lg text-sm font-medium transition-colors
                ${canStart.canStart
                  ? 'bg-[#a78bfa] hover:bg-[#9171e8] text-white'
                  : 'bg-[#2a2a3a] text-[#6a6a7a] cursor-not-allowed'
                }
              `}
            >
              Explorar Fronteira
            </button>
          </div>

          {/* Interior */}
          <div className="bg-[#1a1a24]/50 rounded-lg p-3 border border-[#2a2a3a]/30">
            <h4 className="text-sm font-medium text-[#e8e8ec] mb-1">
              🔥 {zone.layers.interior.name}
            </h4>
            <p className="text-xs text-[#6a6a7a] mb-2">{zone.layers.interior.description}</p>
            <div className="flex items-center gap-2 mb-2 text-xs text-[#6a6a7a]">
              <span>⏱️ 3h - 6h</span>
              <span>⚠️ 10% lesão</span>
            </div>
            <button
              onClick={() => handleStartExpedition('ruinas_de_ignareth', 'interior')}
              disabled={!canStart.canStart}
              className={`
                w-full py-2 rounded-lg text-sm font-medium transition-colors
                ${canStart.canStart
                  ? 'bg-orange-700 hover:bg-orange-600 text-white'
                  : 'bg-[#2a2a3a] text-[#6a6a7a] cursor-not-allowed'
                }
              `}
            >
              Explorar Interior
            </button>
          </div>
        </div>

        {!canStart.canStart && canStart.reason && (
          <p className="text-xs text-red-400/70 mt-3 text-center italic">{canStart.reason}</p>
        )}
      </div>
    </div>
  );
}
