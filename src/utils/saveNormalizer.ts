// ============================================================
// ARC: AETHON — SAVE NORMALIZER
// Ensures backward compatibility with old save formats.
// Applies safe defaults for missing fields without resetting.
// ============================================================

import { GameSave, DragonData, CrystalInventory, PersonalityTraits, NestData, ProfessionProgress, MaterialInventory } from '../types/game';
import { normalizeMaterialInventory } from './materials';
import { normalizeNestData } from './nest';

/**
 * Create default crystal inventory
 */
function createDefaultCrystals(): CrystalInventory {
  return { fire: 0, water: 0, earth: 0, air: 0, metal: 0 };
}

/**
 * Create default personality traits
 */
function createDefaultTraits(): PersonalityTraits {
  return {
    courage: 0.1,
    gentleness: 0.1,
    loyalty: 0.1,
    curiosity: 0.1,
    resilience: 0.1,
  };
}

/**
 * Create default profession progress
 */
function createDefaultProfessionProgress(): ProfessionProgress {
  return {
    discoveredProfession: null,
    professionXp: 0,
    professionLevel: 0,
    hints: [],
    tendencies: { guardian: 0, forge: 0, memory: 0 },
  };
}

/**
 * Normalize dragon data to ensure all fields exist.
 * This allows old saves to work with new features.
 */
export function normalizeDragonData(dragon: unknown): DragonData | null {
  if (!dragon || typeof dragon !== 'object') {
    return null;
  }

  const d = dragon as Record<string, unknown>;

  // Required fields - if missing, return null (invalid dragon)
  if (typeof d.dragonName !== 'string' || !d.dragonType) {
    return null;
  }

  // Normalize crystals
  let crystals: CrystalInventory;
  if (d.crystals && typeof d.crystals === 'object' && !Array.isArray(d.crystals)) {
    const c = d.crystals as Record<string, unknown>;
    crystals = {
      fire: typeof c.fire === 'number' ? c.fire : 0,
      water: typeof c.water === 'number' ? c.water : 0,
      earth: typeof c.earth === 'number' ? c.earth : 0,
      air: typeof c.air === 'number' ? c.air : 0,
      metal: typeof c.metal === 'number' ? c.metal : 0,
    };
  } else {
    crystals = createDefaultCrystals();
  }

  // Normalize personality traits
  let personalityTraits: PersonalityTraits;
  if (d.personalityTraits && typeof d.personalityTraits === 'object') {
    const p = d.personalityTraits as Record<string, unknown>;
    personalityTraits = {
      courage: typeof p.courage === 'number' ? p.courage : 0.1,
      gentleness: typeof p.gentleness === 'number' ? p.gentleness : 0.1,
      loyalty: typeof p.loyalty === 'number' ? p.loyalty : 0.1,
      curiosity: typeof p.curiosity === 'number' ? p.curiosity : 0.1,
      resilience: typeof p.resilience === 'number' ? p.resilience : 0.1,
    };
  } else {
    personalityTraits = createDefaultTraits();
  }

  // Normalize materials using existing utility
  const materials: MaterialInventory = normalizeMaterialInventory(d.materials);

  // Normalize nest data using existing utility
  const nestData: NestData = normalizeNestData(d.nestData);

  // Normalize profession progress
  let professionProgress: ProfessionProgress;
  if (d.professionProgress && typeof d.professionProgress === 'object') {
    const pp = d.professionProgress as Record<string, unknown>;
    const tendencies = pp.tendencies as Record<string, number> | undefined;
    professionProgress = {
      discoveredProfession: typeof pp.discoveredProfession === 'string' ? pp.discoveredProfession : null,
      professionXp: typeof pp.professionXp === 'number' ? pp.professionXp : 0,
      professionLevel: typeof pp.professionLevel === 'number' ? pp.professionLevel : 0,
      hints: Array.isArray(pp.hints) ? pp.hints : [],
      tendencies: tendencies || { guardian: 0, forge: 0, memory: 0 },
    };
  } else {
    professionProgress = createDefaultProfessionProgress();
  }

  // Return normalized dragon data
  return {
    dragonName: d.dragonName as string,
    dragonType: d.dragonType as string,
    dominantElement: (d.dominantElement as DragonData['dominantElement']) || 'earth',
    vitality: typeof d.vitality === 'number' ? Math.min(1, Math.max(0, d.vitality)) : 0.75,
    personalityTraits,
    
    // Expedition state with safe defaults
    isOnExpedition: d.isOnExpedition === true,
    expeditionEndTime: typeof d.expeditionEndTime === 'number' ? d.expeditionEndTime : null,
    expeditionZoneId: (d.expeditionZoneId as DragonData['expeditionZoneId']) || null,
    expeditionLayerId: (d.expeditionLayerId as DragonData['expeditionLayerId']) || null,
    expeditionStartTime: typeof d.expeditionStartTime === 'number' ? d.expeditionStartTime : null,
    
    // Injury state with safe defaults
    isInjured: d.isInjured === true,
    recoveryTime: typeof d.recoveryTime === 'number' ? d.recoveryTime : null,
    
    // Collections with safe defaults
    diaryEntries: Array.isArray(d.diaryEntries) ? d.diaryEntries : [],
    crystals,
    materials,
    
    // Systems with safe defaults
    nestData,
    professionProgress,
    
    // Feeding tracking with safe defaults
    foodsEatenFirstTime: Array.isArray(d.foodsEatenFirstTime) ? d.foodsEatenFirstTime : [],
  };
}

/**
 * Normalize a loaded save to ensure all fields exist.
 * This runs after loading but before validation.
 * It helps old saves work with new features.
 */
export function normalizeSave(save: GameSave): GameSave {
  const normalized = { ...save };

  // Ensure save version exists
  if (typeof normalized.saveVersion !== 'number') {
    normalized.saveVersion = 1;
  }

  // Normalize dragon data if present
  if (normalized.hasDragon && normalized.dragonData) {
    const normalizedDragon = normalizeDragonData(normalized.dragonData);
    if (normalizedDragon) {
      normalized.dragonData = normalizedDragon;
    }
  }

  return normalized;
}
