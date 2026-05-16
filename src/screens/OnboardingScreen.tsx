// ============================================================
// ARC: AETHON — ONBOARDING SCREEN
// ============================================================

import { useState } from 'react';
import Layout from '../components/Layout';
import { useGame } from '../context/GameContext';

export default function OnboardingScreen() {
  const { startNewGame } = useGame();
  const [step, setStep] = useState(0);
  const steps = [
    { emoji: '🌍', title: 'Bem-vindo a Aethon', text: '500 anos atrás, Aethon foi destruído. Os dragões adultos tentaram conter o Colapso. Falharam.' },
    { emoji: '🥚', title: 'Um ovo único', text: 'Mas os Guardiões do Próximo Ciclo salvaram os ovos. Você encontrou um. Ele pulsa com energias elementais.' },
    { emoji: '✨', title: 'Seu vínculo começa', text: 'Cuide dele. Alimente-o com orbs elementais. E quando ele nascer... ele será apenas seu.' },
  ];
  const current = steps[step];
  return (
    <Layout className="items-center justify-center px-6 py-8">
      <div className="flex flex-col items-center gap-6 w-full max-w-sm animate-fade-in" key={step}>
        <div className="text-6xl sm:text-7xl animate-float">{current.emoji}</div>
        <div className="text-center space-y-3 px-2"><h1 className="text-xl sm:text-2xl font-bold text-[#c4b5fd]">{current.title}</h1><p className="text-base text-[#e8e8ec] leading-relaxed">{current.text}</p></div>
        <div className="flex gap-2 py-2">{steps.map((_, i) => (<div key={i} className={`w-2.5 h-2.5 rounded-full transition-all ${i === step ? 'bg-[#a78bfa] scale-110' : 'bg-[#2a2a3a]'}`} />))}</div>
        <button onClick={() => step < steps.length - 1 ? setStep(step + 1) : startNewGame()} className="w-full max-w-xs py-4 px-6 bg-[#a78bfa] hover:bg-[#9171e8] text-white text-base font-semibold rounded-xl transition-all active:scale-[0.98]">
          {step < steps.length - 1 ? 'Continuar' : 'Encontrar o Ovo'}
        </button>
      </div>
    </Layout>
  );
}
