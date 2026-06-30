'use client';

import React from 'react';

interface ActivityCalendarProps {
  days: { date: string; count: number }[];
}

const COLORS = ['#f0f0f0', '#dcfce7', '#86efac', '#22c55e', '#15803d'];

export function ActivityCalendar({ days }: ActivityCalendarProps) {
  const maxCount = Math.max(...days.map(d => d.count), 1);

  const weeks: { date: string; count: number }[][] = [];
  let currentWeek: { date: string; count: number }[] = [];

  const firstDay = new Date(days[0]?.date || Date.now());
  const dayOfWeek = firstDay.getDay();
  for (let i = 0; i < dayOfWeek; i++) {
    currentWeek.push({ date: '', count: 0 });
  }

  days.forEach(day => {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) currentWeek.push({ date: '', count: 0 });
    weeks.push(currentWeek);
  }

  const getColor = (count: number) => {
    if (count === 0) return COLORS[0];
    const ratio = count / maxCount;
    if (ratio <= 0.25) return COLORS[1];
    if (ratio <= 0.5) return COLORS[2];
    if (ratio <= 0.75) return COLORS[3];
    return COLORS[4];
  };

  const monthLabels = days.reduce<{ month: string; weekIdx: number }[]>((acc, day, i) => {
    if (day.date) {
      const d = new Date(day.date);
      const month = d.toLocaleDateString('ru-RU', { month: 'short' });
      if (acc.length === 0 || acc[acc.length - 1].month !== month) {
        acc.push({ month, weekIdx: Math.floor(i / 7) });
      }
    }
    return acc;
  }, []);

  return (
    <div className="calendar-card">
      <div className="calendar-header">
        <h3>Активность</h3>
        <div className="calendar-legend">
          <span>Мало</span>
          {COLORS.map((c, i) => (
            <div key={i} className="legend-cell" style={{ background: c }} />
          ))}
          <span>Много</span>
        </div>
      </div>

      <div className="calendar-scroll">
        <div className="month-labels">
          {monthLabels.map((m, i) => (
            <span key={i} className="month-label" style={{ gridColumn: m.weekIdx + 1 }}>{m.month}</span>
          ))}
        </div>

        <div className="calendar-grid">
          {weeks.map((week, wi) => (
            <div key={wi} className="calendar-week">
              {week.map((day, di) => (
                <div
                  key={di}
                  className={`calendar-cell ${day.date ? 'has-data' : 'empty'}`}
                  style={{ background: day.date ? getColor(day.count) : 'transparent' }}
                  title={day.date ? `${day.date}: ${day.count} действий` : ''}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .calendar-card { background: white; border-radius: 20px; padding: 24px; border: 1px solid #f0f0f0; }
        .calendar-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
        .calendar-header h3 { font-size: 16px; font-weight: 800; margin: 0; color: #111; }
        .calendar-legend { display: flex; align-items: center; gap: 4px; font-size: 11px; color: #aaa; }
        .legend-cell { width: 12px; height: 12px; border-radius: 3px; }
        .calendar-scroll { overflow-x: auto; }
        .month-labels { display: grid; grid-template-columns: repeat(13, 24px); gap: 3px; margin-bottom: 4px; }
        .month-label { font-size: 10px; color: #aaa; font-weight: 600; }
        .calendar-grid { display: flex; gap: 3px; }
        .calendar-week { display: flex; flex-direction: column; gap: 3px; }
        .calendar-cell { width: 20px; height: 20px; border-radius: 4px; transition: transform 0.15s; }
        .calendar-cell.has-data:hover { transform: scale(1.3); z-index: 1; }
        .calendar-cell.empty { background: transparent !important; }
      `}</style>
    </div>
  );
}
