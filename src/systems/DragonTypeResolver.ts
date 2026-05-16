// ============================================================
// ARC: AETHON — DRAGON TYPE RESOLVER
// ============================================================

import { EggData, PublicElementType, ElementType, PersonalityTraits } from '../types/game';
import { getDragonTypeById } from '../data/dragonTaxonomy';

export interface ResolvedDragonType {
  dragonTypeId: string;
  dragonTypeName: string;
  dominantElement: ElementType;
  secondaryElement: ElementType | null;
  voidTouched: boolean;
  elements: ElementType[];
}

interface ElementRatios { fire: number; water: number; earth: number; air: number; metal: number; }

const PURE_THRESHOLD = 0.60;
const VOID_TOUCHED_THRESHOLD = 0.25;
const FALLBACK_TYPE_ID = 'pure_earth';

const FUSED_TYPE_MAP: Record<string, string> = {
  'fire+water': 'fused_fire_water', 'fire+earth': 'fused_fire_earth', 'water+earth': 'fused_water_earth',
  'fire+air': 'fused_fire_air', 'water+air': 'fused_water_air', 'earth+air': 'fused_earth_air',
  'fire+metal': 'fused_fire_metal', 'water+metal': 'fused_water_metal', 'earth+metal': 'fused_earth_metal', 'air+metal': 'fused_air_metal',
};

function getPairKey(a: PublicElementType, b: PublicElementType): string {
  const s = new Set([a, b]);
  if (s.has('fire') && s.has('water')) return 'fire+water';
  if (s.has('fire') && s.has('earth')) return 'fire+earth';
  if (s.has('water') && s.has('earth')) return 'water+earth';
  if (s.has('fire') && s.has('air')) return 'fire+air';
  if (s.has('water') && s.has('air')) return 'water+air';
  if (s.has('earth') && s.has('air')) return 'earth+air';
  if (s.has('fire') && s.has('metal')) return 'fire+metal';
  if (s.has('water') && s.has('metal')) return 'water+metal';
  if (s.has('earth') && s.has('metal')) return 'earth+metal';
  if (s.has('air') && s.has('metal')) return 'air+metal';
  return 'fire+water';
}

function calculateRatios(eggData: EggData): ElementRatios {
  const total = eggData.fireEnergy + eggData.waterEnergy + eggData.earthEnergy + eggData.airEnergy + eggData.metalEnergy;
  if (total === 0) return { fire: 0, water: 0, earth: 1, air: 0, metal: 0 };
  return { fire: eggData.fireEnergy / total, water: eggData.waterEnergy / total, earth: eggData.earthEnergy / total, air: eggData.airEnergy / total, metal: eggData.metalEnergy / total };
}

function getTopTwoElements(ratios: ElementRatios): [PublicElementType, PublicElementType] {
  const sorted = (Object.entries(ratios) as [PublicElementType, number][]).sort((a, b) => b[1] - a[1]);
  return [sorted[0][0], sorted[1][0]];
}

export function resolveDragonType(eggData: EggData): ResolvedDragonType {
  const ratios = calculateRatios(eggData);
  const [topElement, secondElement] = getTopTwoElements(ratios);
  const voidTouched = eggData.voidEnergy >= VOID_TOUCHED_THRESHOLD;

  if (ratios[topElement] >= PURE_THRESHOLD) {
    const typeId = `pure_${topElement}`;
    const dragonType = getDragonTypeById(typeId);
    return { dragonTypeId: typeId, dragonTypeName: dragonType?.name || `Dragão de ${topElement}`, dominantElement: topElement, secondaryElement: null, voidTouched, elements: [topElement] };
  }

  const pairKey = getPairKey(topElement, secondElement);
  const fusedTypeId = FUSED_TYPE_MAP[pairKey] || FALLBACK_TYPE_ID;
  const dragonType = getDragonTypeById(fusedTypeId);
  return {
    dragonTypeId: fusedTypeId, dragonTypeName: dragonType?.name || `Dragão de ${topElement} e ${secondElement}`,
    dominantElement: ratios[topElement] >= ratios[secondElement] ? topElement : secondElement,
    secondaryElement: secondElement, voidTouched, elements: [topElement, secondElement],
  };
}

export function getDragonNarrativePhrase(typeId: string, voidTouched: boolean): string {
  const phrases: Record<string, string> = {
    pure_fire: 'Nascido das brasas de Ignareth. Seus olhos queimam com a memória do mundo.',
    pure_water: 'Das águas paradas de Velun. Ele carrega algo que não deveria ser possível: paz.',
    pure_earth: 'Da terra que não cedeu. Ele está aqui. Ele ficará.',
    pure_air: 'Dos ventos que ainda lembram o céu antigo, ele respirou pela primeira vez.',
    pure_metal: 'Do metal que sobreviveu ao Colapso, nasceu uma vontade que não se dobra.',
    fused_fire_water: 'Fogo e Água em um só. Aethon nunca viu isso antes do Colapso.',
    fused_fire_earth: 'A fúria da terra e do fogo. Prepare-se.',
    fused_water_earth: 'Água e Terra em harmonia. Raro. Precioso.',
    fused_fire_air: 'Fogo e Ar se encontraram em cinzas dançantes.',
    fused_water_air: 'Água e Ar se tornaram névoa viva.',
    fused_earth_air: 'Terra e Ar desafiaram o peso do mundo.',
    fused_fire_metal: 'Fogo e Metal cantaram dentro da casca.',
    fused_water_metal: 'Água e Metal fluíram como prata viva.',
    fused_earth_metal: 'Terra e Metal se fecharam em couraça.',
    fused_air_metal: 'Ar e Metal cortaram o silêncio.',
  };
  let phrase = phrases[typeId] || 'Ele abriu os olhos. Aethon ficou em silêncio por um instante.';
  if (voidTouched) phrase += '\n\nPor um instante, algo entre as rachaduras pareceu olhar de volta.';
  return phrase;
}

export function getInitialPersonalityTraits(dominantElement: ElementType, secondaryElement: ElementType | null): PersonalityTraits {
  const base: PersonalityTraits = { courage: 0.1, gentleness: 0.1, loyalty: 0.1, curiosity: 0.1, resilience: 0.1 };
  const traitMap: Record<string, keyof PersonalityTraits> = { fire: 'courage', water: 'gentleness', earth: 'loyalty', air: 'curiosity', metal: 'resilience' };
  if (traitMap[dominantElement]) base[traitMap[dominantElement]] = 0.3;
  if (secondaryElement && traitMap[secondaryElement]) base[traitMap[secondaryElement]] = Math.min(0.4, base[traitMap[secondaryElement]] + 0.15);
  return base;
}
