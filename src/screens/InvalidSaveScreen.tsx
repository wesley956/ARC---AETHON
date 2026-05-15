// ============================================================
// ARC: AETHON — INVALID SAVE SCREEN
// Shown when GameStateValidator detects save corruption.
//
// CRITICAL:
//   - Do NOT auto-reset the save.
//   - Do NOT offer a public "start over" button.
//   - Show clear error messages.
//   - Protect the Central Absolute Rule.
// ============================================================

import Layout from '../components/Layout';
import { useGame } from '../context/GameContext';

export default function InvalidSaveScreen() {
  const { validationErrors } = useGame();

  return (
    <Layout className="items-center justify-center px-6">
      <div className="flex flex-col items-center gap-6 w-full max-w-sm animate-fade-in">
        {/* Icon */}
        <div className="text-6xl">🛡️</div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-red-400 text-center">
          Save Inválido Detectado
        </h1>

        {/* Explanation */}
        <p className="text-aethon-text text-center text-sm leading-relaxed">
          Não foi feito reset automático para proteger a regra central do jogo.
        </p>

        <p className="text-aethon-muted text-center text-xs leading-relaxed">
          Seu vínculo com seu dragão é sagrado. Um save corrompido não será apagado sem investigação.
        </p>

        {/* Error List */}
        <div className="w-full bg-red-950/30 border border-red-800/40 rounded-xl p-4">
          <h2 className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-3">
            Erros detectados:
          </h2>
          <ul className="space-y-2">
            {validationErrors.map((error, i) => (
              <li key={i} className="flex gap-2 text-xs text-red-300">
                <span className="text-red-500 shrink-0">✕</span>
                <span>{error}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Instructions */}
        <div className="bg-aethon-card/30 border border-aethon-border/30 rounded-lg p-4 text-center">
          <p className="text-xs text-aethon-muted leading-relaxed">
            Se você acredita que isso é um erro, entre em contato com o suporte do jogo. 
            Seu save está preservado no armazenamento local.
          </p>
        </div>
      </div>
    </Layout>
  );
}
