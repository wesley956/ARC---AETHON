// ============================================================
// ARC: AETHON — EGG SCREEN
// Mobile-optimized egg nurturing experience.
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
    const updateTimer = () => {
      const remaining = getTimeUntilNextOrb(eggData.lastOrbGenTime);
      setTimeToNextOrb(formatTimeRemaining(remaining));
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [eggData]);

  // Check if egg is ready to hatch
  useEffect(() => {
    if (eggData && eggData.maturationProgress >= 1.0) {
      navigateTo('HatchScene');
    }
  }, [eggData, navigateTo]);

  // Handle orb drag start (touch and mouse)
  const handleOrbDragStart = useCallback((orb: Orb, e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggedOrb(orb);
    setDragPosition({ x: e.clientX, y: e.clientY });
  }, []);

  // Handle drag move and drop
  useEffect(() => {
    if (!draggedOrb) return;

    const handleMove = (e: PointerEvent) => {
      e.preventDefault();
      setDragPosition({ x: e.clientX, y: e.clientY });
    };

    const handleUp = (e: PointerEvent) => {
      e.preventDefault();
      
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

    // Use capture to prevent scroll during drag
    window.addEventListener('pointermove', handleMove, { passive: false });
    window.addEventListener('pointerup', handleUp);
    window.addEventListener('pointercancel', handleUp);
    
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
      window.removeEventListener('pointercancel', handleUp);
    };
  }, [draggedOrb, dragPosition, eggData, updateSave]);

  // Hold to absorb
  const handleEggPointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
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
      <Layout className="items-center justify-center px-6">
        <p className="text-[#6a6a7a]">Erro: dados do ovo não encontrados.</p>
      </Layout>
    );
  }

  const maturationPercent = Math.round(eggData.maturationProgress * 100);

  return (
    <Layout className="pt-4 px-4 pb-20 overflow-y-auto">
      {/* Maturation Progress */}
      <div className="text-center mb-4">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-xs text-[#6a6a7a] uppercase tracking-wide">Maturação</span>
          <span className="text-lg font-bold text-[#a78bfa]">{maturationPercent}%</span>
        </div>
        <div className="w-full max-w-[200px] mx-auto h-2.5 bg-[#1a1a24] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#a78bfa] to-[#c4b5fd] rounded-full transition-all duration-500"
            style={{ width: `${maturationPercent}%` }}
          />
        </div>
      </div>

      {/* Energy Bars */}
      <div className="flex justify-center gap-3 mb-4 px-2">
        {(['fire', 'water', 'earth'] as const).map((element) => {
          const energy = eggData[`${element}Energy` as keyof typeof eggData] as number;
          const percent = Math.round(energy * 100);
          return (
            <div key={element} className="flex flex-col items-center gap-1 flex-1 max-w-[80px]">
              <span className="text-lg">{ELEMENT_EMOJI[element]}</span>
              <div className="w-full h-1.5 bg-[#1a1a24] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ 
                    width: `${percent}%`,
                    backgroundColor: ELEMENT_COLORS[element]
                  }}
                />
              </div>
              <span className="text-[10px] text-[#6a6a7a]">{percent}%</span>
            </div>
          );
        })}
      </div>

      {/* Egg Container */}
      <div className="relative flex items-center justify-center mb-4" style={{ minHeight: '180px' }}>
        <div
          ref={eggRef}
          className="
            relative w-36 h-36 sm:w-40 sm:h-40 
            flex items-center justify-center 
            cursor-pointer select-none
          "
          style={{ touchAction: 'none' }}
          onPointerDown={handleEggPointerDown}
          onPointerUp={handleEggPointerUp}
          onPointerLeave={handleEggPointerUp}
          onPointerCancel={handleEggPointerUp}
          role="button"
          aria-label={eggData.orbsOnEgg.length > 0 ? 'Segure para absorver energia' : 'Ovo'}
        >
          {/* Egg emoji */}
          <div 
            className={`text-7xl sm:text-8xl ${isHolding ? 'animate-glow' : 'animate-float'}`}
            style={{
              filter: isHolding ? `drop-shadow(0 0 20px #a78bfa)` : 'none'
            }}
          >
            🥚
          </div>

          {/* Hold progress ring */}
          {isHolding && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <svg className="w-28 h-28 sm:w-32 sm:h-32" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#2a2a3a" strokeWidth="4" />
                <circle
                  cx="50" cy="50" r="45"
                  fill="none" stroke="#a78bfa" strokeWidth="4"
                  strokeDasharray={`${holdProgress * 283} 283`}
                  strokeLinecap="round"
                  transform="rotate(-90 50 50)"
                  className="transition-all duration-100"
                />
              </svg>
            </div>
          )}

          {/* Orbiting orbs */}
          {eggData.orbsOnEgg.map((orb, index) => {
            const delay = index * 0.8;
            return (
              <div
                key={orb.id}
                className="absolute text-xl pointer-events-none animate-orbit"
                style={{
                  animationDelay: `${-delay}s`,
                  animationDuration: `${4 + index * 0.5}s`,
                }}
              >
                {ELEMENT_EMOJI[orb.element]}
              </div>
            );
          })}
        </div>
      </div>

      {/* Instructions */}
      <div className="text-center mb-4">
        <p className="text-sm text-[#a0a0b0]">
          {eggData.orbsOnEgg.length > 0
            ? '☝️ Segure o ovo para absorver'
            : '👆 Arraste orbs para o ovo'}
        </p>
        {eggData.orbsOnEgg.length >= ORB_ON_EGG_MAX && (
          <p className="text-xs text-[#6a6a7a] mt-1">
            Máximo de orbs no ovo atingido
          </p>
        )}
      </div>

      {/* Timer */}
      <div className="text-center mb-4 bg-[#12121a]/50 rounded-lg py-2 px-4 mx-auto max-w-[200px]">
        <span className="text-xs text-[#6a6a7a] block">Próximo orb em</span>
        <span className="text-base font-mono text-[#a78bfa]">{timeToNextOrb}</span>
      </div>

      {/* Orb Tray */}
      <div className="bg-[#12121a]/50 rounded-xl border border-[#2a2a3a]/50 p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-[#e8e8ec]">Energias Disponíveis</span>
          <span className="text-xs text-[#6a6a7a] bg-[#1a1a24] px-2 py-0.5 rounded">
            {eggData.availableOrbs.length}/8
          </span>
        </div>
        <div className="grid grid-cols-4 gap-2.5">
          {eggData.availableOrbs.map((orb) => (
            <div
              key={orb.id}
              onPointerDown={(e) => handleOrbDragStart(orb, e)}
              className={`
                aspect-square flex items-center justify-center rounded-xl
                bg-[#1a1a24] border-2 border-[#2a2a3a] 
                hover:border-[#a78bfa]/50 active:border-[#a78bfa]
                transition-all cursor-grab active:cursor-grabbing
                select-none text-2xl sm:text-3xl
                min-h-[52px] min-w-[52px]
                ${draggedOrb?.id === orb.id ? 'opacity-30 scale-95' : ''}
              `}
              style={{
                touchAction: 'none',
                boxShadow: `0 0 12px ${ELEMENT_COLORS[orb.element]}30`,
              }}
              role="button"
              aria-label={`Orb de ${orb.element}`}
            >
              {ELEMENT_EMOJI[orb.element]}
            </div>
          ))}
          {/* Empty slots */}
          {Array.from({ length: Math.max(0, 8 - eggData.availableOrbs.length) }).map((_, i) => (
            <div 
              key={`empty_${i}`} 
              className="
                aspect-square rounded-xl bg-[#1a1a24]/30 border border-[#2a2a3a]/30
                min-h-[52px] min-w-[52px]
              " 
            />
          ))}
        </div>
      </div>

      {/* Dragged orb follows pointer */}
      {draggedOrb && (
        <div
          className="fixed pointer-events-none z-50 text-4xl"
          style={{
            left: dragPosition.x - 20,
            top: dragPosition.y - 20,
            filter: `drop-shadow(0 0 10px ${ELEMENT_COLORS[draggedOrb.element]})`,
          }}
        >
          {ELEMENT_EMOJI[draggedOrb.element]}
        </div>
      )}
    </Layout>
  );
}
