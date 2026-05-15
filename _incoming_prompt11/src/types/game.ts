// ============================================================
// ARC: AETHON — GAME TYPES
// Source of Truth: Game Flow Bible v1.2
// ============================================================

// --- SCREENS / STATE MACHINE ---
export type AppScreen =
  | 'Splash'
  | 'NoSave'
  | 'Onboarding'
  | 'EggActive'
  | 'EggReadyToHatch'
  | 'HatchScene'
  | 'DragonActive'
  | 'DragonOnExpedition'
  | 'ExpeditionReturnReady'
  | 'NestManagement'
  | 'DiaryView'
  | 'InvalidSaveState';

// --- ELEMENTS ---
export type PublicElementType = 'fire' | 'water' | 'earth' | 'air' | 'metal';
export type HiddenElementType = 'void';
export type ElementType = PublicElementType | HiddenElementType;

/** MVP orbs are limited to fire, water, earth only */
export type MvpOrbElement = 'fire' | 'water' | 'earth';

// --- ORBS ---
export interface Orb {
  id: string;
  element: MvpOrbElement;
  createdAt: number;
}

// --- EGG ---
export interface EggData {
  fireEnergy: number;
  waterEnergy: number;
  earthEnergy: number;
  airEnergy: number;
  metalEnergy: number;
  voidEnergy: number;
  maturationProgress: number;
  maturationRate: number;
  eggCreationTime: number;
  availableOrbs: Orb[];
  orbsOnEgg: Orb[];
  lastOrbGenTime: number;
  nightEventDoneToday: boolean;
}

// --- DIARY ---
export interface DiaryEntry {
  id: string;
  dayNumber: number;
  text: string;
  timestamp: number;
  category?: 'birth' | 'feeding' | 'expedition' | 'memory' | 'milestone' | 'nest';
}

// --- MATERIALS ---
export type MaterialId = 'living_ash' | 'ancient_stone' | 'shell_fragment' | 'memory_echo';

export interface MaterialDefinition {
  id: MaterialId;
  name: string;
  emoji: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  description: string;
}

export type MaterialInventory = Record<MaterialId, number>;

export interface Material {
  id: string;
  name: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  element?: ElementType;
  description?: string;
  quantity: number;
}

// --- EXPEDITION ---
export type ExpeditionZoneId = 'ruinas_de_ignareth';
export type ExpeditionLayerId = 'fronteira' | 'interior';

export interface ExpeditionState {
  isOnExpedition: boolean;
  zoneId: ExpeditionZoneId | null;
  layerId: ExpeditionLayerId | null;
  startTime: number | null;
  returnTime: number | null;
}

export interface ExpeditionRewards {
  crystals: Partial<CrystalInventory>;
  materials: Partial<MaterialInventory>;
  wasInjured: boolean;
  foundMemoryEcho: boolean;
}

// --- INJURY ---
export interface InjuryState {
  isInjured: boolean;
  recoveryTime: number | null;
}

// --- NEST ---
export type NestSlotType = 'base' | 'comfort' | 'relic';
export type NestStyle = 'basic' | 'warm' | 'stone' | 'memory';

export interface NestSlot {
  id: string;
  name: string;
  materialId: MaterialId;
  slotType: NestSlotType;
  comfortBonus: number;
  elementalAffinity?: ElementType;
  description: string;
}

export interface NestData {
  comfort: number;
  style: NestStyle;
  slots: {
    base: NestSlot | null;
    comfort: NestSlot | null;
    relic: NestSlot | null;
  };
  appliedUpgrades: string[];
  lastUpdatedAt: string | null;
}

// --- PROFESSIONS ---
export interface ProfessionProgress {
  discoveredProfession: string | null;
  professionXp: number;
  professionLevel: number;
  hints: string[];
  tendencies?: {
    guardian?: number;
    forge?: number;
    memory?: number;
  };
}

// --- CRYSTALS ---
export interface CrystalInventory {
  fire: number;
  water: number;
  earth: number;
  air: number;
  metal: number;
}

// --- PERSONALITY ---
export interface PersonalityTraits {
  courage: number;
  gentleness: number;
  loyalty: number;
  curiosity: number;
  resilience: number;
}

export type TraitKey = keyof PersonalityTraits;

// --- DRAGON TAXONOMY ---
export type DragonLineageCategory =
  | 'pure'
  | 'fused_public'
  | 'threshold_variant'
  | 'convergence';

export interface DragonType {
  id: string;
  name: string;
  category: DragonLineageCategory;
  elements: ElementType[];
  lore?: string;
  isHidden: boolean;
}

// --- DRAGON ---
export interface DragonData {
  dragonName: string;
  dragonType: string;
  dominantElement: ElementType;
  vitality: number;
  personalityTraits: PersonalityTraits;
  isOnExpedition: boolean;
  expeditionEndTime: number | null;
  expeditionZoneId: ExpeditionZoneId | null;
  expeditionLayerId: ExpeditionLayerId | null;
  expeditionStartTime: number | null;
  isInjured: boolean;
  recoveryTime: number | null;
  diaryEntries: DiaryEntry[];
  crystals: CrystalInventory;
  materials: MaterialInventory;
  nestData: NestData;
  professionProgress: ProfessionProgress;
  foodsEatenFirstTime: string[];
}

// --- SAVE ---
export const CURRENT_SAVE_VERSION = 1;

export interface GameSave {
  accountId: string;
  hasEgg: boolean;
  hasDragon: boolean;
  eggData: EggData | null;
  dragonData: DragonData | null;
  onboardingDone: boolean;
  lastSaveTime: number;
  lastDayKey: string;
  totalAdsWatched: number;
  lastAdResetDay: string;
  saveVersion: number;
}

// --- SAVE VALIDATION ---
export interface SaveValidationResult {
  isValid: boolean;
  errors: string[];
}

// --- FOOD SYSTEM ---
export interface FoodRecipe {
  id: string;
  name: string;
  emoji: string;
  cost: Partial<CrystalInventory>;
  vitalityGain: number;
  traitPush: TraitKey;
  traitAmount: number;
  feedMessage: string;
  diaryEntry: string;
}
