// ============================================================
// ARC: AETHON — FOOD CARD
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
  else if (!canAfford) unavailabilityReason = 'Sem cristais';

  return (
    <div className="space-y-1">
      <button
        onClick={() => onFeed(recipe.id)}
        disabled={isDisabled}
        className={`
          w-full p-3 rounded-xl border transition-all text-left
          ${isDisabled
            ? 'bg-[#12121a]/30 border-[#2a2a3a]/30 opacity-50 cursor-not-allowed'
            : 'bg-[#12121a]/50 border-[#2a2a3a]/50 hover:border-[#a78bfa]/50 active:scale-[0.98]'
          }
        `}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{recipe.emoji}</span>
          <div className="flex-1">
            <p className="text-sm font-medium text-[#e8e8ec]">{recipe.name}</p>
            <div className="flex items-center gap-2 mt-1">
              {Object.entries(recipe.cost).map(([element, cost]) => (
                <span key={element} className="text-xs text-[#6a6a7a]">
                  {ELEMENT_EMOJI[element]} {cost}
                </span>
              ))}
              <span className="text-xs text-green-400">+{Math.round(recipe.vitalityGain * 100)}% vida</span>
            </div>
          </div>
        </div>
      </button>

      {unavailabilityReason && (
        <p className="text-xs text-[#6a6a7a] text-center italic">{unavailabilityReason}</p>
      )}
    </div>
  );
}
