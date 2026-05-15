// ============================================================
// ARC: AETHON — TIME MANAGER
// Handles offline orb generation, daily reset, and time-based calculations.
// ============================================================

import { EggData, Orb, MvpOrbElement, GameSave } from '../types/game';
import {
  ORB_GENERATION_INTERVAL_MS,
  ORB_MIN_PER_WINDOW,
  ORB_MAX_PER_WINDOW,
  ORB_TRAY_MAX,
  MVP_ORB_ELEMENTS,
} from '../constants/gameConstants';

/**
 * Generate a unique orb ID.
 */
function generateOrbId(): string {
  return `orb_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Pick a random MVP element for an orb.
 */
function randomMvpElement(): MvpOrbElement {
  const idx = Math.floor(Math.random() * MVP_ORB_ELEMENTS.length);
  return MVP_ORB_ELEMENTS[idx];
}

/**
 * Random integer between min and max (inclusive).
 */
function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Get today's key in YYYY-MM-DD format.
 */
export function getTodayKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

/**
 * Apply daily reset to save.
 * 
 * Compares save.lastDayKey with today:
 * - If different day:
 *   - If eggData exists: set nightEventDoneToday = false
 *   - Set totalAdsWatched = 0
 *   - Set lastAdResetDay = today
 *   - Set lastDayKey = today
 * - If same day: return save unchanged
 * 
 * This is the ONLY place where lastDayKey should be modified.
 */
export function applyDailyReset(save: GameSave): GameSave {
  const today = getTodayKey();
  
  // Same day - no reset needed
  if (save.lastDayKey === today) {
    return save;
  }
  
  // Different day - apply reset
  let updatedSave: GameSave = {
    ...save,
    totalAdsWatched: 0,
    lastAdResetDay: today,
    lastDayKey: today,
  };
  
  // Reset egg daily flags if egg exists
  if (updatedSave.eggData) {
    updatedSave = {
      ...updatedSave,
      eggData: {
        ...updatedSave.eggData,
        nightEventDoneToday: false,
      },
    };
  }
  
  return updatedSave;
}

/**
 * Process offline orb generation.
 * Called when the app opens or resumes.
 *
 * Rules:
 * - Calculate 2-hour windows since lastOrbGenTime.
 * - Generate 1-2 orbs per window.
 * - Fill tray up to ORB_TRAY_MAX.
 * - If tray fills, update lastOrbGenTime to now.
 *
 * Returns updated EggData (or same if nothing changed).
 */
export function processOfflineOrbs(eggData: EggData): EggData {
  const now = Date.now();
  const elapsed = now - eggData.lastOrbGenTime;

  if (elapsed < ORB_GENERATION_INTERVAL_MS) {
    // Not enough time passed
    return eggData;
  }

  const windowCount = Math.floor(elapsed / ORB_GENERATION_INTERVAL_MS);

  if (windowCount <= 0) return eggData;

  const newOrbs: Orb[] = [...eggData.availableOrbs];
  let windowsProcessed = 0;

  for (let i = 0; i < windowCount; i++) {
    if (newOrbs.length >= ORB_TRAY_MAX) break;

    const orbsThisWindow = randInt(ORB_MIN_PER_WINDOW, ORB_MAX_PER_WINDOW);

    for (let j = 0; j < orbsThisWindow; j++) {
      if (newOrbs.length >= ORB_TRAY_MAX) break;

      newOrbs.push({
        id: generateOrbId(),
        element: randomMvpElement(),
        createdAt: eggData.lastOrbGenTime + (i + 1) * ORB_GENERATION_INTERVAL_MS,
      });
    }

    windowsProcessed = i + 1;
  }

  const trayFull = newOrbs.length >= ORB_TRAY_MAX;
  const newLastOrbGenTime = trayFull
    ? now
    : eggData.lastOrbGenTime + windowsProcessed * ORB_GENERATION_INTERVAL_MS;

  return {
    ...eggData,
    availableOrbs: newOrbs,
    lastOrbGenTime: newLastOrbGenTime,
  };
}

/**
 * Get the time until the next orb generation (ms).
 */
export function getTimeUntilNextOrb(lastOrbGenTime: number): number {
  const nextGen = lastOrbGenTime + ORB_GENERATION_INTERVAL_MS;
  return Math.max(0, nextGen - Date.now());
}

/**
 * Format milliseconds as "HH:MM:SS".
 * Returns "Pronto!" if time is 0 or negative.
 */
export function formatTimeRemaining(ms: number): string {
  if (ms <= 0) return 'Pronto!';
  
  const totalSeconds = Math.ceil(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
