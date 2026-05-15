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

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function randomInRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
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

export function getLayerConfig(zoneId: ExpeditionZoneId, layerId: ExpeditionLayerId): ExpeditionLayerConfig | null {
  const zone = EXPEDITION_ZONES[zoneId];
  if (!zone) return null;
  return zone.layers[layerId] || null;
}

export function calculateExpeditionDuration(layerConfig: ExpeditionLayerConfig): number {
  const [min, max] = layerConfig.durationRange;
  let duration = randomInRange(min, max);
  if (DEV_EXPEDITION_FAST_MODE) {
    duration = Math.floor(duration * DEV_EXPEDITION_TIME_MULTIPLIER);
    duration = Math.max(duration, 5000);
  }
  return duration;
}

export function getInjuryRecoveryTime(): number {
  if (DEV_EXPEDITION_FAST_MODE) return DEV_INJURY_RECOVERY_TIME_MS;
  return INJURY_RECOVERY_TIME_MS;
}

export interface CanStartExpeditionResult {
  canStart: boolean;
  reason: string | null;
}

export function canStartExpedition(dragonData: DragonData): CanStartExpeditionResult {
  const isOnExpedition = dragonData.isOnExpedition ?? false;
  const isInjured = dragonData.isInjured ?? false;
  if (isOnExpedition) return { canStart: false, reason: 'Seu dragão já está em uma expedição.' };
  if (isInjured) return { canStart: false, reason: 'Seu dragão está machucado e precisa descansar.' };
  return { canStart: true, reason: null };
}

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
    return { success: false, message: canStart.reason || 'Não é possível iniciar a expedição.' };
  }

  const layerConfig = getLayerConfig(zoneId, layerId);
  if (!layerConfig) {
    return { success: false, message: 'Camada de expedição inválida.' };
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

export function isExpeditionReady(dragonData: DragonData): boolean {
  const isOnExpedition = dragonData.isOnExpedition ?? false;
  const expeditionEndTime = dragonData.expeditionEndTime ?? null;
  if (!isOnExpedition || !expeditionEndTime) return false;
  return Date.now() >= expeditionEndTime;
}

export function getExpeditionTimeRemaining(dragonData: DragonData): number {
  const expeditionEndTime = dragonData.expeditionEndTime ?? null;
  if (!expeditionEndTime) return 0;
  return Math.max(0, expeditionEndTime - Date.now());
}

function calculateRewards(layerConfig: ExpeditionLayerConfig): ExpeditionRewards {
  const crystals: Partial<CrystalInventory> = {};
  const materials: Partial<MaterialInventory> = {};
  let wasInjured = false;
  let foundMemoryEcho = false;

  const [minCrystals, maxCrystals] = layerConfig.rewards.crystalRange;
  const crystalCount = randomInRange(minCrystals, maxCrystals);

  if (layerConfig.rewards.crystalType === 'fire') {
    crystals.fire = crystalCount;
  } else if (layerConfig.rewards.crystalType === 'mixed') {
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
    if (remaining > 0) {
      const randomElement = elements[Math.floor(Math.random() * elements.length)];
      crystals[randomElement] = (crystals[randomElement] || 0) + remaining;
    }
  }

  if (Math.random() < layerConfig.rewards.commonMaterialChance) {
    const commonMats: MaterialId[] = ['living_ash', 'ancient_stone'];
    const mat = commonMats[Math.floor(Math.random() * commonMats.length)];
    materials[mat] = (materials[mat] || 0) + 1;
  }
  if (Math.random() < layerConfig.rewards.uncommonMaterialChance) {
    materials.shell_fragment = (materials.shell_fragment || 0) + 1;
  }
  if (Math.random() < layerConfig.rewards.rareMaterialChance) {
    materials.memory_echo = (materials.memory_echo || 0) + 1;
    foundMemoryEcho = true;
  }
  if (layerConfig.injuryChance > 0 && Math.random() < layerConfig.injuryChance) {
    wasInjured = true;
  }

  return { crystals, materials, wasInjured, foundMemoryEcho };
}

export interface CollectExpeditionResult {
  success: boolean;
  message: string;
  rewards?: ExpeditionRewards;
  newDragonData?: DragonData;
}

export function collectExpeditionRewards(dragonData: DragonData): CollectExpeditionResult {
  if (!isExpeditionReady(dragonData)) {
    return { success: false, message: 'A expedição ainda não terminou.' };
  }

  const zoneId = dragonData.expeditionZoneId;
  const layerId = dragonData.expeditionLayerId;
  if (!zoneId || !layerId) {
    return { success: false, message: 'Dados de expedição inválidos.' };
  }

  const layerConfig = getLayerConfig(zoneId, layerId);
  if (!layerConfig) {
    return { success: false, message: 'Configuração de camada não encontrada.' };
  }

  const rewards = calculateRewards(layerConfig);
  const existingCrystals = dragonData.crystals ?? { fire: 0, water: 0, earth: 0, air: 0, metal: 0 };
  const newCrystals: CrystalInventory = { ...existingCrystals };
  for (const [element, amount] of Object.entries(rewards.crystals)) {
    const key = element as keyof CrystalInventory;
    newCrystals[key] = (newCrystals[key] || 0) + (amount || 0);
  }

  const existingMaterials = normalizeMaterialInventory(dragonData.materials);
  const newMaterials = addMaterials(existingMaterials, rewards.materials);

  const existingDiaryEntries = dragonData.diaryEntries ?? [];
  const currentDay = calculateCurrentDay(existingDiaryEntries);
  const diaryText = rewards.wasInjured ? layerConfig.injuryDiaryEntry : layerConfig.diaryEntry;
  const newDiaryEntry: DiaryEntry = {
    id: generateId('diary'),
    dayNumber: currentDay,
    text: `Dia ${currentDay} — ${diaryText}`,
    timestamp: Date.now(),
    category: 'expedition',
  };

  let newDragonData: DragonData = {
    ...dragonData,
    crystals: newCrystals,
    materials: newMaterials,
    isOnExpedition: false,
    expeditionZoneId: null,
    expeditionLayerId: null,
    expeditionStartTime: null,
    expeditionEndTime: null,
    diaryEntries: [...existingDiaryEntries, newDiaryEntry],
  };

  if (rewards.wasInjured) {
    newDragonData = {
      ...newDragonData,
      isInjured: true,
      recoveryTime: Date.now() + getInjuryRecoveryTime(),
    };
  }

  let rewardMessage = `🎒 ${dragonData.dragonName} retornou!`;
  const crystalParts: string[] = [];
  for (const [element, amount] of Object.entries(rewards.crystals)) {
    if ((amount || 0) > 0) {
      crystalParts.push(`+${amount} ${element === 'fire' ? '🔥' : element === 'water' ? '💧' : '🌍'}`);
    }
  }
  if (crystalParts.length > 0) {
    rewardMessage += ` Cristais: ${crystalParts.join(', ')}`;
  }
  if (rewards.wasInjured) {
    rewardMessage += ' ⚠️ Voltou machucado.';
  }

  return { success: true, message: rewardMessage, rewards, newDragonData };
}

export function checkInjuryRecovery(dragonData: DragonData): DragonData {
  const isInjured = dragonData.isInjured ?? false;
  const recoveryTime = dragonData.recoveryTime ?? null;
  if (!isInjured || !recoveryTime) return dragonData;
  if (Date.now() >= recoveryTime) {
    return { ...dragonData, isInjured: false, recoveryTime: null };
  }
  return dragonData;
}

export function getInjuryTimeRemaining(dragonData: DragonData): number {
  const recoveryTime = dragonData.recoveryTime ?? null;
  if (!recoveryTime) return 0;
  return Math.max(0, recoveryTime - Date.now());
}

export function formatTimeRemaining(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function getExpeditionStatusText(dragonData: DragonData): string {
  const isOnExpedition = dragonData.isOnExpedition ?? false;
  const isInjured = dragonData.isInjured ?? false;
  if (isOnExpedition) return 'Em expedição';
  if (isInjured) return 'Machucado';
  return 'No ninho';
}
