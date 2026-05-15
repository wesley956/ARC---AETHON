// ============================================================
// ARC: AETHON — INVALID SAVE SCREEN
// Shown when save validation fails.
// Does NOT auto-reset. Informs the player of the issue.
// ============================================================

import Layout from '../components/Layout';
import { useGame } from '../context/GameContext';

export default function InvalidSaveScreen() {
  const { validationErrors, clearSave } = useGame();

  return (
    <Layout className="items-center justify-center px-6">
      <div className="flex flex-col items-center gap-6 max-w-sm text-center">
        {/* Warning Icon */}
        <div className="text-6xl">⚠️</div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-red-400">Save Inconsistente</h1>

        {/* Description */}
        <p className="text-sm text-[#6a6a7a]">
          O save do jogo está em um estado inválido.
          Isso pode acontecer por corrupção de dados ou versão incompatível.
        </p>

        {/* Errors */}
        {validationErrors.length > 0 && (
          <div className="w-full bg-red-900/20 border border-red-700/50 rounded-lg p-4 text-left">
            <p className="text-xs text-red-300 font-semibold mb-2">Erros encontrados:</p>
            <ul className="text-xs text-red-300/80 space-y-1">
              {validationErrors.map((error, i) => (
                <li key={i}>• {error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Warning about reset */}
        <div className="bg-[#12121a] border border-[#2a2a3a] rounded-lg p-4">
          <p className="text-xs text-[#6a6a7a]">
            ⚠️ O jogo não pode continuar com um save inválido.
            Se você escolher limpar, todo o progresso será perdido.
          </p>
        </div>

        {/* DEV ONLY - Clear button */}
        <button
          onClick={clearSave}
          className="w-full py-3 bg-red-900 hover:bg-red-800 text-red-200 font-semibold rounded-xl transition-colors border border-red-700"
        >
          🗑️ [DEV ONLY] Limpar Save e Recomeçar
        </button>

        <p className="text-[10px] text-[#6a6a7a]">
          Em caso de dúvidas, entre em contato com o suporte.
        </p>
      </div>
    </Layout>
  );
}
