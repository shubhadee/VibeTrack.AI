import React from 'react';

export function TopKeywords({ words = [] }) {
  return (
    <div className="bg-[var(--panel-bg)] border-[var(--panel-border)] text-[var(--text-primary)] p-8 rounded-2xl shadow-sm">
      <h3 className="font-bold text-xl mb-6">Keyword Insights</h3>
      <div className="flex flex-wrap gap-3">
        {words.length > 0 ? (
          words.map((word, i) => (
            <span
              key={i}
              className="px-4 py-2 bg-[var(--surface-strong)] text-[var(--text-secondary)] rounded-full font-bold"
              style={{ fontSize: `${12 + ((word.size || 12) / 2)}px` }}>
              {word.text}
            </span>
          ))
        ) : (
          <p className="text-[var(--text-secondary)] italic">No data yet...</p>
        )}
      </div>
    </div>
  );
}
