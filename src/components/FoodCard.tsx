// ============================================================
// ARC: AETHON — FOOD CARD
// ============================================================

import { FoodRecipe, CrystalInventory } from '../types/game';
import { ELEMENT_EMOJI, ELEMENT_COLORS } from '../constants/gameConstants';

interface FoodCardProps { food: FoodRecipe; crystals: CrystalInventory; onFeed: (foodId: string) => void; disabled?: boolean; }

export default function FoodCard({ food, crystals, onFeed, disabled }: FoodCardProps) {
  const canAfford = Object.entries(food.cost).every(([element, amount]) => (crystals[element as keyof CrystalInventory] || 0) >= (amount || 0));
  const primaryElement = Object.keys(food.cost)[0] as keyof CrystalInventory;
  const primaryColor = ELEMENT_COLORS[primaryElement] || '#a78bfa';
  const isAvailable = canAfford && !disabled;
  return (
    <div className="relative overflow-hidden rounded-xl transition-all duration-300" style={{ background: 'rgba(18,18,26,0.7)', border: `1px solid ${isAvailable ? primaryColor + '40' : 'rgba(42,42,58,0.5)'}`, boxShadow: isAvailable ? `0 0 20px ${primaryColor}15` : 'none' }}>
      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${primaryColor}20 0%, ${primaryColor}10 100%)`, border: `1px solid ${primaryColor}30` }}><span className="text-2xl" style={{ opacity: isAvailable ? 1 : 0.5 }}>{food.emoji}</span></div>
          <div className="flex-1"><h3 className="font-semibold text-[#e8e8ec]">{food.name}</h3><div className="flex items-center gap-2 mt-1"><span className="text-sm">{ELEMENT_EMOJI[primaryElement]}</span><span className="text-xs text-[#6a6a7a]">{Object.values(food.cost)[0] || 1} cristal ({crystals[primaryElement] || 0})</span></div></div>
        </div>
        <p className="text-xs text-[#6a6a7a] mb-3 italic">{food.traitPush === 'courage' ? '⚔️ Fortalece a coragem' : food.traitPush === 'gentleness' ? '💜 Nutre a gentileza' : '🤝 Aprofunda a lealdade'}</p>
        <button onClick={() => onFeed(food.id)} disabled={disabled || !canAfford} className="w-full py-3 rounded-xl font-semibold text-sm transition-all active:scale-[0.98]" style={{ background: isAvailable ? `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}dd 100%)` : 'rgba(42,42,58,0.5)', color: isAvailable ? 'white' : '#6a6a7a' }}>
          {disabled ? 'Satisfeito' : canAfford ? 'Alimentar' : 'Cristais insuficientes'}
        </button>
      </div>
    </div>
  );
}
