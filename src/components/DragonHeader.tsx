// ============================================================
// ARC: AETHON — DRAGON HEADER
// Prompt 11: Emotional header for the dragon phase.
// ============================================================

import { DragonData, DragonType, ElementType } from '../types/game';
import { ELEMENT_EMOJI, ELEMENT_COLORS } from '../constants/gameConstants';
import { ELEMENT_GLOW_COLORS, DominantElement } from '../utils/elementVisuals';

interface DragonHeaderProps {
  dragon: DragonData;
  dragonType: DragonType | undefined;
  categoryName: string;
}

// Map ElementType to DominantElement for visual colors
function getVisualElement(element: ElementType): DominantElement {
  if (element === 'void') return 'void';
  if (element === 'air' || element === 'metal') return 'balanced';
  return element as DominantElement;
}

export default function DragonHeader({ dragon, dragonType, categoryName }: DragonHeaderProps) {
  const isOnExpedition = dragon.isOnExpedition;
  const isInjured = dragon.isInjured;
  const visualElement = getVisualElement(dragon.dominantElement);
  const colors = ELEMENT_GLOW_COLORS[visualElement];

  const statusText = isOnExpedition ? 'Em expedição...' : isInjured ? 'Recuperando...' : 'Descansando no ninho';
  const statusEmoji = isOnExpedition ? '🗺️' : isInjured ? '🩹' : '✨';

  // Generate a simple bond phrase based on traits
  const getBondPhrase = () => {
    const traits = dragon.personalityTraits;
    const sortedTraits = Object.entries(traits).sort(([, a], [, b]) => b - a);
    const topTrait = sortedTraits[0]?.[0];
    
    const phrases: Record<string, string> = {
      courage: 'Seus olhos queimam com determinação.',
      gentleness: 'Sua presença acalma o ar ao redor.',
      loyalty: 'Ele sempre olha para onde você está.',
      curiosity: 'Seus olhos buscam cada detalhe do mundo.',
      resilience: 'Há força silenciosa em sua postura.',
    };
    
    return phrases[topTrait] || 'Ele descansa ao seu lado.';
  };

  return (
    <div className="relative overflow-hidden rounded-2xl">
      {/* Background gradient based on element */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          background: `radial-gradient(ellipse at top, ${colors.glow} 0%, transparent 70%)`,
        }}
      />
      
      {/* Subtle pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: 'radial-gradient(circle at 50% 50%, #fff 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />
      
      {/* Content */}
      <div className="relative p-5 flex flex-col items-center text-center space-y-3">
        {/* Dragon Avatar */}
        <div className="relative">
          {/* Outer glow ring */}
          <div 
            className="absolute inset-0 rounded-full animate-pulse-soft"
            style={{
              background: `radial-gradient(circle, ${colors.glow} 0%, transparent 70%)`,
              transform: 'scale(1.8)',
            }}
          />
          
          {/* Avatar container */}
          <div 
            className="relative w-20 h-20 rounded-full flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${colors.primary}20 0%, ${colors.secondary}10 100%)`,
              border: `2px solid ${colors.primary}40`,
              boxShadow: `0 0 20px ${colors.glow}, inset 0 0 20px ${colors.glow}`,
            }}
          >
            <span 
              className="text-4xl"
              style={{
                filter: `drop-shadow(0 0 8px ${colors.glow})`,
              }}
            >
              {isInjured ? '🩹' : '🐉'}
            </span>
          </div>

          {/* Element badge */}
          <div 
            className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${ELEMENT_COLORS[dragon.dominantElement]}30, ${ELEMENT_COLORS[dragon.dominantElement]}10)`,
              border: `1px solid ${ELEMENT_COLORS[dragon.dominantElement]}50`,
              boxShadow: `0 0 10px ${ELEMENT_COLORS[dragon.dominantElement]}30`,
            }}
          >
            <span className="text-lg">{ELEMENT_EMOJI[dragon.dominantElement]}</span>
          </div>
        </div>

        {/* Name */}
        <h1 
          className="text-2xl font-bold tracking-wide"
          style={{
            color: '#e8e8ec',
            textShadow: `0 0 20px ${colors.glow}`,
          }}
        >
          {dragon.dragonName}
        </h1>

        {/* Type and Category */}
        {dragonType && (
          <div className="space-y-0.5">
            <p 
              className="text-sm font-medium"
              style={{ color: colors.primary }}
            >
              {dragonType.name}
            </p>
            <p className="text-xs text-[#6a6a7a]">{categoryName}</p>
          </div>
        )}

        {/* Status Badge */}
        <div 
          className="flex items-center gap-2 px-4 py-2 rounded-full"
          style={{
            background: isInjured 
              ? 'rgba(239, 68, 68, 0.1)' 
              : isOnExpedition 
                ? 'rgba(59, 130, 246, 0.1)' 
                : `${colors.glow}`,
            border: `1px solid ${isInjured ? 'rgba(239, 68, 68, 0.3)' : isOnExpedition ? 'rgba(59, 130, 246, 0.3)' : colors.primary + '30'}`,
          }}
        >
          <span className="text-sm">{statusEmoji}</span>
          <span className="text-xs text-[#a0a0b8]">{statusText}</span>
        </div>

        {/* Bond phrase */}
        <p className="text-xs text-[#6a6a7a] italic max-w-[250px]">
          {getBondPhrase()}
        </p>
      </div>
    </div>
  );
}
