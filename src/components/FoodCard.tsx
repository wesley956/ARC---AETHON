// ============================================================
// ARC: AETHON — FOOD CARD
// ============================================================

import { FoodRecipe, CrystalInventory } from '../types/game';

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

  return (
    <div className="bg-[#12121a]/50 rounded-xl border border-[#2a2a3a]/50 p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{food.emoji}</span>
          <span className="text-sm font-medium text-[#e8e8ec]">{food.name}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 mb-3 text-xs text-[#6a6a7a]">
        {Object.entries(food.cost).map(([element, amount]) => (
          <span key={element}>Custo: {amount} cristal</span>
        ))}
      </div>
      <button
        onClick={() => onFeed(food.id)}
        disabled={disabled || !canAfford}
        className="w-full py-3 bg-[#a78bfa] hover:bg-[#9171e8] disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all active:scale-[0.98]"
      >
        Alimentar
      </button>
    </div>
  );
}
