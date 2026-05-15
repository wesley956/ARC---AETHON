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
  createdAt: number; // timestamp
}

// --- EGG ---

export interface EggData {
  fireEnergy: number;
  waterEnergy: number;
  earthEnergy: number;
  airEnergy: number;
  metalEnergy: number;
  voidEnergy: number;
  maturationProgress: number; // 0..1 (1 = ready to hatch)
  maturationRate: number;
  eggCreationTime: number; // timestamp
  availableOrbs: Orb[];
  orbsOnEgg: Orb[];
  lastOrbGenTime: number; // timestamp
  nightEventDoneToday: boolean;
}

// --- DIARY ---

export interface DiaryEntry {
  id: string;
  dayNumber: number;
  text: string;
  timestamp: number;
}

// --- MATERIALS ---

export interface Material {
  id: string;
  name: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  element?: ElementType;
  description?: string;
  quantity: number;
}

// --- NEST ---

export interface NestData {
  base: string | null;
  coating: string | null; // revestimento
  heatSource: string | null; // fonte de calor
  comfortObject: string | null; // objeto de conforto
  relic: string | null; // relíquia
  elementalAmbience: string | null; // ambiente elemental
  comfortLevel: number;
}

// --- PROFESSIONS ---

export interface ProfessionProgress {
  discoveredProfession: string | null;
  professionXp: number;
  professionLevel: number;
  hints: string[]; // narrative hints toward a profession
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
  courage: number;   // Corajoso
  gentleness: number; // Gentil
  loyalty: number;   // Leal
  curiosity: number; // Curioso
  resilience: number; // Resiliente
}

// --- DRAGON TAXONOMY ---

export type DragonLineageCategory =
  | 'pure'
  | 'fused_public'
  | 'threshold_variant' // Limiar — internal only
  | 'convergence';      // Unique creator dragon

export interface DragonType {
  id: string;
  name: string;
  category: DragonLineageCategory;
  elements: ElementType[];
  lore?: string;
  isHidden: boolean; // true for threshold/convergence — never revealed to player
}

// --- DRAGON ---

export interface DragonData {
  dragonName: string;
  dragonType: string; // DragonType.id
  dominantElement: ElementType;
  vitality: number;
  personalityTraits: PersonalityTraits;
  isOnExpedition: boolean;
  expeditionEndTime: number | null;
  diaryEntries: DiaryEntry[];
  crystals: CrystalInventory;
  materials: Material[];
  nestData: NestData;
  professionProgress: ProfessionProgress;
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
  lastDayKey: string; // "YYYY-MM-DD"
  totalAdsWatched: number;
  lastAdResetDay: string;
  saveVersion: number;
}

// --- SAVE VALIDATION ---

export interface SaveValidationResult {
  isValid: boolean;
  errors: string[];
}
