// ============================================================
// ARC: AETHON — DRAGON SCREEN
// Prompt 11: Visual polish — warm, magical, emotional.
// Mobile-optimized dragon management.
// ============================================================

import { useState } from 'react';
import Layout from '../components/Layout';
import { useGame } from '../context/GameContext';
import { getDragonTypeById, getCategoryDisplayName } from '../data/dragonTaxonomy';
import { FOOD_RECIPES, MAX_VITALITY } from '../constants/gameConstants';
import DragonHeader from '../components/DragonHeader';
import VitalityBar from '../components/VitalityBar';
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
import { ELEMENT_GLOW_COLORS, DominantElement } from '../utils/elementVisuals';

type Tab = 'status' | 'feed' | 'expedition' | 'diary' | 'nest';

// Map element to visual element
function getVisualElement(element: string): DominantElement {
  if (element === 'void') return 'void';
  if (element === 'air' || element === 'metal') return 'balanced';
  if (element === 'fire' || element === 'water' || element === 'earth') {
    return element as DominantElement;
  }
  return 'balanced';
}

export default function DragonScreen() {
  const { save, updateSave } = useGame();
  const [activeTab, setActiveTab] = useState<Tab>('status');
  const [notification, setNotification] = useState<string | null>(null);
  const [notificationType, setNotificationType] = useState<'success' | 'error'>('success');

  const dragon = save?.dragonData;
  if (!dragon) return null;

  const dragonType = getDragonTypeById(dragon.dragonType);
  const categoryName = dragonType ? getCategoryDisplayName(dragonType.category) : '';
  const materials = normalizeMaterialInventory(dragon.materials);
  const visualElement = getVisualElement(dragon.dominantElement);
  const elementColors = ELEMENT_GLOW_COLORS[visualElement];

  const handleFeed = (foodId: string) => {
    const food = FOOD_RECIPES[foodId];
    if (!food || !dragon) return;

    const canAfford = Object.entries(food.cost).every(([element, amount]) => {
      return (dragon.crystals[element as keyof typeof dragon.crystals] || 0) >= (amount || 0);
    });

    if (!canAfford) {
      setNotificationType('error');
      setNotification('💎 Cristais insuficientes para essa comida.');
      return;
    }

    if (dragon.vitality >= MAX_VITALITY) {
      setNotificationType('error');
      setNotification('✨ Ele está satisfeito. Não quer comer agora.');
      return;
    }

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

    setNotificationType('success');
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
    <Layout className="pb-20 relative">
      {/* Background gradient based on element */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#050510] via-[#0a0a12] to-[#0d0b1a]" />
        <div 
          className="absolute inset-0 opacity-15"
          style={{
            background: `radial-gradient(ellipse 80% 50% at 50% 0%, ${elementColors.glow} 0%, transparent 70%)`,
          }}
        />
      </div>

      {notification && (
        <FloatingNotification 
          message={notification} 
          type={notificationType} 
          onClose={() => setNotification(null)} 
        />
      )}

      <div className="relative z-10 flex-1 py-4 space-y-4">
        {activeTab === 'status' && (
          <div className="space-y-4 animate-fade-in">
            {/* Dragon Header */}
            <DragonHeader 
              dragon={dragon} 
              dragonType={dragonType} 
              categoryName={categoryName}
            />

            {/* Vitality */}
            <VitalityBar vitality={dragon.vitality} />

            {/* Crystals */}
            <CrystalDisplay crystals={dragon.crystals} />

            {/* Traits */}
            <TraitDisplay traits={dragon.personalityTraits} />

            {/* Materials */}
            <MaterialDisplay materials={materials} />
          </div>
        )}

        {activeTab === 'feed' && (
          <div className="space-y-4 animate-fade-in">
            {/* Header */}
            <div 
              className="rounded-xl p-4"
              style={{
                background: 'linear-gradient(135deg, rgba(18, 18, 26, 0.5) 0%, rgba(18, 18, 26, 0.3) 100%)',
                border: '1px solid rgba(42, 42, 58, 0.3)',
              }}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">🍖</span>
                <h2 className="text-lg font-bold text-[#e8e8ec]">Alimentação</h2>
              </div>
              <p className="text-xs text-[#6a6a7a]">
                Alimente {dragon.dragonName} para recuperar vitalidade e moldar sua personalidade.
              </p>
            </div>

            {/* Crystals compact */}
            <CrystalDisplay crystals={dragon.crystals} compact />

            {/* Vitality indicator */}
            {dragon.vitality >= MAX_VITALITY && (
              <div 
                className="rounded-xl p-3 text-center"
                style={{
                  background: 'rgba(34, 197, 94, 0.1)',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                }}
              >
                <p className="text-sm text-[#4ade80]">
                  ✨ {dragon.dragonName} está completamente satisfeito
                </p>
              </div>
            )}

            {/* Food cards */}
            {Object.values(FOOD_RECIPES).map((food) => (
              <FoodCard 
                key={food.id} 
                food={food} 
                crystals={dragon.crystals} 
                onFeed={handleFeed} 
                disabled={dragon.vitality >= MAX_VITALITY} 
              />
            ))}
          </div>
        )}

        {activeTab === 'expedition' && (
          <div className="space-y-4 animate-fade-in">
            {/* Header */}
            <div 
              className="rounded-xl p-4"
              style={{
                background: 'linear-gradient(135deg, rgba(18, 18, 26, 0.5) 0%, rgba(30, 25, 20, 0.3) 100%)',
                border: '1px solid rgba(255, 107, 53, 0.15)',
              }}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">🗺️</span>
                <h2 className="text-lg font-bold text-[#e8e8ec]">Expedições</h2>
              </div>
              <p className="text-xs text-[#6a6a7a]">
                As ruínas de Aethon guardam cristais e materiais preciosos.
              </p>
            </div>

            <ExpeditionPanel />
          </div>
        )}

        {activeTab === 'nest' && (
          <div className="space-y-4 animate-fade-in">
            {/* Header */}
            <div 
              className="rounded-xl p-4"
              style={{
                background: 'linear-gradient(135deg, rgba(18, 18, 26, 0.5) 0%, rgba(18, 18, 26, 0.3) 100%)',
                border: '1px solid rgba(42, 42, 58, 0.3)',
              }}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">🏠</span>
                <h2 className="text-lg font-bold text-[#e8e8ec]">Ninho</h2>
              </div>
              <p className="text-xs text-[#6a6a7a]">
                A casa de {dragon.dragonName}. Use materiais para torná-la mais confortável.
              </p>
            </div>

            {/* Materials compact */}
            <MaterialDisplay materials={materials} compact />

            <NestPanel />
          </div>
        )}

        {activeTab === 'diary' && (
          <div className="space-y-4 animate-fade-in">
            {/* Header */}
            <div 
              className="rounded-xl p-4"
              style={{
                background: 'linear-gradient(135deg, rgba(18, 18, 26, 0.5) 0%, rgba(18, 18, 26, 0.3) 100%)',
                border: '1px solid rgba(42, 42, 58, 0.3)',
              }}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">📖</span>
                <h2 className="text-lg font-bold text-[#e8e8ec]">Diário</h2>
              </div>
              <p className="text-xs text-[#6a6a7a]">
                As memórias compartilhadas com {dragon.dragonName}.
              </p>
            </div>

            <DiaryList entries={dragon.diaryEntries} />
          </div>
        )}
      </div>

      {/* Fixed Bottom Navigation */}
      <nav 
        className="fixed bottom-0 left-0 right-0 z-40 safe-area-bottom"
        style={{
          background: 'rgba(10, 10, 18, 0.95)',
          borderTop: '1px solid rgba(42, 42, 58, 0.5)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <div className="container-mobile flex justify-around py-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const tabColor = isActive ? elementColors.primary : '#6a6a7a';

            return (
              <button 
                key={tab.id} 
                onClick={() => setActiveTab(tab.id)}
                className="flex flex-col items-center gap-0.5 py-1 px-2 min-w-[52px] transition-all active:scale-95"
                style={{ color: tabColor }}
              >
                <span 
                  className="text-lg transition-all"
                  style={{
                    filter: isActive ? `drop-shadow(0 0 6px ${elementColors.glow})` : 'none',
                    transform: isActive ? 'scale(1.1)' : 'scale(1)',
                  }}
                >
                  {tab.emoji}
                </span>
                <span 
                  className="text-[10px] font-medium"
                  style={{ color: isActive ? elementColors.primary : '#6a6a7a' }}
                >
                  {tab.label}
                </span>
                {/* Active indicator */}
                {isActive && (
                  <div 
                    className="absolute bottom-0 w-8 h-0.5 rounded-full"
                    style={{ backgroundColor: elementColors.primary }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      <DebugPanel />
    </Layout>
  );
}
