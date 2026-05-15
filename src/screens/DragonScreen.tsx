// ============================================================
// ARC: AETHON — DRAGON SCREEN
// Mobile-optimized dragon management.
// ============================================================

import { useState } from 'react';
import Layout from '../components/Layout';
import { useGame } from '../context/GameContext';
import { getDragonTypeById, getCategoryDisplayName } from '../data/dragonTaxonomy';
import { ELEMENT_EMOJI, FOOD_RECIPES, MAX_VITALITY } from '../constants/gameConstants';
import CrystalDisplay from '../components/CrystalDisplay';
import TraitDisplay from '../components/TraitDisplay';
import DiaryList from '../components/DiaryList';
import FoodCard from '../components/FoodCard';
import ExpeditionPanel from '../components/ExpeditionPanel';
import MaterialDisplay from '../components/MaterialDisplay';
import NestPanel from '../components/NestPanel';
import FloatingNotification from '../components/FloatingNotification';
import DebugPanel from '../components/DebugPanel';
import { normalizeMaterialInventory } from '../utils/materials';

type Tab = 'status' | 'feed' | 'expedition' | 'diary' | 'nest';

export default function DragonScreen() {
  const { save, updateSave } = useGame();
  const [activeTab, setActiveTab] = useState<Tab>('status');
  const [notification, setNotification] = useState<string | null>(null);

  const dragon = save?.dragonData;
  if (!dragon) return null;

  const dragonType = getDragonTypeById(dragon.dragonType);
  const isOnExpedition = dragon.isOnExpedition;
  const isInjured = dragon.isInjured;
  const materials = normalizeMaterialInventory(dragon.materials);

  const statusText = isOnExpedition ? 'Em expedição' : isInjured ? 'Recuperando' : 'Descansando';

  const handleFeed = (foodId: string) => {
    const food = FOOD_RECIPES[foodId];
    if (!food || !dragon) return;

    const canAfford = Object.entries(food.cost).every(([element, amount]) => {
      return (dragon.crystals[element as keyof typeof dragon.crystals] || 0) >= (amount || 0);
    });

    if (!canAfford || dragon.vitality >= MAX_VITALITY) return;

    updateSave((prev) => {
      if (!prev.dragonData) return prev;
      const newCrystals = { ...prev.dragonData.crystals };
      Object.entries(food.cost).forEach(([element, amount]) => {
        newCrystals[element as keyof typeof newCrystals] -= (amount || 0);
      });

      const newVitality = Math.min(MAX_VITALITY, prev.dragonData.vitality + food.vitalityGain);
      const newTraits = { ...prev.dragonData.personalityTraits };
      newTraits[food.traitPush] = Math.min(1, newTraits[food.traitPush] + food.traitAmount);

      return {
        ...prev,
        dragonData: {
          ...prev.dragonData,
          crystals: newCrystals,
          vitality: newVitality,
          personalityTraits: newTraits,
        },
      };
    });

    setNotification(food.feedMessage);
  };

  const tabs: { id: Tab; label: string; emoji: string }[] = [
    { id: 'status', label: 'Status', emoji: '🐉' },
    { id: 'feed', label: 'Comida', emoji: '🍖' },
    { id: 'expedition', label: 'Explorar', emoji: '🗺️' },
    { id: 'nest', label: 'Ninho', emoji: '🏠' },
    { id: 'diary', label: 'Diário', emoji: '📖' },
  ];

  return (
    <Layout className="pb-20">
      {notification && (
        <FloatingNotification message={notification} type="success" onClose={() => setNotification(null)} />
      )}

      <div className="flex-1 py-4 space-y-4">
        {activeTab === 'status' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="text-6xl">{isInjured ? '🩹' : '🐉'}</div>
              <h1 className="text-xl font-bold text-[#e8e8ec]">{dragon.dragonName}</h1>
              {dragonType && (
                <div className="space-y-1">
                  <p className="text-sm text-[#a78bfa]">{dragonType.name}</p>
                  <p className="text-xs text-[#6a6a7a]">{getCategoryDisplayName(dragonType.category)}</p>
                </div>
              )}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-[#12121a]/50 rounded-full border border-[#2a2a3a]/50">
                <span>{isOnExpedition ? '🗺️' : isInjured ? '🩹' : ELEMENT_EMOJI[dragon.dominantElement] || '🐉'}</span>
                <span className="text-xs text-[#6a6a7a]">{statusText}</span>
              </div>
            </div>

            <div className="bg-[#12121a]/50 rounded-xl border border-[#2a2a3a]/50 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[#6a6a7a]">❤️ Vitalidade</span>
                <span className="text-sm font-medium text-[#e8e8ec]">{Math.round(dragon.vitality * 100)}%</span>
              </div>
              <div className="w-full h-3 bg-[#1a1a24] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-red-500 to-green-500 rounded-full transition-all duration-500" style={{ width: `${dragon.vitality * 100}%` }} />
              </div>
            </div>

            <CrystalDisplay crystals={dragon.crystals} />
            <TraitDisplay traits={dragon.personalityTraits} />
            <MaterialDisplay materials={materials} />
          </div>
        )}

        {activeTab === 'feed' && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-lg font-bold text-[#e8e8ec]">🍖 Alimentação</h2>
            <CrystalDisplay crystals={dragon.crystals} compact />
            {Object.values(FOOD_RECIPES).map((food) => (
              <FoodCard key={food.id} food={food} crystals={dragon.crystals} onFeed={handleFeed} disabled={dragon.vitality >= MAX_VITALITY} />
            ))}
          </div>
        )}

        {activeTab === 'expedition' && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-lg font-bold text-[#e8e8ec]">🗺️ Expedições</h2>
            <ExpeditionPanel />
          </div>
        )}

        {activeTab === 'nest' && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-lg font-bold text-[#e8e8ec]">🏠 Ninho</h2>
            <NestPanel />
          </div>
        )}

        {activeTab === 'diary' && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-lg font-bold text-[#e8e8ec]">📖 Diário</h2>
            <DiaryList entries={dragon.diaryEntries} />
          </div>
        )}
      </div>

      {/* Fixed Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#0a0a12]/95 border-t border-[#2a2a3a]/50 safe-area-bottom z-40">
        <div className="container-mobile flex justify-around py-2">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-0.5 py-1 px-2 min-w-[52px] transition-colors ${activeTab === tab.id ? 'text-[#a78bfa]' : 'text-[#6a6a7a]'}`}
            >
              <span className="text-lg">{tab.emoji}</span>
              <span className="text-[10px]">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      <DebugPanel />
    </Layout>
  );
}
