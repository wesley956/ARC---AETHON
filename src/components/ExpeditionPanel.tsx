// ============================================================
// ARC: AETHON — EXPEDITION PANEL
// Mobile-optimized expedition management.
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
    const updateTimers = () => {
      if (isOnExpedition) {
        const remaining = getExpeditionTimeRemaining(dragon);
        setTimeRemaining(formatTimeRemaining(remaining));
      }
      if (isInjured) {
        const remaining = getInjuryTimeRemaining(dragon);
        setInjuryTime(formatTimeRemaining(remaining));
      }
    };

    updateTimers();
    const interval = setInterval(updateTimers, 1000);
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
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className="text-2xl">{zone.emoji}</span>
          <span className="font-medium text-[#e8e8ec]">{zone.name}</span>
          <span className="text-xs text-blue-300 bg-blue-900/30 px-2 py-1 rounded">
            {currentLayerConfig?.name || 'Explorando'}
          </span>
        </div>

        <div className="space-y-2 mb-4">
          <p className="text-base text-blue-300">
            {dragon.dragonName} está explorando...
          </p>
          <p className="text-sm text-[#6a6a7a] italic">
            "Ele está longe, entre cinzas antigas."
          </p>
        </div>

        {expeditionReady ? (
          <button
            onClick={handleCollect}
            className="
              w-full py-4 px-6
              bg-green-700 hover:bg-green-600 active:bg-green-500
              text-white font-semibold text-base
              rounded-xl transition-all
              active:scale-[0.98]
              animate-pulse-soft
            "
          >
            🎁 Coletar Recompensas
          </button>
        ) : (
          <div className="text-center py-4 bg-[#1a1a24]/50 rounded-xl">
            <span className="text-xs text-[#6a6a7a] block mb-1">Retorna em</span>
            <p className="text-2xl font-mono text-blue-300">{timeRemaining || '--:--:--'}</p>
          </div>
        )}
      </div>
    );
  }

  // If injured, show recovery
  if (isInjured) {
    return (
      <div className="bg-[#12121a]/50 rounded-xl border border-red-700/30 p-4">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">🩹</span>
          <span className="font-medium text-red-300">Machucado</span>
        </div>
        <p className="text-sm text-[#a0a0b0] mb-4">
          {dragon.dragonName} precisa descansar antes de explorar novamente.
        </p>
        <div className="text-center py-4 bg-[#1a1a24]/50 rounded-xl">
          <span className="text-xs text-[#6a6a7a] block mb-1">Recuperação em</span>
          <p className="text-2xl font-mono text-red-300">{injuryTime || '--:--:--'}</p>
        </div>
      </div>
    );
  }

  // Show expedition options
  return (
    <div className="space-y-4">
      {/* Zone Header */}
      <div className="bg-[#12121a]/50 rounded-xl border border-[#2a2a3a]/50 p-4">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-3xl">{zone.emoji}</span>
          <div>
            <h3 className="font-medium text-[#e8e8ec] text-lg">{zone.name}</h3>
            <p className="text-xs text-[#6a6a7a]">Zona de Exploração</p>
          </div>
        </div>
        <p className="text-sm text-[#a0a0b0] leading-relaxed">
          {zone.description}
        </p>
      </div>

      {/* Layer Options */}
      <div className="space-y-3">
        {/* Fronteira */}
        <div className="bg-[#12121a]/50 rounded-xl border border-[#2a2a3a]/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">🌅</span>
            <h4 className="font-medium text-[#e8e8ec]">{zone.layers.fronteira.name}</h4>
          </div>
          <p className="text-sm text-[#6a6a7a] mb-3">{zone.layers.fronteira.description}</p>
          <div className="flex items-center gap-3 mb-3 flex-wrap text-xs text-[#a0a0b0]">
            <span className="flex items-center gap-1">
              <span>⏱️</span> 30min - 2h
            </span>
            <span className="flex items-center gap-1 text-green-400">
              <span>🛡️</span> Seguro
            </span>
          </div>
          <button
            onClick={() => handleStartExpedition('ruinas_de_ignareth', 'fronteira')}
            disabled={!canStart.canStart}
            className={`
              w-full py-3.5 px-4 rounded-xl text-base font-medium transition-all
              active:scale-[0.98]
              ${canStart.canStart
                ? 'bg-[#a78bfa] hover:bg-[#9171e8] active:bg-[#8161d8] text-white'
                : 'bg-[#2a2a3a] text-[#6a6a7a] cursor-not-allowed'
              }
            `}
          >
            Explorar Fronteira
          </button>
        </div>

        {/* Interior */}
        <div className="bg-[#12121a]/50 rounded-xl border border-orange-700/30 p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">🔥</span>
            <h4 className="font-medium text-[#e8e8ec]">{zone.layers.interior.name}</h4>
          </div>
          <p className="text-sm text-[#6a6a7a] mb-3">{zone.layers.interior.description}</p>
          <div className="flex items-center gap-3 mb-3 flex-wrap text-xs text-[#a0a0b0]">
            <span className="flex items-center gap-1">
              <span>⏱️</span> 3h - 6h
            </span>
            <span className="flex items-center gap-1 text-orange-400">
              <span>⚠️</span> 10% lesão
            </span>
          </div>
          <button
            onClick={() => handleStartExpedition('ruinas_de_ignareth', 'interior')}
            disabled={!canStart.canStart}
            className={`
              w-full py-3.5 px-4 rounded-xl text-base font-medium transition-all
              active:scale-[0.98]
              ${canStart.canStart
                ? 'bg-orange-700 hover:bg-orange-600 active:bg-orange-500 text-white'
                : 'bg-[#2a2a3a] text-[#6a6a7a] cursor-not-allowed'
              }
            `}
          >
            Explorar Interior
          </button>
        </div>
      </div>

      {/* Status message */}
      {!canStart.canStart && canStart.reason && (
        <p className="text-sm text-red-400/70 text-center px-4">
          {canStart.reason}
        </p>
      )}
    </div>
  );
}
