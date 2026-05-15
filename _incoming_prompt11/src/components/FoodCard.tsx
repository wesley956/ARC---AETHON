// ============================================================
// ARC: AETHON — FOOD CARD
// Prompt 11: Beautiful, emotional food cards.
// ============================================================

import { FoodRecipe, CrystalInventory } from '../types/game';
import { ELEMENT_EMOJI, ELEMENT_COLORS } from '../constants/gameConstants';

interface FoodCardProps {
  food: FoodRecipe;
  crystals: CrystalInventory;
  onFeed: (foodId: string) => void;
  disabled?: boolean;
}

export default function FoodCard({ food, crystals, onFeed, disabled }: FoodCardProps) {
  const canAfford = Object.entries(food.cost).every(([element, amount]) => {
    return (crystals[element as keyof CrystalInventory] || 0) >= (amount || 0);
  });

  // Get the primary element from cost
  const primaryElement = Object.keys(food.cost)[0] as keyof CrystalInventory;
  const primaryColor = ELEMENT_COLORS[primaryElement] || '#a78bfa';
  const costAmount = Object.values(food.cost)[0] || 1;
  const available = crystals[primaryElement] || 0;

  // Determine state message
  const getStateMessage = () => {
    if (disabled) return { text: '✨ Vitalidade cheia — não quer comer', color: '#22c55e' };
    if (!canAfford) return { text: `💎 Precisa de ${costAmount} cristal de ${ELEMENT_EMOJI[primaryElement]}`, color: '#ef4444' };
    return { text: 'Pronto para alimentar', color: '#a78bfa' };
  };

  const stateMessage = getStateMessage();
  const isAvailable = canAfford && !disabled;

  return (
    <div 
      className="relative overflow-hidden rounded-xl transition-all duration-300"
      style={{
        background: 'linear-gradient(135deg, rgba(18, 18, 26, 0.7) 0%, rgba(18, 18, 26, 0.5) 100%)',
        border: `1px solid ${isAvailable ? primaryColor + '40' : 'rgba(42, 42, 58, 0.5)'}`,
        boxShadow: isAvailable ? `0 0 20px ${primaryColor}15` : 'none',
      }}
    >
      {/* Subtle glow overlay when available */}
      {isAvailable && (
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            background: `radial-gradient(ellipse at top, ${primaryColor}30 0%, transparent 70%)`,
          }}
        />
      )}

      <div className="relative p-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${primaryColor}20 0%, ${primaryColor}10 100%)`,
              border: `1px solid ${primaryColor}30`,
              boxShadow: isAvailable ? `0 0 15px ${primaryColor}20` : 'none',
            }}
          >
            <span 
              className="text-2xl"
              style={{
                filter: isAvailable ? `drop-shadow(0 0 4px ${primaryColor})` : 'none',
                opacity: isAvailable ? 1 : 0.5,
              }}
            >
              {food.emoji}
            </span>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-[#e8e8ec]">{food.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm">{ELEMENT_EMOJI[primaryElement]}</span>
              <span 
                className="text-xs font-medium"
                style={{ color: canAfford ? '#6a6a7a' : '#ef4444' }}
              >
                {costAmount} cristal ({available} disponível)
              </span>
            </div>
          </div>
        </div>

        {/* Effect hint */}
        <p className="text-xs text-[#6a6a7a] mb-3 italic">
          {food.traitPush === 'courage' && '⚔️ Fortalece a coragem'}
          {food.traitPush === 'gentleness' && '💜 Nutre a gentileza'}
          {food.traitPush === 'loyalty' && '🤝 Aprofunda a lealdade'}
        </p>

        {/* State message */}
        <p 
          className="text-xs mb-3"
          style={{ color: stateMessage.color }}
        >
          {stateMessage.text}
        </p>

        {/* Feed button */}
        <button
          onClick={() => onFeed(food.id)}
          disabled={disabled || !canAfford}
          className="w-full py-3 rounded-xl font-semibold text-sm transition-all active:scale-[0.98]"
          style={{
            background: isAvailable 
              ? `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}dd 100%)`
              : 'rgba(42, 42, 58, 0.5)',
            color: isAvailable ? 'white' : '#6a6a7a',
            boxShadow: isAvailable ? `0 4px 15px ${primaryColor}40` : 'none',
            cursor: isAvailable ? 'pointer' : 'not-allowed',
          }}
        >
          {disabled ? 'Satisfeito' : canAfford ? 'Alimentar' : 'Cristais insuficientes'}
        </button>
      </div>
    </div>
  );
}
