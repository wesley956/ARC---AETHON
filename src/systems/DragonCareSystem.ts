// ============================================================
// ARC: AETHON — DRAGON CARE SYSTEM
// ============================================================

import { DragonData, DiaryEntry, FoodRecipe, CrystalInventory, TraitKey } from '../types/game';
import { FOOD_RECIPES, MAX_VITALITY } from '../constants/gameConstants';

function generateId(prefix: string): string { return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`; }

function calculateCurrentDay(diaryEntries: DiaryEntry[]): number {
  if (diaryEntries.length === 0) return 1;
  const maxDay = Math.max(...diaryEntries.map(e => e.dayNumber));
  const lastEntry = diaryEntries.reduce((latest, current) => current.timestamp > latest.timestamp ? current : latest);
  if (new Date(lastEntry.timestamp).toDateString() !== new Date().toDateString()) return maxDay + 1;
  return maxDay;
}

export function canAffordFood(crystals: CrystalInventory, recipe: FoodRecipe): boolean {
  for (const [element, cost] of Object.entries(recipe.cost)) {
    if ((crystals[element as keyof CrystalInventory] || 0) < (cost || 0)) return false;
  }
  return true;
}

export interface FeedResult { success: boolean; message: string; newDragonData?: DragonData; isFirstTime?: boolean; }

export function feedDragon(dragonData: DragonData, foodId: string): FeedResult {
  const recipe = FOOD_RECIPES[foodId];
  if (!recipe) return { success: false, message: '❌ Comida desconhecida.' };
  if (!canAffordFood(dragonData.crystals, recipe)) return { success: false, message: '💎 Cristais insuficientes.' };
  if (dragonData.vitality >= MAX_VITALITY) return { success: false, message: '✨ Ele está completamente satisfeito.' };

  const newCrystals = { ...dragonData.crystals };
  for (const [element, cost] of Object.entries(recipe.cost)) newCrystals[element as keyof CrystalInventory] = Math.max(0, (newCrystals[element as keyof CrystalInventory] || 0) - (cost || 0));
  const newTraits = { ...dragonData.personalityTraits };
  newTraits[recipe.traitPush] = Math.min(1, newTraits[recipe.traitPush] + recipe.traitAmount);
  const existingFoods = dragonData.foodsEatenFirstTime ?? [];
  const isFirstTime = !existingFoods.includes(foodId);
  const currentDay = calculateCurrentDay(dragonData.diaryEntries);

  return {
    success: true, message: recipe.feedMessage, isFirstTime,
    newDragonData: {
      ...dragonData, crystals: newCrystals, vitality: Math.min(MAX_VITALITY, dragonData.vitality + recipe.vitalityGain),
      personalityTraits: newTraits, foodsEatenFirstTime: isFirstTime ? [...existingFoods, foodId] : existingFoods,
      diaryEntries: [...dragonData.diaryEntries, { id: generateId('diary'), dayNumber: currentDay, text: `Dia ${currentDay} — ${recipe.diaryEntry}`, timestamp: Date.now(), category: 'feeding' as const }],
    },
  };
}

export function formatVitality(vitality: number): string { return `${Math.round(vitality * 100)}%`; }
