// ============================================================
// ARC: AETHON — EXPEDITION PANEL
// Shows expedition options, status, and rewards.
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { DragonData, ExpeditionLayerId } from '../types/game';
import { EXPEDITION_ZONES, ExpeditionLayerConfig } from '../constants/gameConstants';
import {
  canStartExpedition,
  startExpedition,
  isExpeditionReady,
  collectExpedition,
  getExpeditionTimeRemaining,
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
  const [selectedLayer, setSelectedLayer] = useState<ExpeditionLayerId | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [injuryTimeRemaining, setInjuryTimeRemaining] = useState<string>('');

  // Safe fallbacks for old saves
  const isOnExpedition = dragon.isOnExpedition ?? false;
  const isInjured = dragon.isInjured ?? false;
  // const expeditionZoneId = dragon.expeditionZoneId ?? null;
  const expeditionLayerId = dragon.expeditionLayerId ?? null;

  const expeditionReady = isExpeditionReady(dragon);
  const canStart = canStartExpedition(dragon);

  // Update countdown timers
  useEffect(() => {
    const updateTimers = () => {
      if (isOnExpedition) {
        const remaining = getExpeditionTimeRemaining(dragon);
        setTimeRemaining(formatTimeRemaining(remaining));
      }
      
      if (isInjured) {
        const remaining = getInjuryTimeRemaining(dragon);
        setInjuryTimeRemaining(formatTimeRemaining(remaining));
      }
    };

    updateTimers();
    const interval = setInterval(updateTimers, 1000);
    return () => clearInterval(interval);
  }, [dragon, isOnExpedition, isInjured]);

  // Handle starting expedition
  const handleStartExpedition = useCallback((layerId: ExpeditionLayerId) => {
    const result = startExpedition(dragon, 'ruinas_de_ignareth', layerId);
    
    if (result.success && result.newDragonData) {
      onUpdate(result.newDragonData);
      onNotify(result.message, 'success');
      setSelectedLayer(null);
    } else {
      onNotify(result.message, 'error');
    }
  }, [dragon, onUpdate, onNotify]);

  // Handle collecting expedition
  const handleCollectExpedition = useCallback(() => {
    const result = collectExpedition(dragon);
    
    if (result.success && result.newDragonData) {
      onUpdate(result.newDragonData);
      onNotify(result.message, 'success');
    } else {
      onNotify(result.message, 'error');
    }
  }, [dragon, onUpdate, onNotify]);

  // Get zone config
  const zone = EXPEDITION_ZONES['ruinas_de_ignareth'];
  const currentLayerConfig = expeditionLayerId 
    ? getLayerConfig('ruinas_de_ignareth', expeditionLayerId)
    : null;

  // Render injury status
  if (isInjured && !isOnExpedition) {
    return (
      <div className="bg-[#12121a]/50 rounded-xl border border-[#2a2a3a]/50 p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">🗺️</span>
          <h3 className="font-medium text-[#e8e8ec]">Expedições</h3>
        </div>

        <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4 text-center">
          <p className="text-4xl mb-2">🩹</p>
          <p className="text-sm text-red-300 font-medium">Machucado</p>
          <p className="text-xs text-[#6a6a7a] mt-1">
            {dragon.dragonName} precisa descansar antes de partir novamente.
          </p>
          <div className="mt-3 bg-[#1a1a24] rounded-lg px-3 py-2">
            <p className="text-xs text-[#6a6a7a]">Recuperação em</p>
            <p className="text-lg font-mono text-[#a78bfa]">{injuryTimeRemaining || '--:--'}</p>
          </div>
        </div>
      </div>
    );
  }

  // Render expedition in progress
  if (isOnExpedition) {
    return (
      <div className="bg-[#12121a]/50 rounded-xl border border-[#2a2a3a]/50 p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">🗺️</span>
          <h3 className="font-medium text-[#e8e8ec]">Expedições</h3>
        </div>

        <div className="bg-[#1a1a24]/50 rounded-lg p-4 text-center">
          <p className="text-4xl mb-2 animate-float">{zone.emoji}</p>
          <p className="text-sm text-[#a78bfa] font-medium">{zone.name}</p>
          <p className="text-xs text-[#6a6a7a]">
            {currentLayerConfig?.name || 'Camada desconhecida'}
          </p>
          
          <div className="mt-3 bg-[#0a0a0f] rounded-lg px-4 py-3">
            <p className="text-xs text-[#6a6a7a]">
              {dragon.dragonName} está explorando...
            </p>
            <p className="text-xs text-[#6a6a7a] mt-1 italic">
              "Ele está longe, entre cinzas antigas."
            </p>
          </div>

          {expeditionReady ? (
            <button
              onClick={handleCollectExpedition}
              className="mt-4 w-full py-3 bg-[#a78bfa] hover:bg-[#9171e8] text-white font-semibold rounded-lg transition-colors"
            >
              🎁 Coletar Retorno
            </button>
          ) : (
            <div className="mt-4">
              <p className="text-xs text-[#6a6a7a]">Retorna em</p>
              <p className="text-2xl font-mono text-[#a78bfa]">{timeRemaining || '--:--:--'}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Render expedition selection
  return (
    <div className="bg-[#12121a]/50 rounded-xl border border-[#2a2a3a]/50 p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">🗺️</span>
        <h3 className="font-medium text-[#e8e8ec]">Expedições</h3>
      </div>

      {/* Zone header */}
      <div className="bg-[#1a1a24]/50 rounded-lg p-3 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{zone.emoji}</span>
          <div>
            <p className="text-sm text-[#a78bfa] font-medium">{zone.name}</p>
            <p className="text-xs text-[#6a6a7a]">{zone.description}</p>
          </div>
        </div>
      </div>

      {/* Layer options */}
      <div className="space-y-2">
        {/* Fronteira */}
        <LayerCard
          layer={zone.layers.fronteira}
          layerId="fronteira"
          isSelected={selectedLayer === 'fronteira'}
          canStart={canStart.canStart}
          onSelect={() => setSelectedLayer(selectedLayer === 'fronteira' ? null : 'fronteira')}
          onStart={() => handleStartExpedition('fronteira')}
          dragonName={dragon.dragonName}
        />

        {/* Interior */}
        <LayerCard
          layer={zone.layers.interior}
          layerId="interior"
          isSelected={selectedLayer === 'interior'}
          canStart={canStart.canStart}
          onSelect={() => setSelectedLayer(selectedLayer === 'interior' ? null : 'interior')}
          onStart={() => handleStartExpedition('interior')}
          dragonName={dragon.dragonName}
        />
      </div>

      {/* Info */}
      <p className="text-xs text-[#6a6a7a] mt-3 text-center">
        Expedições trazem cristais, materiais e memórias.
      </p>
    </div>
  );
}

// --- Layer Card Component ---

interface LayerCardProps {
  layer: ExpeditionLayerConfig;
  layerId: ExpeditionLayerId;
  isSelected: boolean;
  canStart: boolean;
  onSelect: () => void;
  onStart: () => void;
  dragonName: string;
}

function LayerCard({ layer, isSelected, canStart, onSelect, onStart, dragonName }: LayerCardProps) {
  const [minDuration, maxDuration] = layer.durationRange;
  const minHours = Math.floor(minDuration / (60 * 60 * 1000));
  const minMinutes = Math.floor((minDuration % (60 * 60 * 1000)) / (60 * 1000));
  const maxHours = Math.floor(maxDuration / (60 * 60 * 1000));

  const formatDuration = () => {
    if (minHours === 0) {
      return `${minMinutes}min — ${maxHours}h`;
    }
    return `${minHours}h — ${maxHours}h`;
  };

  const getRiskText = () => {
    if (layer.injuryChance === 0) return 'Seguro';
    return `${Math.round(layer.injuryChance * 100)}% risco`;
  };

  const getRiskColor = () => {
    if (layer.injuryChance === 0) return 'text-green-400';
    if (layer.injuryChance < 0.2) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div
      className={`
        rounded-lg border transition-all cursor-pointer
        ${isSelected 
          ? 'bg-[#1a1a24] border-[#a78bfa]/50' 
          : 'bg-[#12121a] border-[#2a2a3a] hover:border-[#a78bfa]/30'
        }
      `}
      onClick={onSelect}
    >
      <div className="p-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-[#e8e8ec]">{layer.name}</p>
            <p className="text-xs text-[#6a6a7a]">{layer.description}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-[#6a6a7a]">{formatDuration()}</p>
            <p className={`text-xs font-medium ${getRiskColor()}`}>{getRiskText()}</p>
          </div>
        </div>

        {/* Rewards preview */}
        <div className="flex items-center gap-3 mt-2 text-xs text-[#6a6a7a]">
          <span>🔥 {layer.rewards.crystalRange[0]}-{layer.rewards.crystalRange[1]}</span>
          {layer.rewards.commonMaterialChance > 0 && <span>🪨 Material</span>}
          {layer.rewards.rareMaterialChance > 0 && <span>✨ Raro</span>}
        </div>
      </div>

      {/* Expanded actions */}
      {isSelected && (
        <div className="px-3 pb-3 pt-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (canStart) onStart();
            }}
            disabled={!canStart}
            className={`
              w-full py-2 rounded-lg text-sm font-medium transition-colors
              ${canStart
                ? 'bg-[#a78bfa] hover:bg-[#9171e8] text-white'
                : 'bg-[#2a2a3a] text-[#6a6a7a] cursor-not-allowed'
              }
            `}
          >
            🗺️ Enviar {dragonName}
          </button>
        </div>
      )}
    </div>
  );
}
