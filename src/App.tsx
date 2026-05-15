// ============================================================
// ARC: AETHON — APP
// Entry point. Routes to the correct screen based on game state.
// ============================================================

import { GameProvider, useGame } from './context/GameContext';
import SplashScreen from './screens/SplashScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import EggScreen from './screens/EggScreen';
import HatchScreen from './screens/HatchScreen';
import DragonScreen from './screens/DragonScreen';
import InvalidSaveScreen from './screens/InvalidSaveScreen';
import DebugPanel from './components/DebugPanel';

function ScreenRouter() {
  const { currentScreen, isLoading } = useGame();

  if (isLoading) {
    return <SplashScreen />;
  }

  switch (currentScreen) {
    case 'Splash':
      return <SplashScreen />;

    case 'NoSave':
    case 'Onboarding':
      return <OnboardingScreen />;

    case 'EggActive':
      return <EggScreen />;

    case 'HatchScene':
      return <HatchScreen />;

    case 'DragonActive':
    case 'DragonOnExpedition':
    case 'ExpeditionReturnReady':
      return <DragonScreen />;

    case 'NestManagement':
      return <DragonScreen />;

    case 'DiaryView':
      return <DragonScreen />;

    case 'InvalidSaveState':
      return <InvalidSaveScreen />;

    default:
      return <OnboardingScreen />;
  }
}

export default function App() {
  return (
    <GameProvider>
      <ScreenRouter />
      <DebugPanel />
    </GameProvider>
  );
}
