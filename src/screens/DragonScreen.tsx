// ============================================================
// ARC: AETHON — DRAGON SCREEN
// Placeholder for post-hatch dragon interactions.
// ============================================================

import Layout from '../components/Layout';
import { useGame } from '../context/GameContext';
import { ELEMENT_EMOJI, ELEMENT_LABELS } from '../constants/gameConstants';
import { getDragonTypeById } from '../data/dragonTaxonomy';

export default function DragonScreen() {
  const { save } = useGame();
  const dragon = save?.dragonData;

  const dragonType = dragon ? getDragonTypeById(dragon.dragonType) : null;

  return (
    <Layout className="items-center pt-8 px-6 pb-20">
      {/* Title */}
      <h1 className="text-2xl font-bold text-aethon-glow mb-2">
        Dragão
      </h1>

      {dragon ? (
        <div className="flex flex-col items-center gap-6 w-full max-w-xs animate-fade-in">
          {/* Dragon Visual */}
          <div className="text-7xl mt-4 animate-float">🐉</div>

          {/* Name */}
          <h2 className="text-xl font-bold text-aethon-text">
            {dragon.dragonName}
          </h2>

          {/* Type */}
          {dragonType && (
            <p className="text-sm text-aethon-accent">
              {dragonType.name}
            </p>
          )}

          {/* Stats */}
          <div className="w-full space-y-3">
            {/* Element */}
            <div className="bg-aethon-card/50 rounded-lg px-4 py-3 border border-aethon-border/50 flex items-center gap-3">
              <span className="text-lg">{ELEMENT_EMOJI[dragon.dominantElement]}</span>
              <span className="text-sm text-aethon-muted">Elemento Dominante</span>
              <span className="text-sm text-aethon-text ml-auto">
                {ELEMENT_LABELS[dragon.dominantElement]}
              </span>
            </div>

            {/* Vitality */}
            <div className="bg-aethon-card/50 rounded-lg px-4 py-3 border border-aethon-border/50 flex items-center gap-3">
              <span className="text-lg">❤️</span>
              <span className="text-sm text-aethon-muted">Vitalidade</span>
              <span className="text-sm text-aethon-text ml-auto">
                {dragon.vitality}
              </span>
            </div>

            {/* Expedition */}
            <div className="bg-aethon-card/50 rounded-lg px-4 py-3 border border-aethon-border/50 flex items-center gap-3">
              <span className="text-lg">🗺️</span>
              <span className="text-sm text-aethon-muted">Expedição</span>
              <span className="text-sm text-aethon-text ml-auto">
                {dragon.isOnExpedition ? 'Em expedição' : 'No ninho'}
              </span>
            </div>

            {/* Diary Entries */}
            <div className="bg-aethon-card/50 rounded-lg px-4 py-3 border border-aethon-border/50 flex items-center gap-3">
              <span className="text-lg">📖</span>
              <span className="text-sm text-aethon-muted">Diário</span>
              <span className="text-sm text-aethon-text ml-auto">
                {dragon.diaryEntries.length} entrada{dragon.diaryEntries.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 mt-12">
          <div className="text-5xl">🌑</div>
          <p className="text-aethon-muted text-center">
            Nenhum dragão encontrado nos dados do save.
          </p>
        </div>
      )}

      {/* Notice */}
      <div className="w-full max-w-xs bg-aethon-card/30 border border-aethon-border/30 rounded-lg p-4 text-center mt-8">
        <p className="text-xs text-aethon-muted leading-relaxed">
          🐉 Sistema completo do dragão — alimentação, expedições, ninho, profissões e diário interativo — será implementado em prompt futuro.
        </p>
      </div>
    </Layout>
  );
}
