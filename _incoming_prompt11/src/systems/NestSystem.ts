// ============================================================
// ARC: AETHON — NEST SYSTEM
// Handles nest upgrades, comfort calculation, and diary entries.
// ============================================================

import {
  DragonData,
  DiaryEntry,
  NestSlot,
  NestData,
  MaterialInventory,
} from '../types/game';
import { normalizeMaterialInventory, removeMaterials } from '../utils/materials';
import { normalizeNestData, recalculateComfort, determineNestStyle } from '../utils/nest';
import { NestUpgradeDefinition } from '../data/nestUpgrades';

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

export interface ApplyNestUpgradeResult {
  success: boolean;
  message: string;
  newDragonData?: DragonData;
}

export interface CanApplyResult {
  canApply: boolean;
  reason: string | null;
}

export function canApplyUpgrade(
  dragonData: DragonData,
  upgrade: NestUpgradeDefinition
): CanApplyResult {
  const materials = normalizeMaterialInventory(dragonData.materials);
  const nestData = normalizeNestData(dragonData.nestData);

  const currentSlot = nestData.slots[upgrade.slotType];
  if (currentSlot && currentSlot.id === upgrade.id) {
    return { canApply: false, reason: 'Esse ajuste já faz parte do ninho.' };
  }

  for (const [materialId, requiredAmount] of Object.entries(upgrade.cost)) {
    const available = materials[materialId as keyof MaterialInventory] || 0;
    if (available < (requiredAmount || 0)) {
      return { canApply: false, reason: `Você não tem ${materialId} suficiente.` };
    }
  }

  return { canApply: true, reason: null };
}

export function applyNestUpgrade(
  dragonData: DragonData,
  upgrade: NestUpgradeDefinition
): ApplyNestUpgradeResult {
  const canApply = canApplyUpgrade(dragonData, upgrade);
  if (!canApply.canApply) {
    return { success: false, message: canApply.reason || 'Não é possível aplicar.' };
  }

  const existingMaterials = normalizeMaterialInventory(dragonData.materials);
  const nestData = normalizeNestData(dragonData.nestData);

  const newMaterials = removeMaterials(existingMaterials, upgrade.cost as Partial<MaterialInventory>);
  if (!newMaterials) {
    return { success: false, message: '🎒 Você não tem material suficiente.' };
  }

  const newSlot: NestSlot = {
    id: upgrade.id,
    name: upgrade.name,
    materialId: Object.keys(upgrade.cost)[0] as any,
    slotType: upgrade.slotType,
    comfortBonus: upgrade.comfortBonus,
    elementalAffinity: upgrade.elementalAffinity,
    description: upgrade.description,
  };

  const newSlots = { ...nestData.slots };
  newSlots[upgrade.slotType] = newSlot;

  const newComfort = recalculateComfort(newSlots);
  const newStyle = determineNestStyle(newSlots);

  const newAppliedUpgrades = [...nestData.appliedUpgrades];
  if (!newAppliedUpgrades.includes(upgrade.id)) {
    newAppliedUpgrades.push(upgrade.id);
  }

  const newNestData: NestData = {
    comfort: newComfort,
    style: newStyle,
    slots: newSlots,
    appliedUpgrades: newAppliedUpgrades,
    lastUpdatedAt: new Date().toISOString(),
  };

  const existingDiaryEntries = dragonData.diaryEntries ?? [];
  const currentDay = calculateCurrentDay(existingDiaryEntries);
  const newDiaryEntry: DiaryEntry = {
    id: generateId('diary'),
    dayNumber: currentDay,
    text: `Dia ${currentDay} — ${upgrade.diaryEntry}`,
    timestamp: Date.now(),
    category: 'nest',
  };

  const professionProgress = dragonData.professionProgress ?? {
    discoveredProfession: null,
    professionXp: 0,
    professionLevel: 0,
    hints: [],
  };
  const newProfessionProgress = { ...professionProgress };
  if (upgrade.professionTendency) {
    const tendencies = newProfessionProgress.tendencies ?? { guardian: 0, forge: 0, memory: 0 };
    const key = upgrade.professionTendency.key;
    tendencies[key] = (tendencies[key] ?? 0) + upgrade.professionTendency.amount;
    newProfessionProgress.tendencies = tendencies;
  }

  const newDragonData: DragonData = {
    ...dragonData,
    materials: newMaterials,
    nestData: newNestData,
    diaryEntries: [...existingDiaryEntries, newDiaryEntry],
    professionProgress: newProfessionProgress,
  };

  return {
    success: true,
    message: `🏠 ${upgrade.name} agora faz parte do ninho.`,
    newDragonData,
  };
}
