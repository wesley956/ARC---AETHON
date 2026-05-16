// ============================================================
// ARC: AETHON — TIME MANAGER
// ============================================================

import { EggData, GameSave, MvpOrbElement, Orb } from '../types/game';
import { ORB_GENERATION_INTERVAL_MS, ORB_MIN_PER_WINDOW, ORB_MAX_PER_WINDOW, ORB_TRAY_MAX, MVP_ORB_ELEMENTS } from '../constants/gameConstants';

export function getTodayKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function generateOrb(): Orb {
  const element: MvpOrbElement = MVP_ORB_ELEMENTS[Math.floor(Math.random() * MVP_ORB_ELEMENTS.length)];
  return { id: `orb_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`, element, createdAt: Date.now() };
}

export function processOfflineOrbs(eggData: EggData): EggData {
  const now = Date.now();
  const elapsed = now - eggData.lastOrbGenTime;
  const windowsPassed = Math.floor(elapsed / ORB_GENERATION_INTERVAL_MS);
  if (windowsPassed === 0) return eggData;

  const newOrbs: Orb[] = [];
  for (let i = 0; i < windowsPassed; i++) {
    const count = ORB_MIN_PER_WINDOW + Math.floor(Math.random() * (ORB_MAX_PER_WINDOW - ORB_MIN_PER_WINDOW + 1));
    for (let j = 0; j < count; j++) newOrbs.push(generateOrb());
  }
  const combined = [...eggData.availableOrbs, ...newOrbs];
  const final = combined.slice(0, ORB_TRAY_MAX);
  const newTime = final.length >= ORB_TRAY_MAX ? now : eggData.lastOrbGenTime + windowsPassed * ORB_GENERATION_INTERVAL_MS;
  return { ...eggData, availableOrbs: final, lastOrbGenTime: newTime };
}

export function applyDailyReset(save: GameSave): GameSave {
  const todayKey = getTodayKey();
  if (save.lastDayKey === todayKey) return save;
  let updated: GameSave = { ...save, lastDayKey: todayKey };
  if (updated.eggData) updated = { ...updated, eggData: { ...updated.eggData, nightEventDoneToday: false } };
  if (updated.lastAdResetDay !== todayKey) updated = { ...updated, totalAdsWatched: 0, lastAdResetDay: todayKey };
  return updated;
}

export function getTimeUntilNextOrb(lastOrbGenTime: number): number {
  return ORB_GENERATION_INTERVAL_MS - ((Date.now() - lastOrbGenTime) % ORB_GENERATION_INTERVAL_MS);
}

export function formatTimeRemaining(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${String(Math.floor(s / 3600)).padStart(2, '0')}:${String(Math.floor((s % 3600) / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}
