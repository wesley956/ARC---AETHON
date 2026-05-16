// ============================================================
// ARC: AETHON — NEST SYSTEM
// ============================================================

import { DragonData, DiaryEntry, NestSlot, NestData, MaterialInventory } from '../types/game';
import { normalizeMaterialInventory, removeMaterials } from '../utils/materials';
import { normalizeNestData, recalculateComfort, determineNestStyle } from '../utils/nest';
import { NestUpgradeDefinition } from '../data/nestUpgrades';

function generateId(prefix: string): string { return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`; }

function calculateCurrentDay(diaryEntries: DiaryEntry[]): number {
  if (diaryEntries.length === 0) return 1;
  const maxDay = Math.max(...diaryEntries.map(e => e.dayNumber));
  const lastEntry = diaryEntries.reduce((latest, current) => current.timestamp > latest.timestamp ? current : latest);
  if (new Date(lastEntry.timestamp).toDateString() !== new Date().toDateString()) return maxDay + 1;
  return maxDay;
}

export interface ApplyNestUpgradeResult { success: boolean; message: string; newDragonData?: DragonData; }
export interface CanApplyResult { canApply: boolean; reason: string | null; }

export function canApplyUpgrade(dragonData: DragonData, upgrade: NestUpgradeDefinition): CanApplyResult {
  const materials = normalizeMaterialInventory(dragonData.materials);
  const nestData = normalizeNestData(dragonData.nestData);
  const currentSlot = nestData.slots[upgrade.slotType];
  if (currentSlot && currentSlot.id === upgrade.id) return { canApply: false, reason: 'Esse ajuste já faz parte do ninho.' };
  for (const [materialId, requiredAmount] of Object.entries(upgrade.cost)) {
    if ((materials[materialId as keyof MaterialInventory] || 0) < (requiredAmount || 0)) return { canApply: false, reason: 'Material insuficiente.' };
  }
  return { canApply: true, reason: null };
}

export function applyNestUpgrade(dragonData: DragonData, upgrade: NestUpgradeDefinition): ApplyNestUpgradeResult {
  const canResult = canApplyUpgrade(dragonData, upgrade);
  if (!canResult.canApply) return { success: false, message: canResult.reason || 'Não é possível aplicar.' };
  const nestData = normalizeNestData(dragonData.nestData);
  const newMaterials = removeMaterials(normalizeMaterialInventory(dragonData.materials), upgrade.cost as Partial<MaterialInventory>);
  if (!newMaterials) return { success: false, message: 'Material insuficiente.' };
  const newSlot: NestSlot = { id: upgrade.id, name: upgrade.name, materialId: Object.keys(upgrade.cost)[0] as any, slotType: upgrade.slotType, comfortBonus: upgrade.comfortBonus, elementalAffinity: upgrade.elementalAffinity, description: upgrade.description };
  const newSlots = { ...nestData.slots, [upgrade.slotType]: newSlot };
  const newComfort = recalculateComfort(newSlots);
  const newStyle = determineNestStyle(newSlots);
  const newApplied = [...nestData.appliedUpgrades];
  if (!newApplied.includes(upgrade.id)) newApplied.push(upgrade.id);
  const newNestData: NestData = { comfort: newComfort, style: newStyle, slots: newSlots, appliedUpgrades: newApplied, lastUpdatedAt: new Date().toISOString() };
  const currentDay = calculateCurrentDay(dragonData.diaryEntries ?? []);
  const newDragonData: DragonData = {
    ...dragonData, materials: newMaterials, nestData: newNestData,
    diaryEntries: [...(dragonData.diaryEntries ?? []), { id: generateId('diary'), dayNumber: currentDay, text: `Dia ${currentDay} — ${upgrade.diaryEntry}`, timestamp: Date.now(), category: 'nest' as const }],
    professionProgress: { ...(dragonData.professionProgress ?? { discoveredProfession: null, professionXp: 0, professionLevel: 0, hints: [] }), tendencies: (() => { const t = { ...(dragonData.professionProgress?.tendencies ?? { guardian: 0, forge: 0, memory: 0 }) }; if (upgrade.professionTendency) { t[upgrade.professionTendency.key] = (t[upgrade.professionTendency.key] ?? 0) + upgrade.professionTendency.amount; } return t; })() },
  };
  return { success: true, message: `🏠 ${upgrade.name} agora faz parte do ninho.`, newDragonData };
}
