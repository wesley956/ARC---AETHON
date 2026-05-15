// ============================================================
// ARC: AETHON — DIARY LIST
// ============================================================

import { useState } from 'react';
import { DiaryEntry } from '../types/game';

interface DiaryListProps {
  entries: DiaryEntry[];
  maxVisible?: number;
}

export default function DiaryList({ entries, maxVisible = 3 }: DiaryListProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const sortedEntries = [...entries].sort((a, b) => b.timestamp - a.timestamp);
  const visibleEntries = isExpanded ? sortedEntries : sortedEntries.slice(0, maxVisible);
  const hasMore = entries.length > maxVisible;

  const getCategoryIcon = (category?: string): string => {
    switch (category) {
      case 'birth': return '🐣';
      case 'feeding': return '🍖';
      case 'expedition': return '🗺️';
      case 'memory': return '💭';
      case 'milestone': return '⭐';
      case 'nest': return '🏠';
      default: return '📖';
    }
  };

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  if (entries.length === 0) {
    return (
      <div className="bg-[#12121a]/50 rounded-xl border border-[#2a2a3a]/50 p-4">
        <p className="text-sm text-[#6a6a7a] text-center italic">
          O diário está vazio...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#12121a]/50 rounded-xl border border-[#2a2a3a]/50 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a2a3a]/50">
        <div className="flex items-center gap-2">
          <span className="text-lg">📖</span>
          <h3 className="font-medium text-[#e8e8ec]">Diário</h3>
        </div>
        <span className="text-xs text-[#6a6a7a]">
          {entries.length} entrada{entries.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="divide-y divide-[#2a2a3a]/30">
        {visibleEntries.map((entry, index) => (
          <div
            key={entry.id}
            className={`p-4 ${index === 0 ? 'bg-[#1a1a24]/30' : ''}`}
          >
            <div className="flex items-start gap-3">
              <span className="text-lg">{getCategoryIcon(entry.category)}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[#e8e8ec] leading-relaxed">
                  {entry.text}
                </p>
                <p className="text-xs text-[#6a6a7a] mt-1">
                  {formatDate(entry.timestamp)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {hasMore && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full py-3 text-sm text-[#a78bfa] hover:text-[#c4b5fd] transition-colors border-t border-[#2a2a3a]/50"
        >
          {isExpanded ? '▲ Ver menos' : `▼ Ver mais ${entries.length - maxVisible} entrada${entries.length - maxVisible !== 1 ? 's' : ''}`}
        </button>
      )}
    </div>
  );
}
