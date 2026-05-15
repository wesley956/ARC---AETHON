// ============================================================
// ARC: AETHON — ONBOARDING SCREEN
// Mobile-optimized first time player experience.
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
      text: '500 anos atrás, Aethon foi destruído. Os dragões adultos tentaram conter o Colapso. Falharam.',
    },
    {
      emoji: '🥚',
      title: 'Um ovo único',
      text: 'Mas os Guardiões do Próximo Ciclo salvaram os ovos. Você encontrou um. Ele pulsa com energias elementais.',
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
    <Layout className="items-center justify-center px-6 py-8">
      <div 
        className="flex flex-col items-center gap-6 w-full max-w-sm animate-fade-in" 
        key={step}
      >
        {/* Emoji Icon */}
        <div 
          className="text-6xl sm:text-7xl animate-float"
          role="img"
          aria-label={currentStep.title}
        >
          {currentStep.emoji}
        </div>

        {/* Text Content */}
        <div className="text-center space-y-3 px-2">
          <h1 className="text-xl sm:text-2xl font-bold text-[#c4b5fd] break-words">
            {currentStep.title}
          </h1>
          <p className="text-base text-[#e8e8ec] leading-relaxed break-words">
            {currentStep.text}
          </p>
        </div>

        {/* Progress Dots */}
        <div className="flex gap-2 py-2" role="tablist" aria-label="Progresso">
          {steps.map((_, i) => (
            <div
              key={i}
              role="tab"
              aria-selected={i === step}
              className={`
                w-2.5 h-2.5 rounded-full transition-all duration-300
                ${i === step 
                  ? 'bg-[#a78bfa] scale-110' 
                  : 'bg-[#2a2a3a]'
                }
              `}
            />
          ))}
        </div>

        {/* Continue Button */}
        <button
          onClick={handleNext}
          className="
            w-full max-w-xs py-4 px-6
            bg-[#a78bfa] hover:bg-[#9171e8] active:bg-[#8161d8]
            text-white text-base font-semibold
            rounded-xl transition-all
            touch-target
            active:scale-[0.98]
          "
          aria-label={step < steps.length - 1 ? 'Continuar para próxima etapa' : 'Começar o jogo'}
        >
          {step < steps.length - 1 ? 'Continuar' : 'Encontrar o Ovo'}
        </button>
      </div>
    </Layout>
  );
}
