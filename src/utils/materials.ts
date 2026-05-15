// ============================================================
// ARC: AETHON — MATERIAL UTILITIES
// Helper functions for material inventory normalization.
// Handles backward compatibility with old save formats.
// ============================================================

import { MaterialInventory, MaterialId } from '../types/game';

/**
 * Create an empty material inventory with all keys set to 0.
 */
export function createEmptyMaterialInventory(): MaterialInventory {
  return {
    living_ash: 0,
    ancient_stone: 0,
    shell_fragment: 0,
    memory_echo: 0,
  };
}

/**
 * List of valid material IDs for validation.
 */
const VALID_MATERIAL_IDS: MaterialId[] = [
  'living_ash',
  'ancient_stone',
  'shell_fragment',
  'memory_echo',
];

/**
 * Check if a string is a valid MaterialId.
 */
function isValidMaterialId(id: string): id is MaterialId {
  return VALID_MATERIAL_IDS.includes(id as MaterialId);
}

/**
 * Normalize material inventory from any input format.
 * 
 * Handles:
 * - undefined/null → empty inventory
 * - old array format [] → empty inventory (no migration)
 * - partial object → fills missing keys with 0
 * - valid object → returns with validated values
 * 
 * This ensures the app never crashes due to old save formats.
 */
export function normalizeMaterialInventory(input: unknown): MaterialInventory {
  const empty = createEmptyMaterialInventory();

  // Handle undefined, null
  if (input === undefined || input === null) {
    return empty;
  }

  // Handle non-objects
  if (typeof input !== 'object') {
    return empty;
  }

  // Handle arrays (old format) - return empty, don't crash
  if (Array.isArray(input)) {
    // Could potentially migrate old array format here in the future
    // For now, just return empty to avoid crashes
    return empty;
  }

  // Handle object format
  const obj = input as Record<string, unknown>;
  const result = createEmptyMaterialInventory();

  // Copy valid material values
  for (const key of VALID_MATERIAL_IDS) {
    const value = obj[key];
    if (typeof value === 'number' && value >= 0 && Number.isFinite(value)) {
      result[key] = Math.floor(value); // Ensure integer
    }
  }

  return result;
}

/**
 * Check if material inventory has any materials.
 */
export function hasMaterials(materials: MaterialInventory): boolean {
  return Object.values(materials).some(qty => qty > 0);
}

/**
 * Get total material count.
 */
export function getTotalMaterialCount(materials: MaterialInventory): number {
  return Object.values(materials).reduce((sum, qty) => sum + qty, 0);
}

/**
 * Add materials to an existing inventory.
 */
export function addMaterials(
  existing: MaterialInventory,
  toAdd: Partial<MaterialInventory>
): MaterialInventory {
  const result = { ...existing };
  
  for (const [key, amount] of Object.entries(toAdd)) {
    if (isValidMaterialId(key) && typeof amount === 'number') {
      result[key] = (result[key] || 0) + amount;
    }
  }
  
  return result;
}
