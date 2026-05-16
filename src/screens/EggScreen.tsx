// ============================================================
// ARC: AETHON — EGG SCREEN
// ============================================================

import { useState, useEffect, useRef } from 'react';
import Layout from '../components/Layout';
import DebugPanel from '../components/DebugPanel';
import { useGame } from '../context/GameContext';
import { MvpOrbElement, EggData } from '../types/game';
import { ORB_ON_EGG_MAX, ENERGY_PER_ORB, VOID_ENERGY_PER_ABSORPTION, VOID_ENERGY_MAX, MATURATION_PER_ORB, ABSORPTION_HOLD_TIME_MS, ELEMENT_EMOJI, ELEMENT_COLORS } from '../constants/gameConstants';
import { getTimeUntilNextOrb, formatTimeRemaining } from '../systems/TimeManager';

export default function EggScreen() {
  const { save, updateSave } = useGame();
  const [isHolding, setIsHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const holdTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => { const t = setInterval(() => setHoldProgress(p => p), 1000); return () => clearInterval(t); }, []);

  if (!save?.eggData) return null;
  const eggData = save.eggData;
  const matPct = Math.round(eggData.maturationProgress * 100);
  const timeToNext = formatTimeRemaining(getTimeUntilNextOrb(eggData.lastOrbGenTime));

  const handleOrbToEgg = (orbId: string) => {
    if (eggData.orbsOnEgg.length >= ORB_ON_EGG_MAX) return;
    updateSave(prev => {
      if (!prev.eggData) return prev;
      const orb = prev.eggData.availableOrbs.find(o => o.id === orbId);
      if (!orb) return prev;
      return { ...prev, eggData: { ...prev.eggData, availableOrbs: prev.eggData.availableOrbs.filter(o => o.id !== orbId), orbsOnEgg: [...prev.eggData.orbsOnEgg, orb] } };
    });
  };

  const startHold = () => {
    if (eggData.orbsOnEgg.length === 0) return;
    setIsHolding(true); setHoldProgress(0);
    holdTimerRef.current = setInterval(() => {
      setHoldProgress(prev => { const next = prev + (100 / (ABSORPTION_HOLD_TIME_MS / 50)); if (next >= 100) { if (holdTimerRef.current) clearInterval(holdTimerRef.current); doAbsorb(); return 0; } return next; });
    }, 50);
  };

  const stopHold = () => { setIsHolding(false); setHoldProgress(0); if (holdTimerRef.current) { clearInterval(holdTimerRef.current); holdTimerRef.current = null; } };

  const doAbsorb = () => {
    setIsHolding(false);
    updateSave(prev => {
      if (!prev.eggData || prev.eggData.orbsOnEgg.length === 0) return prev;
      const orbs = prev.eggData.orbsOnEgg;
      const energyKey = orbs[0].element + 'Energy' as keyof EggData;
      return { ...prev, eggData: { ...prev.eggData, orbsOnEgg: orbs.slice(1), [energyKey]: ((prev.eggData[energyKey] as number) || 0) + ENERGY_PER_ORB, voidEnergy: Math.min(VOID_ENERGY_MAX, prev.eggData.voidEnergy + VOID_ENERGY_PER_ABSORPTION), maturationProgress: Math.min(1, prev.eggData.maturationProgress + MATURATION_PER_ORB) } };
    });
  };

  return (
    <Layout className="px-4 py-6">
      <div className="flex flex-col items-center gap-4 flex-1">
        <div className="w-full"><div className="flex justify-between text-xs mb-1"><span className="text-[#6a6a7a]">Maturação</span><span className="text-[#a78bfa]">{matPct}%</span></div><div className="w-full h-2 bg-[#1a1a24] rounded-full overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-[#7c3aed] to-[#a78bfa] transition-all duration-500" style={{ width: `${matPct}%` }} /></div></div>
        <div className="relative flex items-center justify-center my-6" onPointerDown={startHold} onPointerUp={stopHold} onPointerLeave={stopHold} style={{ touchAction: 'none' }}>
          <div className={`w-32 h-40 rounded-[50%] flex items-center justify-center relative transition-all ${isHolding ? 'scale-105' : ''}`} style={{ background: 'radial-gradient(ellipse at 40% 30%, #2a1a3a 0%, #0a0a12 70%)', border: '2px solid rgba(167,139,250,0.3)', boxShadow: '0 0 40px rgba(124,58,237,0.2), inset 0 0 20px rgba(167,139,250,0.1)' }}>
            <span className="text-5xl select-none" style={{ filter: 'drop-shadow(0 0 10px rgba(167,139,250,0.5))' }}>🥚</span>
            {isHolding && (<svg className="absolute inset-0 w-full h-full" viewBox="0 0 128 160"><circle cx="64" cy="80" r="74" fill="none" stroke="#a78bfa" strokeWidth="3" strokeDasharray={`${(holdProgress / 100) * 465} 465`} strokeLinecap="round" transform="rotate(-90 64 80)" /></svg>)}
          </div>
          {eggData.orbsOnEgg.map((orb, i) => (<div key={orb.id} className="absolute animate-orbit text-lg select-none" style={{ animationDelay: `${i * 0.8}s` }}>{ELEMENT_EMOJI[orb.element]}</div>))}
        </div>
        <p className="text-xs text-[#6a6a7a] text-center">{eggData.orbsOnEgg.length > 0 ? '☝️ Segure o ovo para absorver' : '👆 Toque nos orbs para colocar no ovo'}</p>
        {eggData.orbsOnEgg.length >= ORB_ON_EGG_MAX && <p className="text-xs text-amber-400">Máximo de orbs no ovo atingido</p>}
        {eggData.voidEnergy > 0.05 && <div className="flex items-center gap-1 text-xs text-[#6a6a7a]"><span>🌑</span><span>Vazio: {Math.round(eggData.voidEnergy * 100)}%</span></div>}
        <div className="flex items-center gap-2 text-xs text-[#6a6a7a]"><span>⏳</span><span>Próximo orb em {timeToNext}</span></div>
        <div className="w-full mt-2">
          <div className="flex items-center justify-between mb-2"><span className="text-sm text-[#e8e8ec]">Energias Disponíveis</span><span className="text-xs text-[#6a6a7a]">{eggData.availableOrbs.length}/8</span></div>
          <div className="grid grid-cols-4 gap-2">
            {eggData.availableOrbs.map(orb => (
              <button key={orb.id} onClick={() => handleOrbToEgg(orb.id)} className="aspect-square flex items-center justify-center rounded-xl bg-[#12121a]/80 border-2 border-[#2a2a3a]/60 hover:border-[#a78bfa]/50 active:border-[#a78bfa] transition-all select-none text-2xl min-h-[52px]" style={{ touchAction: 'none', boxShadow: `0 0 12px ${ELEMENT_COLORS[orb.element]}25` }}>
                <span style={{ filter: `drop-shadow(0 0 4px ${ELEMENT_COLORS[orb.element]}60)` }}>{ELEMENT_EMOJI[orb.element]}</span>
              </button>
            ))}
            {Array.from({ length: Math.max(0, 8 - eggData.availableOrbs.length) }).map((_, i) => (<div key={`empty_${i}`} className="aspect-square rounded-xl bg-[#12121a]/30 border-2 border-dashed border-[#2a2a3a]/30 min-h-[52px]" />))}
          </div>
        </div>
      </div>
      <DebugPanel />
    </Layout>
  );
}
