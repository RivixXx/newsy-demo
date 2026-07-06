import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Избранное — NEWSY',
  description: 'Сохранённые челленджи.',
};

export default function FavoritesPage() {
  return (
    <main style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px', fontFamily: 'system-ui, sans-serif', lineHeight: 1.7, color: '#1a1a1a' }}>
      <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>Избранное</h1>
      <p style={{ color: '#666', marginBottom: 40 }}>Раздел в разработке</p>
      <p>
        Здесь будут отображаться челленджи, которые вы добавили в избранное.
      </p>
    </main>
  );
}
