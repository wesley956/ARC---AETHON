// ============================================================
// ARC: AETHON — DRAGON FACTORY
// Creates DragonData from resolved dragon type and player input.
// ============================================================

import {
  DragonData,
  DiaryEntry,
  CrystalInventory,
  NestData,
  ProfessionProgress,
  PersonalityTraits,
  ElementType,
} from '../types/game';
import { ResolvedDragonType, getInitialPersonalityTraits } from './DragonTypeResolver';

/**
 * Generate a unique ID.
 */
function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Create the first diary entry for Day 1.
 */
function createFirstDiaryEntry(): DiaryEntry {
  return {
    id: generateId('diary'),
    dayNumber: 1,
    text: 'Dia 1 — Ele abriu os olhos pela primeira vez. Me olhou. Não tinha medo.',
    timestamp: Date.now(),
  };
}

/**
 * Create initial crystal inventory (empty).
 */
function createInitialCrystals(): CrystalInventory {
  return {
    fire: 0,
    water: 0,
    earth: 0,
    air: 0,
    metal: 0,
  };
}

/**
 * Create initial nest data (basic nest).
 */
function createInitialNest(): NestData {
  return {
    base: null,
    coating: null,
    heatSource: null,
    comfortObject: null,
    relic: null,
    elementalAmbience: null,
    comfortLevel: 0,
  };
}

/**
 * Create initial profession progress (empty).
 */
function createInitialProfessionProgress(): ProfessionProgress {
  return {
    discoveredProfession: null,
    professionXp: 0,
    professionLevel: 0,
    hints: [],
  };
}

/**
 * Create a new DragonData from resolved type and player name.
 */
export function createDragonData(
  resolvedType: ResolvedDragonType,
  dragonName: string
): DragonData {
  const personalityTraits: PersonalityTraits = getInitialPersonalityTraits(
    resolvedType.dominantElement,
    resolvedType.secondaryElement
  );

  return {
    dragonName: dragonName.trim(),
    dragonType: resolvedType.dragonTypeId,
    dominantElement: resolvedType.dominantElement as ElementType,
    vitality: 100,
    personalityTraits,
    isOnExpedition: false,
    expeditionEndTime: null,
    diaryEntries: [createFirstDiaryEntry()],
    crystals: createInitialCrystals(),
    materials: [],
    nestData: createInitialNest(),
    professionProgress: createInitialProfessionProgress(),
  };
}

/**
 * Validate dragon name.
 * Returns error message if invalid, null if valid.
 */
export function validateDragonName(name: string): string | null {
  const trimmed = name.trim();

  if (!trimmed) {
    return 'Dê um nome ao seu dragão antes de continuar.';
  }

  if (trimmed.length < 2) {
    return 'O nome deve ter pelo menos 2 caracteres.';
  }

  if (trimmed.length > 20) {
    return 'O nome deve ter no máximo 20 caracteres.';
  }

  return null;
}
