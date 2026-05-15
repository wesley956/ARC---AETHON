// ============================================================
// ARC: AETHON — HATCH SCREEN
// The birth scene - most important emotional moment.
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import { useGame } from '../context/GameContext';
import { resolveDragonType, getDragonNarrativePhrase } from '../systems/DragonTypeResolver';
import { createDragonData, validateDragonName } from '../systems/DragonFactory';
import { ELEMENT_EMOJI, ELEMENT_COLORS, HATCH_PHASE_DURATIONS } from '../constants/gameConstants';

type HatchPhase = 'preparing' | 'cracking' | 'pulse' | 'burst' | 'reveal' | 'naming' | 'complete';

export default function HatchScreen() {
  const { save, updateSave, navigateTo } = useGame();
  const eggData = save?.eggData;

  const [phase, setPhase] = useState<HatchPhase>('preparing');
  const [dragonName, setDragonName] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Resolve dragon type from egg data
  const resolvedType = eggData ? resolveDragonType(eggData) : null;
  const narrativePhrase = resolvedType ? getDragonNarrativePhrase(resolvedType.dragonTypeId, resolvedType.voidTouched) : '';

  // Auto-advance through phases
  useEffect(() => {
    const phaseDuration = HATCH_PHASE_DURATIONS[phase];

    if (phaseDuration > 0) {
      const timer = setTimeout(() => {
        switch (phase) {
          case 'preparing':
            setPhase('cracking');
            break;
          case 'cracking':
            setPhase('pulse');
            break;
          case 'pulse':
            setPhase('burst');
            break;
          case 'burst':
            setPhase('reveal');
            break;
          case 'complete':
            navigateTo('DragonActive');
            break;
        }
      }, phaseDuration);

      return () => clearTimeout(timer);
    }
  }, [phase, navigateTo]);

  // Handle continue from reveal to naming
  const handleContinueToNaming = useCallback(() => {
    setPhase('naming');
  }, []);

  // Handle name submission
  const handleNameSubmit = useCallback(() => {
    if (!resolvedType || !save) return;

    const error = validateDragonName(dragonName);
    if (error) {
      setNameError(error);
      return;
    }

    setIsSubmitting(true);

    // Create dragon data
    const newDragonData = createDragonData(resolvedType, dragonName);

    // Transition from egg to dragon (irreversible!)
    updateSave((prev) => ({
      ...prev,
      hasEgg: false,
      hasDragon: true,
      eggData: null,
      dragonData: newDragonData,
    }));

    setPhase('complete');
  }, [dragonName, resolvedType, save, updateSave]);

  if (!eggData || !resolvedType) {
    return (
      <Layout className="items-center justify-center">
        <p className="text-[#6a6a7a]">Erro: dados do ovo não encontrados.</p>
      </Layout>
    );
  }

  const dominantColor = ELEMENT_COLORS[resolvedType.dominantElement] || '#a78bfa';

  return (
    <Layout className="items-center justify-center px-6">
      {/* Phase: Preparing */}
      {phase === 'preparing' && (
        <div className="flex flex-col items-center gap-6 animate-fade-in">
          <div className="text-7xl animate-shake">🥚</div>
          <p className="text-lg text-[#e8e8ec] text-center">
            Algo se move dentro da casca...
          </p>
        </div>
      )}

      {/* Phase: Cracking */}
      {phase === 'cracking' && (
        <div className="flex flex-col items-center gap-6 animate-fade-in">
          <div className="text-7xl animate-shake" style={{ animationDuration: '0.2s' }}>
            🥚
          </div>
          <p className="text-lg text-[#e8e8ec] text-center">
            A casca estala. Rachaduras surgem.
          </p>
        </div>
      )}

      {/* Phase: Pulse */}
      {phase === 'pulse' && (
        <div className="flex flex-col items-center gap-6 animate-fade-in">
          <div
            className="text-7xl animate-glow"
            style={{ filter: `drop-shadow(0 0 20px ${dominantColor})` }}
          >
            🥚
          </div>
          <div className="text-4xl">{ELEMENT_EMOJI[resolvedType.dominantElement]}</div>
          <p className="text-lg text-[#e8e8ec] text-center">
            A energia acumulada responde.
          </p>
        </div>
      )}

      {/* Phase: Burst */}
      {phase === 'burst' && (
        <div className="flex flex-col items-center gap-6 animate-fade-in">
          <div className="text-7xl animate-pulse">✨</div>
          <p className="text-lg text-[#e8e8ec] text-center">
            A casca explode em luz.
          </p>
        </div>
      )}

      {/* Phase: Reveal */}
      {phase === 'reveal' && (
        <div className="flex flex-col items-center gap-6 animate-fade-in max-w-sm">
          <div
            className="text-8xl animate-float"
            style={{ filter: `drop-shadow(0 0 30px ${dominantColor})` }}
          >
            🐉
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-xl font-bold text-[#c4b5fd]">
              {resolvedType.dragonTypeName}
            </h2>
            <p className="text-sm text-[#e8e8ec] leading-relaxed whitespace-pre-line">
              {narrativePhrase}
            </p>
          </div>
          <button
            onClick={handleContinueToNaming}
            className="w-full max-w-xs py-4 bg-[#a78bfa] hover:bg-[#9171e8] text-white font-semibold rounded-xl transition-colors mt-4"
          >
            Dar um nome
          </button>
        </div>
      )}

      {/* Phase: Naming */}
      {phase === 'naming' && (
        <div className="flex flex-col items-center gap-6 animate-fade-in w-full max-w-sm">
          <div
            className="text-7xl animate-float"
            style={{ filter: `drop-shadow(0 0 20px ${dominantColor})` }}
          >
            🐉
          </div>
          <div className="text-center">
            <h2 className="text-xl font-bold text-[#c4b5fd] mb-2">
              Como você vai chamá-lo?
            </h2>
            <p className="text-sm text-[#6a6a7a]">
              Esse nome será para sempre.
            </p>
          </div>
          <div className="w-full">
            <input
              type="text"
              value={dragonName}
              onChange={(e) => {
                setDragonName(e.target.value);
                setNameError(null);
              }}
              placeholder="Nome do dragão"
              maxLength={20}
              className="w-full px-4 py-3 bg-[#12121a] border border-[#2a2a3a] rounded-xl text-[#e8e8ec] text-center text-lg placeholder:text-[#6a6a7a] focus:outline-none focus:border-[#a78bfa] transition-colors"
              disabled={isSubmitting}
            />
            {nameError && (
              <p className="text-red-400 text-sm mt-2 text-center">{nameError}</p>
            )}
          </div>
          <button
            onClick={handleNameSubmit}
            disabled={isSubmitting || !dragonName.trim()}
            className={`
              w-full py-4 font-semibold rounded-xl transition-all
              ${isSubmitting || !dragonName.trim()
                ? 'bg-[#2a2a3a] text-[#6a6a7a] cursor-not-allowed'
                : 'bg-[#a78bfa] hover:bg-[#9171e8] text-white'
              }
            `}
          >
            {isSubmitting ? 'Nascendo...' : 'Confirmar Nome'}
          </button>
        </div>
      )}

      {/* Phase: Complete */}
      {phase === 'complete' && (
        <div className="flex flex-col items-center gap-6 animate-fade-in">
          <div className="text-7xl animate-float">🐉</div>
          <h2 className="text-xl font-bold text-[#c4b5fd]">{dragonName}</h2>
          <p className="text-sm text-[#6a6a7a]">Seu vínculo começou.</p>
        </div>
      )}
    </Layout>
  );
}
