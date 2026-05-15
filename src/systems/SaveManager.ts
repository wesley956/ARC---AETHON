// ============================================================
// ARC: AETHON — SAVE MANAGER
// Handles localStorage read/write with validation.
//
// IMPORTANT:
// - writeSave() only updates lastSaveTime
// - lastDayKey is ONLY modified by applyDailyReset() in TimeManager
// ============================================================

import { GameSave, MvpOrbElement, CURRENT_SAVE_VERSION } from '../types/game';
import { SAVE_KEY } from '../constants/gameConstants';
import { getTodayKey } from './TimeManager';

/**
 * Load save from localStorage.
 * Returns null if no save exists or if JSON is unparseable.
 * Does NOT validate — caller should run GameStateValidator.
 */
export function loadSave(): GameSave | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed as GameSave;
  } catch {
    console.error('[SaveManager] Failed to parse save from localStorage.');
    return null;
  }
}

/**
 * Persist save to localStorage.
 * 
 * ONLY updates lastSaveTime.
 * Does NOT update lastDayKey — that is handled exclusively by applyDailyReset().
 */
export function writeSave(save: GameSave): void {
  try {
    const updated: GameSave = {
      ...save,
      lastSaveTime: Date.now(),
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('[SaveManager] Failed to write save:', e);
  }
}

/**
 * Delete save from localStorage.
 * DEV ONLY — must never be exposed as a player-facing feature.
 */
export function deleteSave(): void {
  localStorage.removeItem(SAVE_KEY);
}

/**
 * Generate a unique account ID.
 */
export function generateAccountId(): string {
  return `aethon_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Create the initial save after onboarding.
 */
export function createInitialSave(initialOrb: { id: string; element: MvpOrbElement; createdAt: number }): GameSave {
  const now = Date.now();
  const todayKey = getTodayKey();

  return {
    accountId: generateAccountId(),
    hasEgg: true,
    hasDragon: false,
    eggData: {
      fireEnergy: 0,
      waterEnergy: 0,
      earthEnergy: 0,
      airEnergy: 0,
      metalEnergy: 0,
      voidEnergy: 0,
      maturationProgress: 0,
      maturationRate: 1,
      eggCreationTime: now,
      availableOrbs: [initialOrb],
      orbsOnEgg: [],
      lastOrbGenTime: now,
      nightEventDoneToday: false,
    },
    dragonData: null,
    onboardingDone: true,
    lastSaveTime: now,
    lastDayKey: todayKey,
    totalAdsWatched: 0,
    lastAdResetDay: todayKey,
    saveVersion: CURRENT_SAVE_VERSION,
  };
}
