// ============================================================
// ARC: AETHON — DIARY LIST
// ============================================================

import { DiaryEntry } from '../types/game';

const getCategoryStyle = (category?: string) => {
  switch (category) {
    case 'birth': return { emoji: '🐣', color: '#22c55e' };
    case 'feeding': return { emoji: '🍖', color: '#ff6b35' };
    case 'expedition': return { emoji: '🗺️', color: '#3b82f6' };
    case 'nest': return { emoji: '🏠', color: '#a78bfa' };
    case 'milestone': return { emoji: '⭐', color: '#fbbf24' };
    default: return { emoji: '📖', color: '#6a6a7a' };
  }
};

export default function DiaryList({ entries }: { entries: DiaryEntry[] }) {
  const sorted = [...entries].sort((a, b) => b.timestamp - a.timestamp);
  if (sorted.length === 0) return (<div className="text-center p-6"><span className="text-3xl block mb-2">📖</span><p className="text-sm text-[#6a6a7a]">Nenhuma memória registrada ainda.</p></div>);
  return (
    <div className="space-y-3">
      {sorted.map((entry) => {
        const style = getCategoryStyle(entry.category);
        return (
          <div key={entry.id} className="p-4 rounded-xl animate-fade-in" style={{ background: 'rgba(18,18,26,0.5)', border: '1px solid rgba(42,42,58,0.3)' }}>
            <div className="flex items-center gap-2 mb-2">
              <span>{style.emoji}</span>
              <span className="text-xs text-[#6a6a7a]">Dia {entry.dayNumber}</span>
              <span className="text-xs text-[#4a4a5a] ml-auto">{new Date(entry.timestamp).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}</span>
            </div>
            <p className="text-sm text-[#e8e8ec] leading-relaxed">{entry.text}</p>
          </div>
        );
      })}
    </div>
  );
}
