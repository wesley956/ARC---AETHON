// ============================================================
// ARC: AETHON — INVALID SAVE SCREEN
// ============================================================

import Layout from '../components/Layout';
import { useGame } from '../context/GameContext';

export default function InvalidSaveScreen() {
  const { validationErrors, clearSave } = useGame();

  return (
    <Layout className="items-center justify-center px-6">
      <div className="flex flex-col items-center gap-6 max-w-sm text-center">
        <div className="text-6xl">⚠️</div>
        <h1 className="text-2xl font-bold text-red-400">Save Inconsistente</h1>
        <p className="text-sm text-[#6a6a7a]">O save do jogo está em um estado inválido.</p>
        {validationErrors.length > 0 && (
          <div className="w-full bg-red-900/20 border border-red-700/50 rounded-lg p-4 text-left">
            <p className="text-xs text-red-300 font-semibold mb-2">Erros encontrados:</p>
            <ul className="text-xs text-red-300/80 space-y-1">
              {validationErrors.map((error, i) => (<li key={i}>• {error}</li>))}
            </ul>
          </div>
        )}
        <button onClick={clearSave} className="w-full py-3 bg-red-900 hover:bg-red-800 text-red-200 font-semibold rounded-xl transition-colors border border-red-700">
          🗑️ [DEV ONLY] Limpar Save e Recomeçar
        </button>
      </div>
    </Layout>
  );
}
