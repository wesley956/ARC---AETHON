// ============================================================
// ARC: AETHON — DRAGON TYPE RESOLVER
// Resolves dragon type from egg energy data.
// ============================================================

import { EggData, PublicElementType, ElementType, PersonalityTraits } from '../types/game';
import { getDragonTypeById } from '../data/dragonTaxonomy';

/** Result of dragon type resolution */
export interface ResolvedDragonType {
  dragonTypeId: string;
  dragonTypeName: string;
  dominantElement: ElementType;
  secondaryElement: ElementType | null;
  voidTouched: boolean;
  elements: ElementType[];
}

/** Element energy ratios */
interface ElementRatios {
  fire: number;
  water: number;
  earth: number;
  air: number;
  metal: number;
}

const PURE_THRESHOLD = 0.60;
const VOID_TOUCHED_THRESHOLD = 0.25;
const FALLBACK_TYPE_ID = 'pure_earth';

const FUSED_TYPE_MAP: Record<string, string> = {
  'fire+water': 'fused_fire_water',
  'fire+earth': 'fused_fire_earth',
  'water+earth': 'fused_water_earth',
  'fire+air': 'fused_fire_air',
  'water+air': 'fused_water_air',
  'earth+air': 'fused_earth_air',
  'fire+metal': 'fused_fire_metal',
  'water+metal': 'fused_water_metal',
  'earth+metal': 'fused_earth_metal',
  'air+metal': 'fused_air_metal',
};

function getPairKey(a: PublicElementType, b: PublicElementType): string {
  const set = new Set([a, b]);
  if (set.has('fire') && set.has('water')) return 'fire+water';
  if (set.has('fire') && set.has('earth')) return 'fire+earth';
  if (set.has('water') && set.has('earth')) return 'water+earth';
  if (set.has('fire') && set.has('air')) return 'fire+air';
  if (set.has('water') && set.has('air')) return 'water+air';
  if (set.has('earth') && set.has('air')) return 'earth+air';
  if (set.has('fire') && set.has('metal')) return 'fire+metal';
  if (set.has('water') && set.has('metal')) return 'water+metal';
  if (set.has('earth') && set.has('metal')) return 'earth+metal';
  if (set.has('air') && set.has('metal')) return 'air+metal';
  return 'fire+water';
}

function getFusedTypeId(elem1: PublicElementType, elem2: PublicElementType): string {
  const pairKey = getPairKey(elem1, elem2);
  return FUSED_TYPE_MAP[pairKey] || FUSED_TYPE_MAP['fire+water'];
}

function calculateRatios(eggData: EggData): ElementRatios {
  const total = eggData.fireEnergy + eggData.waterEnergy + eggData.earthEnergy + eggData.airEnergy + eggData.metalEnergy;

  if (total === 0) {
    return { fire: 0, water: 0, earth: 1, air: 0, metal: 0 };
  }

  return {
    fire: eggData.fireEnergy / total,
    water: eggData.waterEnergy / total,
    earth: eggData.earthEnergy / total,
    air: eggData.airEnergy / total,
    metal: eggData.metalEnergy / total,
  };
}

function getTopTwoElements(ratios: ElementRatios): [PublicElementType, PublicElementType] {
  const sorted = (Object.entries(ratios) as [PublicElementType, number][])
    .sort((a, b) => b[1] - a[1]);
  return [sorted[0][0], sorted[1][0]];
}

function validateTypeId(typeId: string): string {
  const dragonType = getDragonTypeById(typeId);
  if (!dragonType) {
    return FALLBACK_TYPE_ID;
  }
  return typeId;
}

function capitalizeElement(element: PublicElementType): string {
  const names: Record<PublicElementType, string> = {
    fire: 'Fogo',
    water: 'Água',
    earth: 'Terra',
    air: 'Ar',
    metal: 'Metal',
  };
  return names[element];
}

export function resolveDragonType(eggData: EggData): ResolvedDragonType {
  const ratios = calculateRatios(eggData);
  const [topElement, secondElement] = getTopTwoElements(ratios);
  const voidTouched = eggData.voidEnergy >= VOID_TOUCHED_THRESHOLD;

  if (ratios[topElement] >= PURE_THRESHOLD) {
    const rawTypeId = `pure_${topElement}`;
    const typeId = validateTypeId(rawTypeId);
    const dragonType = getDragonTypeById(typeId);

    return {
      dragonTypeId: typeId,
      dragonTypeName: dragonType?.name || `Dragão de ${capitalizeElement(topElement)}`,
      dominantElement: topElement,
      secondaryElement: null,
      voidTouched,
      elements: [topElement],
    };
  }

  const rawFusedTypeId = getFusedTypeId(topElement, secondElement);
  const fusedTypeId = validateTypeId(rawFusedTypeId);
  const dragonType = getDragonTypeById(fusedTypeId);
  const dominantElement = ratios[topElement] >= ratios[secondElement] ? topElement : secondElement;

  return {
    dragonTypeId: fusedTypeId,
    dragonTypeName: dragonType?.name || `Dragão de ${capitalizeElement(topElement)} e ${capitalizeElement(secondElement)}`,
    dominantElement,
    secondaryElement: secondElement,
    voidTouched,
    elements: [topElement, secondElement],
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
    fused_fire_air: 'Fogo e Ar se encontraram em cinzas dançantes. Algo veloz demais para ser preso nasceu.',
    fused_water_air: 'Água e Ar se tornaram névoa viva. Ele parece lembrar lugares onde nunca esteve.',
    fused_earth_air: 'Terra e Ar desafiaram o peso do mundo. Ele nasceu entre permanência e liberdade.',
    fused_fire_metal: 'Fogo e Metal cantaram dentro da casca. Uma alma de forja abriu os olhos.',
    fused_water_metal: 'Água e Metal fluíram como prata viva. Seu corpo parece mudar com cada reflexo.',
    fused_earth_metal: 'Terra e Metal se fecharam em couraça. Ele nasceu para resistir.',
    fused_air_metal: 'Ar e Metal cortaram o silêncio. Suas asas parecem ouvir o futuro.',
  };

  let phrase = phrases[typeId] || 'Ele abriu os olhos. Aethon ficou em silêncio por um instante.';

  if (voidTouched) {
    phrase += '\n\nPor um instante, algo entre as rachaduras pareceu olhar de volta.';
  }

  return phrase;
}

export function getInitialPersonalityTraits(dominantElement: ElementType, secondaryElement: ElementType | null): PersonalityTraits {
  const baseTraits: PersonalityTraits = {
    courage: 0.1,
    gentleness: 0.1,
    loyalty: 0.1,
    curiosity: 0.1,
    resilience: 0.1,
  };

  switch (dominantElement) {
    case 'fire': baseTraits.courage = 0.3; break;
    case 'water': baseTraits.gentleness = 0.3; break;
    case 'earth': baseTraits.loyalty = 0.3; break;
    case 'air': baseTraits.curiosity = 0.3; break;
    case 'metal': baseTraits.resilience = 0.3; break;
  }

  if (secondaryElement) {
    switch (secondaryElement) {
      case 'fire': baseTraits.courage = Math.min(0.4, baseTraits.courage + 0.15); break;
      case 'water': baseTraits.gentleness = Math.min(0.4, baseTraits.gentleness + 0.15); break;
      case 'earth': baseTraits.loyalty = Math.min(0.4, baseTraits.loyalty + 0.15); break;
      case 'air': baseTraits.curiosity = Math.min(0.4, baseTraits.curiosity + 0.15); break;
      case 'metal': baseTraits.resilience = Math.min(0.4, baseTraits.resilience + 0.15); break;
    }
  }

  return baseTraits;
}
