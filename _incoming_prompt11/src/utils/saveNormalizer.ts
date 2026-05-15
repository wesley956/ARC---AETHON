// ============================================================
// ARC: AETHON — SAVE NORMALIZER
// ============================================================

import { GameSave, DragonData, CrystalInventory, PersonalityTraits, NestData, ProfessionProgress, MaterialInventory } from '../types/game';
import { normalizeMaterialInventory } from './materials';
import { normalizeNestData } from './nest';

function createDefaultCrystals(): CrystalInventory { return { fire: 0, water: 0, earth: 0, air: 0, metal: 0 }; }
function createDefaultTraits(): PersonalityTraits { return { courage: 0.1, gentleness: 0.1, loyalty: 0.1, curiosity: 0.1, resilience: 0.1 }; }
function createDefaultProfessionProgress(): ProfessionProgress {
  return { discoveredProfession: null, professionXp: 0, professionLevel: 0, hints: [], tendencies: { guardian: 0, forge: 0, memory: 0 } };
}

export function normalizeDragonData(dragon: unknown): DragonData | null {
  if (!dragon || typeof dragon !== 'object') return null;
  const d = dragon as Record<string, unknown>;
  if (typeof d.dragonName !== 'string' || !d.dragonType) return null;

  let crystals: CrystalInventory;
  if (d.crystals && typeof d.crystals === 'object' && !Array.isArray(d.crystals)) {
    const c = d.crystals as Record<string, unknown>;
    crystals = { fire: typeof c.fire === 'number' ? c.fire : 0, water: typeof c.water === 'number' ? c.water : 0, earth: typeof c.earth === 'number' ? c.earth : 0, air: typeof c.air === 'number' ? c.air : 0, metal: typeof c.metal === 'number' ? c.metal : 0 };
  } else { crystals = createDefaultCrystals(); }

  let personalityTraits: PersonalityTraits;
  if (d.personalityTraits && typeof d.personalityTraits === 'object') {
    const p = d.personalityTraits as Record<string, unknown>;
    personalityTraits = { courage: typeof p.courage === 'number' ? p.courage : 0.1, gentleness: typeof p.gentleness === 'number' ? p.gentleness : 0.1, loyalty: typeof p.loyalty === 'number' ? p.loyalty : 0.1, curiosity: typeof p.curiosity === 'number' ? p.curiosity : 0.1, resilience: typeof p.resilience === 'number' ? p.resilience : 0.1 };
  } else { personalityTraits = createDefaultTraits(); }

  const materials: MaterialInventory = normalizeMaterialInventory(d.materials);
  const nestData: NestData = normalizeNestData(d.nestData);

  let professionProgress: ProfessionProgress;
  if (d.professionProgress && typeof d.professionProgress === 'object') {
    const pp = d.professionProgress as Record<string, unknown>;
    const tendencies = pp.tendencies as Record<string, number> | undefined;
    professionProgress = { discoveredProfession: typeof pp.discoveredProfession === 'string' ? pp.discoveredProfession : null, professionXp: typeof pp.professionXp === 'number' ? pp.professionXp : 0, professionLevel: typeof pp.professionLevel === 'number' ? pp.professionLevel : 0, hints: Array.isArray(pp.hints) ? pp.hints : [], tendencies: tendencies || { guardian: 0, forge: 0, memory: 0 } };
  } else { professionProgress = createDefaultProfessionProgress(); }

  return {
    dragonName: d.dragonName as string, dragonType: d.dragonType as string,
    dominantElement: (d.dominantElement as DragonData['dominantElement']) || 'earth',
    vitality: typeof d.vitality === 'number' ? Math.min(1, Math.max(0, d.vitality)) : 0.75,
    personalityTraits,
    isOnExpedition: d.isOnExpedition === true, expeditionEndTime: typeof d.expeditionEndTime === 'number' ? d.expeditionEndTime : null,
    expeditionZoneId: (d.expeditionZoneId as DragonData['expeditionZoneId']) || null,
    expeditionLayerId: (d.expeditionLayerId as DragonData['expeditionLayerId']) || null,
    expeditionStartTime: typeof d.expeditionStartTime === 'number' ? d.expeditionStartTime : null,
    isInjured: d.isInjured === true, recoveryTime: typeof d.recoveryTime === 'number' ? d.recoveryTime : null,
    diaryEntries: Array.isArray(d.diaryEntries) ? d.diaryEntries : [],
    crystals, materials, nestData, professionProgress,
    foodsEatenFirstTime: Array.isArray(d.foodsEatenFirstTime) ? d.foodsEatenFirstTime : [],
  };
}

export function normalizeSave(save: GameSave): GameSave {
  const normalized = { ...save };
  if (typeof normalized.saveVersion !== 'number') normalized.saveVersion = 1;
  if (normalized.hasDragon && normalized.dragonData) {
    const normalizedDragon = normalizeDragonData(normalized.dragonData);
    if (normalizedDragon) normalized.dragonData = normalizedDragon;
  }
  return normalized;
}
