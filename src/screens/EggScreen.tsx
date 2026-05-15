// ============================================================
// ARC: AETHON — EGG SCREEN
// ============================================================

import { useState, useCallback, useEffect, useRef } from 'react';
import Layout from '../components/Layout';
import { useGame } from '../context/GameContext';
import {
  ELEMENT_EMOJI,
  ELEMENT_COLORS,
  ORB_ON_EGG_MAX,
  ENERGY_PER_ORB,
  VOID_ENERGY_PER_ABSORPTION,
  VOID_ENERGY_MAX,
  MATURATION_PER_ORB,
  ABSORPTION_HOLD_TIME_MS,
  EGG_DROP_RADIUS,
} from '../constants/gameConstants';
import { Orb } from '../types/game';
import { getTimeUntilNextOrb, formatTimeRemaining } from '../systems/TimeManager';

export default function EggScreen() {
  const { save, updateSave, navigateTo } = useGame();
  const eggData = save?.eggData;

  const [draggedOrb, setDraggedOrb] = useState<Orb | null>(null);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [isHolding, setIsHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [timeToNextOrb, setTimeToNextOrb] = useState('');

  const eggRef = useRef<HTMLDivElement>(null);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const holdStartRef = useRef<number>(0);
  const holdIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Update orb timer
  useEffect(() => {
    if (!eggData) return;
    const interval = setInterval(() => {
      const remaining = getTimeUntilNextOrb(eggData.lastOrbGenTime);
      setTimeToNextOrb(formatTimeRemaining(remaining));
    }, 1000);
    return () => clearInterval(interval);
  }, [eggData]);

  // Check if egg is ready to hatch
  useEffect(() => {
    if (eggData && eggData.maturationProgress >= 1.0) {
      navigateTo('HatchScene');
    }
  }, [eggData, navigateTo]);

  const handleOrbDragStart = useCallback((orb: Orb, e: React.PointerEvent) => {
    e.preventDefault();
    setDraggedOrb(orb);
    setDragPosition({ x: e.clientX, y: e.clientY });
  }, []);

  useEffect(() => {
    if (!draggedOrb) return;

    const handleMove = (e: PointerEvent) => {
      setDragPosition({ x: e.clientX, y: e.clientY });
    };

    const handleUp = () => {
      if (!eggRef.current || !draggedOrb || !eggData) {
        setDraggedOrb(null);
        return;
      }

      const eggRect = eggRef.current.getBoundingClientRect();
      const eggCenterX = eggRect.left + eggRect.width / 2;
      const eggCenterY = eggRect.top + eggRect.height / 2;
      const dx = dragPosition.x - eggCenterX;
      const dy = dragPosition.y - eggCenterY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance <= EGG_DROP_RADIUS && eggData.orbsOnEgg.length < ORB_ON_EGG_MAX) {
        updateSave((prev) => {
          if (!prev.eggData) return prev;
          return {
            ...prev,
            eggData: {
              ...prev.eggData,
              availableOrbs: prev.eggData.availableOrbs.filter(o => o.id !== draggedOrb.id),
              orbsOnEgg: [...prev.eggData.orbsOnEgg, draggedOrb],
            },
          };
        });
      }

      setDraggedOrb(null);
    };

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };
  }, [draggedOrb, dragPosition, eggData, updateSave]);

  // Hold to absorb
  const handleEggPointerDown = useCallback(() => {
    if (!eggData || eggData.orbsOnEgg.length === 0) return;

    setIsHolding(true);
    holdStartRef.current = Date.now();

    holdIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - holdStartRef.current;
      setHoldProgress(Math.min(1, elapsed / ABSORPTION_HOLD_TIME_MS));
    }, 50);

    holdTimerRef.current = setTimeout(() => {
      // Absorb!
      updateSave((prev) => {
        if (!prev.eggData || prev.eggData.orbsOnEgg.length === 0) return prev;

        const orbToAbsorb = prev.eggData.orbsOnEgg[0];
        const elementKey = `${orbToAbsorb.element}Energy` as keyof typeof prev.eggData;
        const currentEnergy = (prev.eggData[elementKey] as number) || 0;

        return {
          ...prev,
          eggData: {
            ...prev.eggData,
            [elementKey]: currentEnergy + ENERGY_PER_ORB,
            voidEnergy: Math.min(VOID_ENERGY_MAX, prev.eggData.voidEnergy + VOID_ENERGY_PER_ABSORPTION),
            maturationProgress: Math.min(1.0, prev.eggData.maturationProgress + MATURATION_PER_ORB),
            orbsOnEgg: prev.eggData.orbsOnEgg.slice(1),
          },
        };
      });

      setIsHolding(false);
      setHoldProgress(0);
      if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
    }, ABSORPTION_HOLD_TIME_MS);
  }, [eggData, updateSave]);

  const handleEggPointerUp = useCallback(() => {
    setIsHolding(false);
    setHoldProgress(0);
    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
  }, []);

  if (!eggData) {
    return (
      <Layout className="items-center justify-center">
        <p className="text-[#6a6a7a]">Erro: dados do ovo não encontrados.</p>
      </Layout>
    );
  }

  const maturationPercent = Math.round(eggData.maturationProgress * 100);

  return (
    <Layout className="pt-4 px-4 pb-24">
      {/* Maturation */}
      <div className="text-center mb-6">
        <span className="text-xs text-[#6a6a7a]">Maturação</span>
        <p className="text-lg font-bold text-[#a78bfa]">{maturationPercent}%</p>
        <div className="w-full max-w-xs mx-auto h-2 bg-[#1a1a24] rounded-full overflow-hidden mt-1">
          <div
            className="h-full bg-gradient-to-r from-[#a78bfa] to-[#c4b5fd] rounded-full transition-all duration-500"
            style={{ width: `${maturationPercent}%` }}
          />
        </div>
      </div>

      {/* Egg */}
      <div
        ref={eggRef}
        className="relative w-40 h-40 mx-auto mb-8 flex items-center justify-center cursor-pointer select-none touch-none"
        onPointerDown={handleEggPointerDown}
        onPointerUp={handleEggPointerUp}
        onPointerLeave={handleEggPointerUp}
      >
        <div className={`text-8xl ${isHolding ? 'animate-glow' : 'animate-float'}`}>
          🥚
        </div>

        {isHolding && (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-32 h-32" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="#2a2a3a" strokeWidth="3" />
              <circle
                cx="50" cy="50" r="45"
                fill="none" stroke="#a78bfa" strokeWidth="3"
                strokeDasharray={`${holdProgress * 283} 283`}
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
              />
            </svg>
          </div>
        )}

        {/* Orbiting orbs */}
        {eggData.orbsOnEgg.map((orb, index) => {
          const delay = index * 0.5;
          return (
            <div
              key={orb.id}
              className="absolute text-xl animate-orbit"
              style={{
                animationDelay: `${-delay}s`,
                animationDuration: `${3 + index * 0.5}s`,
              }}
            >
              {ELEMENT_EMOJI[orb.element]}
            </div>
          );
        })}
      </div>

      {/* Instruction */}
      <p className="text-center text-sm text-[#6a6a7a] mb-4">
        {eggData.orbsOnEgg.length > 0
          ? 'Segure o ovo para absorver as energias'
          : 'Arraste orbs para o ovo'}
      </p>

      {/* Timer */}
      <div className="text-center mb-6">
        <span className="text-xs text-[#6a6a7a]">Próximo orb em</span>
        <p className="text-sm font-mono text-[#a78bfa]">{timeToNextOrb}</p>
      </div>

      {/* Orb Tray */}
      <div className="bg-[#12121a]/50 rounded-xl border border-[#2a2a3a]/50 p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-[#e8e8ec]">Energias Disponíveis</span>
          <span className="text-xs text-[#6a6a7a]">{eggData.availableOrbs.length}/8</span>
        </div>
        <div className="grid grid-cols-4 gap-2">
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
              {ELEMENT_EMOJI[orb.element]}
            </div>
          ))}
          {Array.from({ length: Math.max(0, 8 - eggData.availableOrbs.length) }).map((_, i) => (
            <div key={`empty_${i}`} className="w-12 h-12 rounded-lg bg-[#1a1a24]/30 border border-[#2a2a3a]/30" />
          ))}
        </div>
      </div>

      {/* Dragged orb follows cursor */}
      {draggedOrb && (
        <div
          className="fixed pointer-events-none z-50 text-3xl"
          style={{
            left: dragPosition.x - 16,
            top: dragPosition.y - 16,
          }}
        >
          {ELEMENT_EMOJI[draggedOrb.element]}
        </div>
      )}
    </Layout>
  );
}
