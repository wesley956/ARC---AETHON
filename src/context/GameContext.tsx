// ============================================================
// ARC: AETHON — GAME CONTEXT
// Central state management.
// Handles save loading, validation, screen routing, and save writes.
//
// BOOT SEQUENCE:
// 1. Load save from localStorage
// 2. Validate save structure
// 3. Apply daily reset (if new day)
// 4. Process offline orbs (if in egg phase)
// 5. Resolve screen
// ============================================================

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { AppScreen, GameSave, MvpOrbElement, SaveValidationResult } from '../types/game';
import { loadSave, writeSave, deleteSave, createInitialSave } from '../systems/SaveManager';
import { validateSave } from '../systems/GameStateValidator';
import { processOfflineOrbs, applyDailyReset } from '../systems/TimeManager';
import { MATURATION_HATCH_THRESHOLD, MVP_ORB_ELEMENTS } from '../constants/gameConstants';

interface GameContextValue {
  // State
  currentScreen: AppScreen;
  save: GameSave | null;
  validationErrors: string[];
  isLoading: boolean;

  // Actions
  startNewGame: () => void;
  updateSave: (updater: (prev: GameSave) => GameSave) => void;
  clearSave: () => void; // DEV ONLY
  navigateTo: (screen: AppScreen) => void;
}

const GameContext = createContext<GameContextValue | null>(null);

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}

/**
 * Determine the correct screen based on save state.
 */
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

  // Fallback: if onboarding isn't done, go to onboarding
  if (!save.onboardingDone) {
    return 'Onboarding';
  }

  // Edge case: onboarding done but no egg/dragon — treat as onboarding
  return 'Onboarding';
}

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('Splash');
  const [save, setSave] = useState<GameSave | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const initialized = useRef(false);

  // --- INITIALIZATION (BOOT SEQUENCE) ---
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // Simulate a brief splash
    const timer = setTimeout(() => {
      // Step 1: Load save
      const loaded = loadSave();

      if (!loaded) {
        // No save exists
        setCurrentScreen('Onboarding');
        setIsLoading(false);
        return;
      }

      // Step 2: Validate
      const validation: SaveValidationResult = validateSave(loaded);

      if (!validation.isValid) {
        setValidationErrors(validation.errors);
        setCurrentScreen('InvalidSaveState');
        setSave(loaded);
        setIsLoading(false);
        return;
      }

      // Step 3: Apply daily reset
      let processedSave = applyDailyReset(loaded);

      // Step 4: Process offline orbs if in egg phase
      if (processedSave.hasEgg && processedSave.eggData) {
        const updatedEgg = processOfflineOrbs(processedSave.eggData);
        processedSave = { ...processedSave, eggData: updatedEgg };
      }

      // Persist changes from daily reset and offline processing
      writeSave(processedSave);

      // Step 5: Resolve screen
      setSave(processedSave);
      setCurrentScreen(resolveScreen(processedSave));
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  // --- ACTIONS ---

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

      // Re-validate after update
      const validation = validateSave(updated);
      if (!validation.isValid) {
        console.error('[GameContext] Save update would create invalid state!', validation.errors);
        setValidationErrors(validation.errors);
        setCurrentScreen('InvalidSaveState');
        return prev; // Don't apply invalid update
      }

      writeSave(updated);
      return updated;
    });
  }, []);

  const clearSave = useCallback(() => {
    // DEV ONLY
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
