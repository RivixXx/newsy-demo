import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Финансы — ЧИ',
  description: 'Управление финансами и история транзакций.',
};

export default function FinancePage() {
  return (
    <main style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px', fontFamily: 'system-ui, sans-serif', lineHeight: 1.7, color: '#1a1a1a' }}>
      <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>Финансы</h1>
      <p style={{ color: '#666', marginBottom: 40 }}>Раздел в разработке</p>
      <p>
        Здесь будет доступна история платежей, вывод средств
        и управление финансовыми настройками.
      </p>
    </main>
  );
}
