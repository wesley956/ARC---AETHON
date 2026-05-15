// ============================================================
// ARC: AETHON — DRAGON CARE SYSTEM
// Handles feeding, vitality, traits, and diary entries.
// ============================================================

import {
  DragonData,
  DiaryEntry,
  FoodRecipe,
  CrystalInventory,
  TraitKey,
} from '../types/game';
import { FOOD_RECIPES, MAX_VITALITY } from '../constants/gameConstants';

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function calculateCurrentDay(diaryEntries: DiaryEntry[]): number {
  if (diaryEntries.length === 0) return 1;
  const maxDay = Math.max(...diaryEntries.map(e => e.dayNumber));
  const lastEntry = diaryEntries.reduce((latest, current) =>
    current.timestamp > latest.timestamp ? current : latest
  );
  const lastDate = new Date(lastEntry.timestamp).toDateString();
  const today = new Date().toDateString();
  if (lastDate !== today) return maxDay + 1;
  return maxDay;
}

export function canAffordFood(crystals: CrystalInventory, recipe: FoodRecipe): boolean {
  for (const [element, cost] of Object.entries(recipe.cost)) {
    const available = crystals[element as keyof CrystalInventory] || 0;
    if (available < (cost || 0)) return false;
  }
  return true;
}

export function getRequiredCrystal(recipe: FoodRecipe): keyof CrystalInventory | null {
  const entries = Object.entries(recipe.cost).filter(([, cost]) => (cost || 0) > 0);
  if (entries.length > 0) return entries[0][0] as keyof CrystalInventory;
  return null;
}

export interface FeedResult {
  success: boolean;
  message: string;
  newDragonData?: DragonData;
  isFirstTime?: boolean;
}

export function feedDragon(dragonData: DragonData, foodId: string): FeedResult {
  const recipe = FOOD_RECIPES[foodId];
  if (!recipe) {
    return { success: false, message: '❌ Comida desconhecida.' };
  }

  if (!canAffordFood(dragonData.crystals, recipe)) {
    const requiredElement = getRequiredCrystal(recipe);
    return {
      success: false,
      message: `💎 Você não tem cristais de ${getElementName(requiredElement)} suficientes para preparar ${recipe.name}.`,
    };
  }

  if (dragonData.vitality >= MAX_VITALITY) {
    return { success: false, message: '✨ Ele está completamente satisfeito. Não quer comer agora.' };
  }

  const newCrystals = { ...dragonData.crystals };
  for (const [element, cost] of Object.entries(recipe.cost)) {
    const key = element as keyof CrystalInventory;
    newCrystals[key] = Math.max(0, (newCrystals[key] || 0) - (cost || 0));
  }

  const newVitality = Math.min(MAX_VITALITY, dragonData.vitality + recipe.vitalityGain);

  const newTraits = { ...dragonData.personalityTraits };
  const traitKey = recipe.traitPush;
  newTraits[traitKey] = Math.min(1, newTraits[traitKey] + recipe.traitAmount);

  const existingFoodsEaten = dragonData.foodsEatenFirstTime ?? [];
  const isFirstTime = !existingFoodsEaten.includes(foodId);
  const newFoodsEaten = isFirstTime ? [...existingFoodsEaten, foodId] : existingFoodsEaten;

  const existingDiaryEntries = dragonData.diaryEntries ?? [];
  const currentDay = calculateCurrentDay(existingDiaryEntries);

  const newDiaryEntry: DiaryEntry = {
    id: generateId('diary'),
    dayNumber: currentDay,
    text: `Dia ${currentDay} — ${recipe.diaryEntry}`,
    timestamp: Date.now(),
    category: 'feeding',
  };

  const newDragonData: DragonData = {
    ...dragonData,
    crystals: newCrystals,
    vitality: newVitality,
    personalityTraits: newTraits,
    diaryEntries: [...existingDiaryEntries, newDiaryEntry],
    foodsEatenFirstTime: newFoodsEaten,
  };

  return { success: true, message: recipe.feedMessage, newDragonData, isFirstTime };
}

function getElementName(element: keyof CrystalInventory | null): string {
  if (!element) return 'desconhecido';
  const names: Record<string, string> = {
    fire: 'Fogo', water: 'Água', earth: 'Terra', air: 'Ar', metal: 'Metal',
  };
  return names[element] || element;
}

export function getAllFoods(): FoodRecipe[] {
  return Object.values(FOOD_RECIPES);
}

export function getDominantTraits(dragonData: DragonData, count: number = 2): TraitKey[] {
  const traits = dragonData.personalityTraits;
  const sorted = (Object.entries(traits) as [TraitKey, number][])
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .filter(([, value]) => value > 0.1)
    .map(([key]) => key);
  return sorted;
}

export function formatTraitValue(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export function formatVitality(vitality: number): string {
  return `${Math.round(vitality * 100)}%`;
}
