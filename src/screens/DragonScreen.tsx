// ============================================================
// ARC: AETHON — DRAGON SCREEN
// ============================================================

import { useState } from 'react';
import { useGame } from '../context/GameContext';
import { MAX_VITALITY, FOOD_RECIPES } from '../constants/gameConstants';
import { feedDragon } from '../systems/DragonCareSystem';
import Layout from '../components/Layout';
import DragonHeader from '../components/DragonHeader';
import VitalityBar from '../components/VitalityBar';
import CrystalDisplay from '../components/CrystalDisplay';
import TraitDisplay from '../components/TraitDisplay';
import MaterialDisplay from '../components/MaterialDisplay';
import FoodCard from '../components/FoodCard';
import ExpeditionPanel from '../components/ExpeditionPanel';
import NestPanel from '../components/NestPanel';
import DiaryList from '../components/DiaryList';
import FloatingNotification from '../components/FloatingNotification';
import DebugPanel from '../components/DebugPanel';

export default function DragonScreen() {
  const { save, updateSave } = useGame();
  const [activeTab, setActiveTab] = useState<'status' | 'feed' | 'expedition' | 'nest' | 'diary'>('status');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  if (!save?.dragonData) return null;
  const dragon = save.dragonData;

  const handleFeed = (foodId: string) => {
    const result = feedDragon(dragon, foodId);
    if (result.success && result.newDragonData) {
      updateSave(prev => ({ ...prev, dragonData: result.newDragonData! }));
    }
    setNotification({ message: result.message, type: result.success ? 'success' : 'error' });
  };

  const tabs = [
    { id: 'status' as const, emoji: '📊', label: 'Status' },
    { id: 'feed' as const, emoji: '🍖', label: 'Alimentar' },
    { id: 'expedition' as const, emoji: '🗺️', label: 'Expedir' },
    { id: 'nest' as const, emoji: '🏠', label: 'Ninho' },
    { id: 'diary' as const, emoji: '📖', label: 'Diário' },
  ];

  return (
    <Layout>
      <div className="flex flex-col flex-1">
        <div className="flex-1 overflow-y-auto px-4 pt-4 pb-24 scrollbar-hide">
          {activeTab === 'status' && (<div className="space-y-4"><DragonHeader dragon={dragon} /><VitalityBar vitality={dragon.vitality} /><CrystalDisplay crystals={dragon.crystals} /><TraitDisplay traits={dragon.personalityTraits} /><MaterialDisplay materials={dragon.materials} compact /></div>)}
          {activeTab === 'feed' && (<div className="space-y-4"><div className="text-center mb-4"><h2 className="text-lg font-bold text-[#c4b5fd]">🍖 Alimentação</h2><p className="text-sm text-[#6a6a7a]">Alimente {dragon.dragonName} para recuperar vitalidade.</p></div><CrystalDisplay crystals={dragon.crystals} compact />{dragon.vitality >= MAX_VITALITY && <p className="text-center text-sm text-green-400 py-2">✨ {dragon.dragonName} está completamente satisfeito</p>}{Object.values(FOOD_RECIPES).map(food => (<FoodCard key={food.id} food={food} crystals={dragon.crystals} onFeed={handleFeed} disabled={dragon.vitality >= MAX_VITALITY} />))}</div>)}
          {activeTab === 'expedition' && (<div className="space-y-4"><div className="text-center mb-4"><h2 className="text-lg font-bold text-[#c4b5fd]">🗺️ Expedições</h2><p className="text-sm text-[#6a6a7a]">As ruínas de Aethon guardam cristais e materiais preciosos.</p></div><ExpeditionPanel dragon={dragon} /></div>)}
          {activeTab === 'nest' && (<div className="space-y-4"><div className="text-center mb-4"><h2 className="text-lg font-bold text-[#c4b5fd]">🏠 Ninho</h2><p className="text-sm text-[#6a6a7a]">A casa de {dragon.dragonName}. Use materiais para torná-la mais confortável.</p></div><MaterialDisplay materials={dragon.materials} compact /><NestPanel dragon={dragon} /></div>)}
          {activeTab === 'diary' && (<div className="space-y-4"><div className="text-center mb-4"><h2 className="text-lg font-bold text-[#c4b5fd]">📖 Diário</h2><p className="text-sm text-[#6a6a7a]">As memórias compartilhadas com {dragon.dragonName}.</p></div><DiaryList entries={dragon.diaryEntries} /></div>)}
        </div>
        <nav className="fixed bottom-0 left-0 right-0 bg-[#0a0a12]/95 backdrop-blur-sm border-t border-[#2a2a3a]/30 safe-area-bottom z-30">
          <div className="max-w-md mx-auto flex justify-around py-2">
            {tabs.map(tab => (<button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-all ${activeTab === tab.id ? 'text-[#a78bfa]' : 'text-[#4a4a5a]'}`}><span className="text-lg">{tab.emoji}</span><span className="text-[10px]">{tab.label}</span></button>))}
          </div>
        </nav>
      </div>
      {notification && <FloatingNotification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}
      <DebugPanel />
    </Layout>
  );
}
