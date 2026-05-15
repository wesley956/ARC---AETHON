// ============================================================
// ARC: AETHON — SAVE MANAGER
// ============================================================

import { GameSave, MvpOrbElement, CURRENT_SAVE_VERSION } from '../types/game';
import { SAVE_KEY } from '../constants/gameConstants';
import { getTodayKey } from './TimeManager';

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

export function writeSave(save: GameSave): void {
  try {
    const updated: GameSave = { ...save, lastSaveTime: Date.now() };
    localStorage.setItem(SAVE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('[SaveManager] Failed to write save:', e);
  }
}

export function deleteSave(): void {
  localStorage.removeItem(SAVE_KEY);
}

export function generateAccountId(): string {
  return `aethon_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

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
