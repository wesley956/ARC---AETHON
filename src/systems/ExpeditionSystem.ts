// ============================================================
// ARC: AETHON — EXPEDITION SYSTEM
// Handles expeditions, rewards, injuries, and diary entries.
// ============================================================

import {
  DragonData,
  DiaryEntry,
  CrystalInventory,
  MaterialInventory,
  MaterialId,
  ExpeditionZoneId,
  ExpeditionLayerId,
  ExpeditionRewards,
} from '../types/game';
import {
  EXPEDITION_ZONES,
  DEV_EXPEDITION_FAST_MODE,
  DEV_EXPEDITION_TIME_MULTIPLIER,
  INJURY_RECOVERY_TIME_MS,
  DEV_INJURY_RECOVERY_TIME_MS,
  ExpeditionLayerConfig,
} from '../constants/gameConstants';
import { normalizeMaterialInventory, addMaterials } from '../utils/materials';

/**
 * Generate a unique ID.
 */
function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Get a random number between min and max (inclusive).
 */
function randomInRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
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
 * Get the expedition layer configuration.
 */
export function getLayerConfig(zoneId: ExpeditionZoneId, layerId: ExpeditionLayerId): ExpeditionLayerConfig | null {
  const zone = EXPEDITION_ZONES[zoneId];
  if (!zone) return null;
  
  return zone.layers[layerId] || null;
}

/**
 * Calculate expedition duration based on layer config.
 */
export function calculateExpeditionDuration(layerConfig: ExpeditionLayerConfig): number {
  const [min, max] = layerConfig.durationRange;
  let duration = randomInRange(min, max);
  
  // Apply DEV mode time reduction if enabled
  if (DEV_EXPEDITION_FAST_MODE) {
    duration = Math.floor(duration * DEV_EXPEDITION_TIME_MULTIPLIER);
    duration = Math.max(duration, 5000); // Minimum 5 seconds
  }
  
  return duration;
}

/**
 * Get injury recovery time.
 */
export function getInjuryRecoveryTime(): number {
  if (DEV_EXPEDITION_FAST_MODE) {
    return DEV_INJURY_RECOVERY_TIME_MS;
  }
  return INJURY_RECOVERY_TIME_MS;
}

/**
 * Check if dragon can start an expedition.
 */
export interface CanStartExpeditionResult {
  canStart: boolean;
  reason: string | null;
}

export function canStartExpedition(dragonData: DragonData): CanStartExpeditionResult {
  // Safe fallbacks for old saves
  const isOnExpedition = dragonData.isOnExpedition ?? false;
  const isInjured = dragonData.isInjured ?? false;
  
  if (isOnExpedition) {
    return {
      canStart: false,
      reason: 'Seu dragão já está em uma expedição.',
    };
  }
  
  if (isInjured) {
    return {
      canStart: false,
      reason: 'Seu dragão está machucado e precisa descansar.',
    };
  }
  
  return {
    canStart: true,
    reason: null,
  };
}

/**
 * Start an expedition.
 */
export interface StartExpeditionResult {
  success: boolean;
  message: string;
  newDragonData?: DragonData;
}

export function startExpedition(
  dragonData: DragonData,
  zoneId: ExpeditionZoneId,
  layerId: ExpeditionLayerId
): StartExpeditionResult {
  const canStart = canStartExpedition(dragonData);
  if (!canStart.canStart) {
    return {
      success: false,
      message: canStart.reason || 'Não é possível iniciar a expedição.',
    };
  }
  
  const layerConfig = getLayerConfig(zoneId, layerId);
  if (!layerConfig) {
    return {
      success: false,
      message: 'Camada de expedição inválida.',
    };
  }
  
  const zone = EXPEDITION_ZONES[zoneId];
  const duration = calculateExpeditionDuration(layerConfig);
  const now = Date.now();
  
  const newDragonData: DragonData = {
    ...dragonData,
    isOnExpedition: true,
    expeditionZoneId: zoneId,
    expeditionLayerId: layerId,
    expeditionStartTime: now,
    expeditionEndTime: now + duration,
  };
  
  return {
    success: true,
    message: `🗺️ ${dragonData.dragonName} partiu para ${zone.name} — ${layerConfig.name}.`,
    newDragonData,
  };
}

/**
 * Check if expedition is ready to collect.
 */
export function isExpeditionReady(dragonData: DragonData): boolean {
  const isOnExpedition = dragonData.isOnExpedition ?? false;
  const expeditionEndTime = dragonData.expeditionEndTime ?? null;
  
  if (!isOnExpedition || !expeditionEndTime) {
    return false;
  }
  
  return Date.now() >= expeditionEndTime;
}

/**
 * Get time remaining for expedition in milliseconds.
 */
export function getExpeditionTimeRemaining(dragonData: DragonData): number {
  const expeditionEndTime = dragonData.expeditionEndTime ?? null;
  
  if (!expeditionEndTime) {
    return 0;
  }
  
  return Math.max(0, expeditionEndTime - Date.now());
}

/**
 * Calculate expedition rewards.
 */
function calculateRewards(layerConfig: ExpeditionLayerConfig): ExpeditionRewards {
  const crystals: Partial<CrystalInventory> = {};
  const materials: Partial<MaterialInventory> = {};
  let wasInjured = false;
  let foundMemoryEcho = false;
  
  // Calculate crystals
  const [minCrystals, maxCrystals] = layerConfig.rewards.crystalRange;
  const crystalCount = randomInRange(minCrystals, maxCrystals);
  
  if (layerConfig.rewards.crystalType === 'fire') {
    crystals.fire = crystalCount;
  } else if (layerConfig.rewards.crystalType === 'mixed') {
    // Distribute among fire, water, earth
    const elements: (keyof CrystalInventory)[] = ['fire', 'water', 'earth'];
    let remaining = crystalCount;
    
    for (const element of elements) {
      if (remaining <= 0) break;
      const amount = randomInRange(0, remaining);
      if (amount > 0) {
        crystals[element] = amount;
        remaining -= amount;
      }
    }
    
    // Give remaining to a random element
    if (remaining > 0) {
      const randomElement = elements[Math.floor(Math.random() * elements.length)];
      crystals[randomElement] = (crystals[randomElement] || 0) + remaining;
    }
  }
  
  // Calculate materials
  if (Math.random() < layerConfig.rewards.commonMaterialChance) {
    // Common materials: living_ash or ancient_stone
    const commonMaterials: MaterialId[] = ['living_ash', 'ancient_stone'];
    const material = commonMaterials[Math.floor(Math.random() * commonMaterials.length)];
    materials[material] = 1;
  }
  
  if (Math.random() < layerConfig.rewards.uncommonMaterialChance) {
    materials.shell_fragment = 1;
  }
  
  if (Math.random() < layerConfig.rewards.rareMaterialChance) {
    materials.memory_echo = 1;
    foundMemoryEcho = true;
  }
  
  // Calculate injury
  if (Math.random() < layerConfig.injuryChance) {
    wasInjured = true;
  }
  
  return {
    crystals,
    materials,
    wasInjured,
    foundMemoryEcho,
  };
}

/**
 * Collect expedition rewards.
 */
export interface CollectExpeditionResult {
  success: boolean;
  message: string;
  rewards?: ExpeditionRewards;
  newDragonData?: DragonData;
}

export function collectExpedition(dragonData: DragonData): CollectExpeditionResult {
  const isOnExpedition = dragonData.isOnExpedition ?? false;
  const zoneId = dragonData.expeditionZoneId;
  const layerId = dragonData.expeditionLayerId;
  
  if (!isOnExpedition || !zoneId || !layerId) {
    return {
      success: false,
      message: 'Não há expedição para coletar.',
    };
  }
  
  if (!isExpeditionReady(dragonData)) {
    return {
      success: false,
      message: 'A expedição ainda não terminou.',
    };
  }
  
  const layerConfig = getLayerConfig(zoneId, layerId);
  if (!layerConfig) {
    return {
      success: false,
      message: 'Configuração de expedição inválida.',
    };
  }
  
  const zone = EXPEDITION_ZONES[zoneId];
  const rewards = calculateRewards(layerConfig);
  
  // Apply crystal rewards
  const newCrystals: CrystalInventory = { ...dragonData.crystals };
  for (const [element, amount] of Object.entries(rewards.crystals)) {
    const key = element as keyof CrystalInventory;
    newCrystals[key] = (newCrystals[key] || 0) + (amount || 0);
  }
  
  // Apply material rewards (normalize for old saves compatibility)
  const existingMaterials = normalizeMaterialInventory(dragonData.materials);
  const newMaterials = addMaterials(existingMaterials, rewards.materials);
  
  // Create diary entries
  const currentDay = calculateCurrentDay(dragonData.diaryEntries ?? []);
  const newDiaryEntries: DiaryEntry[] = [...(dragonData.diaryEntries ?? [])];
  
  // Main expedition diary entry
  const mainDiaryText = rewards.wasInjured
    ? layerConfig.injuryDiaryEntry
    : layerConfig.diaryEntry;
  
  newDiaryEntries.push({
    id: generateId('diary'),
    dayNumber: currentDay,
    text: `Dia ${currentDay} — ${mainDiaryText}`,
    timestamp: Date.now(),
    category: 'expedition',
  });
  
  // Special diary entry for Memory Echo
  if (rewards.foundMemoryEcho) {
    newDiaryEntries.push({
      id: generateId('diary'),
      dayNumber: currentDay,
      text: `Dia ${currentDay} — Trouxe comigo um eco. Não sei se era lembrança minha ou do mundo.`,
      timestamp: Date.now() + 1, // Slightly after to ensure order
      category: 'memory',
    });
  }
  
  // Apply injury if needed
  const now = Date.now();
  const isInjured = rewards.wasInjured;
  const recoveryTime = isInjured ? now + getInjuryRecoveryTime() : null;
  
  const newDragonData: DragonData = {
    ...dragonData,
    crystals: newCrystals,
    materials: newMaterials,
    diaryEntries: newDiaryEntries,
    isOnExpedition: false,
    expeditionZoneId: null,
    expeditionLayerId: null,
    expeditionStartTime: null,
    expeditionEndTime: null,
    isInjured,
    recoveryTime,
  };
  
  // Build reward message
  let rewardMessage = `🎉 ${dragonData.dragonName} voltou de ${zone.name}!`;
  
  const crystalParts: string[] = [];
  for (const [element, amount] of Object.entries(rewards.crystals)) {
    if (amount && amount > 0) {
      crystalParts.push(`+${amount} ${element === 'fire' ? '🔥' : element === 'water' ? '💧' : '🌍'}`);
    }
  }
  if (crystalParts.length > 0) {
    rewardMessage += ` Cristais: ${crystalParts.join(', ')}`;
  }
  
  if (rewards.wasInjured) {
    rewardMessage += ' ⚠️ Voltou machucado.';
  }
  
  return {
    success: true,
    message: rewardMessage,
    rewards,
    newDragonData,
  };
}

/**
 * Check if dragon has recovered from injury.
 */
export function checkInjuryRecovery(dragonData: DragonData): DragonData {
  const isInjured = dragonData.isInjured ?? false;
  const recoveryTime = dragonData.recoveryTime ?? null;
  
  if (!isInjured || !recoveryTime) {
    return dragonData;
  }
  
  if (Date.now() >= recoveryTime) {
    return {
      ...dragonData,
      isInjured: false,
      recoveryTime: null,
    };
  }
  
  return dragonData;
}

/**
 * Get injury time remaining in milliseconds.
 */
export function getInjuryTimeRemaining(dragonData: DragonData): number {
  const recoveryTime = dragonData.recoveryTime ?? null;
  
  if (!recoveryTime) {
    return 0;
  }
  
  return Math.max(0, recoveryTime - Date.now());
}

/**
 * Format milliseconds as HH:MM:SS.
 * Always returns full format with hours, even if hours = 0.
 * Examples: 00:00:45, 00:12:08, 01:43:22
 */
export function formatTimeRemaining(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/**
 * Get expedition status text.
 */
export function getExpeditionStatusText(dragonData: DragonData): string {
  const isOnExpedition = dragonData.isOnExpedition ?? false;
  const isInjured = dragonData.isInjured ?? false;
  
  if (isOnExpedition) {
    return 'Em expedição';
  }
  
  if (isInjured) {
    return 'Machucado';
  }
  
  return 'No ninho';
}
