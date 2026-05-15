// ============================================================
// ARC: AETHON — EGG SCREEN
// Complete implementation of the orb and absorption mechanics.
//
// Features:
// - Orb tray with drag and drop
// - Drop detection over egg (110px radius for mobile comfort)
// - Orbiting orbs visualization
// - 2-second hold absorption
// - Energy and maturation updates
// - Transition to HatchScene at 100%
// ============================================================

import { useState, useEffect, useRef, useCallback } from 'react';
import Layout from '../components/Layout';
import { useGame } from '../context/GameContext';
import DraggableOrb from '../components/DraggableOrb';
import OrbitingOrbs from '../components/OrbitingOrbs';
import AbsorptionRing from '../components/AbsorptionRing';
import FloatingNotification, { useNotifications } from '../components/FloatingNotification';
import {
  ELEMENT_EMOJI,
  ELEMENT_LABELS,
  ELEMENT_COLORS,
  ORB_ON_EGG_MAX,
  ABSORPTION_HOLD_TIME_MS,
  ENERGY_PER_ORB,
  VOID_ENERGY_PER_ABSORPTION,
  VOID_ENERGY_MAX,
  MATURATION_PER_ORB,
  MATURATION_HATCH_THRESHOLD,
  ORB_TRAY_MAX,
  ORB_MIN_PER_WINDOW,
  ORB_MAX_PER_WINDOW,
  MVP_ORB_ELEMENTS,
  EGG_DROP_RADIUS,
} from '../constants/gameConstants';
import { getTimeUntilNextOrb, formatTimeRemaining } from '../systems/TimeManager';
import { Orb, MvpOrbElement } from '../types/game';

export default function EggScreen() {
  const { save, updateSave, navigateTo } = useGame();
  const egg = save?.eggData;

  // Refs for drop detection
  const eggRef = useRef<HTMLDivElement>(null);

  // Drag state
  const [isDragging, setIsDragging] = useState(false);
  const [isOverEgg, setIsOverEgg] = useState(false);

  // Absorption state
  const [isHolding, setIsHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const holdStartTime = useRef<number | null>(null);
  const holdAnimationFrame = useRef<number | null>(null);

  // Post-absorption bonus state
  const [showAbsorptionBonus, setShowAbsorptionBonus] = useState(false);

  // Timer state
  const [nextOrbTimer, setNextOrbTimer] = useState('');
  const [isTrayFull, setIsTrayFull] = useState(false);

  // Notifications
  const { notifications, showNotification, dismissNotification } = useNotifications();

  // Timer update effect
  useEffect(() => {
    if (!egg) return;

    const updateTimer = () => {
      // Check if tray is full
      const trayFull = egg.availableOrbs.length >= ORB_TRAY_MAX;
      setIsTrayFull(trayFull);

      if (trayFull) {
        setNextOrbTimer('Tray cheio');
        return;
      }

      const remaining = getTimeUntilNextOrb(egg.lastOrbGenTime);
      setNextOrbTimer(formatTimeRemaining(remaining));

      // Check if we should generate a new orb
      if (remaining <= 0) {
        generateOnlineOrb();
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [egg?.lastOrbGenTime, egg?.availableOrbs.length]);

  // Generate orb when timer reaches 0 (online generation)
  const generateOnlineOrb = useCallback(() => {
    if (!save?.eggData) return;
    if (save.eggData.availableOrbs.length >= ORB_TRAY_MAX) return;

    const orbCount = Math.floor(Math.random() * (ORB_MAX_PER_WINDOW - ORB_MIN_PER_WINDOW + 1)) + ORB_MIN_PER_WINDOW;
    const newOrbs: Orb[] = [];

    for (let i = 0; i < orbCount; i++) {
      if (save.eggData.availableOrbs.length + newOrbs.length >= ORB_TRAY_MAX) break;

      const element: MvpOrbElement = MVP_ORB_ELEMENTS[Math.floor(Math.random() * MVP_ORB_ELEMENTS.length)];
      newOrbs.push({
        id: `orb_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
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
              lastOrbGenTime: Date.now(),
            }
          : prev.eggData,
      }));
    }
  }, [save?.eggData, updateSave]);

  // Prevent body scroll during drag
  useEffect(() => {
    if (isDragging) {
      document.body.classList.add('dragging');
    } else {
      document.body.classList.remove('dragging');
    }
    return () => document.body.classList.remove('dragging');
  }, [isDragging]);

  // Check if position is over the egg (using EGG_DROP_RADIUS for comfortable mobile experience)
  const isPositionOverEgg = useCallback((position: { x: number; y: number }) => {
    if (!eggRef.current) return false;
    const rect = eggRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distance = Math.sqrt(
      Math.pow(position.x - centerX, 2) + Math.pow(position.y - centerY, 2)
    );
    return distance < EGG_DROP_RADIUS;
  }, []);

  // Drag handlers
  const handleDragStart = useCallback(() => {
    setIsDragging(true);
    setShowAbsorptionBonus(false);
  }, []);

  const handleDragMove = useCallback(
    (position: { x: number; y: number }) => {
      setIsOverEgg(isPositionOverEgg(position));
    },
    [isPositionOverEgg]
  );

  const handleDragEnd = useCallback(
    (orbId: string, dropPosition: { x: number; y: number }) => {
      setIsDragging(false);
      setIsOverEgg(false);

      if (!save?.eggData) return;

      const droppedOverEgg = isPositionOverEgg(dropPosition);

      if (droppedOverEgg) {
        // Check if we can add more orbs to the egg
        if (save.eggData.orbsOnEgg.length >= ORB_ON_EGG_MAX) {
          showNotification('Segure o ovo pra absorver primeiro!');
          return;
        }

        // Find the orb
        const orb = save.eggData.availableOrbs.find((o) => o.id === orbId);
        if (!orb) return;

        // Move orb from tray to egg
        updateSave((prev) => ({
          ...prev,
          eggData: prev.eggData
            ? {
                ...prev.eggData,
                availableOrbs: prev.eggData.availableOrbs.filter((o) => o.id !== orbId),
                orbsOnEgg: [...prev.eggData.orbsOnEgg, orb],
              }
            : prev.eggData,
        }));

        // Show element-specific notification
        const elementMessages: Record<string, string> = {
          fire: '🔥 Energia de Fogo grudou no ovo!',
          water: '💧 Energia de Água grudou no ovo!',
          earth: '🌍 Energia de Terra grudou no ovo!',
        };
        showNotification(elementMessages[orb.element] || '✨ Orb grudou no ovo!');
      }
      // If dropped outside egg, orb stays in tray (no action needed)
    },
    [save?.eggData, isPositionOverEgg, updateSave, showNotification]
  );

  // Handle drag cancel (from DraggableOrb pointercancel)
  const handleDragCancel = useCallback(() => {
    setIsDragging(false);
    setIsOverEgg(false);
  }, []);

  // Absorption hold handlers
  const startHold = useCallback(() => {
    if (!egg || egg.orbsOnEgg.length === 0) {
      showNotification('Arraste energias pro ovo primeiro!');
      return;
    }

    setIsHolding(true);
    holdStartTime.current = Date.now();
    setShowAbsorptionBonus(false);

    const updateProgress = () => {
      if (!holdStartTime.current) return;

      const elapsed = Date.now() - holdStartTime.current;
      const progress = Math.min(elapsed / ABSORPTION_HOLD_TIME_MS, 1);
      setHoldProgress(progress);

      if (progress >= 1) {
        // Absorption complete
        completeAbsorption();
      } else {
        holdAnimationFrame.current = requestAnimationFrame(updateProgress);
      }
    };

    holdAnimationFrame.current = requestAnimationFrame(updateProgress);
  }, [egg, showNotification]);

  const cancelHold = useCallback(() => {
    setIsHolding(false);
    setHoldProgress(0);
    holdStartTime.current = null;
    if (holdAnimationFrame.current) {
      cancelAnimationFrame(holdAnimationFrame.current);
      holdAnimationFrame.current = null;
    }
  }, []);

  const completeAbsorption = useCallback(() => {
    if (!save?.eggData || save.eggData.orbsOnEgg.length === 0) return;

    const orbsToAbsorb = save.eggData.orbsOnEgg;

    // Calculate energy gains
    let fireGain = 0;
    let waterGain = 0;
    let earthGain = 0;

    orbsToAbsorb.forEach((orb) => {
      switch (orb.element) {
        case 'fire':
          fireGain += ENERGY_PER_ORB;
          break;
        case 'water':
          waterGain += ENERGY_PER_ORB;
          break;
        case 'earth':
          earthGain += ENERGY_PER_ORB;
          break;
      }
    });

    // Calculate maturation gain
    const maturationGain = orbsToAbsorb.length * MATURATION_PER_ORB;

    // Update save (useEffect will handle navigation to HatchScene)
    updateSave((prev) => {
      if (!prev.eggData) return prev;

      const newVoidEnergy = Math.min(
        prev.eggData.voidEnergy + VOID_ENERGY_PER_ABSORPTION,
        VOID_ENERGY_MAX
      );

      const newMaturation = Math.min(
        prev.eggData.maturationProgress + maturationGain,
        MATURATION_HATCH_THRESHOLD
      );

      return {
        ...prev,
        eggData: {
          ...prev.eggData,
          fireEnergy: prev.eggData.fireEnergy + fireGain,
          waterEnergy: prev.eggData.waterEnergy + waterGain,
          earthEnergy: prev.eggData.earthEnergy + earthGain,
          voidEnergy: newVoidEnergy,
          maturationProgress: newMaturation,
          orbsOnEgg: [], // Clear orbiting orbs
        },
      };
    });

    // Reset hold state
    setIsHolding(false);
    setHoldProgress(0);
    holdStartTime.current = null;
    if (holdAnimationFrame.current) {
      cancelAnimationFrame(holdAnimationFrame.current);
      holdAnimationFrame.current = null;
    }

    // Show notification
    showNotification('✨ O ovo absorveu as energias!');

    // Show absorption bonus button
    setShowAbsorptionBonus(true);
  }, [save, updateSave, showNotification]);

  // Handle absorption bonus click
  const handleAbsorptionBonus = useCallback(() => {
    showNotification('Absorção real será conectada ao sistema de anúncios futuramente.');
    setShowAbsorptionBonus(false);
  }, [showNotification]);

  // Check maturation after save updates - SINGLE SOURCE OF TRUTH for HatchScene navigation
  useEffect(() => {
    if (egg && egg.maturationProgress >= MATURATION_HATCH_THRESHOLD) {
      // Small delay for visual feedback
      const timer = setTimeout(() => {
        navigateTo('HatchScene');
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [egg?.maturationProgress, navigateTo]);

  if (!egg) return null;

  const matPct = (egg.maturationProgress * 100).toFixed(1);

  // Only show MVP elements (fire, water, earth)
  const energies = [
    {
      key: 'fire',
      value: egg.fireEnergy,
      label: ELEMENT_LABELS.fire,
      emoji: ELEMENT_EMOJI.fire,
      color: ELEMENT_COLORS.fire,
    },
    {
      key: 'water',
      value: egg.waterEnergy,
      label: ELEMENT_LABELS.water,
      emoji: ELEMENT_EMOJI.water,
      color: ELEMENT_COLORS.water,
    },
    {
      key: 'earth',
      value: egg.earthEnergy,
      label: ELEMENT_LABELS.earth,
      emoji: ELEMENT_EMOJI.earth,
      color: ELEMENT_COLORS.earth,
    },
  ];

  return (
    <Layout className="items-center pt-6 px-4 pb-24 overflow-hidden">
      {/* Floating Notifications */}
      <FloatingNotification
        notifications={notifications}
        onDismiss={dismissNotification}
      />

      {/* Title */}
      <h1 className="text-2xl font-bold text-aethon-glow mb-1">O Ovo</h1>
      <p className="text-aethon-muted text-sm mb-4">
        Cuide dele. Ele sente sua presença.
      </p>

      {/* Maturation Bar */}
      <div className="w-full max-w-xs mb-4">
        <div className="flex justify-between text-xs text-aethon-muted mb-1">
          <span>Maturação</span>
          <span>{matPct}%</span>
        </div>
        <div className="w-full h-3 bg-aethon-card rounded-full overflow-hidden border border-aethon-border">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.min(100, parseFloat(matPct))}%`,
              background: 'linear-gradient(90deg, #7c5cbf, #c084fc)',
            }}
          />
        </div>
      </div>

      {/* Egg Container */}
      <div
        ref={eggRef}
        className="relative mb-4 select-none"
        onPointerDown={(e) => {
          if (!isDragging) {
            e.preventDefault();
            startHold();
          }
        }}
        onPointerUp={cancelHold}
        onPointerLeave={cancelHold}
        onPointerCancel={cancelHold}
        style={{ touchAction: 'none' }}
      >
        {/* Absorption Ring */}
        <AbsorptionRing progress={holdProgress} isActive={isHolding} />

        {/* Base glow */}
        <div
          className={`
            absolute inset-0 rounded-full pointer-events-none
            transition-all duration-300
            ${isOverEgg ? 'animate-egg-highlight' : 'animate-pulse-glow'}
          `}
          style={{
            background: isOverEgg
              ? 'radial-gradient(circle, rgba(192,132,252,0.3) 0%, transparent 60%)'
              : 'radial-gradient(circle, rgba(192,132,252,0.15) 0%, transparent 70%)',
            transform: 'scale(2.5)',
          }}
        />

        {/* Orbiting orbs */}
        <OrbitingOrbs orbs={egg.orbsOnEgg} />

        {/* The Egg */}
        <div
          className={`
            text-8xl transition-transform duration-200 cursor-pointer
            ${isHolding ? 'scale-95' : 'animate-float'}
            ${isOverEgg ? 'scale-110' : ''}
          `}
        >
          🥚
        </div>

        {/* Orbs on egg indicator */}
        {egg.orbsOnEgg.length > 0 && !isHolding && (
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-aethon-card/90 px-3 py-1 rounded-full text-xs text-aethon-muted border border-aethon-border whitespace-nowrap">
            {egg.orbsOnEgg.length}/{ORB_ON_EGG_MAX} orbs • Segure para absorver
          </div>
        )}
      </div>

      {/* Absorption Bonus Button */}
      {showAbsorptionBonus && (
        <button
          onClick={handleAbsorptionBonus}
          className="mb-4 px-4 py-2 bg-aethon-accent/20 border border-aethon-accent/40 rounded-xl text-aethon-glow text-sm hover:bg-aethon-accent/30 active:scale-95 transition-all"
        >
          <div className="font-medium">✨ Absorção</div>
          <div className="text-xs text-aethon-muted mt-0.5">
            O ovo ainda pulsa com energia. Uma segunda Absorção é possível…
          </div>
        </button>
      )}

      {/* Energies */}
      <div className="w-full max-w-xs mb-4">
        <h2 className="text-xs font-semibold text-aethon-muted mb-2 uppercase tracking-wider">
          Energias Elementais
        </h2>
        <div className="grid grid-cols-1 gap-1.5">
          {energies.map((e) => (
            <div
              key={e.key}
              className="flex items-center gap-2 bg-aethon-card/50 rounded-lg px-3 py-1.5 border border-aethon-border/50"
            >
              <span className="text-base">{e.emoji}</span>
              <span className="text-xs text-aethon-text flex-1">{e.label}</span>
              <div className="w-16 h-1.5 bg-aethon-bg rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, e.value * 100)}%`,
                    backgroundColor: e.color,
                  }}
                />
              </div>
              <span className="text-[10px] text-aethon-muted w-8 text-right">
                {(e.value * 100).toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Void Energy (subtle) */}
      <div className="w-full max-w-xs mb-4">
        <div className="flex items-center gap-2 bg-aethon-void/10 rounded-lg px-3 py-1.5 border border-aethon-void/20">
          <span className="text-base">{ELEMENT_EMOJI.void}</span>
          <span className="text-xs text-aethon-muted flex-1">Ressonância Oculta</span>
          <span className="text-[10px] text-aethon-muted">
            {(egg.voidEnergy * 100).toFixed(0)}%
          </span>
        </div>
      </div>

      {/* Orb Tray */}
      <div className="w-full max-w-xs">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xs font-semibold text-aethon-muted uppercase tracking-wider">
            Orbs Disponíveis
          </h2>
          <span className={`text-[10px] ${isTrayFull ? 'text-yellow-400' : 'text-aethon-muted'}`}>
            {egg.availableOrbs.length}/{ORB_TRAY_MAX}
          </span>
        </div>

        {egg.availableOrbs.length > 0 ? (
          <div className="flex flex-wrap gap-2 justify-center bg-aethon-card/30 rounded-xl p-3 border border-aethon-border/30">
            {egg.availableOrbs.map((orb) => (
              <DraggableOrb
                key={orb.id}
                orb={orb}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragMove={handleDragMove}
                onDragCancel={handleDragCancel}
                disabled={isHolding}
              />
            ))}
          </div>
        ) : (
          <div className="text-center bg-aethon-card/30 rounded-xl p-4 border border-aethon-border/30">
            <p className="text-xs text-aethon-muted italic">
              Nenhum orb disponível.
            </p>
          </div>
        )}

        <p className={`text-[10px] mt-2 text-center ${isTrayFull ? 'text-yellow-400' : 'text-aethon-muted'}`}>
          {isTrayFull ? '⚠️ Tray cheio — use orbs para receber mais' : `Próximo orb em: ${nextOrbTimer}`}
        </p>
      </div>

      {/* Instructions hint */}
      <div className="w-full max-w-xs mt-4 text-center">
        <p className="text-[10px] text-aethon-muted/70">
          Arraste orbs até o ovo • Segure o ovo para absorver
        </p>
      </div>
    </Layout>
  );
}
