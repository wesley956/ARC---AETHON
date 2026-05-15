// ============================================================
// ARC: AETHON — DRAGON SCREEN
// Main screen after dragon birth.
// Shows dragon info, feeding, diary, expeditions and materials.
// ============================================================

import { useState, useCallback, useEffect } from 'react';
import Layout from '../components/Layout';
import { useGame } from '../context/GameContext';
import { ELEMENT_EMOJI, MAX_VITALITY } from '../constants/gameConstants';
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

type Tab = 'status' | 'feed' | 'diary' | 'explore';

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
    const interval = setInterval(checkRecovery, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, [dragon, updateSave]);

  // Handle feeding
  const handleFeed = useCallback((foodId: string) => {
    if (!dragon) return;

    // Check if on expedition
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

  // Handle expedition update
  const handleExpeditionUpdate = useCallback((newDragonData: typeof dragon) => {
    if (!newDragonData) return;
    updateSave((prev) => ({
      ...prev,
      dragonData: newDragonData,
    }));
  }, [updateSave]);

  // Handle notification from expedition
  const handleExpeditionNotify = useCallback((message: string, type: 'success' | 'error' | 'info') => {
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
            {isOnExpedition ? '🗺️' : isInjured ? '🩹' : ELEMENT_EMOJI[dragon.dominantElement]}
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
      <div className="flex gap-1 mb-4 bg-[#12121a] p-1 rounded-xl">
        {[
          { id: 'status' as Tab, label: '📊', title: 'Status' },
          { id: 'feed' as Tab, label: '🍖', title: 'Alimentar' },
          { id: 'diary' as Tab, label: '📖', title: 'Diário' },
          { id: 'explore' as Tab, label: '🗺️', title: 'Explorar' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex-1 py-2 rounded-lg text-sm transition-colors
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
            {/* Crystals */}
            <CrystalDisplay crystals={dragon.crystals} />

            {/* Materials */}
            <MaterialDisplay materials={dragon.materials} />

            {/* Personality Traits */}
            <TraitDisplay traits={dragon.personalityTraits} />

            {/* Quick Stats */}
            <div className="bg-[#12121a]/50 rounded-xl border border-[#2a2a3a]/50 p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">📈</span>
                <h3 className="font-medium text-[#e8e8ec]">Informações</h3>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-[#1a1a24]/50 rounded-lg p-3">
                  <p className="text-[#6a6a7a] text-xs">Status</p>
                  <p className="text-[#e8e8ec] font-medium">
                    {isOnExpedition ? '🗺️ Em expedição' : isInjured ? '🩹 Machucado' : '🏠 No ninho'}
                  </p>
                </div>
                <div className="bg-[#1a1a24]/50 rounded-lg p-3">
                  <p className="text-[#6a6a7a] text-xs">Memórias</p>
                  <p className="text-[#e8e8ec] font-medium">
                    {(dragon.diaryEntries ?? []).length} entrada{(dragon.diaryEntries ?? []).length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </div>

            {/* Lore */}
            {dragonType?.lore && (
              <div className="bg-[#12121a]/50 rounded-xl border border-[#2a2a3a]/50 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">📜</span>
                  <h3 className="font-medium text-[#e8e8ec]">Origem</h3>
                </div>
                <p className="text-sm text-[#6a6a7a] italic leading-relaxed">
                  "{dragonType.lore}"
                </p>
              </div>
            )}
          </>
        )}

        {/* Feed Tab */}
        {activeTab === 'feed' && (
          <>
            {/* Expedition warning */}
            {isOnExpedition && (
              <div className="bg-blue-900/20 border border-blue-700/50 rounded-xl p-3 text-center">
                <p className="text-sm text-blue-300">
                  🗺️ {dragon.dragonName} está em expedição. Aguarde o retorno para alimentá-lo.
                </p>
              </div>
            )}

            {/* Crystal inventory compact */}
            <div className="bg-[#12121a]/50 rounded-xl border border-[#2a2a3a]/50 p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#6a6a7a]">Seus cristais:</span>
                <CrystalDisplay crystals={dragon.crystals} compact />
              </div>
            </div>

            {/* Vitality warning */}
            {dragon.vitality >= MAX_VITALITY && (
              <div className="bg-green-900/20 border border-green-700/50 rounded-xl p-3 text-center">
                <p className="text-sm text-green-300">
                  ✨ {dragon.dragonName} está completamente satisfeito!
                </p>
              </div>
            )}

            {/* Food list */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-[#e8e8ec]">Comidas disponíveis</h3>
              {foods.map((food) => (
                <FoodCard
                  key={food.id}
                  recipe={food}
                  crystals={dragon.crystals}
                  onFeed={handleFeed}
                  vitalityFull={dragon.vitality >= MAX_VITALITY}
                  disabled={isOnExpedition}
                />
              ))}
            </div>

            {/* Feeding tip */}
            <div className="bg-[#12121a]/30 rounded-lg p-3 text-center">
              <p className="text-xs text-[#6a6a7a]">
                💡 Cada comida influencia a personalidade do dragão de forma diferente.
              </p>
            </div>
          </>
        )}

        {/* Diary Tab */}
        {activeTab === 'diary' && (
          <>
            <DiaryList entries={dragon.diaryEntries ?? []} maxVisible={5} />

            <div className="bg-[#12121a]/30 rounded-lg p-3 text-center">
              <p className="text-xs text-[#6a6a7a]">
                📖 O diário registra as memórias de {dragon.dragonName}.
              </p>
            </div>
          </>
        )}

        {/* Explore Tab */}
        {activeTab === 'explore' && (
          <>
            {/* Expeditions */}
            <ExpeditionPanel
              dragon={dragon}
              onUpdate={handleExpeditionUpdate}
              onNotify={handleExpeditionNotify}
            />

            {/* Nest placeholder */}
            <div className="bg-[#12121a]/50 rounded-xl border border-[#2a2a3a]/50 p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">🏠</span>
                <h3 className="font-medium text-[#e8e8ec]">Ninho</h3>
              </div>
              <div className="bg-[#1a1a24]/50 rounded-lg p-4 text-center">
                <p className="text-sm text-[#6a6a7a]">
                  O ninho ainda é simples.
                </p>
                <p className="text-xs text-[#6a6a7a] mt-2">
                  Materiais de expedição poderão transformá-lo.
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Bottom padding for debug panel */}
      <div className="h-16" />
    </Layout>
  );
}
