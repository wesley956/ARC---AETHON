// ============================================================
// ARC: AETHON — DIARY LIST
// Prompt 11: Intimate, emotional diary display.
// ============================================================

import { DiaryEntry } from '../types/game';

interface DiaryListProps {
  entries: DiaryEntry[];
  maxEntries?: number;
}

// Get category-based styling
function getCategoryStyle(category?: string) {
  switch (category) {
    case 'birth':
      return { emoji: '🥚', color: '#c4b5fd', label: 'Nascimento' };
    case 'feeding':
      return { emoji: '🍖', color: '#4ade80', label: 'Alimentação' };
    case 'expedition':
      return { emoji: '🗺️', color: '#60a5fa', label: 'Expedição' };
    case 'nest':
      return { emoji: '🏠', color: '#f59e0b', label: 'Ninho' };
    case 'memory':
      return { emoji: '✨', color: '#a78bfa', label: 'Memória' };
    case 'milestone':
      return { emoji: '⭐', color: '#fbbf24', label: 'Marco' };
    default:
      return { emoji: '📝', color: '#6a6a7a', label: 'Diário' };
  }
}

export default function DiaryList({ entries, maxEntries = 10 }: DiaryListProps) {
  const sortedEntries = [...entries].sort((a, b) => b.timestamp - a.timestamp).slice(0, maxEntries);

  if (sortedEntries.length === 0) {
    return (
      <div 
        className="rounded-xl p-6 text-center"
        style={{
          background: 'linear-gradient(135deg, rgba(18, 18, 26, 0.6) 0%, rgba(18, 18, 26, 0.4) 100%)',
          border: '1px solid rgba(42, 42, 58, 0.5)',
        }}
      >
        <span className="text-4xl mb-3 block">📖</span>
        <p className="text-sm text-[#6a6a7a] italic">
          O diário ainda está em branco...
        </p>
        <p className="text-xs text-[#4a4a5a] mt-2">
          As memórias serão escritas aqui.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Diary header */}
      <div className="flex items-center justify-between px-1">
        <p className="text-xs text-[#6a6a7a]">
          {sortedEntries.length} {sortedEntries.length === 1 ? 'memória' : 'memórias'} registradas
        </p>
      </div>

      {/* Entries */}
      {sortedEntries.map((entry, index) => {
        const style = getCategoryStyle(entry.category);
        const isRecent = index === 0;

        return (
          <div 
            key={entry.id} 
            className="relative overflow-hidden rounded-xl transition-all duration-300"
            style={{
              background: 'linear-gradient(135deg, rgba(18, 18, 26, 0.6) 0%, rgba(18, 18, 26, 0.4) 100%)',
              border: `1px solid ${isRecent ? style.color + '30' : 'rgba(42, 42, 58, 0.5)'}`,
            }}
          >
            {/* Accent line */}
            <div 
              className="absolute left-0 top-0 bottom-0 w-1"
              style={{ backgroundColor: style.color + '60' }}
            />

            <div className="p-4 pl-5">
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span 
                    className="text-sm"
                    style={{ filter: `drop-shadow(0 0 4px ${style.color}40)` }}
                  >
                    {style.emoji}
                  </span>
                  <span 
                    className="text-xs font-medium"
                    style={{ color: style.color }}
                  >
                    Dia {entry.dayNumber}
                  </span>
                  {isRecent && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#a78bfa]/20 text-[#a78bfa]">
                      Recente
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-[#4a4a5a]">
                  {new Date(entry.timestamp).toLocaleDateString('pt-BR', { 
                    day: 'numeric', 
                    month: 'short' 
                  })}
                </span>
              </div>

              {/* Entry text */}
              <p className="text-sm text-[#c8c8d0] leading-relaxed">
                <span className="text-[#6a6a7a]">"</span>
                {entry.text}
                <span className="text-[#6a6a7a]">"</span>
              </p>
            </div>
          </div>
        );
      })}

      {/* Load more hint if there are more entries */}
      {entries.length > maxEntries && (
        <p className="text-xs text-[#4a4a5a] text-center py-2">
          +{entries.length - maxEntries} memórias mais antigas...
        </p>
      )}
    </div>
  );
}
