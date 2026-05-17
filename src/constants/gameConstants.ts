// ============================================================
// ARC: AETHON — GAME CONSTANTS
// Source of Truth: Game Flow Bible v1.2
// ============================================================

import type { MvpOrbElement, FoodRecipe, TraitKey, MaterialDefinition, MaterialId } from '../types/game';

// --- ORB GENERATION ---
export const ORB_GENERATION_INTERVAL_MS = 2 * 60 * 60 * 1000;
export const ORB_MIN_PER_WINDOW = 1;
export const ORB_MAX_PER_WINDOW = 2;
export const ORB_TRAY_MAX = 8;
export const ORB_ON_EGG_MAX = 5;
export const MVP_ORB_ELEMENTS: readonly MvpOrbElement[] = ['fire', 'water', 'earth'] as const;

// --- ABSORPTION ---
export const ENERGY_PER_ORB = 0.05;
export const VOID_ENERGY_PER_ABSORPTION = 0.01;
export const VOID_ENERGY_MAX = 0.5;
export const MATURATION_PER_ORB = 0.02;
export const ABSORPTION_HOLD_TIME_MS = 2000;
export const EGG_DROP_RADIUS = 110;

// --- MATURATION ---
export const MATURATION_HATCH_THRESHOLD = 1.0;

// --- DRAGON INITIAL STATE ---
export const INITIAL_DRAGON_VITALITY = 0.75;

// --- FEEDING ---
export const FOOD_VITALITY_GAIN = 0.15;
export const FOOD_TRAIT_GAIN = 0.05;
export const MAX_VITALITY = 1.0;

export const FOOD_RECIPES: Record<string, FoodRecipe> = {
  brasaCrocante: {
    id: 'brasaCrocante',
    name: 'Brasa Crocante',
    emoji: '🔥',
    cost: { fire: 1 },
    vitalityGain: FOOD_VITALITY_GAIN,
    traitPush: 'courage' as TraitKey,
    traitAmount: FOOD_TRAIT_GAIN,
    feedMessage: '🔥 Ele devorou a Brasa Crocante com olhos acesos.',
    diaryEntry: 'Provei fogo hoje. Não queimou. Parecia familiar.',
  },
  caldoDasMares: {
    id: 'caldoDasMares',
    name: 'Caldo das Marés',
    emoji: '💧',
    cost: { water: 1 },
    vitalityGain: FOOD_VITALITY_GAIN,
    traitPush: 'gentleness' as TraitKey,
    traitAmount: FOOD_TRAIT_GAIN,
    feedMessage: '💧 Ele bebeu devagar. Por um instante, tudo pareceu mais calmo.',
    diaryEntry: 'Bebi algo frio e antigo. Senti o mundo ficar quieto.',
  },
  raizDourada: {
    id: 'raizDourada',
    name: 'Raiz Dourada',
    emoji: '🌍',
    cost: { earth: 1 },
    vitalityGain: FOOD_VITALITY_GAIN,
    traitPush: 'loyalty' as TraitKey,
    traitAmount: FOOD_TRAIT_GAIN,
    feedMessage: '🌍 Ele mastigou a Raiz Dourada e se deitou mais perto de você.',
    diaryEntry: 'A raiz tinha gosto de pedra e sol. Fiquei perto dele depois.',
  },
} as const;

// --- MATERIALS ---
export const MATERIAL_DEFINITIONS: Record<MaterialId, MaterialDefinition> = {
  living_ash: {
    id: 'living_ash', name: 'Cinza Viva', emoji: '🔥', rarity: 'common',
    description: 'Cinzas que ainda guardam calor das ruínas antigas.',
  },
  ancient_stone: {
    id: 'ancient_stone', name: 'Pedra Antiga', emoji: '🪨', rarity: 'common',
    description: 'Fragmentos de construções que resistiram ao tempo.',
  },
  shell_fragment: {
    id: 'shell_fragment', name: 'Fragmento de Casca', emoji: '🥚', rarity: 'uncommon',
    description: 'Restos de cascas que podem ter sido de dragões.',
  },
  memory_echo: {
    id: 'memory_echo', name: 'Eco de Memória', emoji: '✨', rarity: 'rare',
    description: 'Uma lembrança cristalizada do passado de Aethon.',
  },
};

// --- EXPEDITIONS ---
export const DEV_EXPEDITION_FAST_MODE = false;
export const DEV_EXPEDITION_TIME_MULTIPLIER = 0.01;
export const INJURY_RECOVERY_TIME_MS = 1 * 60 * 60 * 1000;
export const DEV_INJURY_RECOVERY_TIME_MS = 30 * 1000;

export interface ExpeditionLayerConfig {
  id: string;
  name: string;
  description: string;
  durationRange: [number, number];
  injuryChance: number;
  rewards: {
    crystalType: 'fire' | 'mixed';
    crystalRange: [number, number];
    commonMaterialChance: number;
    uncommonMaterialChance: number;
    rareMaterialChance: number;
  };
  diaryEntry: string;
  injuryDiaryEntry: string;
}

export interface ExpeditionZoneConfig {
  id: string;
  name: string;
  emoji: string;
  description: string;
  layers: {
    fronteira: ExpeditionLayerConfig;
    interior: ExpeditionLayerConfig;
  };
}

export const EXPEDITION_ZONES: Record<string, ExpeditionZoneConfig> = {
  ruinas_de_ignareth: {
    id: 'ruinas_de_ignareth',
    name: 'Ruínas de Ignareth',
    emoji: '🏛️',
    description: 'As bordas queimadas de uma civilização antiga.',
    layers: {
      fronteira: {
        id: 'fronteira', name: 'Fronteira',
        description: 'As bordas externas das ruínas.',
        durationRange: [30 * 60 * 1000, 2 * 60 * 60 * 1000],
        injuryChance: 0,
        rewards: { crystalType: 'fire', crystalRange: [1, 3], commonMaterialChance: 1.0, uncommonMaterialChance: 0, rareMaterialChance: 0 },
        diaryEntry: 'Fui às bordas de Ignareth hoje. O cheiro de cinzas não me incomodou.',
        injuryDiaryEntry: '',
      },
      interior: {
        id: 'interior', name: 'Interior',
        description: 'O coração das ruínas. Mais perigoso.',
        durationRange: [3 * 60 * 60 * 1000, 6 * 60 * 60 * 1000],
        injuryChance: 0.1,
        rewards: { crystalType: 'mixed', crystalRange: [2, 5], commonMaterialChance: 0.5, uncommonMaterialChance: 0.5, rareMaterialChance: 0.15 },
        diaryEntry: 'Fui mais fundo dessa vez. Vi algo que não consigo descrever ainda.',
        injuryDiaryEntry: 'Voltei machucado. Não vou contar o que encontrei lá.',
      },
    },
  },
};

// --- SAVE ---
export const SAVE_KEY = 'arc_aethon_save';

// --- THRESHOLD DRAGONS ---
export const MAX_THRESHOLD_DRAGONS = 4;
export const THRESHOLD_RESERVED_FOR_CREATOR = 1;

// --- ELEMENT LABELS ---
export const ELEMENT_LABELS: Record<string, string> = {
  fire: 'Fogo', water: 'Água', earth: 'Terra', air: 'Ar', metal: 'Metal', void: 'Vazio',
};

export const ELEMENT_COLORS: Record<string, string> = {
  fire: '#ff6b35', water: '#3b82f6', earth: '#8b6914', air: '#a0d2db', metal: '#9ca3af', void: '#4a0e4e',
};

export const ELEMENT_EMOJI: Record<string, string> = {
  fire: '🔥', water: '💧', earth: '🌍', air: '💨', metal: '⚙️', void: '🌑',
};

// --- TRAIT LABELS ---
export const TRAIT_LABELS: Record<string, string> = {
  courage: 'Corajoso', gentleness: 'Gentil', loyalty: 'Leal', curiosity: 'Curioso', resilience: 'Resiliente',
};

export const TRAIT_EMOJI: Record<string, string> = {
  courage: '⚔️', gentleness: '💜', loyalty: '🤝', curiosity: '🔍', resilience: '🛡️',
};

// --- HATCH SEQUENCE TIMING ---
export const HATCH_PHASE_DURATIONS = {
  preparing: 1500,
  cracking: 2000,
  pulse: 1800,
  burst: 1500,
  reveal: 0,
  naming: 0,
  complete: 500,
} as const;

export type HatchPhase = keyof typeof HATCH_PHASE_DURATIONS;
