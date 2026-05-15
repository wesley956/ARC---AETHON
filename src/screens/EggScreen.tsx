// ============================================================
// ARC: AETHON — EGG SCREEN
// Main interaction screen for the egg phase.
// Orbs, absorption, and maturation progress.
// ============================================================

import { useState, useEffect, useCallback, useRef } from 'react';
import Layout from '../components/Layout';
import { useGame } from '../context/GameContext';
import { 
  ELEMENT_EMOJI, 
  ELEMENT_COLORS,
  ORB_ON_EGG_MAX,
  ABSORPTION_HOLD_TIME_MS,
  ENERGY_PER_ORB,
  VOID_ENERGY_PER_ABSORPTION,
  VOID_ENERGY_MAX,
  MATURATION_PER_ORB,
  EGG_DROP_RADIUS,
} from '../constants/gameConstants';
import { getTimeUntilNextOrb, formatTimeRemaining } from '../systems/TimeManager';
import { Orb } from '../types/game';
import FloatingNotification from '../components/FloatingNotification';

export default function EggScreen() {
  const { save, updateSave, navigateTo } = useGame();
  const eggData = save?.eggData;

  // Drag state
  const [draggedOrb, setDraggedOrb] = useState<Orb | null>(null);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });

  // Hold state for absorption
  const [isHolding, setIsHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const holdStartTime = useRef<number | null>(null);
  const holdAnimationFrame = useRef<number | null>(null);

  // Notification
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Timer for next orb
  const [timeToNextOrb, setTimeToNextOrb] = useState('');

  // Egg ref for drop detection
  const eggRef = useRef<HTMLDivElement>(null);

  // Update timer
  useEffect(() => {
    if (!eggData) return;

    const updateTimer = () => {
      const remaining = getTimeUntilNextOrb(eggData.lastOrbGenTime);
      setTimeToNextOrb(formatTimeRemaining(remaining));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [eggData?.lastOrbGenTime]);

  // Handle orb drag start
  const handleOrbDragStart = useCallback((orb: Orb, e: React.PointerEvent) => {
    e.preventDefault();
    setDraggedOrb(orb);
    setDragPosition({ x: e.clientX, y: e.clientY });
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  // Handle drag move
  const handleDragMove = useCallback((e: React.PointerEvent) => {
    if (!draggedOrb) return;
    setDragPosition({ x: e.clientX, y: e.clientY });
  }, [draggedOrb]);

  // Handle drag end
  const handleDragEnd = useCallback((e: React.PointerEvent) => {
    if (!draggedOrb || !eggData || !eggRef.current) {
      setDraggedOrb(null);
      return;
    }

    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}

    // Check if dropped on egg
    const eggRect = eggRef.current.getBoundingClientRect();
    const eggCenterX = eggRect.left + eggRect.width / 2;
    const eggCenterY = eggRect.top + eggRect.height / 2;
    const distance = Math.sqrt(
      Math.pow(e.clientX - eggCenterX, 2) + Math.pow(e.clientY - eggCenterY, 2)
    );

    if (distance <= EGG_DROP_RADIUS) {
      // Check if egg can accept more orbs
      if (eggData.orbsOnEgg.length >= ORB_ON_EGG_MAX) {
        setNotification({ message: 'Segure o ovo para absorver primeiro!', type: 'info' });
      } else {
        // Move orb to egg
        updateSave((prev) => {
          if (!prev.eggData) return prev;
          return {
            ...prev,
            eggData: {
              ...prev.eggData,
              availableOrbs: prev.eggData.availableOrbs.filter((o) => o.id !== draggedOrb.id),
              orbsOnEgg: [...prev.eggData.orbsOnEgg, draggedOrb],
            },
          };
        });
      }
    }

    setDraggedOrb(null);
  }, [draggedOrb, eggData, updateSave]);

  // Handle egg hold for absorption
  const handleEggPointerDown = useCallback(() => {
    if (!eggData || eggData.orbsOnEgg.length === 0) {
      setNotification({ message: 'Arraste energias pro ovo primeiro!', type: 'info' });
      return;
    }

    setIsHolding(true);
    holdStartTime.current = Date.now();

    const animate = () => {
      if (!holdStartTime.current) return;

      const elapsed = Date.now() - holdStartTime.current;
      const progress = Math.min(1, elapsed / ABSORPTION_HOLD_TIME_MS);
      setHoldProgress(progress);

      if (progress < 1) {
        holdAnimationFrame.current = requestAnimationFrame(animate);
      } else {
        // Absorption complete!
        performAbsorption();
      }
    };

    holdAnimationFrame.current = requestAnimationFrame(animate);
  }, [eggData]);

  const handleEggPointerUp = useCallback(() => {
    setIsHolding(false);
    setHoldProgress(0);
    holdStartTime.current = null;
    if (holdAnimationFrame.current) {
      cancelAnimationFrame(holdAnimationFrame.current);
    }
  }, []);

  // Perform absorption
  const performAbsorption = useCallback(() => {
    if (!eggData) return;

    const orbsToAbsorb = eggData.orbsOnEgg;
    if (orbsToAbsorb.length === 0) return;

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

    const maturationGain = orbsToAbsorb.length * MATURATION_PER_ORB;
    const voidGain = VOID_ENERGY_PER_ABSORPTION;

    updateSave((prev) => {
      if (!prev.eggData) return prev;

      const newMaturation = Math.min(1, prev.eggData.maturationProgress + maturationGain);

      return {
        ...prev,
        eggData: {
          ...prev.eggData,
          fireEnergy: prev.eggData.fireEnergy + fireGain,
          waterEnergy: prev.eggData.waterEnergy + waterGain,
          earthEnergy: prev.eggData.earthEnergy + earthGain,
          voidEnergy: Math.min(VOID_ENERGY_MAX, prev.eggData.voidEnergy + voidGain),
          maturationProgress: newMaturation,
          orbsOnEgg: [],
        },
      };
    });

    setNotification({ message: '✨ O ovo absorveu as energias!', type: 'success' });
    setIsHolding(false);
    setHoldProgress(0);
    holdStartTime.current = null;

    // Check for hatch
    if (eggData.maturationProgress + maturationGain >= 1) {
      setTimeout(() => {
        navigateTo('HatchScene');
      }, 1000);
    }
  }, [eggData, updateSave, navigateTo]);

  if (!eggData) {
    return (
      <Layout className="items-center justify-center">
        <p className="text-[#6a6a7a]">Carregando dados do ovo...</p>
      </Layout>
    );
  }

  const maturationPercent = Math.round(eggData.maturationProgress * 100);

  return (
    <Layout className="items-center pt-6 px-4 pb-20">
      {/* Notification */}
      {notification && (
        <FloatingNotification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Title */}
      <h1 className="text-xl font-bold text-[#c4b5fd] mb-2">Seu Ovo</h1>

      {/* Maturation Progress */}
      <div className="w-full max-w-xs mb-4">
        <div className="flex justify-between text-xs text-[#6a6a7a] mb-1">
          <span>Maturação</span>
          <span>{maturationPercent}%</span>
        </div>
        <div className="h-2 bg-[#1a1a24] rounded-full overflow-hidden border border-[#2a2a3a]">
          <div
            className="h-full bg-gradient-to-r from-[#a78bfa] to-[#c4b5fd] transition-all duration-500"
            style={{ width: `${maturationPercent}%` }}
          />
        </div>
      </div>

      {/* Egg */}
      <div
        ref={eggRef}
        onPointerDown={handleEggPointerDown}
        onPointerUp={handleEggPointerUp}
        onPointerLeave={handleEggPointerUp}
        onPointerCancel={handleEggPointerUp}
        className="relative w-40 h-48 flex items-center justify-center cursor-pointer select-none"
      >
        {/* Egg emoji */}
        <div className={`text-8xl ${isHolding ? 'animate-pulse' : 'animate-float'}`}>
          🥚
        </div>

        {/* Hold progress ring */}
        {isHolding && (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#a78bfa"
                strokeWidth="3"
                strokeDasharray={`${holdProgress * 283} 283`}
                transform="rotate(-90 50 50)"
                className="transition-all duration-100"
              />
            </svg>
          </div>
        )}

        {/* Orbs orbiting egg */}
        {eggData.orbsOnEgg.map((orb, index) => {
          const delay = index * 0.5;
          return (
            <div
              key={orb.id}
              className="absolute"
              style={{
                animation: `orbit 4s linear ${delay}s infinite`,
              }}
            >
              <span className="text-2xl">{ELEMENT_EMOJI[orb.element]}</span>
            </div>
          );
        })}
      </div>

      {/* Instruction */}
      <p className="text-xs text-[#6a6a7a] mt-2 text-center">
        {eggData.orbsOnEgg.length > 0
          ? 'Segure o ovo para absorver as energias'
          : 'Arraste orbs para o ovo'}
      </p>

      {/* Timer */}
      <div className="mt-4 text-center">
        <p className="text-xs text-[#6a6a7a]">Próximo orb em</p>
        <p className="text-lg font-mono text-[#a78bfa]">{timeToNextOrb}</p>
      </div>

      {/* Orb Tray */}
      <div className="w-full max-w-xs mt-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-[#6a6a7a]">Energias Disponíveis</span>
          <span className="text-xs text-[#6a6a7a]">{eggData.availableOrbs.length}/8</span>
        </div>
        <div
          className="grid grid-cols-4 gap-2 p-3 bg-[#12121a] rounded-xl border border-[#2a2a3a]"
          onPointerMove={handleDragMove}
          onPointerUp={handleDragEnd}
          onPointerCancel={handleDragEnd}
        >
          {eggData.availableOrbs.map((orb) => (
            <div
              key={orb.id}
              onPointerDown={(e) => handleOrbDragStart(orb, e)}
              className={`
                w-12 h-12 flex items-center justify-center rounded-lg cursor-grab
                bg-[#1a1a24] border border-[#2a2a3a] hover:border-[#a78bfa]/50
                transition-all touch-none select-none
                ${draggedOrb?.id === orb.id ? 'opacity-30' : ''}
              `}
              style={{
                boxShadow: `0 0 12px ${ELEMENT_COLORS[orb.element]}40`,
              }}
            >
              <span className="text-2xl">{ELEMENT_EMOJI[orb.element]}</span>
            </div>
          ))}
          {/* Empty slots */}
          {Array.from({ length: Math.max(0, 8 - eggData.availableOrbs.length) }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="w-12 h-12 rounded-lg bg-[#0a0a0f] border border-[#1a1a24] border-dashed"
            />
          ))}
        </div>
      </div>

      {/* Dragged orb follows cursor */}
      {draggedOrb && (
        <div
          className="fixed pointer-events-none z-50"
          style={{
            left: dragPosition.x - 20,
            top: dragPosition.y - 20,
          }}
        >
          <span className="text-4xl drop-shadow-lg">{ELEMENT_EMOJI[draggedOrb.element]}</span>
        </div>
      )}
    </Layout>
  );
}
