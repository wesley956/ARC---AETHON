// ============================================================
// ARC: AETHON — ELEMENT VISUALS
// Visual helpers for elemental colors, glows, and auras.
// Prompt 10: Visual polish for EggScreen and HatchScreen.
// ============================================================

import { EggData } from '../types/game';

export type DominantElement = 'fire' | 'water' | 'earth' | 'balanced' | 'void';

/**
 * Determine the dominant element from egg energy data.
 * Used for visual aura/glow effects only — does NOT affect game logic.
 */
export function getDominantElement(eggData: EggData): DominantElement {
  const { fireEnergy, waterEnergy, earthEnergy, voidEnergy } = eggData;
  
  // Check void first
  if (voidEnergy >= 0.25) return 'void';
  
  const total = fireEnergy + waterEnergy + earthEnergy;
  if (total === 0) return 'balanced';
  
  const fireRatio = fireEnergy / total;
  const waterRatio = waterEnergy / total;
  const earthRatio = earthEnergy / total;
  
  if (fireRatio > 0.5) return 'fire';
  if (waterRatio > 0.5) return 'water';
  if (earthRatio > 0.5) return 'earth';
  
  return 'balanced';
}

/** Element color palette for visual effects */
export const ELEMENT_GLOW_COLORS: Record<DominantElement, { primary: string; secondary: string; glow: string }> = {
  fire: { primary: '#ff6b35', secondary: '#ff9a5c', glow: 'rgba(255, 107, 53, 0.4)' },
  water: { primary: '#3b82f6', secondary: '#60a5fa', glow: 'rgba(59, 130, 246, 0.4)' },
  earth: { primary: '#d4a017', secondary: '#e8c547', glow: 'rgba(212, 160, 23, 0.4)' },
  balanced: { primary: '#a78bfa', secondary: '#c4b5fd', glow: 'rgba(167, 139, 250, 0.3)' },
  void: { primary: '#7c3aed', secondary: '#a855f7', glow: 'rgba(124, 58, 237, 0.4)' },
};

/** Get CSS box-shadow for elemental glow */
export function getElementalGlow(element: DominantElement, intensity: number = 1): string {
  const colors = ELEMENT_GLOW_COLORS[element];
  const size = Math.round(20 * intensity);
  const spread = Math.round(8 * intensity);
  return `0 0 ${size}px ${spread}px ${colors.glow}, 0 0 ${size * 2}px ${spread}px ${colors.glow}`;
}

/** Get CSS gradient for elemental aura background */
export function getElementalAuraGradient(element: DominantElement): string {
  const colors = ELEMENT_GLOW_COLORS[element];
  return `radial-gradient(ellipse at center, ${colors.glow} 0%, transparent 70%)`;
}

/** Get element-specific orb glow color */
export function getOrbGlowColor(element: string): string {
  const map: Record<string, string> = {
    fire: 'rgba(255, 107, 53, 0.5)',
    water: 'rgba(59, 130, 246, 0.5)',
    earth: 'rgba(212, 160, 23, 0.5)',
  };
  return map[element] || 'rgba(167, 139, 250, 0.3)';
}

/** Get maturation-based crack opacity */
export function getCrackOpacity(maturation: number): number {
  if (maturation < 0.3) return 0;
  if (maturation < 0.5) return 0.2;
  if (maturation < 0.7) return 0.4;
  if (maturation < 0.9) return 0.7;
  return 1;
}
