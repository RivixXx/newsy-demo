import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Аналитика — NEWSY',
  description: 'Статистика и аналитика по вашим челленджам.',
};

export default function AnalyticsPage() {
  return (
    <main style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px', fontFamily: 'system-ui, sans-serif', lineHeight: 1.7, color: '#1a1a1a' }}>
      <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>Аналитика</h1>
      <p style={{ color: '#666', marginBottom: 40 }}>Раздел в разработке</p>
      <p>
        Здесь будет доступна детальная аналитика по вашим челленджам:
        количество участников, конверсия, доходы и многое другое.
      </p>
    </main>
  );
}
