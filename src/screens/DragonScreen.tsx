// ============================================================
// ARC: AETHON — DRAGON SCREEN
// Main screen after dragon birth.
// Shows dragon info, feeding, diary, expeditions, materials, and nest.
// ============================================================

import { useState, useCallback, useEffect } from 'react';
import Layout from '../components/Layout';
import { useGame } from '../context/GameContext';
import { ELEMENT_EMOJI } from '../constants/gameConstants';
import { getDragonTypeById, getCategoryDisplayName } from '../data/dragonTaxonomy';
import { feedDragon, getAllFoods } from '../systems/DragonCareSystem';
import { checkInjuryRecovery, getExpeditionStatusText } from '../systems/ExpeditionSystem';
import VitalityBar from '../components/VitalityBar';
import FoodCard from '../components/FoodCard';
import DiaryList from '../components/DiaryList';
import CrystalDisplay from '../components/CrystalDisplay';
import TraitDisplay from '../components/TraitDisplay';
import FloatingNotification from '../components/FloatingNotification';
import ExpeditionPanel from '../components/ExpeditionPanel';
import MaterialDisplay from '../components/MaterialDisplay';
import NestPanel from '../components/NestPanel';

type Tab = 'status' | 'feed' | 'diary' | 'explore' | 'nest';

export default function DragonScreen() {
  const { save, updateSave } = useGame();
  const dragon = save?.dragonData;

  const [activeTab, setActiveTab] = useState<Tab>('status');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const dragonType = dragon ? getDragonTypeById(dragon.dragonType) : null;
  const foods = getAllFoods();

  // Check for injury recovery on mount and periodically
  useEffect(() => {
    if (!dragon) return;

    const checkRecovery = () => {
      const recoveredDragon = checkInjuryRecovery(dragon);
      if (recoveredDragon !== dragon && recoveredDragon.isInjured !== dragon.isInjured) {
        updateSave((prev) => ({
          ...prev,
          dragonData: recoveredDragon,
        }));
        setNotification({ 
          message: `✨ ${dragon.dragonName} se recuperou completamente!`, 
          type: 'success' 
        });
      }
    };

    checkRecovery();
    const interval = setInterval(checkRecovery, 5000);
    return () => clearInterval(interval);
  }, [dragon, updateSave]);

  // Handle feeding
  const handleFeed = useCallback((foodId: string) => {
    if (!dragon) return;

    const isOnExpedition = dragon.isOnExpedition ?? false;
    if (isOnExpedition) {
      setNotification({ 
        message: '🗺️ Ele está em expedição agora. Aguarde o retorno.', 
        type: 'info' 
      });
      return;
    }

    const result = feedDragon(dragon, foodId);

    if (result.success && result.newDragonData) {
      updateSave((prev) => ({
        ...prev,
        dragonData: result.newDragonData!,
      }));
      setNotification({ message: result.message, type: 'success' });
    } else {
      setNotification({ message: result.message, type: 'error' });
    }
  }, [dragon, updateSave]);

  // Handle dragon data update (from expedition/nest)
  const handleDragonUpdate = useCallback((newDragonData: typeof dragon) => {
    if (!newDragonData) return;
    updateSave((prev) => ({
      ...prev,
      dragonData: newDragonData,
    }));
  }, [updateSave]);

  // Handle notification from panels
  const handleNotify = useCallback((message: string, type: 'success' | 'error' | 'info') => {
    setNotification({ message, type });
  }, []);

  // If no dragon data, show safe error state
  if (!dragon) {
    return (
      <Layout className="items-center justify-center px-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="text-5xl">🌑</div>
          <h2 className="text-xl font-bold text-[#c4b5fd]">Dragão não encontrado</h2>
          <p className="text-sm text-[#6a6a7a] max-w-xs">
            Os dados do dragão estão ausentes no save.
            O jogo pode estar em um estado inconsistente.
          </p>
          <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4 mt-4">
            <p className="text-xs text-red-300">
              ⚠️ Se você acabou de nascer o dragão, recarregue a página.
              Se o problema persistir, o save pode estar corrompido.
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  // Safe fallbacks for old saves
  const isOnExpedition = dragon.isOnExpedition ?? false;
  const isInjured = dragon.isInjured ?? false;
  const statusText = getExpeditionStatusText(dragon);
  const diaryEntries = dragon.diaryEntries ?? [];
  const crystals = dragon.crystals ?? { fire: 0, water: 0, earth: 0, air: 0, metal: 0 };
  const personalityTraits = dragon.personalityTraits ?? { courage: 0.1, gentleness: 0.1, loyalty: 0.1, curiosity: 0.1, resilience: 0.1 };

  return (
    <Layout className="pt-4 px-4 pb-24">
      {/* Notification */}
      {notification && (
        <FloatingNotification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Header */}
      <div className="flex flex-col items-center mb-6 animate-fade-in">
        {/* Dragon Visual */}
        <div
          className={`text-7xl mb-4 ${isOnExpedition ? '' : 'animate-float'}`}
          style={{
            filter: `drop-shadow(0 0 20px ${dragon.dominantElement ? ELEMENT_EMOJI[dragon.dominantElement] : '#a78bfa'}40)`,
            opacity: isOnExpedition ? 0.5 : 1,
          }}
        >
          {isInjured ? '🩹' : '🐉'}
        </div>

        {/* Name */}
        <h1 className="text-2xl font-bold text-[#e8e8ec]">{dragon.dragonName}</h1>

        {/* Type and Lineage */}
        {dragonType && (
          <div className="text-center mt-1">
            <p className="text-sm text-[#a78bfa]">{dragonType.name}</p>
            <p className="text-xs text-[#6a6a7a]">{getCategoryDisplayName(dragonType.category)}</p>
          </div>
        )}

        {/* Status Badge */}
        <div className={`
          flex items-center gap-2 mt-3 px-3 py-1.5 rounded-full border
          ${isOnExpedition 
            ? 'bg-blue-900/20 border-blue-700/50' 
            : isInjured 
              ? 'bg-red-900/20 border-red-700/50'
              : 'bg-[#12121a] border-[#2a2a3a]'
          }
        `}>
          <span className="text-lg">
            {isOnExpedition ? '🗺️' : isInjured ? '🩹' : ELEMENT_EMOJI[dragon.dominantElement] || '🐉'}
          </span>
          <span className={`text-sm ${isOnExpedition ? 'text-blue-300' : isInjured ? 'text-red-300' : 'text-[#e8e8ec]'}`}>
            {statusText}
          </span>
        </div>

        {/* Vitality */}
        <div className="w-full max-w-xs mt-4">
          <VitalityBar vitality={dragon.vitality} />
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 mb-4 bg-[#12121a] p-1 rounded-xl overflow-x-auto">
        {[
          { id: 'status' as Tab, label: '📊', title: 'Status' },
          { id: 'feed' as Tab, label: '🍖', title: 'Alimentar' },
          { id: 'nest' as Tab, label: '🏠', title: 'Ninho' },
          { id: 'explore' as Tab, label: '🗺️', title: 'Explorar' },
          { id: 'diary' as Tab, label: '📖', title: 'Diário' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex-1 py-2 px-2 rounded-lg text-sm transition-colors whitespace-nowrap
              ${activeTab === tab.id
                ? 'bg-[#a78bfa] text-white'
                : 'text-[#6a6a7a] hover:text-[#e8e8ec]'
              }
            `}
          >
            <span className="mr-1">{tab.label}</span>
            <span className="hidden sm:inline">{tab.title}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="space-y-4 animate-fade-in" key={activeTab}>
        {/* Status Tab */}
        {activeTab === 'status' && (
          <>
            <CrystalDisplay crystals={crystals} />
            <MaterialDisplay materials={dragon.materials} />
            <TraitDisplay traits={personalityTraits} />
          </>
        )}

        {/* Feed Tab */}
        {activeTab === 'feed' && (
          <div className="space-y-3">
            <div className="bg-[#12121a]/50 rounded-xl border border-[#2a2a3a]/50 p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">🍖</span>
                <h3 className="font-medium text-[#e8e8ec]">Alimentação</h3>
              </div>
              <p className="text-sm text-[#6a6a7a] mb-4">
                Cada alimento fortalece seu dragão de formas diferentes.
              </p>
              <div className="space-y-2">
                {foods.map((food) => (
                  <FoodCard
                    key={food.id}
                    recipe={food}
                    crystals={crystals}
                    vitality={dragon.vitality}
                    isOnExpedition={isOnExpedition}
                    isInjured={isInjured}
                    onFeed={handleFeed}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Nest Tab */}
        {activeTab === 'nest' && (
          <NestPanel
            dragon={dragon}
            onUpdate={handleDragonUpdate}
            onNotify={handleNotify}
          />
        )}

        {/* Explore Tab */}
        {activeTab === 'explore' && (
          <ExpeditionPanel
            dragon={dragon}
            onUpdate={handleDragonUpdate}
            onNotify={handleNotify}
          />
        )}

        {/* Diary Tab */}
        {activeTab === 'diary' && (
          <DiaryList entries={diaryEntries} maxVisible={10} />
        )}
      </div>
    </Layout>
  );
}
