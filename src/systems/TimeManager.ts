// ============================================================
// ARC: AETHON — TIME MANAGER
// Handles offline orb generation and daily reset.
// ============================================================

import { EggData, GameSave, MvpOrbElement, Orb } from '../types/game';
import {
  ORB_GENERATION_INTERVAL_MS,
  ORB_MIN_PER_WINDOW,
  ORB_MAX_PER_WINDOW,
  ORB_TRAY_MAX,
  MVP_ORB_ELEMENTS,
} from '../constants/gameConstants';

/**
 * Get today's date key in YYYY-MM-DD format.
 */
export function getTodayKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Generate a random orb.
 */
function generateOrb(): Orb {
  const element: MvpOrbElement = MVP_ORB_ELEMENTS[Math.floor(Math.random() * MVP_ORB_ELEMENTS.length)];
  return {
    id: `orb_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    element,
    createdAt: Date.now(),
  };
}

/**
 * Process offline orb generation.
 * Called when the app opens to catch up on missed orb windows.
 */
export function processOfflineOrbs(eggData: EggData): EggData {
  const now = Date.now();
  const elapsed = now - eggData.lastOrbGenTime;

  // Calculate how many windows have passed
  const windowsPassed = Math.floor(elapsed / ORB_GENERATION_INTERVAL_MS);

  if (windowsPassed === 0) {
    // No complete windows passed, return unchanged
    return eggData;
  }

  // Generate orbs for each window
  let newOrbs: Orb[] = [];
  for (let i = 0; i < windowsPassed; i++) {
    const orbsThisWindow = ORB_MIN_PER_WINDOW + Math.floor(Math.random() * (ORB_MAX_PER_WINDOW - ORB_MIN_PER_WINDOW + 1));
    for (let j = 0; j < orbsThisWindow; j++) {
      newOrbs.push(generateOrb());
    }
  }

  // Combine with existing orbs, respecting tray max
  const combinedOrbs = [...eggData.availableOrbs, ...newOrbs];
  const finalOrbs = combinedOrbs.slice(0, ORB_TRAY_MAX);

  // Update lastOrbGenTime
  // If tray is full, set to now (stop accumulating)
  // Otherwise, advance by the windows that passed
  const newLastOrbGenTime = finalOrbs.length >= ORB_TRAY_MAX
    ? now
    : eggData.lastOrbGenTime + windowsPassed * ORB_GENERATION_INTERVAL_MS;

  return {
    ...eggData,
    availableOrbs: finalOrbs,
    lastOrbGenTime: newLastOrbGenTime,
  };
}

/**
 * Apply daily reset if it's a new day.
 * This is the ONLY place where lastDayKey should be modified.
 */
export function applyDailyReset(save: GameSave): GameSave {
  const todayKey = getTodayKey();

  if (save.lastDayKey === todayKey) {
    // Same day, no reset needed
    return save;
  }

  // New day! Apply resets
  let updatedSave: GameSave = {
    ...save,
    lastDayKey: todayKey,
  };

  // Reset egg daily flags
  if (updatedSave.eggData) {
    updatedSave = {
      ...updatedSave,
      eggData: {
        ...updatedSave.eggData,
        nightEventDoneToday: false,
      },
    };
  }

  // Reset ad counter if needed
  if (updatedSave.lastAdResetDay !== todayKey) {
    updatedSave = {
      ...updatedSave,
      totalAdsWatched: 0,
      lastAdResetDay: todayKey,
    };
  }

  return updatedSave;
}

/**
 * Calculate the time until the next orb.
 * Returns milliseconds.
 */
export function getTimeUntilNextOrb(lastOrbGenTime: number): number {
  const now = Date.now();
  const elapsed = now - lastOrbGenTime;
  const remaining = ORB_GENERATION_INTERVAL_MS - (elapsed % ORB_GENERATION_INTERVAL_MS);
  return remaining;
}

/**
 * Format milliseconds as HH:MM:SS.
 */
export function formatTimeRemaining(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/**
 * Calculate the current day number since egg creation or dragon birth.
 */
export function calculateDayNumber(creationTime: number): number {
  const now = Date.now();
  const elapsed = now - creationTime;
  const days = Math.floor(elapsed / (24 * 60 * 60 * 1000));
  return days + 1; // Day 1 is the first day
}
