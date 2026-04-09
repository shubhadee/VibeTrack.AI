import React from 'react';

export function StatsCards({ total = 0, positive = '0%', status = 'ACTIVE' }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-[var(--panel-bg)] border-[var(--panel-border)] text-[var(--text-primary)] p-6 rounded-2xl shadow-sm">
        <p className="text-[var(--text-secondary)] text-sm font-medium uppercase tracking-wider mb-4">Total Mentions</p>
        <h2 className="text-3xl font-bold">{total}</h2>
      </div>
      <div className="bg-[var(--panel-bg)] border-[var(--panel-border)] text-[var(--text-primary)] p-6 rounded-2xl shadow-sm">
        <p className="text-[var(--text-secondary)] text-sm font-medium uppercase tracking-wider mb-4">Positive Mentions</p>
        <h2 className="text-3xl font-bold text-emerald-400">{positive}</h2>
      </div>
      <div className="bg-[var(--panel-bg)] border-[var(--panel-border)] text-[var(--text-primary)] p-6 rounded-2xl shadow-sm">
        <p className="text-[var(--text-secondary)] text-sm font-medium uppercase tracking-wider mb-4">API Status</p>
        <h2 className="text-3xl font-bold text-cyan-300">{status}</h2>
      </div>
    </div>
  );
}
