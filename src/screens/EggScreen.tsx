// ============================================================
// ARC: AETHON — EGG SCREEN
// Prompt 10: Visual polish — mystical, magical, emotional.
// Mobile-optimized egg nurturing experience.
// ============================================================

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
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
import { getDominantElement, ELEMENT_GLOW_COLORS, getElementalGlow, getCrackOpacity } from '../utils/elementVisuals';
import FloatingNotification from '../components/FloatingNotification';
import DebugPanel from '../components/DebugPanel';

export default function EggScreen() {
  const { save, updateSave, navigateTo } = useGame();
  const eggData = save?.eggData;

  const [draggedOrb, setDraggedOrb] = useState<Orb | null>(null);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [isHolding, setIsHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [timeToNextOrb, setTimeToNextOrb] = useState('');
  const [showAbsorbed, setShowAbsorbed] = useState(false);
  const [absorbedElement, setAbsorbedElement] = useState<string>('');

  const eggRef = useRef<HTMLDivElement>(null);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const holdStartRef = useRef<number>(0);
  const holdIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Derived visual state
  const dominant = useMemo(() => eggData ? getDominantElement(eggData) : 'balanced' as const, [eggData]);
  const dominantColors = ELEMENT_GLOW_COLORS[dominant];
  const crackOpacity = useMemo(() => eggData ? getCrackOpacity(eggData.maturationProgress) : 0, [eggData]);
  const matPercent = eggData ? Math.round(eggData.maturationProgress * 100) : 0;

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

  // Handle orb drag start
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
      let absorbedEl = '';
      updateSave((prev) => {
        if (!prev.eggData || prev.eggData.orbsOnEgg.length === 0) return prev;

        const orbToAbsorb = prev.eggData.orbsOnEgg[0];
        absorbedEl = orbToAbsorb.element;
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

      setAbsorbedElement(absorbedEl);
      setShowAbsorbed(true);
      setTimeout(() => setShowAbsorbed(false), 2000);

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

  if (!eggData) return null;

  return (
    <Layout className="relative overflow-hidden">
      {showAbsorbed && (
        <FloatingNotification
          message={`✨ O ovo absorveu a energia de ${ELEMENT_EMOJI[absorbedElement] || '✨'}!`}
          type="success"
        />
      )}

      {/* === BACKGROUND: Mystical cave/nest atmosphere === */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Deep gradient base */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#070714] via-[#0a0a18] to-[#0d0b1a]" />
        {/* Radial elemental aura from center */}
        <div
          className="absolute inset-0 opacity-30"
          style={{ background: `radial-gradient(ellipse 60% 50% at 50% 45%, ${dominantColors.glow} 0%, transparent 70%)` }}
        />
        {/* Subtle texture overlay via small radial dots */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}
        />
        {/* Floating ambient particles */}
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${2 + Math.random() * 3}px`,
              height: `${2 + Math.random() * 3}px`,
              left: `${10 + Math.random() * 80}%`,
              top: `${10 + Math.random() * 80}%`,
              backgroundColor: dominantColors.primary,
              opacity: 0.15 + Math.random() * 0.2,
              animation: `float ${4 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      {/* === MAIN CONTENT === */}
      <div className="relative z-10 flex flex-col items-center py-4 gap-4 flex-1">
        {/* Header */}
        <div className="text-center space-y-1">
          <h1 className="text-lg font-bold text-[#c4b5fd]/90 tracking-wide">O Último Ovo</h1>
          <p className="text-xs text-[#6a6a7a]">Ele pulsa com energia antiga...</p>
        </div>

        {/* Energy bars — compact */}
        <div className="flex items-center gap-3 px-3 py-2 bg-[#12121a]/60 rounded-xl border border-[#2a2a3a]/40 backdrop-blur-sm">
          {(['fire', 'water', 'earth'] as const).map((element) => {
            const energy = eggData[`${element}Energy` as keyof typeof eggData] as number;
            const percent = Math.round(energy * 100);
            return (
              <div key={element} className="flex items-center gap-1.5">
                <span className="text-sm">{ELEMENT_EMOJI[element]}</span>
                <div className="w-12 h-1.5 bg-[#1a1a24] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, percent)}%`, backgroundColor: ELEMENT_COLORS[element] }}
                  />
                </div>
                <span className="text-[10px] text-[#6a6a7a] w-7 text-right">{percent}%</span>
              </div>
            );
          })}
        </div>

        {/* Maturation bar */}
        <div className="w-full max-w-[280px] space-y-1">
          <div className="flex items-center justify-between text-[10px] text-[#6a6a7a]">
            <span>Maturação</span>
            <span className="font-medium" style={{ color: dominantColors.primary }}>{matPercent}%</span>
          </div>
          <div className="w-full h-2 bg-[#1a1a24] rounded-full overflow-hidden border border-[#2a2a3a]/30">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${matPercent}%`,
                background: `linear-gradient(90deg, ${dominantColors.primary}, ${dominantColors.secondary})`,
                boxShadow: matPercent > 50 ? `0 0 8px ${dominantColors.glow}` : 'none',
              }}
            />
          </div>
        </div>

        {/* === EGG CONTAINER === */}
        <div className="relative flex items-center justify-center" style={{ width: '220px', height: '260px' }}>
          {/* Outer aura glow */}
          <div
            className="absolute inset-0 rounded-full animate-pulse-soft"
            style={{
              background: `radial-gradient(ellipse at center, ${dominantColors.glow} 0%, transparent 60%)`,
              transform: 'scale(1.3)',
              opacity: 0.5 + (isHolding ? holdProgress * 0.5 : 0),
            }}
          />

          {/* Egg body */}
          <div
            ref={eggRef}
            onPointerDown={handleEggPointerDown}
            onPointerUp={handleEggPointerUp}
            onPointerLeave={handleEggPointerUp}
            className="relative flex items-center justify-center select-none no-select"
            style={{
              width: '150px',
              height: '190px',
              touchAction: 'none',
              cursor: eggData.orbsOnEgg.length > 0 ? 'pointer' : 'default',
            }}
            role="button"
            aria-label={eggData.orbsOnEgg.length > 0 ? 'Segure para absorver energia' : 'Ovo'}
          >
            {/* Egg shape with CSS */}
            <div
              className="absolute inset-0 transition-all duration-500"
              style={{
                borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
                background: `linear-gradient(135deg, #2a2535 0%, #1a1825 30%, #15132a 60%, #0f0e20 100%)`,
                boxShadow: `
                  inset 0 -15px 30px rgba(0,0,0,0.5),
                  inset 0 10px 20px rgba(255,255,255,0.03),
                  ${getElementalGlow(dominant, 0.6 + (isHolding ? holdProgress * 0.8 : 0))}
                `,
                transform: isHolding ? `scale(${1 + holdProgress * 0.05})` : 'scale(1)',
              }}
            >
              {/* Shell highlights */}
              <div
                className="absolute top-[15%] left-[20%] w-[25%] h-[15%] rounded-full opacity-10"
                style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.3), transparent)' }}
              />
              <div
                className="absolute top-[25%] left-[55%] w-[15%] h-[10%] rounded-full opacity-5"
                style={{ background: 'rgba(255,255,255,0.3)' }}
              />

              {/* Elemental spots/marks on the shell */}
              <div
                className="absolute top-[40%] left-[30%] w-3 h-3 rounded-full"
                style={{ backgroundColor: dominantColors.primary, opacity: 0.15, filter: 'blur(3px)' }}
              />
              <div
                className="absolute top-[55%] left-[55%] w-2 h-2 rounded-full"
                style={{ backgroundColor: dominantColors.secondary, opacity: 0.1, filter: 'blur(2px)' }}
              />
              <div
                className="absolute top-[30%] left-[45%] w-2 h-2 rounded-full"
                style={{ backgroundColor: dominantColors.primary, opacity: 0.08, filter: 'blur(2px)' }}
              />

              {/* Cracks that appear as maturation increases */}
              {crackOpacity > 0 && (
                <>
                  <div className="absolute top-[35%] left-[40%] w-[20%] h-[1px] rotate-[30deg] transition-opacity duration-1000"
                    style={{ backgroundColor: dominantColors.primary, opacity: crackOpacity * 0.6, boxShadow: `0 0 4px ${dominantColors.glow}` }}
                  />
                  <div className="absolute top-[38%] left-[45%] w-[15%] h-[1px] rotate-[-20deg] transition-opacity duration-1000"
                    style={{ backgroundColor: dominantColors.primary, opacity: crackOpacity * 0.4, boxShadow: `0 0 3px ${dominantColors.glow}` }}
                  />
                  <div className="absolute top-[42%] left-[35%] w-[12%] h-[1px] rotate-[60deg] transition-opacity duration-1000"
                    style={{ backgroundColor: dominantColors.secondary, opacity: crackOpacity * 0.3, boxShadow: `0 0 3px ${dominantColors.glow}` }}
                  />
                </>
              )}

              {/* Inner glow / breathing */}
              <div
                className="absolute inset-[15%] rounded-full animate-pulse-soft"
                style={{
                  background: `radial-gradient(circle at 40% 40%, ${dominantColors.glow} 0%, transparent 60%)`,
                  opacity: 0.3,
                }}
              />
            </div>

            {/* Egg emoji overlay for familiar recognition */}
            <span className="relative z-10 text-5xl select-none drop-shadow-lg" style={{
              filter: `drop-shadow(0 0 8px ${dominantColors.glow})`,
            }}>
              🥚
            </span>

            {/* Hold progress ring */}
            {isHolding && (
              <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none z-20" viewBox="0 0 150 190">
                <ellipse
                  cx="75" cy="95" rx="68" ry="88"
                  fill="none"
                  stroke={dominantColors.primary}
                  strokeWidth="3"
                  strokeDasharray={`${holdProgress * 500} 500`}
                  strokeLinecap="round"
                  className="transition-all duration-100"
                  style={{ filter: `drop-shadow(0 0 6px ${dominantColors.glow})` }}
                />
              </svg>
            )}

            {/* Orbiting orbs */}
            {eggData.orbsOnEgg.map((orb, index) => {
              const delay = index * 0.8;
              return (
                <div
                  key={orb.id}
                  className="absolute pointer-events-none"
                  style={{
                    top: '50%',
                    left: '50%',
                    width: '32px',
                    height: '32px',
                    marginTop: '-16px',
                    marginLeft: '-16px',
                    animation: `orbit ${5 + index * 0.5}s linear infinite`,
                    animationDelay: `${delay}s`,
                  }}
                >
                  <span
                    className="text-xl block"
                    style={{
                      filter: `drop-shadow(0 0 6px ${ELEMENT_COLORS[orb.element]}80)`,
                    }}
                  >
                    {ELEMENT_EMOJI[orb.element]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Instructions */}
        <div className="text-center space-y-1">
          <p className="text-sm text-[#a0a0b8]">
            {eggData.orbsOnEgg.length > 0
              ? '☝️ Segure o ovo para absorver'
              : '👆 Arraste orbs para o ovo'}
          </p>
          {eggData.orbsOnEgg.length >= ORB_ON_EGG_MAX && (
            <p className="text-xs text-amber-400/70">Máximo de orbs no ovo atingido</p>
          )}
        </div>

        {/* Void energy indicator (subtle) */}
        {eggData.voidEnergy > 0.05 && (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-purple-950/30 rounded-full border border-purple-800/20">
            <span className="text-xs">🌑</span>
            <span className="text-[10px] text-purple-400/60">Vazio: {Math.round(eggData.voidEnergy * 100)}%</span>
          </div>
        )}

        {/* Timer */}
        <div className="flex items-center gap-2 text-xs text-[#6a6a7a]">
          <span>⏳</span>
          <span>Próximo orb em</span>
          <span className="font-mono text-[#a78bfa]/70">{timeToNextOrb}</span>
        </div>

        {/* === ORB TRAY === */}
        <div className="w-full space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-medium text-[#a0a0b8]">Energias Disponíveis</span>
            <span className="text-[10px] text-[#6a6a7a] bg-[#1a1a24] px-2 py-0.5 rounded-full">
              {eggData.availableOrbs.length}/8
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {eggData.availableOrbs.map((orb) => (
              <div
                key={orb.id}
                onPointerDown={(e) => handleOrbDragStart(orb, e)}
                className={`
                  aspect-square flex items-center justify-center rounded-xl
                  bg-[#12121a]/80 border-2 border-[#2a2a3a]/60
                  hover:border-[#a78bfa]/50 active:border-[#a78bfa]
                  transition-all cursor-grab active:cursor-grabbing
                  select-none text-2xl sm:text-3xl
                  min-h-[52px] min-w-[52px]
                  backdrop-blur-sm
                  ${draggedOrb?.id === orb.id ? 'opacity-30 scale-95' : ''}
                `}
                style={{
                  touchAction: 'none',
                  boxShadow: `0 0 12px ${ELEMENT_COLORS[orb.element]}25, inset 0 0 8px ${ELEMENT_COLORS[orb.element]}10`,
                  animation: 'pulse-soft 3s ease-in-out infinite',
                  animationDelay: `${Math.random() * 2}s`,
                }}
                role="button"
                aria-label={`Orb de ${orb.element}`}
              >
                <span style={{ filter: `drop-shadow(0 0 4px ${ELEMENT_COLORS[orb.element]}80)` }}>
                  {ELEMENT_EMOJI[orb.element]}
                </span>
              </div>
            ))}
            {/* Empty slots */}
            {Array.from({ length: Math.max(0, 8 - eggData.availableOrbs.length) }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square rounded-xl bg-[#0e0e18]/40 border border-[#1a1a24]/40 min-h-[52px] min-w-[52px]" />
            ))}
          </div>
        </div>
      </div>

      {/* Dragged orb follows pointer */}
      {draggedOrb && (
        <div
          className="fixed pointer-events-none z-50 text-3xl"
          style={{
            left: dragPosition.x - 20,
            top: dragPosition.y - 20,
            filter: `drop-shadow(0 0 12px ${ELEMENT_COLORS[draggedOrb.element]}90)`,
            transform: 'scale(1.3)',
          }}
        >
          {ELEMENT_EMOJI[draggedOrb.element]}
        </div>
      )}

      <DebugPanel />
    </Layout>
  );
}
