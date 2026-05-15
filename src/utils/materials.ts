// ============================================================
// ARC: AETHON — MATERIAL UTILITIES
// ============================================================

import { MaterialInventory, MaterialId } from '../types/game';

export function createEmptyMaterialInventory(): MaterialInventory {
  return { living_ash: 0, ancient_stone: 0, shell_fragment: 0, memory_echo: 0 };
}

const VALID_MATERIAL_IDS: MaterialId[] = ['living_ash', 'ancient_stone', 'shell_fragment', 'memory_echo'];

function isValidMaterialId(id: string): id is MaterialId {
  return VALID_MATERIAL_IDS.includes(id as MaterialId);
}

export function normalizeMaterialInventory(input: unknown): MaterialInventory {
  const empty = createEmptyMaterialInventory();
  if (input === undefined || input === null) return empty;
  if (typeof input !== 'object') return empty;
  if (Array.isArray(input)) return empty;

  const obj = input as Record<string, unknown>;
  const result = createEmptyMaterialInventory();
  for (const key of VALID_MATERIAL_IDS) {
    const value = obj[key];
    if (typeof value === 'number' && value >= 0 && Number.isFinite(value)) {
      result[key] = Math.floor(value);
    }
  }
  return result;
}

export function hasMaterials(materials: MaterialInventory): boolean {
  return Object.values(materials).some(qty => qty > 0);
}

export function getTotalMaterialCount(materials: MaterialInventory): number {
  return Object.values(materials).reduce((sum, qty) => sum + qty, 0);
}

export function addMaterials(existing: MaterialInventory, toAdd: Partial<MaterialInventory>): MaterialInventory {
  const result = { ...existing };
  for (const [key, amount] of Object.entries(toAdd)) {
    if (isValidMaterialId(key) && typeof amount === 'number') {
      result[key] = (result[key] || 0) + amount;
    }
  }
  return result;
}

export function removeMaterials(existing: MaterialInventory, toRemove: Partial<MaterialInventory>): MaterialInventory | null {
  const result = { ...existing };
  for (const [key, amount] of Object.entries(toRemove)) {
    if (isValidMaterialId(key) && typeof amount === 'number') {
      if ((result[key] || 0) < amount) return null;
      result[key] = (result[key] || 0) - amount;
    }
  }
  return result;
}
