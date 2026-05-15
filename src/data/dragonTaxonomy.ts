// ============================================================
// ARC: AETHON — DRAGON TAXONOMY
// Source of Truth: Game Flow Bible v1.2
//
// This file contains the complete lineage registry.
// Threshold and Convergence entries are INTERNAL ONLY.
// They must NEVER be shown to the player in the MVP.
// ============================================================

import { DragonType } from '../types/game';

// --- PURE LINEAGES ---

const pureLineages: DragonType[] = [
  {
    id: 'pure_fire',
    name: 'Dragão de Fogo Puro',
    category: 'pure',
    elements: ['fire'],
    isHidden: false,
  },
  {
    id: 'pure_water',
    name: 'Dragão das Águas Puras',
    category: 'pure',
    elements: ['water'],
    isHidden: false,
  },
  {
    id: 'pure_earth',
    name: 'Dragão da Terra Antiga',
    category: 'pure',
    elements: ['earth'],
    isHidden: false,
  },
  {
    id: 'pure_air',
    name: 'Dragão dos Ventos',
    category: 'pure',
    elements: ['air'],
    isHidden: false,
  },
  {
    id: 'pure_metal',
    name: 'Dragão de Metal Vivo',
    category: 'pure',
    elements: ['metal'],
    isHidden: false,
  },
];

// --- FUSED PUBLIC LINEAGES ---

const fusedPublicLineages: DragonType[] = [
  {
    id: 'fused_fire_water',
    name: 'Dragão do Vapor',
    category: 'fused_public',
    elements: ['fire', 'water'],
    isHidden: false,
  },
  {
    id: 'fused_fire_earth',
    name: 'Dragão da Lava',
    category: 'fused_public',
    elements: ['fire', 'earth'],
    isHidden: false,
  },
  {
    id: 'fused_water_earth',
    name: 'Dragão das Marés Vivas',
    category: 'fused_public',
    elements: ['water', 'earth'],
    isHidden: false,
  },
  {
    id: 'fused_fire_air',
    name: 'Dragão da Tempestade de Cinzas',
    category: 'fused_public',
    elements: ['fire', 'air'],
    isHidden: false,
  },
  {
    id: 'fused_water_air',
    name: 'Dragão da Névoa Celeste',
    category: 'fused_public',
    elements: ['water', 'air'],
    isHidden: false,
  },
  {
    id: 'fused_earth_air',
    name: 'Dragão das Montanhas Suspensas',
    category: 'fused_public',
    elements: ['earth', 'air'],
    isHidden: false,
  },
  {
    id: 'fused_fire_metal',
    name: 'Dragão da Forja',
    category: 'fused_public',
    elements: ['fire', 'metal'],
    isHidden: false,
  },
  {
    id: 'fused_water_metal',
    name: 'Dragão do Mercúrio',
    category: 'fused_public',
    elements: ['water', 'metal'],
    isHidden: false,
  },
  {
    id: 'fused_earth_metal',
    name: 'Dragão da Couraça',
    category: 'fused_public',
    elements: ['earth', 'metal'],
    isHidden: false,
  },
  {
    id: 'fused_air_metal',
    name: 'Dragão das Lâminas do Vento',
    category: 'fused_public',
    elements: ['air', 'metal'],
    isHidden: false,
  },
];

// --- THRESHOLD VARIANTS (INTERNAL — NEVER REVEAL TO PLAYER) ---

const thresholdVariants: DragonType[] = [
  {
    id: 'threshold_void_fire',
    name: 'Chama Apagada',
    category: 'threshold_variant',
    elements: ['void', 'fire'],
    isHidden: true,
  },
  {
    id: 'threshold_void_water',
    name: 'Águas Paradas',
    category: 'threshold_variant',
    elements: ['void', 'water'],
    isHidden: true,
  },
  {
    id: 'threshold_void_earth',
    name: 'Terra Oca',
    category: 'threshold_variant',
    elements: ['void', 'earth'],
    isHidden: true,
  },
  {
    id: 'threshold_void_air',
    name: 'Céu Sem Eco',
    category: 'threshold_variant',
    elements: ['void', 'air'],
    isHidden: true,
  },
  {
    id: 'threshold_void_metal',
    name: 'Metal Fantasma',
    category: 'threshold_variant',
    elements: ['void', 'metal'],
    isHidden: true,
  },
  {
    id: 'threshold_void_fire_metal',
    name: 'Forja do Limiar',
    category: 'threshold_variant',
    elements: ['void', 'fire', 'metal'],
    isHidden: true,
  },
  {
    id: 'threshold_void_water_air',
    name: 'Névoa do Limiar',
    category: 'threshold_variant',
    elements: ['void', 'water', 'air'],
    isHidden: true,
  },
];

// --- CONVERGENCE (UNIQUE CREATOR DRAGON — NEVER REVEAL) ---

const convergenceDragon: DragonType = {
  id: 'convergence',
  name: 'Dragão da Convergência',
  category: 'convergence',
  elements: ['fire', 'water', 'earth', 'air', 'metal', 'void'],
  isHidden: true,
  lore: 'Não nasceu de um elemento dominante, nem de uma fusão comum. Ele surgiu quando os seis princípios de Aethon tocaram o mesmo ovo sem se destruírem. Fogo, Água, Terra, Ar, Metal e Vazio encontraram um equilíbrio impossível. O que nasceu não pertence a nenhuma linhagem conhecida. Ele não é apenas raro — ele é um sinal de que o Próximo Ciclo já começou.',
};

// --- FULL REGISTRY ---

export const DRAGON_TAXONOMY: DragonType[] = [
  ...pureLineages,
  ...fusedPublicLineages,
  ...thresholdVariants,
  convergenceDragon,
];

// --- HELPERS ---

/** Get only lineages visible to the player */
export function getPublicLineages(): DragonType[] {
  return DRAGON_TAXONOMY.filter((d) => !d.isHidden);
}

/** Find a dragon type by id */
export function getDragonTypeById(id: string): DragonType | undefined {
  return DRAGON_TAXONOMY.find((d) => d.id === id);
}

/** Check if a dragon type is a Threshold variant */
export function isThresholdDragon(id: string): boolean {
  const dt = getDragonTypeById(id);
  return dt?.category === 'threshold_variant';
}

/** Check if a dragon type is the Convergence */
export function isConvergenceDragon(id: string): boolean {
  return id === 'convergence';
}
