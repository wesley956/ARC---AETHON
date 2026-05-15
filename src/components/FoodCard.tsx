// ============================================================
// ARC: AETHON — FOOD CARD
// Individual food item for feeding the dragon.
// ============================================================

import { FoodRecipe, CrystalInventory } from '../types/game';
import { canAffordFood, getRequiredCrystal } from '../systems/DragonCareSystem';
import { ELEMENT_EMOJI, ELEMENT_LABELS, TRAIT_LABELS } from '../constants/gameConstants';

interface FoodCardProps {
  recipe: FoodRecipe;
  crystals: CrystalInventory;
  onFeed: (foodId: string) => void;
  disabled?: boolean;
  vitalityFull?: boolean;
}

export default function FoodCard({ recipe, crystals, onFeed, disabled, vitalityFull }: FoodCardProps) {
  const canAfford = canAffordFood(crystals, recipe);
  const requiredElement = getRequiredCrystal(recipe);
  const requiredAmount = requiredElement ? (recipe.cost[requiredElement] || 0) : 0;
  const availableAmount = requiredElement ? (crystals[requiredElement] || 0) : 0;

  const isDisabled = disabled || !canAfford || vitalityFull;

  const elementEmoji = requiredElement ? ELEMENT_EMOJI[requiredElement] : '💎';
  const elementLabel = requiredElement ? ELEMENT_LABELS[requiredElement] : '';
  const traitLabel = TRAIT_LABELS[recipe.traitPush] || recipe.traitPush;

  // Determine unavailability reason
  const getUnavailabilityReason = (): string | null => {
    if (vitalityFull) {
      return '✨ Ele está completamente satisfeito.';
    }
    if (!canAfford) {
      return `💎 Você precisa de ${requiredAmount} Cristal de ${elementLabel}.`;
    }
    return null;
  };

  const unavailabilityReason = getUnavailabilityReason();

  return (
    <div className="w-full">
      <button
        onClick={() => !isDisabled && onFeed(recipe.id)}
        disabled={isDisabled}
        className={`
          w-full p-4 rounded-xl border transition-all duration-200
          ${isDisabled
            ? 'bg-[#12121a]/50 border-[#2a2a3a]/50 opacity-70 cursor-not-allowed'
            : 'bg-[#12121a] border-[#2a2a3a] hover:border-[#a78bfa]/50 hover:bg-[#1a1a24] active:scale-[0.98]'
          }
        `}
      >
        <div className="flex items-center gap-4">
          {/* Food Icon */}
          <div className="text-3xl">{recipe.emoji}</div>

          {/* Food Info */}
          <div className="flex-1 text-left">
            <h4 className={`font-medium ${isDisabled ? 'text-[#6a6a7a]' : 'text-[#e8e8ec]'}`}>
              {recipe.name}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-[#6a6a7a]">
                Efeito: +{traitLabel}
              </span>
            </div>
          </div>

          {/* Cost */}
          <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${canAfford ? 'bg-[#1a1a24]' : 'bg-red-900/20'}`}>
            <span>{elementEmoji}</span>
            <span className={`text-sm font-medium ${canAfford ? 'text-[#e8e8ec]' : 'text-red-400'}`}>
              {availableAmount}/{requiredAmount}
            </span>
          </div>
        </div>
      </button>

      {/* Unavailability reason - shown below the card */}
      {unavailabilityReason && (
        <p className="mt-2 text-xs text-[#6a6a7a] text-center px-2">
          {unavailabilityReason}
        </p>
      )}
    </div>
  );
}
