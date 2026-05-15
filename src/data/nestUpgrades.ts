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
  // Future: profession tendency hint
  professionTendency?: {
    key: 'guardian' | 'forge' | 'memory';
    amount: number;
  };
}

/**
 * All available nest upgrades for MVP.
 */
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
    description: 'Pedras antigas tornam o ninho mais firme. Ele parece dormir com menos sobressaltos.',
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
    description: 'Um calor baixo permanece no ninho, como se Ignareth ainda respirasse.',
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
    diaryEntry: 'Coloquei um eco no ninho. Ele ficou quieto por muito tempo, como se escutasse alguém chamar.',
    emoji: '✨',
    professionTendency: { key: 'memory', amount: 1 },
  },
];

/**
 * Get upgrade definitions for a specific slot type.
 */
export function getUpgradesForSlot(slotType: NestSlotType): NestUpgradeDefinition[] {
  return NEST_UPGRADES.filter(u => u.slotType === slotType);
}

/**
 * Get a specific upgrade by ID.
 */
export function getUpgradeById(id: string): NestUpgradeDefinition | undefined {
  return NEST_UPGRADES.find(u => u.id === id);
}
