// ============================================================
// ARC: AETHON — DIARY LIST
// ============================================================

import { DiaryEntry } from '../types/game';

interface DiaryListProps {
  entries: DiaryEntry[];
  maxEntries?: number;
}

export default function DiaryList({ entries, maxEntries = 10 }: DiaryListProps) {
  const sortedEntries = [...entries].sort((a, b) => b.timestamp - a.timestamp).slice(0, maxEntries);

  if (sortedEntries.length === 0) {
    return (
      <div className="bg-[#12121a]/50 rounded-xl border border-[#2a2a3a]/50 p-4 text-center">
        <p className="text-sm text-[#6a6a7a] italic">O diário ainda está em branco...</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sortedEntries.map((entry) => (
        <div key={entry.id} className="bg-[#12121a]/50 rounded-xl border border-[#2a2a3a]/50 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#a78bfa] font-medium">Dia {entry.dayNumber}</span>
            <span className="text-[10px] text-[#6a6a7a]">{new Date(entry.timestamp).toLocaleDateString()}</span>
          </div>
          <p className="text-sm text-[#e8e8ec] leading-relaxed italic">"{entry.text}"</p>
        </div>
      ))}
    </div>
  );
}
