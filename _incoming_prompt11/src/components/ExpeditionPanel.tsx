// ============================================================
// ARC: AETHON — EXPEDITION PANEL
// Prompt 11: Atmospheric expedition UI with ruins aesthetic.
// ============================================================

import { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { EXPEDITION_ZONES } from '../constants/gameConstants';

export default function ExpeditionPanel() {
  const { save, updateSave } = useGame();
  const dragon = save?.dragonData;
  const [timeRemaining, setTimeRemaining] = useState('');

  // Update countdown
  useEffect(() => {
    if (!dragon?.isOnExpedition || !dragon?.expeditionEndTime) return;

    const updateTimer = () => {
      const remaining = Math.max(0, dragon.expeditionEndTime! - Date.now());
      const hours = Math.floor(remaining / (1000 * 60 * 60));
      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
      
      if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m`);
      } else if (minutes > 0) {
        setTimeRemaining(`${minutes}m ${seconds}s`);
      } else {
        setTimeRemaining(`${seconds}s`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [dragon?.isOnExpedition, dragon?.expeditionEndTime]);

  if (!dragon) return null;

  const isOnExpedition = dragon.isOnExpedition;
  const isInjured = dragon.isInjured;

  const startExpedition = (zoneId: string, layerId: string) => {
    const zone = EXPEDITION_ZONES[zoneId];
    if (!zone) return;
    const layer = zone.layers[layerId as keyof typeof zone.layers];
    if (!layer) return;
    const [minDuration, maxDuration] = layer.durationRange;
    const duration = minDuration + Math.random() * (maxDuration - minDuration);
    const now = Date.now();

    updateSave((prev) => ({
      ...prev,
      dragonData: prev.dragonData ? {
        ...prev.dragonData,
        isOnExpedition: true,
        expeditionZoneId: zoneId as any,
        expeditionLayerId: layerId as any,
        expeditionStartTime: now,
        expeditionEndTime: now + duration,
      } : prev.dragonData,
    }));
  };

  // On expedition state
  if (isOnExpedition) {
    const zone = dragon.expeditionZoneId ? EXPEDITION_ZONES[dragon.expeditionZoneId] : null;
    const layer = zone && dragon.expeditionLayerId ? zone.layers[dragon.expeditionLayerId as keyof typeof zone.layers] : null;

    return (
      <div 
        className="relative overflow-hidden rounded-xl"
        style={{
          background: 'linear-gradient(135deg, rgba(18, 18, 26, 0.8) 0%, rgba(30, 25, 20, 0.6) 100%)',
          border: '1px solid rgba(255, 107, 53, 0.2)',
        }}
      >
        {/* Animated background */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            background: 'radial-gradient(ellipse at bottom, rgba(255, 107, 53, 0.3) 0%, transparent 70%)',
          }}
        />

        <div className="relative p-5 text-center space-y-4">
          <div className="text-4xl animate-float">🗺️</div>
          
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-[#e8e8ec]">
              {dragon.dragonName} está explorando
            </h3>
            {zone && layer && (
              <p className="text-sm text-[#ff9a5c]">
                {zone.name} — {layer.name}
              </p>
            )}
          </div>

          <div 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
            style={{
              background: 'rgba(255, 107, 53, 0.15)',
              border: '1px solid rgba(255, 107, 53, 0.3)',
            }}
          >
            <span className="text-sm animate-pulse">⏳</span>
            <span className="text-sm font-mono text-[#ff9a5c]">{timeRemaining}</span>
          </div>

          <p className="text-xs text-[#6a6a7a] italic">
            As ruínas guardam segredos antigos...
          </p>
        </div>
      </div>
    );
  }

  // Injured state
  if (isInjured) {
    return (
      <div 
        className="relative overflow-hidden rounded-xl"
        style={{
          background: 'linear-gradient(135deg, rgba(18, 18, 26, 0.8) 0%, rgba(30, 20, 20, 0.6) 100%)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
        }}
      >
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(239, 68, 68, 0.2) 0%, transparent 70%)',
          }}
        />

        <div className="relative p-5 text-center space-y-3">
          <div className="text-4xl">🩹</div>
          
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-[#e8e8ec]">
              Recuperando de lesão
            </h3>
            <p className="text-sm text-[#f87171]">
              {dragon.dragonName} precisa descansar
            </p>
          </div>

          <p className="text-xs text-[#6a6a7a] italic">
            Algumas feridas demoram para curar...
          </p>
        </div>
      </div>
    );
  }

  // Available expeditions
  return (
    <div className="space-y-4">
      {/* Introduction */}
      <div 
        className="rounded-xl p-4"
        style={{
          background: 'linear-gradient(135deg, rgba(18, 18, 26, 0.5) 0%, rgba(18, 18, 26, 0.3) 100%)',
          border: '1px solid rgba(42, 42, 58, 0.3)',
        }}
      >
        <p className="text-sm text-[#a0a0b8] text-center">
          O mundo de Aethon guarda ruínas antigas. Envie {dragon.dragonName} para explorar.
        </p>
      </div>

      {/* Zones */}
      {Object.values(EXPEDITION_ZONES).map((zone) => (
        <div 
          key={zone.id} 
          className="relative overflow-hidden rounded-xl"
          style={{
            background: 'linear-gradient(135deg, rgba(18, 18, 26, 0.7) 0%, rgba(30, 25, 20, 0.5) 100%)',
            border: '1px solid rgba(255, 107, 53, 0.15)',
          }}
        >
          {/* Zone glow */}
          <div 
            className="absolute inset-0 opacity-10"
            style={{
              background: 'radial-gradient(ellipse at top right, rgba(255, 107, 53, 0.4) 0%, transparent 60%)',
            }}
          />

          <div className="relative p-4">
            {/* Zone header */}
            <div className="flex items-center gap-3 mb-3">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 107, 53, 0.2) 0%, rgba(255, 107, 53, 0.1) 100%)',
                  border: '1px solid rgba(255, 107, 53, 0.3)',
                  boxShadow: '0 0 15px rgba(255, 107, 53, 0.15)',
                }}
              >
                <span className="text-2xl">{zone.emoji}</span>
              </div>
              <div>
                <h3 className="font-semibold text-[#e8e8ec]">{zone.name}</h3>
                <p className="text-xs text-[#6a6a7a]">{zone.description}</p>
              </div>
            </div>

            {/* Layers */}
            <div className="space-y-2">
              {Object.values(zone.layers).map((layer) => {
                const isRisky = layer.injuryChance > 0;
                const durationText = layer.durationRange[0] >= 3600000 
                  ? `${Math.round(layer.durationRange[0] / 3600000)}-${Math.round(layer.durationRange[1] / 3600000)}h`
                  : `${Math.round(layer.durationRange[0] / 60000)}-${Math.round(layer.durationRange[1] / 60000)}m`;

                return (
                  <button 
                    key={layer.id} 
                    onClick={() => startExpedition(zone.id, layer.id)}
                    className="w-full p-3 rounded-xl text-left transition-all active:scale-[0.98]"
                    style={{
                      background: 'rgba(26, 26, 36, 0.6)',
                      border: '1px solid rgba(42, 42, 58, 0.5)',
                    }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-[#e8e8ec]">{layer.name}</span>
                      <span className="text-xs text-[#6a6a7a]">⏱ {durationText}</span>
                    </div>
                    <p className="text-xs text-[#6a6a7a] mb-2">{layer.description}</p>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-[#4ade80]">
                        💎 {layer.rewards.crystalRange[0]}-{layer.rewards.crystalRange[1]}
                      </span>
                      {isRisky && (
                        <span className="text-[#f87171]">
                          ⚠️ {Math.round(layer.injuryChance * 100)}% risco
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
