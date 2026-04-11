import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export function SentimentGauge({ value = 0 }) {
  const data = [
    { name: 'Positive', value: value },
    { name: 'Remaining', value: Math.max(0, 100 - value) },
  ];

  return (
    <div className="bg-[var(--panel-bg)] border-[var(--panel-border)] text-[var(--text-primary)] p-8 rounded-2xl shadow-sm text-center">
      <h3 className="font-bold text-xl mb-4">Overall Vibe Score</h3>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie data={data} innerRadius={70} outerRadius={95} startAngle={180} endAngle={0} dataKey="value">
            <Cell fill="#38bdf8" />
            <Cell fill="rgba(148,163,184,0.25)" />
          </Pie>
          <Tooltip labelStyle={{ color: '#fff' }} contentStyle={{ background: 'rgba(15, 23, 42, 0.95)', border: 'none' }} />
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-[-45px]">
        <span className="text-5xl font-extrabold text-[var(--text-primary)]">{value}%</span>
        <p className="text-[var(--text-secondary)] font-medium">Positive Sentiment</p>
      </div>
    </div>
  );
}
