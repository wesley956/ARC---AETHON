// ============================================================
// ARC: AETHON — GAME STATE VALIDATOR
// ============================================================

import { SaveValidationResult, CURRENT_SAVE_VERSION } from '../types/game';

function validateEggData(eggData: unknown, errors: string[]): void {
  if (!eggData || typeof eggData !== 'object') { errors.push('eggData não é um objeto válido.'); return; }
  const e = eggData as Record<string, unknown>;
  if (!Array.isArray(e.availableOrbs)) errors.push('eggData.availableOrbs deve ser um array.');
  if (!Array.isArray(e.orbsOnEgg)) errors.push('eggData.orbsOnEgg deve ser um array.');
  if (typeof e.maturationProgress !== 'number') errors.push('eggData.maturationProgress deve ser um número.');
  if (typeof e.lastOrbGenTime !== 'number') errors.push('eggData.lastOrbGenTime deve ser um número.');
  if (typeof e.nightEventDoneToday !== 'boolean') errors.push('eggData.nightEventDoneToday deve ser um booleano.');
}

function validateDragonData(dragonData: unknown, errors: string[]): void {
  if (!dragonData || typeof dragonData !== 'object') { errors.push('dragonData não é um objeto válido.'); return; }
  const d = dragonData as Record<string, unknown>;
  if (typeof d.dragonName !== 'string') errors.push('dragonData.dragonName deve ser uma string.');
  if (!d.dragonType) errors.push('dragonData.dragonType deve existir.');
  if (typeof d.vitality !== 'number') errors.push('dragonData.vitality deve ser um número.');
  if (d.diaryEntries !== undefined && !Array.isArray(d.diaryEntries)) errors.push('dragonData.diaryEntries deve ser um array.');
  if (d.materials !== undefined && d.materials !== null) {
    if (typeof d.materials !== 'object') errors.push('dragonData.materials deve ser um objeto ou array.');
  }
  if (!d.crystals || typeof d.crystals !== 'object') errors.push('dragonData.crystals deve ser um objeto.');
  if (!d.personalityTraits || typeof d.personalityTraits !== 'object') errors.push('dragonData.personalityTraits deve ser um objeto.');
}

export function validateSave(save: unknown): SaveValidationResult {
  const errors: string[] = [];
  if (!save || typeof save !== 'object') return { isValid: false, errors: ['Save não é um objeto válido.'] };
  const s = save as Record<string, unknown>;

  if (!s.accountId || typeof s.accountId !== 'string') errors.push('Save não possui accountId válido.');
  if (s.saveVersion === undefined || s.saveVersion === null) errors.push('saveVersion ausente no save.');
  else if (typeof s.saveVersion !== 'number') errors.push('saveVersion não é um número.');
  else if ((s.saveVersion as number) > CURRENT_SAVE_VERSION) errors.push(`saveVersion (${s.saveVersion}) é mais recente que o suportado (${CURRENT_SAVE_VERSION}).`);

  const hasEgg = s.hasEgg;
  const hasDragon = s.hasDragon;
  if (typeof hasEgg !== 'boolean') errors.push('hasEgg não é um booleano.');
  if (typeof hasDragon !== 'boolean') errors.push('hasDragon não é um booleano.');
  if (hasEgg === true && hasDragon === true) errors.push('VIOLAÇÃO DA REGRA CENTRAL: hasEgg e hasDragon estão ambos como true.');
  if (hasEgg === true) { if (!s.eggData) errors.push('hasEgg é true mas eggData está ausente.'); else validateEggData(s.eggData, errors); }
  if (hasDragon === true) { if (!s.dragonData) errors.push('hasDragon é true mas dragonData está ausente.'); else validateDragonData(s.dragonData, errors); }
  if (s.eggData && s.dragonData) errors.push('eggData e dragonData existem simultaneamente.');
  if (typeof s.onboardingDone !== 'boolean') errors.push('onboardingDone não é um booleano.');

  return { isValid: errors.length === 0, errors };
}
