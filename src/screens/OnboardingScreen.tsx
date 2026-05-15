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
    {
      emoji: '🌍',
      title: 'Bem-vindo a Aethon',
      text: 'Um mundo que já conheceu glória... e viu tudo ruir. Mas algo permanece.',
    },
    {
      emoji: '🥚',
      title: 'Um ovo único',
      text: 'Você encontrou algo precioso. Um ovo de dragão, o último de sua espécie. Ele pulsa com energias elementais.',
    },
    {
      emoji: '✨',
      title: 'Seu vínculo começa',
      text: 'Cuide dele. Alimente-o com orbs elementais. E quando ele nascer... ele será apenas seu.',
    },
  ];

  const currentStep = steps[step];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      startNewGame();
    }
  };

  return (
    <Layout className="items-center justify-center px-8">
      <div className="flex flex-col items-center gap-8 animate-fade-in" key={step}>
        <div className="text-7xl animate-float">{currentStep.emoji}</div>
        <div className="text-center space-y-3">
          <h1 className="text-2xl font-bold text-[#c4b5fd]">{currentStep.title}</h1>
          <p className="text-base text-[#e8e8ec] leading-relaxed">{currentStep.text}</p>
        </div>
        <div className="flex gap-2">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === step ? 'bg-[#a78bfa]' : 'bg-[#2a2a3a]'
              }`}
            />
          ))}
        </div>
        <button
          onClick={handleNext}
          className="w-full max-w-xs py-4 bg-[#a78bfa] hover:bg-[#9171e8] text-white font-semibold rounded-xl transition-colors"
        >
          {step < steps.length - 1 ? 'Continuar' : 'Encontrar o Ovo'}
        </button>
      </div>
    </Layout>
  );
}
