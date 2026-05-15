// ============================================================
// ARC: AETHON — ORBITING ORBS
// Visual display of orbs circling around the egg.
// ============================================================

import { Orb } from '../types/game';
import { ELEMENT_EMOJI, ELEMENT_COLORS } from '../constants/gameConstants';

interface OrbitingOrbsProps {
  orbs: Orb[];
}

export default function OrbitingOrbs({ orbs }: OrbitingOrbsProps) {
  if (orbs.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none">
      {orbs.map((orb, index) => (
        <OrbitingOrb
          key={orb.id}
          orb={orb}
          index={index}
          total={orbs.length}
        />
      ))}
    </div>
  );
}

interface OrbitingOrbProps {
  orb: Orb;
  index: number;
  total: number;
}

function OrbitingOrb({ orb, index, total }: OrbitingOrbProps) {
  const color = ELEMENT_COLORS[orb.element];
  const emoji = ELEMENT_EMOJI[orb.element];

  // Calculate orbit parameters
  const baseRadius = 70; // Base orbit radius
  const radiusVariation = total >= 3 ? (index % 2 === 0 ? 8 : -8) : 0;
  const radius = baseRadius + radiusVariation;

  // Distribute orbs evenly around the circle
  const angleOffset = (360 / total) * index;

  // Animation duration varies slightly for visual interest
  const baseDuration = 8;
  const durationVariation = total >= 3 ? (index * 0.5) : 0;
  const duration = baseDuration + durationVariation;

  // Animation delay for staggered start
  const delay = index * 0.3;

  return (
    <div
      className="absolute left-1/2 top-1/2 w-8 h-8 -ml-4 -mt-4"
      style={{
        animation: `orbit ${duration}s linear infinite`,
        animationDelay: `-${delay}s`,
        // Using CSS custom properties for the orbit
        ['--orbit-radius' as string]: `${radius}px`,
        ['--angle-offset' as string]: `${angleOffset}deg`,
      }}
    >
      <div
        className="w-full h-full rounded-full flex items-center justify-center text-sm border-2 bg-aethon-card/90"
        style={{
          borderColor: color,
          boxShadow: `0 0 10px ${color}66`,
          // Counter-rotate to keep emoji upright
          animation: `counter-orbit ${duration}s linear infinite`,
          animationDelay: `-${delay}s`,
        }}
      >
        {emoji}
      </div>
    </div>
  );
}
