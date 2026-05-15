// ============================================================
// ARC: AETHON — TRAIT DISPLAY
// Prompt 11: Beautiful personality traits with emotional depth.
// ============================================================

import { PersonalityTraits, TraitKey } from '../types/game';
import { TRAIT_LABELS, TRAIT_EMOJI } from '../constants/gameConstants';

interface TraitDisplayProps {
  traits: PersonalityTraits;
  showAll?: boolean;
}

// Trait color mapping
const TRAIT_COLORS: Record<TraitKey, string> = {
  courage: '#ef4444',
  gentleness: '#a855f7',
  loyalty: '#3b82f6',
  curiosity: '#22c55e',
  resilience: '#f59e0b',
};

// Trait descriptions based on intensity
function getTraitDescription(trait: TraitKey, value: number): string {
  if (value < 0.2) return '';
  
  const descriptions: Record<TraitKey, Record<string, string>> = {
    courage: {
      low: 'Mostra sinais de bravura',
      medium: 'Enfrenta desafios sem hesitar',
      high: 'Seu espírito é indomável',
    },
    gentleness: {
      low: 'Demonstra gentileza sutil',
      medium: 'Sua presença acalma o ambiente',
      high: 'Irradia paz e compaixão',
    },
    loyalty: {
      low: 'Está formando laços',
      medium: 'Sempre olha para onde você está',
      high: 'Seu vínculo é inquebrantável',
    },
    curiosity: {
      low: 'Observa com interesse',
      medium: 'Explora cada canto',
      high: 'Busca incansavelmente o desconhecido',
    },
    resilience: {
      low: 'Mostra força interior',
      medium: 'Supera adversidades com graça',
      high: 'Nada consegue abalar seu espírito',
    },
  };

  const level = value < 0.4 ? 'low' : value < 0.7 ? 'medium' : 'high';
  return descriptions[trait][level];
}

export default function TraitDisplay({ traits, showAll = false }: TraitDisplayProps) {
  const sortedTraits = (Object.entries(traits) as [TraitKey, number][]).sort((a, b) => b[1] - a[1]);
  const visibleTraits = showAll ? sortedTraits : sortedTraits.slice(0, 3);
  const activeTraits = visibleTraits.filter(([, value]) => value > 0.15);

  if (activeTraits.length === 0) {
    return (
      <div 
        className="rounded-xl p-5 text-center"
        style={{
          background: 'linear-gradient(135deg, rgba(18, 18, 26, 0.6) 0%, rgba(18, 18, 26, 0.4) 100%)',
          border: '1px solid rgba(42, 42, 58, 0.5)',
        }}
      >
        <span className="text-3xl mb-2 block">🧠</span>
        <p className="text-sm text-[#6a6a7a] italic">
          A personalidade ainda está se formando...
        </p>
        <p className="text-xs text-[#4a4a5a] mt-2">
          Alimentar e cuidar do dragão revelará quem ele é.
        </p>
      </div>
    );
  }

  // Find dominant trait
  const dominantTrait = activeTraits[0];

  return (
    <div 
      className="rounded-xl overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(18, 18, 26, 0.6) 0%, rgba(18, 18, 26, 0.4) 100%)',
        border: '1px solid rgba(42, 42, 58, 0.5)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#2a2a3a]/30">
        <div className="flex items-center gap-2">
          <span className="text-xl">🧠</span>
          <h3 className="font-medium text-[#e8e8ec]">Personalidade</h3>
        </div>
        {dominantTrait && (
          <span 
            className="text-xs px-2 py-1 rounded-full"
            style={{
              background: `${TRAIT_COLORS[dominantTrait[0]]}20`,
              color: TRAIT_COLORS[dominantTrait[0]],
            }}
          >
            {TRAIT_LABELS[dominantTrait[0]]}
          </span>
        )}
      </div>

      {/* Traits */}
      <div className="p-4 space-y-4">
        {activeTraits.map(([trait, value], index) => {
          const percentage = Math.round(value * 100);
          const color = TRAIT_COLORS[trait];
          const description = getTraitDescription(trait, value);
          const isDominant = index === 0;

          return (
            <div key={trait} className="space-y-2">
              {/* Trait header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span 
                    className="text-lg"
                    style={{
                      filter: isDominant ? `drop-shadow(0 0 6px ${color}60)` : 'none',
                    }}
                  >
                    {TRAIT_EMOJI[trait] || '✨'}
                  </span>
                  <span className="text-sm font-medium text-[#e8e8ec]">
                    {TRAIT_LABELS[trait] || trait}
                  </span>
                </div>
                <span 
                  className="text-sm font-bold"
                  style={{ color }}
                >
                  {percentage}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 bg-[#1a1a24] rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-700"
                  style={{ 
                    width: `${percentage}%`,
                    background: `linear-gradient(90deg, ${color} 0%, ${color}aa 100%)`,
                    boxShadow: isDominant ? `0 0 10px ${color}40` : 'none',
                  }}
                />
              </div>

              {/* Description */}
              {description && isDominant && (
                <p className="text-xs text-[#6a6a7a] italic pl-7">
                  {description}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
