import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Профиль бренда — ЧИ',
  description: 'Управление профилем бренда на платформе ЧИ.',
};

export default function BrandProfilePage() {
  return (
    <main style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px', fontFamily: 'system-ui, sans-serif', lineHeight: 1.7, color: '#1a1a1a' }}>
      <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>Профиль бренда</h1>
      <p style={{ color: '#666', marginBottom: 40 }}>Раздел в разработке</p>
      <p>
        Здесь вы сможете настроить профиля вашего бренда, загрузить логотип
        и управлять публичной информацией для участников.
      </p>
    </main>
  );
}
