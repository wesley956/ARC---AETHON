// ============================================================
// ARC: AETHON — GAME CONTEXT
// Central state management.
// ============================================================

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { AppScreen, GameSave, MvpOrbElement, SaveValidationResult } from '../types/game';
import { loadSave, writeSave, deleteSave, createInitialSave } from '../systems/SaveManager';
import { validateSave } from '../systems/GameStateValidator';
import { processOfflineOrbs, applyDailyReset } from '../systems/TimeManager';
import { MATURATION_HATCH_THRESHOLD, MVP_ORB_ELEMENTS } from '../constants/gameConstants';

interface GameContextValue {
  currentScreen: AppScreen;
  save: GameSave | null;
  validationErrors: string[];
  isLoading: boolean;
  startNewGame: () => void;
  updateSave: (updater: (prev: GameSave) => GameSave) => void;
  clearSave: () => void;
  navigateTo: (screen: AppScreen) => void;
}

const GameContext = createContext<GameContextValue | null>(null);

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}

function resolveScreen(save: GameSave): AppScreen {
  if (save.hasDragon && save.dragonData) {
    if (save.dragonData.isOnExpedition) {
      if (save.dragonData.expeditionEndTime && Date.now() >= save.dragonData.expeditionEndTime) {
        return 'ExpeditionReturnReady';
      }
      return 'DragonOnExpedition';
    }
    return 'DragonActive';
  }

  if (save.hasEgg && save.eggData) {
    if (save.eggData.maturationProgress >= MATURATION_HATCH_THRESHOLD) {
      return 'HatchScene';
    }
    return 'EggActive';
  }

  if (!save.onboardingDone) return 'Onboarding';
  return 'Onboarding';
}

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('Splash');
  const [save, setSave] = useState<GameSave | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => {
      const loaded = loadSave();

      if (!loaded) {
        setCurrentScreen('Onboarding');
        setIsLoading(false);
        return;
      }

      const validation: SaveValidationResult = validateSave(loaded);
      if (!validation.isValid) {
        setValidationErrors(validation.errors);
        setCurrentScreen('InvalidSaveState');
        setSave(loaded);
        setIsLoading(false);
        return;
      }

      let processedSave = applyDailyReset(loaded);

      if (processedSave.hasEgg && processedSave.eggData) {
        const updatedEgg = processOfflineOrbs(processedSave.eggData);
        processedSave = { ...processedSave, eggData: updatedEgg };
      }

      writeSave(processedSave);
      setSave(processedSave);
      setCurrentScreen(resolveScreen(processedSave));
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  const startNewGame = useCallback(() => {
    const randomElement: MvpOrbElement = MVP_ORB_ELEMENTS[Math.floor(Math.random() * MVP_ORB_ELEMENTS.length)];
    const initialOrb = {
      id: `orb_initial_${Date.now()}`,
      element: randomElement,
      createdAt: Date.now(),
    };

    const newSave = createInitialSave(initialOrb);
    writeSave(newSave);
    setSave(newSave);
    setCurrentScreen('EggActive');
  }, []);

  const updateSave = useCallback((updater: (prev: GameSave) => GameSave) => {
    setSave((prev) => {
      if (!prev) return prev;
      const updated = updater(prev);

      const validation = validateSave(updated);
      if (!validation.isValid) {
        console.error('[GameContext] Save update would create invalid state!', validation.errors);
        setValidationErrors(validation.errors);
        setCurrentScreen('InvalidSaveState');
        return prev;
      }

      writeSave(updated);

      const newScreen = resolveScreen(updated);
      if (newScreen !== currentScreen) {
        setCurrentScreen(newScreen);
      }

      return updated;
    });
  }, [currentScreen]);

  const clearSave = useCallback(() => {
    deleteSave();
    setSave(null);
    setValidationErrors([]);
    setCurrentScreen('Onboarding');
  }, []);

  const navigateTo = useCallback((screen: AppScreen) => {
    setCurrentScreen(screen);
  }, []);

  return (
    <GameContext.Provider
      value={{
        currentScreen,
        save,
        validationErrors,
        isLoading,
        startNewGame,
        updateSave,
        clearSave,
        navigateTo,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}
