// ============================================================
// ARC: AETHON — NEST UTILITIES
// ============================================================

import { NestData, NestSlot } from '../types/game';

export function createDefaultNestData(): NestData {
  return { comfort: 0, style: 'basic', slots: { base: null, comfort: null, relic: null }, appliedUpgrades: [], lastUpdatedAt: null };
}

export function normalizeNestData(input: unknown): NestData {
  const defaultNest = createDefaultNestData();
  if (!input || typeof input !== 'object') return defaultNest;

  const obj = input as Record<string, unknown>;
  if ('slots' in obj && typeof obj.slots === 'object' && obj.slots !== null) {
    const slots = obj.slots as Record<string, unknown>;
    return {
      comfort: typeof obj.comfort === 'number' ? obj.comfort : 0,
      style: isValidStyle(obj.style) ? obj.style : 'basic',
      slots: {
        base: isValidSlot(slots.base) ? slots.base as NestSlot : null,
        comfort: isValidSlot(slots.comfort) ? slots.comfort as NestSlot : null,
        relic: isValidSlot(slots.relic) ? slots.relic as NestSlot : null,
      },
      appliedUpgrades: Array.isArray(obj.appliedUpgrades) ? obj.appliedUpgrades as string[] : [],
      lastUpdatedAt: typeof obj.lastUpdatedAt === 'string' ? obj.lastUpdatedAt : null,
    };
  }

  const oldComfort = typeof obj.comfortLevel === 'number' ? obj.comfortLevel : 0;
  return { ...defaultNest, comfort: oldComfort };
}

function isValidStyle(value: unknown): value is NestData['style'] {
  return typeof value === 'string' && ['basic', 'warm', 'stone', 'memory'].includes(value);
}

function isValidSlot(value: unknown): boolean {
  if (!value || typeof value !== 'object') return false;
  const slot = value as Record<string, unknown>;
  return typeof slot.id === 'string' && typeof slot.name === 'string';
}

export function recalculateComfort(slots: NestData['slots']): number {
  let total = 0;
  if (slots.base) total += slots.base.comfortBonus;
  if (slots.comfort) total += slots.comfort.comfortBonus;
  if (slots.relic) total += slots.relic.comfortBonus;
  return Math.min(100, total);
}

export function determineNestStyle(slots: NestData['slots']): NestData['style'] {
  if (slots.relic) return 'memory';
  if (slots.comfort) return 'warm';
  if (slots.base) return 'stone';
  return 'basic';
}

export function getComfortDescription(comfort: number): string {
  if (comfort >= 23) return 'O dragão descansa melhor aqui. O ninho guarda história.';
  if (comfort >= 18) return 'O dragão descansa melhor aqui. Algo no ninho guarda lembranças.';
  if (comfort >= 10) return 'O dragão descansa melhor aqui.';
  if (comfort >= 5) return 'O ninho começa a ficar mais agradável.';
  return 'O ninho ainda é simples, mas cada material trazido de Aethon pode transformá-lo.';
}

export function getStyleDescription(style: NestData['style']): string {
  switch (style) {
    case 'stone': return '🪨 Base estável.';
    case 'warm': return '🔥 Afinidade de Fogo no ninho.';
    case 'memory': return '✨ Algo no ninho guarda lembranças.';
    default: return '🏠 Ninho básico.';
  }
}
