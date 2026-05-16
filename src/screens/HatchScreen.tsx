// ============================================================
// ARC: AETHON — HATCH SCREEN
// ============================================================

import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useGame } from '../context/GameContext';
import { HatchPhase } from '../constants/gameConstants';
import { HATCH_PHASE_DURATIONS, ELEMENT_EMOJI, ELEMENT_COLORS } from '../constants/gameConstants';
import { resolveDragonType, getDragonNarrativePhrase } from '../systems/DragonTypeResolver';
import { createDragonData, validateDragonName } from '../systems/DragonFactory';

export default function HatchScreen() {
  const { save, updateSave } = useGame();
  const [phase, setPhase] = useState<HatchPhase>('preparing');
  const [dragonName, setDragonName] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const eggData = save?.eggData;
  const resolvedType = eggData ? resolveDragonType(eggData) : null;
  const narrativePhrase = resolvedType ? getDragonNarrativePhrase(resolvedType.dragonTypeId, resolvedType.voidTouched) : '';

  useEffect(() => {
    if (phase === 'preparing') { const t = setTimeout(() => setPhase('cracking'), HATCH_PHASE_DURATIONS.preparing); return () => clearTimeout(t); }
    if (phase === 'cracking') { const t = setTimeout(() => setPhase('pulse'), HATCH_PHASE_DURATIONS.cracking); return () => clearTimeout(t); }
    if (phase === 'pulse') { const t = setTimeout(() => setPhase('burst'), HATCH_PHASE_DURATIONS.pulse); return () => clearTimeout(t); }
    if (phase === 'burst') { const t = setTimeout(() => setPhase('reveal'), HATCH_PHASE_DURATIONS.burst); return () => clearTimeout(t); }
  }, [phase]);

  const handleNameSubmit = () => {
    const error = validateDragonName(dragonName);
    if (error) { setNameError(error); return; }
    if (!resolvedType || isSubmitting) return;
    setIsSubmitting(true);
    const newDragon = createDragonData(resolvedType, dragonName);
    updateSave(prev => ({ ...prev, hasEgg: false, eggData: null, hasDragon: true, dragonData: newDragon }));
  };

  const color = resolvedType ? ELEMENT_COLORS[resolvedType.dominantElement] : '#a78bfa';
  const emoji = resolvedType ? ELEMENT_EMOJI[resolvedType.dominantElement] : '✨';

  return (
    <Layout className="items-center justify-center px-6 py-8">
      <div className="flex flex-col items-center gap-6 w-full max-w-sm">
        {phase === 'preparing' && (<div className="text-center animate-fade-in"><div className="text-7xl mb-6 animate-breathe">🥚</div><p className="text-lg text-[#c4b5fd]">Algo se move dentro da casca...</p></div>)}
        {phase === 'cracking' && (<div className="text-center animate-fade-in"><div className="text-7xl animate-shake">🥚</div><div className="mt-6 space-y-2"><div className="h-0.5 w-16 mx-auto bg-gradient-to-r from-transparent via-amber-400 to-transparent animate-glow" /></div><p className="text-lg text-[#c4b5fd] mt-4">A casca começa a rachar...</p></div>)}
        {phase === 'pulse' && resolvedType && (<div className="text-center animate-fade-in"><div className="text-7xl mb-4 animate-pulse-soft" style={{ filter: `drop-shadow(0 0 20px ${color}80)` }}>🥚</div><p className="text-lg text-[#c4b5fd] mb-2">A energia acumulada responde.</p><div className="flex items-center gap-2 justify-center"><span className="text-2xl">{emoji}</span><span className="text-lg font-bold text-[#e8e8ec]">{resolvedType.dragonTypeName}</span></div></div>)}
        {phase === 'burst' && (<div className="text-center animate-fade-in"><div className="text-8xl mb-6" style={{ filter: 'drop-shadow(0 0 30px rgba(167,139,250,0.8))' }}>🐉</div><p className="text-xl text-[#c4b5fd] font-bold">✨ Ele nasceu! ✨</p></div>)}
        {phase === 'reveal' && resolvedType && (<div className="text-center space-y-4 animate-fade-in">
          <div className="w-24 h-24 mx-auto rounded-full flex items-center justify-center text-5xl" style={{ background: `radial-gradient(circle, ${color}30 0%, transparent 70%)`, border: `2px solid ${color}50` }}>🐉</div>
          <h2 className="text-2xl font-bold text-[#c4b5fd]">{resolvedType.dragonTypeName}</h2>
          <div className="flex items-center gap-2 justify-center"><span>{emoji}</span><span className="text-sm text-[#e8e8ec]">{resolvedType.dominantElement === 'fire' ? 'Fogo' : resolvedType.dominantElement === 'water' ? 'Água' : resolvedType.dominantElement === 'earth' ? 'Terra' : resolvedType.dominantElement === 'air' ? 'Ar' : 'Metal'}</span></div>
          <p className="text-sm text-[#8a8a9a] italic leading-relaxed">{narrativePhrase}</p>
          {resolvedType.voidTouched && <p className="text-xs text-purple-300">🌑 Tocado pelo Vazio</p>}
          <button onClick={() => setPhase('naming')} className="mt-4 py-3 px-8 bg-[#a78bfa] hover:bg-[#9171e8] text-white font-semibold rounded-xl transition-all active:scale-[0.98]">Continuar</button>
        </div>)}
        {phase === 'naming' && (<div className="text-center space-y-4 animate-fade-in w-full">
          <div className="text-5xl mb-2">🐉</div>
          <div><h2 className="text-xl font-bold text-[#c4b5fd]">Como você vai chamá-lo?</h2><p className="text-sm text-[#6a6a7a] mt-1">Esse nome será para sempre.</p></div>
          <input type="text" value={dragonName} onChange={e => { setDragonName(e.target.value); setNameError(null); }} placeholder="Nome do dragão" maxLength={20} autoFocus className="w-full px-4 py-4 bg-[#12121a] border-2 border-[#2a2a3a] rounded-xl text-[#e8e8ec] text-center text-lg placeholder:text-[#6a6a7a] focus:outline-none focus:border-[#a78bfa] transition-colors" disabled={isSubmitting} />
          {nameError && <p className="text-sm text-red-400">{nameError}</p>}
          <button onClick={handleNameSubmit} disabled={isSubmitting} className="w-full py-4 bg-[#a78bfa] hover:bg-[#9171e8] text-white font-semibold rounded-xl transition-all active:scale-[0.98] disabled:opacity-50">Ele espera por um nome.</button>
        </div>)}
      </div>
    </Layout>
  );
}
