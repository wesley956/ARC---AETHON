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
  MaterialInventory,
} from '../types/game';
import { ResolvedDragonType, getInitialPersonalityTraits } from './DragonTypeResolver';
import { INITIAL_DRAGON_VITALITY } from '../constants/gameConstants';

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function createFirstDiaryEntry(): DiaryEntry {
  return {
    id: generateId('diary'),
    dayNumber: 1,
    text: 'Dia 1 — Ele abriu os olhos pela primeira vez. Me olhou. Não tinha medo.',
    timestamp: Date.now(),
    category: 'birth',
  };
}

function createInitialCrystals(): CrystalInventory {
  return { fire: 3, water: 3, earth: 3, air: 0, metal: 0 };
}

function createInitialMaterials(): MaterialInventory {
  return { living_ash: 0, ancient_stone: 0, shell_fragment: 0, memory_echo: 0 };
}

function createInitialNest(): NestData {
  return {
    comfort: 0,
    style: 'basic',
    slots: {
      base: null,
      comfort: null,
      relic: null,
    },
    appliedUpgrades: [],
    lastUpdatedAt: null,
  };
}

function createInitialProfessionProgress(): ProfessionProgress {
  return {
    discoveredProfession: null,
    professionXp: 0,
    professionLevel: 0,
    hints: [],
    tendencies: {
      guardian: 0,
      forge: 0,
      memory: 0,
    },
  };
}

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
    vitality: INITIAL_DRAGON_VITALITY,
    personalityTraits,
    
    isOnExpedition: false,
    expeditionEndTime: null,
    expeditionZoneId: null,
    expeditionLayerId: null,
    expeditionStartTime: null,
    
    isInjured: false,
    recoveryTime: null,
    
    diaryEntries: [createFirstDiaryEntry()],
    crystals: createInitialCrystals(),
    materials: createInitialMaterials(),
    
    nestData: createInitialNest(),
    professionProgress: createInitialProfessionProgress(),
    
    foodsEatenFirstTime: [],
  };
}

export function validateDragonName(name: string): string | null {
  const trimmed = name.trim();

  if (!trimmed) return 'Dê um nome ao seu dragão antes de continuar.';
  if (trimmed.length < 2) return 'O nome deve ter pelo menos 2 caracteres.';
  if (trimmed.length > 20) return 'O nome deve ter no máximo 20 caracteres.';

  return null;
}
