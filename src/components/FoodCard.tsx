// ============================================================
// ARC: AETHON — FOOD CARD
// Mobile-optimized food item card.
// ============================================================

import { FoodRecipe, CrystalInventory } from '../types/game';
import { ELEMENT_EMOJI } from '../constants/gameConstants';
import { canAffordFood } from '../systems/DragonCareSystem';

interface FoodCardProps {
  recipe: FoodRecipe;
  crystals: CrystalInventory;
  vitality: number;
  isOnExpedition: boolean;
  isInjured: boolean;
  onFeed: (foodId: string) => void;
}

export default function FoodCard({ recipe, crystals, vitality, isOnExpedition, isInjured, onFeed }: FoodCardProps) {
  const canAfford = canAffordFood(crystals, recipe);
  const isFull = vitality >= 1.0;
  const isDisabled = !canAfford || isFull || isOnExpedition || isInjured;

  let unavailabilityReason = '';
  if (isOnExpedition) unavailabilityReason = 'Em expedição';
  else if (isInjured) unavailabilityReason = 'Machucado';
  else if (isFull) unavailabilityReason = 'Satisfeito';
  else if (!canAfford) unavailabilityReason = 'Cristais insuficientes';

  return (
    <div className="space-y-1">
      <button
        onClick={() => onFeed(recipe.id)}
        disabled={isDisabled}
        className={`
          w-full p-4 rounded-xl border transition-all text-left
          min-h-[72px]
          ${isDisabled
            ? 'bg-[#12121a]/30 border-[#2a2a3a]/30 opacity-60 cursor-not-allowed'
            : 'bg-[#12121a]/50 border-[#2a2a3a]/50 hover:border-[#a78bfa]/50 active:border-[#a78bfa] active:scale-[0.99]'
          }
        `}
        aria-label={`${recipe.name}${isDisabled ? ` - ${unavailabilityReason}` : ''}`}
        aria-disabled={isDisabled}
      >
        <div className="flex items-center gap-4">
          <span className="text-3xl flex-shrink-0">{recipe.emoji}</span>
          <div className="flex-1 min-w-0">
            <p className="text-base font-medium text-[#e8e8ec] mb-1">{recipe.name}</p>
            <div className="flex items-center gap-3 flex-wrap">
              {Object.entries(recipe.cost).map(([element, cost]) => {
                const available = crystals[element as keyof CrystalInventory] || 0;
                const hasEnough = available >= (cost || 0);
                return (
                  <span 
                    key={element} 
                    className={`text-sm ${hasEnough ? 'text-[#a0a0b0]' : 'text-red-400'}`}
                  >
                    {ELEMENT_EMOJI[element]} {cost}
                  </span>
                );
              })}
              <span className="text-sm text-green-400">
                +{Math.round(recipe.vitalityGain * 100)}% vida
              </span>
            </div>
          </div>
        </div>
      </button>

      {/* Show unavailability reason below the button */}
      {unavailabilityReason && (
        <p className="text-xs text-[#6a6a7a] text-center px-2">
          {unavailabilityReason}
        </p>
      )}
    </div>
  );
}
