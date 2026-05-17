// ============================================================
// ARC: AETHON — DRAGON TAXONOMY
// Source of Truth: Game Flow Bible v1.2
// ============================================================

import { DragonType } from '../types/game';

const pureLineages: DragonType[] = [
  { id: 'pure_fire', name: 'Dragão de Fogo Puro', category: 'pure', elements: ['fire'], isHidden: false, lore: 'Nascido das brasas de Ignareth.' },
  { id: 'pure_water', name: 'Dragão das Águas Puras', category: 'pure', elements: ['water'], isHidden: false, lore: 'Das águas paradas de Velun.' },
  { id: 'pure_earth', name: 'Dragão da Terra Antiga', category: 'pure', elements: ['earth'], isHidden: false, lore: 'Da terra que não cedeu.' },
  { id: 'pure_air', name: 'Dragão dos Ventos', category: 'pure', elements: ['air'], isHidden: false, lore: 'Dos ventos que ainda lembram o céu antigo.' },
  { id: 'pure_metal', name: 'Dragão de Metal Vivo', category: 'pure', elements: ['metal'], isHidden: false, lore: 'Do metal que sobreviveu ao Colapso.' },
];

const fusedPublicLineages: DragonType[] = [
  { id: 'fused_fire_water', name: 'Dragão do Vapor', category: 'fused_public', elements: ['fire', 'water'], isHidden: false },
  { id: 'fused_fire_earth', name: 'Dragão da Lava', category: 'fused_public', elements: ['fire', 'earth'], isHidden: false },
  { id: 'fused_water_earth', name: 'Dragão das Marés Vivas', category: 'fused_public', elements: ['water', 'earth'], isHidden: false },
  { id: 'fused_fire_air', name: 'Dragão da Tempestade de Cinzas', category: 'fused_public', elements: ['fire', 'air'], isHidden: false },
  { id: 'fused_water_air', name: 'Dragão da Névoa Celeste', category: 'fused_public', elements: ['water', 'air'], isHidden: false },
  { id: 'fused_earth_air', name: 'Dragão das Montanhas Suspensas', category: 'fused_public', elements: ['earth', 'air'], isHidden: false },
  { id: 'fused_fire_metal', name: 'Dragão da Forja', category: 'fused_public', elements: ['fire', 'metal'], isHidden: false },
  { id: 'fused_water_metal', name: 'Dragão do Mercúrio', category: 'fused_public', elements: ['water', 'metal'], isHidden: false },
  { id: 'fused_earth_metal', name: 'Dragão da Couraça', category: 'fused_public', elements: ['earth', 'metal'], isHidden: false },
  { id: 'fused_air_metal', name: 'Dragão das Lâminas do Vento', category: 'fused_public', elements: ['air', 'metal'], isHidden: false },
];

const thresholdVariants: DragonType[] = [
  { id: 'threshold_void_fire', name: 'Chama Apagada', category: 'threshold_variant', elements: ['void', 'fire'], isHidden: true },
  { id: 'threshold_void_water', name: 'Águas Paradas', category: 'threshold_variant', elements: ['void', 'water'], isHidden: true },
  { id: 'threshold_void_earth', name: 'Terra Oca', category: 'threshold_variant', elements: ['void', 'earth'], isHidden: true },
  { id: 'threshold_void_air', name: 'Céu Sem Eco', category: 'threshold_variant', elements: ['void', 'air'], isHidden: true },
  { id: 'threshold_void_metal', name: 'Metal Fantasma', category: 'threshold_variant', elements: ['void', 'metal'], isHidden: true },
  { id: 'threshold_void_fire_metal', name: 'Forja do Limiar', category: 'threshold_variant', elements: ['void', 'fire', 'metal'], isHidden: true },
  { id: 'threshold_void_water_air', name: 'Névoa do Limiar', category: 'threshold_variant', elements: ['void', 'water', 'air'], isHidden: true },
];

const convergenceDragon: DragonType = {
  id: 'convergence', name: 'Dragão da Convergência', category: 'convergence',
  elements: ['fire', 'water', 'earth', 'air', 'metal', 'void'], isHidden: true,
};

export const DRAGON_TAXONOMY: DragonType[] = [...pureLineages, ...fusedPublicLineages, ...thresholdVariants, convergenceDragon];

export function getPublicLineages(): DragonType[] { return DRAGON_TAXONOMY.filter((d) => !d.isHidden); }
export function getDragonTypeById(id: string): DragonType | undefined { return DRAGON_TAXONOMY.find((d) => d.id === id); }
export function isThresholdDragon(id: string): boolean { return getDragonTypeById(id)?.category === 'threshold_variant'; }
export function isConvergenceDragon(id: string): boolean { return id === 'convergence'; }
export function getCategoryDisplayName(category: string): string {
  const names: Record<string, string> = { pure: 'Linhagem Pura', fused_public: 'Linhagem Fundida', threshold_variant: 'Linhagem Desconhecida', convergence: 'Linhagem Única' };
  return names[category] || 'Desconhecido';
}
