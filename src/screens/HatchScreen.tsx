// ============================================================
// ARC: AETHON — HATCH SCREEN
// The most important moment in the game: dragon birth.
//
// SEQUENCE:
// 1. PREPARING - Load data, resolve type
// 2. CRACKING - Egg shakes, cracks appear
// 3. PULSE - Elemental energy pulses
// 4. BURST - Egg bursts with light
// 5. REVEAL - Show dragon type and narrative
// 6. NAMING - Player names the dragon
// 7. COMPLETE - Create dragon, update save
//
// IMPORTANT:
// - After confirming name, eggData becomes null
// - The error check must NOT trigger during 'complete' phase
// - The transition to DragonScreen is irreversible
// ============================================================

import { useState, useEffect, useRef, useCallback } from 'react';
import Layout from '../components/Layout';
import { useGame } from '../context/GameContext';
import {
  resolveDragonType,
  getDragonNarrativePhrase,
  ResolvedDragonType,
} from '../systems/DragonTypeResolver';
import { createDragonData, validateDragonName } from '../systems/DragonFactory';
import {
  ELEMENT_COLORS,
  ELEMENT_EMOJI,
  HATCH_PHASE_DURATIONS,
} from '../constants/gameConstants';

type HatchPhase =
  | 'preparing'
  | 'cracking'
  | 'pulse'
  | 'burst'
  | 'reveal'
  | 'naming'
  | 'complete'
  | 'error';

export default function HatchScreen() {
  const { save, updateSave, navigateTo } = useGame();
  const egg = save?.eggData;

  // Phase state
  const [phase, setPhase] = useState<HatchPhase>('preparing');
  const [resolvedType, setResolvedType] = useState<ResolvedDragonType | null>(null);
  const [narrativePhrase, setNarrativePhrase] = useState('');

  // Naming state
  const [dragonName, setDragonName] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Visual state
  const [showCracks, setShowCracks] = useState(false);
  const [showFlash, setShowFlash] = useState(false);

  // Finalization flag - prevents error state after save transition
  const isFinalizingRef = useRef(false);

  // Refs for cleanup
  const phaseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (phaseTimerRef.current) {
        clearTimeout(phaseTimerRef.current);
      }
    };
  }, []);

  // Phase sequence logic
  useEffect(() => {
    // CRITICAL: Don't show error during finalization or complete phase
    // After confirming name, eggData becomes null, but that's expected
    if (!egg && !isFinalizingRef.current && phase !== 'complete' && phase !== 'error') {
      setPhase('error');
      return;
    }

    // If we're finalizing or complete, don't process phases that need egg
    if (!egg) return;

    // Handle phase transitions
    const advancePhase = (nextPhase: HatchPhase, delay: number) => {
      phaseTimerRef.current = setTimeout(() => {
        setPhase(nextPhase);
      }, delay);
    };

    switch (phase) {
      case 'preparing':
        // Resolve dragon type
        const resolved = resolveDragonType(egg);
        setResolvedType(resolved);
        setNarrativePhrase(getDragonNarrativePhrase(resolved.dragonTypeId, resolved.voidTouched));
        advancePhase('cracking', HATCH_PHASE_DURATIONS.preparing);
        break;

      case 'cracking':
        setShowCracks(true);
        advancePhase('pulse', HATCH_PHASE_DURATIONS.cracking);
        break;

      case 'pulse':
        advancePhase('burst', HATCH_PHASE_DURATIONS.pulse);
        break;

      case 'burst':
        setShowFlash(true);
        advancePhase('reveal', HATCH_PHASE_DURATIONS.burst);
        break;

      case 'reveal':
        // Wait for player to continue
        break;

      case 'naming':
        // Wait for player input
        break;

      case 'complete':
        // Handled by handleConfirmName
        break;

      case 'error':
        // Show error state
        break;
    }

    return () => {
      if (phaseTimerRef.current) {
        clearTimeout(phaseTimerRef.current);
      }
    };
  }, [phase, egg]);

  // Handle name submission
  const handleConfirmName = useCallback(() => {
    if (!resolvedType || isSubmitting) return;

    const error = validateDragonName(dragonName);
    if (error) {
      setNameError(error);
      return;
    }

    setNameError(null);
    setIsSubmitting(true);
    
    // CRITICAL: Mark as finalizing BEFORE setting phase and updating save
    // This prevents the error check from triggering when eggData becomes null
    isFinalizingRef.current = true;
    setPhase('complete');

    // Create dragon data
    const newDragonData = createDragonData(resolvedType, dragonName);

    // Small delay for visual feedback, then update save and navigate
    setTimeout(() => {
      // Update save - this makes eggData null
      updateSave((prev) => ({
        ...prev,
        hasEgg: false,
        eggData: null,
        hasDragon: true,
        dragonData: newDragonData,
      }));

      // Navigate to dragon screen after save is updated
      setTimeout(() => {
        navigateTo('DragonActive');
      }, 500);
    }, HATCH_PHASE_DURATIONS.complete);
  }, [resolvedType, dragonName, isSubmitting, updateSave, navigateTo]);

  // Handle continue to naming
  const handleContinueToNaming = useCallback(() => {
    setPhase('naming');
  }, []);

  // Get element color for visuals
  const elementColor = resolvedType
    ? ELEMENT_COLORS[resolvedType.dominantElement] || ELEMENT_COLORS.fire
    : ELEMENT_COLORS.fire;

  const elementEmoji = resolvedType
    ? ELEMENT_EMOJI[resolvedType.dominantElement] || '🐉'
    : '🐉';

  // Error state - only shown if error occurred BEFORE finalization
  if (phase === 'error') {
    return (
      <Layout className="items-center justify-center px-6">
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="text-6xl">⚠️</div>
          <h1 className="text-2xl font-bold text-red-400">Erro no Nascimento</h1>
          <p className="text-aethon-muted text-sm max-w-xs">
            Não foi possível encontrar os dados do ovo. O save pode estar inconsistente.
          </p>
          <button
            onClick={() => navigateTo('InvalidSaveState')}
            className="px-4 py-2 bg-red-900/30 border border-red-700 rounded-lg text-red-300 text-sm"
          >
            Ver detalhes do erro
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout className="items-center justify-center px-6 overflow-hidden">
      {/* Screen flash effect */}
      {showFlash && (
        <div
          className="fixed inset-0 z-50 pointer-events-none animate-screen-flash"
          style={{ backgroundColor: elementColor }}
        />
      )}

      {/* PREPARING / CRACKING / PULSE phases */}
      {(phase === 'preparing' || phase === 'cracking' || phase === 'pulse') && (
        <div className="flex flex-col items-center gap-6 text-center">
          {/* Egg with effects */}
          <div className="relative">
            {/* Elemental glow background */}
            <div
              className={`
                absolute inset-0 rounded-full pointer-events-none
                ${phase === 'pulse' ? 'animate-elemental-pulse' : 'animate-pulse-glow'}
              `}
              style={{
                background: `radial-gradient(circle, ${elementColor}33 0%, transparent 70%)`,
                transform: 'scale(3)',
              }}
            />

            {/* The Egg */}
            <div
              className={`
                text-8xl select-none relative
                ${phase === 'cracking' ? 'animate-egg-shake' : ''}
                ${phase === 'pulse' ? 'animate-elemental-pulse' : ''}
              `}
            >
              🥚

              {/* Cracks overlay */}
              {showCracks && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-4xl animate-crack-appear opacity-70">💥</div>
                </div>
              )}
            </div>
          </div>

          {/* Phase text */}
          <div className="min-h-[60px]">
            {phase === 'preparing' && (
              <p className="text-aethon-text text-lg animate-fade-in">
                Algo se move dentro da casca...
              </p>
            )}
            {phase === 'cracking' && (
              <p className="text-aethon-text text-lg animate-fade-in">
                A casca estala. Rachaduras surgem.
              </p>
            )}
            {phase === 'pulse' && (
              <p className="text-aethon-text text-lg animate-fade-in" style={{ color: elementColor }}>
                A energia acumulada responde.
              </p>
            )}
          </div>
        </div>
      )}

      {/* BURST phase */}
      {phase === 'burst' && (
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="relative">
            {/* Burst effect */}
            <div
              className="absolute inset-0 rounded-full animate-hatch-burst"
              style={{
                background: `radial-gradient(circle, ${elementColor} 0%, transparent 70%)`,
                transform: 'scale(2)',
              }}
            />
            <div className="text-8xl animate-hatch-burst">🥚</div>
          </div>
        </div>
      )}

      {/* REVEAL phase */}
      {phase === 'reveal' && resolvedType && (
        <div className="flex flex-col items-center gap-6 text-center max-w-sm">
          {/* Dragon visual */}
          <div className="relative animate-dragon-reveal">
            {/* Element glow */}
            <div
              className="absolute inset-0 rounded-full animate-pulse-glow"
              style={{
                background: `radial-gradient(circle, ${elementColor}44 0%, transparent 70%)`,
                transform: 'scale(2.5)',
              }}
            />
            <div className="text-8xl">🐉</div>
            {/* Element badge */}
            <div
              className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-3xl"
              style={{ filter: `drop-shadow(0 0 8px ${elementColor})` }}
            >
              {elementEmoji}
            </div>
          </div>

          {/* Dragon type name */}
          <h1
            className="text-2xl font-bold animate-text-fade-in"
            style={{ color: elementColor, animationDelay: '0.2s', opacity: 0 }}
          >
            {resolvedType.dragonTypeName}
          </h1>

          {/* Narrative phrase */}
          <p
            className="text-aethon-text text-sm leading-relaxed animate-text-fade-in whitespace-pre-line"
            style={{ animationDelay: '0.4s', opacity: 0 }}
          >
            {narrativePhrase}
          </p>

          {/* Continue button */}
          <button
            onClick={handleContinueToNaming}
            className="mt-4 px-6 py-3 bg-aethon-accent/20 border border-aethon-accent/40 rounded-xl text-aethon-glow font-medium hover:bg-aethon-accent/30 active:scale-95 transition-all animate-text-fade-in"
            style={{ animationDelay: '0.6s', opacity: 0 }}
          >
            Dar um nome
          </button>
        </div>
      )}

      {/* NAMING phase */}
      {phase === 'naming' && resolvedType && (
        <div className="flex flex-col items-center gap-6 text-center w-full max-w-sm animate-fade-in">
          {/* Dragon visual (smaller) */}
          <div className="relative">
            <div
              className="absolute inset-0 rounded-full animate-pulse-glow"
              style={{
                background: `radial-gradient(circle, ${elementColor}33 0%, transparent 70%)`,
                transform: 'scale(2)',
              }}
            />
            <div className="text-6xl">🐉</div>
          </div>

          {/* Type name */}
          <h2 className="text-lg font-medium" style={{ color: elementColor }}>
            {resolvedType.dragonTypeName}
          </h2>

          {/* Naming prompt */}
          <p className="text-aethon-muted text-sm">
            Como você vai chamá-lo?
          </p>

          {/* Name input */}
          <div className="w-full">
            <input
              type="text"
              value={dragonName}
              onChange={(e) => {
                setDragonName(e.target.value);
                setNameError(null);
              }}
              placeholder="Digite o nome..."
              maxLength={20}
              className="w-full px-4 py-3 bg-aethon-card border border-aethon-border rounded-xl text-aethon-text text-center text-lg placeholder:text-aethon-muted/50 focus:outline-none focus:border-aethon-accent transition-colors"
              autoFocus
              disabled={isSubmitting}
            />

            {/* Character count */}
            <p className="text-[10px] text-aethon-muted mt-1 text-right">
              {dragonName.length}/20
            </p>

            {/* Error message */}
            {nameError && (
              <p className="text-red-400 text-xs mt-2 animate-fade-in">
                {nameError}
              </p>
            )}
          </div>

          {/* Confirm button */}
          <button
            onClick={handleConfirmName}
            disabled={isSubmitting || !dragonName.trim()}
            className={`
              w-full px-6 py-3 rounded-xl font-medium transition-all
              ${
                isSubmitting || !dragonName.trim()
                  ? 'bg-aethon-card/50 text-aethon-muted border border-aethon-border/50 cursor-not-allowed'
                  : 'bg-aethon-accent/20 border border-aethon-accent/40 text-aethon-glow hover:bg-aethon-accent/30 active:scale-95'
              }
            `}
          >
            {isSubmitting ? '✨ Nascendo...' : 'Confirmar nome'}
          </button>
        </div>
      )}

      {/* COMPLETE phase */}
      {phase === 'complete' && (
        <div className="flex flex-col items-center gap-6 text-center animate-fade-in">
          <div className="text-6xl animate-pulse-glow">🐉</div>
          <p className="text-aethon-glow text-lg font-medium">
            {dragonName} nasceu.
          </p>
          <p className="text-aethon-muted text-sm">
            Uma nova jornada começa...
          </p>
        </div>
      )}
    </Layout>
  );
}
