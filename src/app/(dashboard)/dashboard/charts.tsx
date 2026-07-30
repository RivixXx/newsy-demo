'use client';

import React from 'react';
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

interface ChartsProps {
  categoryStats: { name: string; value: number }[];
  recentParticipations: { date: string; status: string }[];
}

const COLORS = ['#FF385C', '#2563eb', '#16a34a', '#d97706', '#7c3aed', '#db2777'];

// Aggregate participations by day for the activity chart
function aggregateActivity(data: { date: string; status: string }[]) {
  const now = new Date();
  const days: Record<string, number> = {};

  // Last 14 days
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
    days[key] = 0;
  }

  data.forEach(p => {
    const d = new Date(p.date);
    const key = d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
    if (key in days) days[key]++;
  });

  return Object.entries(days).map(([date, count]) => ({ date, count }));
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'white', padding: '10px 14px', borderRadius: 10,
      border: '1px solid #e5e5e5', boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      fontSize: 13, fontWeight: 600,
    }}>
      <p style={{ margin: '0 0 4px', color: '#999', fontSize: 11 }}>{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ margin: 0, color: p.color }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
}

export function DashboardCharts({ categoryStats, recentParticipations }: ChartsProps) {
  const activityData = aggregateActivity(recentParticipations);
  const hasActivity = recentParticipations.length > 0;
  const hasCategories = categoryStats.length > 0;

  return (
    <div style={s.row}>
      {/* Activity chart */}
      <div style={s.chartCard}>
        <div style={s.chartHeader}>
          <h3 style={s.chartTitle}>Активность</h3>
          <span style={s.chartBadge}>14 дней</span>
        </div>
        <div style={s.chartBody}>
          {hasActivity ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={activityData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="activityGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FF385C" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#FF385C" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#999' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#999' }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="count" name="Участий" stroke="#FF385C" strokeWidth={2} fill="url(#activityGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div style={s.emptyChart}>
              <span style={{ fontSize: 32, opacity: 0.3 }}>📊</span>
              <p>Нет данных об активности</p>
              <span>Начните участвовать в челленджах</span>
            </div>
          )}
        </div>
      </div>

      {/* Category distribution */}
      <div style={s.chartCard}>
        <div style={s.chartHeader}>
          <h3 style={s.chartTitle}>Категории</h3>
          <span style={s.chartBadge}>{categoryStats.length}</span>
        </div>
        <div style={s.chartBody}>
          {hasCategories ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <ResponsiveContainer width="50%" height={200}>
                <PieChart>
                  <Pie
                    data={categoryStats}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryStats.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div style={s.legend}>
                {categoryStats.map((cat, i) => (
                  <div key={cat.name} style={s.legendItem}>
                    <div style={{ ...s.legendDot, background: COLORS[i % COLORS.length] }} />
                    <span style={s.legendName}>{cat.name}</span>
                    <span style={s.legendValue}>{cat.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={s.emptyChart}>
              <span style={{ fontSize: 32, opacity: 0.3 }}>🎯</span>
              <p>Нет данных о категориях</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  row: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 14,
  },
  chartCard: {
    background: 'white',
    borderRadius: 20,
    border: '1px solid #f0f0f0',
    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
    overflow: 'hidden',
  },
  chartHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px 0',
  },
  chartTitle: {
    fontSize: 15,
    fontWeight: 800,
    margin: 0,
    color: '#111',
  },
  chartBadge: {
    padding: '3px 10px',
    borderRadius: 8,
    background: '#f5f5f5',
    fontSize: 12,
    fontWeight: 700,
    color: '#888',
  },
  chartBody: {
    padding: '12px 12px 16px',
  },
  emptyChart: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    height: 200,
    color: '#ccc',
    textAlign: 'center',
  },
  legend: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    flex: 1,
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 13,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: '50%',
    flexShrink: 0,
  },
  legendName: {
    flex: 1,
    fontWeight: 600,
    color: '#333',
  },
  legendValue: {
    fontWeight: 800,
    color: '#111',
    minWidth: 20,
    textAlign: 'right',
  },
};
