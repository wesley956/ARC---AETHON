// ============================================================
// ARC: AETHON — GAME CONSTANTS
// Source of Truth: Game Flow Bible v1.2
// ============================================================

// --- ORB GENERATION ---

/** Time between orb generation windows (ms) */
export const ORB_GENERATION_INTERVAL_MS = 2 * 60 * 60 * 1000; // 2 hours

/** Minimum orbs per generation window */
export const ORB_MIN_PER_WINDOW = 1;

/** Maximum orbs per generation window */
export const ORB_MAX_PER_WINDOW = 2;

/** Maximum orbs in tray (availableOrbs) */
export const ORB_TRAY_MAX = 8;

/** Maximum orbs orbiting the egg */
export const ORB_ON_EGG_MAX = 5;

/** MVP orb elements - typed to MvpOrbElement */
import type { MvpOrbElement } from '../types/game';
export const MVP_ORB_ELEMENTS: readonly MvpOrbElement[] = ['fire', 'water', 'earth'] as const;

// --- ABSORPTION ---

/** Energy gain per orb of matching element */
export const ENERGY_PER_ORB = 0.05;

/** Void energy gain per absorption (any element) */
export const VOID_ENERGY_PER_ABSORPTION = 0.01;

/** Maximum void energy */
export const VOID_ENERGY_MAX = 0.5;

/** Maturation gain per orb absorbed */
export const MATURATION_PER_ORB = 0.02;

/** Hold time to trigger absorption (ms) */
export const ABSORPTION_HOLD_TIME_MS = 2000;

/** Egg drop detection radius (px) - generous for mobile */
export const EGG_DROP_RADIUS = 110;

// --- MATURATION ---

/** Maturation threshold for hatching (1.0 = 100%) */
export const MATURATION_HATCH_THRESHOLD = 1.0;

// --- FEEDING ---

export const FOOD_RECIPES = {
  brasaCrocante: {
    name: 'Brasa Crocante',
    cost: { fire: 1 },
    vitalityGain: 5,
    traitPush: 'courage' as const,
    traitAmount: 0.02,
  },
  caldoDasMares: {
    name: 'Caldo das Marés',
    cost: { water: 1 },
    vitalityGain: 5,
    traitPush: 'gentleness' as const,
    traitAmount: 0.02,
  },
  raizDourada: {
    name: 'Raiz Dourada',
    cost: { earth: 1 },
    vitalityGain: 5,
    traitPush: 'loyalty' as const,
    traitAmount: 0.02,
  },
} as const;

// --- EXPEDITIONS ---

export const EXPEDITION_ZONES = {
  ruinasDeIgnareth: {
    id: 'ruinas_de_ignareth',
    name: 'Ruínas de Ignareth',
    layers: {
      fronteira: {
        name: 'Fronteira',
        durationRange: [30 * 60 * 1000, 2 * 60 * 60 * 1000] as [number, number],
        risk: 0,
        rewards: {
          crystalRange: [1, 3] as [number, number],
          crystalElement: 'fire' as const,
          commonMaterialChance: 1.0,
          narrativeFragmentChance: 0.1,
        },
      },
      interior: {
        name: 'Interior',
        durationRange: [3 * 60 * 60 * 1000, 6 * 60 * 60 * 1000] as [number, number],
        risk: 0.1,
        rewards: {
          crystalRange: [2, 5] as [number, number],
          crystalElement: 'mixed' as const,
          uncommonMaterialChance: 0.5,
          echoChance: 0.15,
        },
      },
    },
  },
} as const;

// --- SAVE ---

export const SAVE_KEY = 'arc_aethon_save';

// --- BALANCING META ---
// Active player: ~3 days to hatch
// Casual player: ~5 days to hatch
// Mostly idle: ~7 days to hatch
// This is achieved via ORB_GENERATION_INTERVAL_MS + MATURATION_PER_ORB

// --- THRESHOLD DRAGONS ---

/** Maximum threshold dragons allowed globally (future server control) */
export const MAX_THRESHOLD_DRAGONS = 4;

/** One is reserved for the creator/founder */
export const THRESHOLD_RESERVED_FOR_CREATOR = 1;

// --- ELEMENT LABELS ---

export const ELEMENT_LABELS: Record<string, string> = {
  fire: 'Fogo',
  water: 'Água',
  earth: 'Terra',
  air: 'Ar',
  metal: 'Metal',
  void: 'Vazio',
};

export const ELEMENT_COLORS: Record<string, string> = {
  fire: '#ff6b35',
  water: '#3b82f6',
  earth: '#8b6914',
  air: '#a0d2db',
  metal: '#9ca3af',
  void: '#4a0e4e',
};

export const ELEMENT_EMOJI: Record<string, string> = {
  fire: '🔥',
  water: '💧',
  earth: '🌍',
  air: '💨',
  metal: '⚙️',
  void: '🌑',
};

// --- HATCH SEQUENCE TIMING ---

export const HATCH_PHASE_DURATIONS = {
  preparing: 1500,
  cracking: 2000,
  pulse: 1800,
  burst: 1500,
  reveal: 0, // Manual advance
  naming: 0, // Manual advance
  complete: 500,
} as const;

export type HatchPhase = keyof typeof HATCH_PHASE_DURATIONS;
