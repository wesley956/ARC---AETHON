// ============================================================
// ARC: AETHON — NEST UPGRADES DATA
// Defines available nest upgrades and their costs/effects.
// ============================================================

import { MaterialId, NestSlotType, ElementType, NestStyle } from '../types/game';

export interface NestUpgradeDefinition {
  id: string;
  name: string;
  slotType: NestSlotType;
  cost: Partial<Record<MaterialId, number>>;
  comfortBonus: number;
  elementalAffinity: ElementType;
  style: NestStyle;
  description: string;
  diaryEntry: string;
  emoji: string;
  professionTendency?: {
    key: 'guardian' | 'forge' | 'memory';
    amount: number;
  };
}

export const NEST_UPGRADES: NestUpgradeDefinition[] = [
  // --- BASE SLOT ---
  {
    id: 'base_pedra_antiga',
    name: 'Base de Pedra Antiga',
    slotType: 'base',
    cost: { ancient_stone: 1 },
    comfortBonus: 10,
    elementalAffinity: 'earth',
    style: 'stone',
    description: 'Pedras antigas tornam o ninho mais firme.',
    diaryEntry: 'Trouxe pedras antigas para o ninho. Ele as empurrou até ficarem exatamente onde queria.',
    emoji: '🪨',
    professionTendency: { key: 'guardian', amount: 1 },
  },
  // --- COMFORT SLOT ---
  {
    id: 'comfort_cinza_viva',
    name: 'Braseiro de Cinza Viva',
    slotType: 'comfort',
    cost: { living_ash: 1 },
    comfortBonus: 8,
    elementalAffinity: 'fire',
    style: 'warm',
    description: 'Um calor baixo permanece no ninho.',
    diaryEntry: 'Um calor baixo ficou no ninho. Ele dormiu perto dele sem medo.',
    emoji: '🔥',
    professionTendency: { key: 'forge', amount: 1 },
  },
  // --- RELIC SLOT ---
  {
    id: 'relic_eco_memoria',
    name: 'Relíquia de Eco',
    slotType: 'relic',
    cost: { memory_echo: 1 },
    comfortBonus: 5,
    elementalAffinity: 'void',
    style: 'memory',
    description: 'O eco não faz som. Mesmo assim, o dragão parece ouvi-lo.',
    diaryEntry: 'Coloquei um eco no ninho. Ele ficou quieto por muito tempo.',
    emoji: '✨',
    professionTendency: { key: 'memory', amount: 1 },
  },
];

export function getUpgradesForSlot(slotType: NestSlotType): NestUpgradeDefinition[] {
  return NEST_UPGRADES.filter(u => u.slotType === slotType);
}

export function getUpgradeById(id: string): NestUpgradeDefinition | undefined {
  return NEST_UPGRADES.find(u => u.id === id);
}
