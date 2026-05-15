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

/**
 * Generate a unique ID.
 */
function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Calculate the current day number based on diary entries.
 */
function calculateCurrentDay(diaryEntries: DiaryEntry[]): number {
  if (diaryEntries.length === 0) return 1;

  const maxDay = Math.max(...diaryEntries.map(e => e.dayNumber));
  const lastEntry = diaryEntries.reduce((latest, current) =>
    current.timestamp > latest.timestamp ? current : latest
  );

  const lastDate = new Date(lastEntry.timestamp).toDateString();
  const today = new Date().toDateString();

  if (lastDate !== today) {
    return maxDay + 1;
  }

  return maxDay;
}

/**
 * Result of applying a nest upgrade.
 */
export interface ApplyNestUpgradeResult {
  success: boolean;
  message: string;
  newDragonData?: DragonData;
}

/**
 * Check if a nest upgrade can be applied.
 */
export interface CanApplyResult {
  canApply: boolean;
  reason: string | null;
}

export function canApplyUpgrade(
  dragonData: DragonData,
  upgrade: NestUpgradeDefinition
): CanApplyResult {
  // Normalize materials and nestData for safety
  const materials = normalizeMaterialInventory(dragonData.materials);
  const nestData = normalizeNestData(dragonData.nestData);

  // Check if upgrade is already applied to the slot
  const currentSlot = nestData.slots[upgrade.slotType];
  if (currentSlot && currentSlot.id === upgrade.id) {
    return {
      canApply: false,
      reason: 'Esse ajuste já faz parte do ninho.',
    };
  }

  // Check materials
  for (const [materialId, requiredAmount] of Object.entries(upgrade.cost)) {
    const available = materials[materialId as keyof MaterialInventory] || 0;
    if (available < (requiredAmount || 0)) {
      return {
        canApply: false,
        reason: 'Você não tem material suficiente para alterar o ninho.',
      };
    }
  }

  return {
    canApply: true,
    reason: null,
  };
}

/**
 * Apply a nest upgrade to the dragon's nest.
 * Consumes materials, updates slot, recalculates comfort, creates diary entry.
 */
export function applyNestUpgrade(
  dragonData: DragonData,
  upgrade: NestUpgradeDefinition
): ApplyNestUpgradeResult {
  // Verify dragon data exists
  if (!dragonData) {
    return {
      success: false,
      message: '❌ Dados do dragão não encontrados.',
    };
  }

  // Normalize materials
  const materials = normalizeMaterialInventory(dragonData.materials);

  // Normalize nestData (handles old format or missing data)
  const nestData = normalizeNestData(dragonData.nestData);

  // Check if already applied (Option B: block re-application)
  const currentSlot = nestData.slots[upgrade.slotType];
  if (currentSlot && currentSlot.id === upgrade.id) {
    return {
      success: false,
      message: '🏠 Esse ajuste já faz parte do ninho.',
    };
  }

  // Check materials
  const newMaterials = removeMaterials(materials, upgrade.cost as Partial<MaterialInventory>);
  if (!newMaterials) {
    return {
      success: false,
      message: '🎒 Você não tem material suficiente para alterar o ninho.',
    };
  }

  // Create nest slot
  const newSlot: NestSlot = {
    id: upgrade.id,
    name: upgrade.name,
    materialId: Object.keys(upgrade.cost)[0] as any,
    slotType: upgrade.slotType,
    comfortBonus: upgrade.comfortBonus,
    elementalAffinity: upgrade.elementalAffinity,
    description: upgrade.description,
  };

  // Update slots
  const newSlots = { ...nestData.slots };
  newSlots[upgrade.slotType] = newSlot;

  // Recalculate comfort from slots (prevents infinite farming)
  const newComfort = recalculateComfort(newSlots);

  // Determine style
  const newStyle = determineNestStyle(newSlots);

  // Update applied upgrades list
  const newAppliedUpgrades = [...nestData.appliedUpgrades];
  if (!newAppliedUpgrades.includes(upgrade.id)) {
    newAppliedUpgrades.push(upgrade.id);
  }

  // Create new nestData
  const newNestData: NestData = {
    comfort: newComfort,
    style: newStyle,
    slots: newSlots,
    appliedUpgrades: newAppliedUpgrades,
    lastUpdatedAt: new Date().toISOString(),
  };

  // Create diary entry (narrative, not technical)
  const existingDiaryEntries = dragonData.diaryEntries ?? [];
  const currentDay = calculateCurrentDay(existingDiaryEntries);

  const newDiaryEntry: DiaryEntry = {
    id: generateId('diary'),
    dayNumber: currentDay,
    text: `Dia ${currentDay} — ${upgrade.diaryEntry}`,
    timestamp: Date.now(),
    category: 'nest',
  };

  // Update profession tendencies (light, safe)
  const professionProgress = dragonData.professionProgress ?? {
    discoveredProfession: null,
    professionXp: 0,
    professionLevel: 0,
    hints: [],
  };

  const newProfessionProgress = { ...professionProgress };
  if (upgrade.professionTendency) {
    const tendencies = newProfessionProgress.tendencies ?? {
      guardian: 0,
      forge: 0,
      memory: 0,
    };
    const key = upgrade.professionTendency.key;
    tendencies[key] = (tendencies[key] ?? 0) + upgrade.professionTendency.amount;
    newProfessionProgress.tendencies = tendencies;
  }

  // Build new dragon data
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
