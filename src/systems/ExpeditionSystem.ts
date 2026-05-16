// ============================================================
// ARC: AETHON — EXPEDITION SYSTEM
// ============================================================

import { DragonData, DiaryEntry, CrystalInventory, MaterialInventory, MaterialId, ExpeditionZoneId, ExpeditionLayerId, ExpeditionRewards } from '../types/game';
import { EXPEDITION_ZONES, DEV_EXPEDITION_FAST_MODE, DEV_EXPEDITION_TIME_MULTIPLIER, INJURY_RECOVERY_TIME_MS, DEV_INJURY_RECOVERY_TIME_MS, ExpeditionLayerConfig } from '../constants/gameConstants';
import { normalizeMaterialInventory, addMaterials } from '../utils/materials';

function generateId(prefix: string): string { return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`; }
function randomInRange(min: number, max: number): number { return Math.floor(Math.random() * (max - min + 1)) + min; }

function calculateCurrentDay(diaryEntries: DiaryEntry[]): number {
  if (diaryEntries.length === 0) return 1;
  const maxDay = Math.max(...diaryEntries.map(e => e.dayNumber));
  const lastEntry = diaryEntries.reduce((latest, current) => current.timestamp > latest.timestamp ? current : latest);
  if (new Date(lastEntry.timestamp).toDateString() !== new Date().toDateString()) return maxDay + 1;
  return maxDay;
}

export function getLayerConfig(zoneId: ExpeditionZoneId, layerId: ExpeditionLayerId): ExpeditionLayerConfig | null {
  const zone = EXPEDITION_ZONES[zoneId];
  return zone?.layers[layerId] || null;
}

export function calculateExpeditionDuration(layerConfig: ExpeditionLayerConfig): number {
  const [min, max] = layerConfig.durationRange;
  let duration = randomInRange(min, max);
  if (DEV_EXPEDITION_FAST_MODE) duration = Math.max(Math.floor(duration * DEV_EXPEDITION_TIME_MULTIPLIER), 5000);
  return duration;
}

export function getInjuryRecoveryTime(): number { return DEV_EXPEDITION_FAST_MODE ? DEV_INJURY_RECOVERY_TIME_MS : INJURY_RECOVERY_TIME_MS; }

export interface CanStartExpeditionResult { canStart: boolean; reason: string | null; }

export function canStartExpedition(dragonData: DragonData): CanStartExpeditionResult {
  if (dragonData.isOnExpedition) return { canStart: false, reason: 'Seu dragão já está em uma expedição.' };
  if (dragonData.isInjured) return { canStart: false, reason: 'Seu dragão está machucado e precisa descansar.' };
  return { canStart: true, reason: null };
}

export interface StartExpeditionResult { success: boolean; message: string; newDragonData?: DragonData; }

export function startExpedition(dragonData: DragonData, zoneId: ExpeditionZoneId, layerId: ExpeditionLayerId): StartExpeditionResult {
  const canStart = canStartExpedition(dragonData);
  if (!canStart.canStart) return { success: false, message: canStart.reason || 'Não é possível iniciar.' };
  const layerConfig = getLayerConfig(zoneId, layerId);
  if (!layerConfig) return { success: false, message: 'Camada inválida.' };
  const zone = EXPEDITION_ZONES[zoneId];
  const duration = calculateExpeditionDuration(layerConfig);
  const now = Date.now();
  return { success: true, message: `🗺️ ${dragonData.dragonName} partiu para ${zone.name} — ${layerConfig.name}.`, newDragonData: { ...dragonData, isOnExpedition: true, expeditionZoneId: zoneId, expeditionLayerId: layerId, expeditionStartTime: now, expeditionEndTime: now + duration } };
}

export function isExpeditionReady(dragonData: DragonData): boolean {
  return (dragonData.isOnExpedition && !!dragonData.expeditionEndTime && Date.now() >= dragonData.expeditionEndTime);
}

export function getExpeditionTimeRemaining(dragonData: DragonData): number {
  return dragonData.expeditionEndTime ? Math.max(0, dragonData.expeditionEndTime - Date.now()) : 0;
}

function calculateRewards(layerConfig: ExpeditionLayerConfig): ExpeditionRewards {
  const crystals: Partial<Record<string, number>> = {};
  const materials: Partial<MaterialInventory> = {};
  const [minC, maxC] = layerConfig.rewards.crystalRange;
  const crystalCount = randomInRange(minC, maxC);
  if (layerConfig.rewards.crystalType === 'fire') { crystals.fire = crystalCount; }
  else { const elements: (keyof CrystalInventory)[] = ['fire', 'water', 'earth']; let remaining = crystalCount; for (const el of elements) { const amt = Math.floor(remaining / (elements.length - elements.indexOf(el))); if (amt > 0 && remaining > 0) { crystals[el] = amt; remaining -= amt; } } if (remaining > 0) { const r = elements[Math.floor(Math.random() * elements.length)]; crystals[r] = (crystals[r] || 0) + remaining; } }
  if (Math.random() < layerConfig.rewards.commonMaterialChance) { const mats: MaterialId[] = ['living_ash', 'ancient_stone']; materials[mats[Math.floor(Math.random() * mats.length)]] = 1; }
  if (Math.random() < layerConfig.rewards.uncommonMaterialChance) materials.shell_fragment = 1;
  const foundMemoryEcho = Math.random() < layerConfig.rewards.rareMaterialChance;
  if (foundMemoryEcho) materials.memory_echo = 1;
  const wasInjured = Math.random() < layerConfig.injuryChance;
  return { crystals, materials, wasInjured, foundMemoryEcho };
}

export interface CollectRewardsResult { success: boolean; message: string; rewards: ExpeditionRewards; newDragonData: DragonData; }

export function collectExpeditionRewards(dragonData: DragonData): CollectRewardsResult {
  const layerConfig = getLayerConfig(dragonData.expeditionZoneId!, dragonData.expeditionLayerId!);
  if (!layerConfig) return { success: false, message: 'Erro.', rewards: { crystals: {}, materials: {}, wasInjured: false, foundMemoryEcho: false }, newDragonData: dragonData };
  const rewards = calculateRewards(layerConfig);
  const newCrystals = { ...dragonData.crystals };
  for (const [el, amt] of Object.entries(rewards.crystals)) { const k = el as keyof CrystalInventory; newCrystals[k] = (newCrystals[k] || 0) + (amt || 0); }
  const newMaterials = addMaterials(normalizeMaterialInventory(dragonData.materials), rewards.materials as Partial<MaterialInventory>);
  const currentDay = calculateCurrentDay(dragonData.diaryEntries);
  const diaryText = rewards.wasInjured ? layerConfig.injuryDiaryEntry : layerConfig.diaryEntry;
  const newDragonData: DragonData = {
    ...dragonData, isOnExpedition: false, expeditionEndTime: null, expeditionStartTime: null, expeditionZoneId: null, expeditionLayerId: null,
    crystals: newCrystals, materials: newMaterials,
    isInjured: rewards.wasInjured, recoveryTime: rewards.wasInjured ? Date.now() + getInjuryRecoveryTime() : null,
    diaryEntries: [...dragonData.diaryEntries, { id: generateId('diary'), dayNumber: currentDay, text: `Dia ${currentDay} — ${diaryText}`, timestamp: Date.now(), category: 'expedition' as const }],
  };
  let msg = `🗺️ ${dragonData.dragonName} retornou!`;
  if (rewards.wasInjured) msg += ' ⚠️ Machucado.';
  return { success: true, message: msg, rewards, newDragonData };
}

export function checkInjuryRecovery(dragonData: DragonData): DragonData {
  if (!dragonData.isInjured || !dragonData.recoveryTime) return dragonData;
  return Date.now() >= dragonData.recoveryTime ? { ...dragonData, isInjured: false, recoveryTime: null } : dragonData;
}

export function getInjuryTimeRemaining(dragonData: DragonData): number {
  return dragonData.recoveryTime ? Math.max(0, dragonData.recoveryTime - Date.now()) : 0;
}

export function formatTimeRemaining(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${String(Math.floor(s / 3600)).padStart(2, '0')}:${String(Math.floor((s % 3600) / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}
