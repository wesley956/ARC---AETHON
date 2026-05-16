// ============================================================
// ARC: AETHON — DRAGON HEADER
// ============================================================

import { DragonData } from '../types/game';
import { getDragonTypeById, getCategoryDisplayName } from '../data/dragonTaxonomy';
import { ELEMENT_EMOJI, ELEMENT_COLORS } from '../constants/gameConstants';

export default function DragonHeader({ dragon }: { dragon: DragonData }) {
  const dragonType = getDragonTypeById(dragon.dragonType);
  const categoryName = dragonType ? getCategoryDisplayName(dragonType.category) : '';
  const isInjured = dragon.isInjured;
  const isOnExpedition = dragon.isOnExpedition;
  let statusEmoji = '😊'; let statusText = 'Saudável';
  if (isInjured) { statusEmoji = '🩹'; statusText = 'Machucado'; }
  else if (isOnExpedition) { statusEmoji = '🗺️'; statusText = 'Em expedição'; }
  const getBondPhrase = () => {
    if (dragon.vitality >= 0.8) return 'Ele olha para você com confiança.';
    if (dragon.vitality >= 0.5) return 'Ele está ao seu lado.';
    return 'Ele se aproxima, precisando de você.';
  };
  return (
    <div className="flex flex-col items-center gap-3 py-4">
      <div className="relative">
        <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl" style={{ background: `radial-gradient(circle, ${ELEMENT_COLORS[dragon.dominantElement]}20 0%, transparent 70%)`, border: `2px solid ${ELEMENT_COLORS[dragon.dominantElement]}40`, boxShadow: `0 0 20px ${ELEMENT_COLORS[dragon.dominantElement]}20` }}>
          {isInjured ? '🩹' : '🐉'}
        </div>
        <span className="absolute -top-1 -right-1 text-lg">{ELEMENT_EMOJI[dragon.dominantElement]}</span>
      </div>
      <h2 className="text-xl font-bold text-[#c4b5fd]">{dragon.dragonName}</h2>
      {dragonType && <div className="flex items-center gap-2"><span className="text-sm text-[#e8e8ec]">{dragonType.name}</span><span className="text-xs text-[#6a6a7a] bg-[#1a1a24] px-2 py-0.5 rounded-full">{categoryName}</span></div>}
      <div className="flex items-center gap-1.5 text-sm"><span>{statusEmoji}</span><span className="text-[#6a6a7a]">{statusText}</span></div>
      <p className="text-xs text-[#8a8a9a] italic">{getBondPhrase()}</p>
    </div>
  );
}
