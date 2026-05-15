// ============================================================
// ARC: AETHON — HATCH SCREEN
// Prompt 10: Visual polish — mystical birth sequence.
// Mobile-optimized hatching experience.
// ============================================================

import { useState, useEffect, useMemo } from 'react';
import Layout from '../components/Layout';
import { useGame } from '../context/GameContext';
import { resolveDragonType, getDragonNarrativePhrase } from '../systems/DragonTypeResolver';
import { createDragonData, validateDragonName } from '../systems/DragonFactory';
import { ELEMENT_EMOJI, ELEMENT_COLORS, HATCH_PHASE_DURATIONS, HatchPhase } from '../constants/gameConstants';
import { getDominantElement, ELEMENT_GLOW_COLORS } from '../utils/elementVisuals';

export default function HatchScreen() {
  const { save, updateSave } = useGame();
  const eggData = save?.eggData;

  const [phase, setPhase] = useState<HatchPhase>('preparing');
  const [dragonName, setDragonName] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Resolve dragon type from egg data
  const resolvedType = useMemo(() => {
    if (!eggData) return null;
    return resolveDragonType(eggData);
  }, [eggData]);

  // Get dominant element colors
  const dominant = useMemo(() => eggData ? getDominantElement(eggData) : 'balanced' as const, [eggData]);
  const dominantColors = ELEMENT_GLOW_COLORS[dominant];

  // Auto-advance through phases
  useEffect(() => {
    const duration = HATCH_PHASE_DURATIONS[phase];
    if (duration === 0) return; // Manual advance phases

    const timer = setTimeout(() => {
      const phases: HatchPhase[] = ['preparing', 'cracking', 'pulse', 'burst', 'reveal', 'naming', 'complete'];
      const currentIndex = phases.indexOf(phase);
      if (currentIndex < phases.length - 1) {
        setPhase(phases[currentIndex + 1]);
      }
    }, duration);

    return () => clearTimeout(timer);
  }, [phase]);

  // Handle name submission
  const handleNameSubmit = async () => {
    const error = validateDragonName(dragonName);
    if (error) {
      setNameError(error);
      return;
    }

    if (!resolvedType || !eggData) return;

    setIsSubmitting(true);
    setNameError(null);

    // Small delay for effect
    await new Promise(resolve => setTimeout(resolve, 500));

    const newDragonData = createDragonData(resolvedType, dragonName);

    updateSave((prev) => ({
      ...prev,
      hasEgg: false,
      eggData: null,
      hasDragon: true,
      dragonData: newDragonData,
    }));
  };

  if (!eggData || !resolvedType) return null;

  const narrativePhrase = getDragonNarrativePhrase(resolvedType.dragonTypeId, resolvedType.voidTouched);

  return (
    <Layout className="relative overflow-hidden">
      {/* === BACKGROUND === */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#050510] via-[#0a0a18] to-[#0d0b1a]" />
        <div
          className="absolute inset-0 transition-opacity duration-1000"
          style={{
            background: `radial-gradient(ellipse 70% 60% at 50% 40%, ${dominantColors.glow} 0%, transparent 70%)`,
            opacity: phase === 'pulse' || phase === 'burst' ? 0.7 : 0.3,
          }}
        />
        {/* Particles during burst */}
        {(phase === 'burst' || phase === 'reveal') && (
          <>
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full animate-float"
                style={{
                  width: `${3 + Math.random() * 4}px`,
                  height: `${3 + Math.random() * 4}px`,
                  left: `${20 + Math.random() * 60}%`,
                  top: `${20 + Math.random() * 60}%`,
                  backgroundColor: dominantColors.primary,
                  opacity: 0.4 + Math.random() * 0.4,
                  animationDuration: `${2 + Math.random() * 3}s`,
                  animationDelay: `${Math.random() * 2}s`,
                }}
              />
            ))}
          </>
        )}
      </div>

      {/* === MAIN CONTENT === */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen py-8 px-4">
        {/* PREPARING Phase */}
        {phase === 'preparing' && (
          <div className="flex flex-col items-center gap-6 animate-fade-in">
            <div
              className="text-7xl animate-pulse-soft"
              style={{ filter: `drop-shadow(0 0 20px ${dominantColors.glow})` }}
            >
              🥚
            </div>
            <p className="text-lg text-[#c4b5fd]/80 text-center italic">
              Algo se move dentro da casca...
            </p>
          </div>
        )}

        {/* CRACKING Phase */}
        {phase === 'cracking' && (
          <div className="flex flex-col items-center gap-6 animate-fade-in">
            <div className="relative">
              <div
                className="text-7xl animate-shake"
                style={{ filter: `drop-shadow(0 0 25px ${dominantColors.glow})` }}
              >
                🥚
              </div>
              {/* Crack lines */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div
                  className="absolute w-8 h-[2px] rotate-[30deg]"
                  style={{
                    backgroundColor: dominantColors.primary,
                    boxShadow: `0 0 8px ${dominantColors.glow}`,
                    opacity: 0.8,
                  }}
                />
                <div
                  className="absolute w-6 h-[2px] rotate-[-45deg] translate-x-2"
                  style={{
                    backgroundColor: dominantColors.secondary,
                    boxShadow: `0 0 6px ${dominantColors.glow}`,
                    opacity: 0.6,
                  }}
                />
                <div
                  className="absolute w-4 h-[2px] rotate-[75deg] -translate-y-2"
                  style={{
                    backgroundColor: dominantColors.primary,
                    boxShadow: `0 0 5px ${dominantColors.glow}`,
                    opacity: 0.5,
                  }}
                />
              </div>
            </div>
            <p className="text-lg text-[#c4b5fd]/80 text-center italic">
              A casca começa a rachar...
            </p>
          </div>
        )}

        {/* PULSE Phase */}
        {phase === 'pulse' && (
          <div className="flex flex-col items-center gap-6 animate-fade-in">
            <div className="relative">
              <div
                className="absolute inset-0 rounded-full animate-pulse"
                style={{
                  background: `radial-gradient(circle, ${dominantColors.glow} 0%, transparent 70%)`,
                  transform: 'scale(2.5)',
                }}
              />
              <div
                className="text-7xl relative z-10"
                style={{
                  filter: `drop-shadow(0 0 30px ${dominantColors.primary})`,
                  animation: 'pulse-soft 0.8s ease-in-out infinite',
                }}
              >
                🥚
              </div>
            </div>
            <p className="text-lg text-[#c4b5fd]/90 text-center italic">
              A energia acumulada responde.
            </p>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{ELEMENT_EMOJI[resolvedType.dominantElement] || '✨'}</span>
              <span className="text-sm text-[#a0a0b8]">{resolvedType.dragonTypeName}</span>
            </div>
          </div>
        )}

        {/* BURST Phase */}
        {phase === 'burst' && (
          <div className="flex flex-col items-center gap-6 animate-fade-in">
            <div
              className="w-32 h-32 rounded-full flex items-center justify-center"
              style={{
                background: `radial-gradient(circle, ${dominantColors.primary}40 0%, transparent 70%)`,
                boxShadow: `0 0 60px 20px ${dominantColors.glow}`,
                animation: 'pulse 0.5s ease-out infinite',
              }}
            >
              <span className="text-6xl opacity-0 animate-fade-in" style={{ animationDelay: '0.5s', animationFillMode: 'forwards' }}>
                🐉
              </span>
            </div>
            <p className="text-lg text-white text-center font-medium">
              ✨ Ele nasceu! ✨
            </p>
          </div>
        )}

        {/* REVEAL Phase */}
        {phase === 'reveal' && (
          <div className="flex flex-col items-center gap-6 max-w-sm animate-fade-in">
            {/* Dragon reveal card */}
            <div
              className="w-full p-6 rounded-2xl text-center space-y-4"
              style={{
                background: `linear-gradient(135deg, ${dominantColors.glow}20 0%, rgba(18,18,26,0.9) 100%)`,
                border: `1px solid ${dominantColors.primary}40`,
                boxShadow: `0 0 40px ${dominantColors.glow}40`,
              }}
            >
              <div
                className="text-6xl"
                style={{ filter: `drop-shadow(0 0 15px ${dominantColors.glow})` }}
              >
                🐉
              </div>

              <div className="space-y-2">
                <h2 className="text-xl font-bold text-[#e8e8ec]">{resolvedType.dragonTypeName}</h2>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-lg">{ELEMENT_EMOJI[resolvedType.dominantElement]}</span>
                  <span
                    className="text-sm font-medium px-3 py-1 rounded-full"
                    style={{
                      backgroundColor: `${ELEMENT_COLORS[resolvedType.dominantElement]}20`,
                      color: ELEMENT_COLORS[resolvedType.dominantElement],
                    }}
                  >
                    {resolvedType.dominantElement === 'fire' ? 'Fogo' :
                     resolvedType.dominantElement === 'water' ? 'Água' :
                     resolvedType.dominantElement === 'earth' ? 'Terra' :
                     resolvedType.dominantElement === 'air' ? 'Ar' :
                     resolvedType.dominantElement === 'metal' ? 'Metal' : 'Desconhecido'}
                  </span>
                  {resolvedType.secondaryElement && (
                    <>
                      <span className="text-[#6a6a7a]">+</span>
                      <span className="text-lg">{ELEMENT_EMOJI[resolvedType.secondaryElement]}</span>
                    </>
                  )}
                </div>
              </div>

              <p className="text-sm text-[#a0a0b8] italic leading-relaxed whitespace-pre-line">
                {narrativePhrase}
              </p>

              {resolvedType.voidTouched && (
                <div className="flex items-center justify-center gap-1 text-xs text-purple-400/70">
                  <span>🌑</span>
                  <span>Tocado pelo Vazio</span>
                </div>
              )}
            </div>

            <button
              onClick={() => setPhase('naming')}
              className="w-full py-4 px-6 bg-[#a78bfa] hover:bg-[#9171e8] text-white text-base font-semibold rounded-xl transition-all active:scale-[0.98]"
            >
              Dar um nome
            </button>
          </div>
        )}

        {/* NAMING Phase */}
        {phase === 'naming' && (
          <div className="flex flex-col items-center gap-6 max-w-sm w-full animate-fade-in">
            <div
              className="text-5xl"
              style={{ filter: `drop-shadow(0 0 12px ${dominantColors.glow})` }}
            >
              🐉
            </div>

            <div className="text-center space-y-2">
              <h2 className="text-xl font-bold text-[#c4b5fd]">
                Como você vai chamá-lo?
              </h2>
              <p className="text-sm text-[#6a6a7a]">
                Esse nome será para sempre.
              </p>
            </div>

            <div className="w-full space-y-3">
              <input
                type="text"
                value={dragonName}
                onChange={(e) => { setDragonName(e.target.value); setNameError(null); }}
                placeholder="Nome do dragão"
                maxLength={20}
                autoFocus
                className="w-full px-4 py-4 bg-[#12121a] border-2 border-[#2a2a3a] rounded-xl text-[#e8e8ec] text-center text-lg placeholder:text-[#6a6a7a] focus:outline-none focus:border-[#a78bfa] transition-colors"
                disabled={isSubmitting}
                aria-label="Nome do dragão"
              />
              {nameError && (
                <p className="text-sm text-red-400 text-center">{nameError}</p>
              )}
            </div>

            <button
              onClick={handleNameSubmit}
              disabled={isSubmitting || !dragonName.trim()}
              className="w-full py-4 px-6 bg-[#a78bfa] hover:bg-[#9171e8] disabled:opacity-50 disabled:cursor-not-allowed text-white text-base font-semibold rounded-xl transition-all active:scale-[0.98]"
            >
              {isSubmitting ? 'Criando vínculo...' : 'Confirmar'}
            </button>

            <p className="text-xs text-[#6a6a7a] text-center italic">
              Ele espera por um nome.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
