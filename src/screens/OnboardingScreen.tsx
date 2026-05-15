// ============================================================
// ARC: AETHON — ONBOARDING SCREEN
// The player's first encounter with the world of Aethon.
// ============================================================

import { useState } from 'react';
import Layout from '../components/Layout';
import { useGame } from '../context/GameContext';

const ONBOARDING_TEXTS = [
  '500 anos atrás, Aethon foi destruído.',
  'Os dragões adultos tentaram conter o Colapso. Falharam.',
  'Mas os Guardiões do Próximo Ciclo salvaram os ovos.',
  'Você encontrou um.',
];

export default function OnboardingScreen() {
  const { startNewGame } = useGame();
  const [step, setStep] = useState(0);
  const [fading, setFading] = useState(false);

  const isLastStep = step === ONBOARDING_TEXTS.length - 1;

  const handleAdvance = () => {
    if (isLastStep) {
      startNewGame();
      return;
    }

    setFading(true);
    setTimeout(() => {
      setStep((prev) => prev + 1);
      setFading(false);
    }, 400);
  };

  return (
    <Layout className="items-center justify-center px-8">
      <div className="flex flex-col items-center justify-center flex-1 w-full max-w-sm">
        {/* Egg visual */}
        <div className="text-6xl mb-12 animate-float">🥚</div>

        {/* Text */}
        <div
          className={`
            text-center mb-12 transition-opacity duration-400 min-h-[80px] flex items-center
            ${fading ? 'opacity-0' : 'opacity-100'}
          `}
        >
          <p className="text-lg leading-relaxed text-aethon-text">
            {ONBOARDING_TEXTS[step]}
          </p>
        </div>

        {/* Action button */}
        <button
          onClick={handleAdvance}
          className="
            w-full py-4 rounded-xl
            bg-aethon-accent/20 border border-aethon-accent/40
            text-aethon-glow font-medium text-lg
            active:scale-95 transition-transform
            hover:bg-aethon-accent/30
          "
        >
          {isLastStep ? 'Proteger o ovo' : 'Continuar'}
        </button>

        {/* Step indicator */}
        <div className="flex gap-2 mt-6">
          {ONBOARDING_TEXTS.map((_, i) => (
            <div
              key={i}
              className={`
                w-2 h-2 rounded-full transition-colors duration-300
                ${i === step ? 'bg-aethon-glow' : 'bg-aethon-border'}
              `}
            />
          ))}
        </div>
      </div>
    </Layout>
  );
}
