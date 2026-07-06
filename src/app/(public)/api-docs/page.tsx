import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'API — NEWSY',
  description: 'Документация API платформы NEWSY для интеграции.',
};

export default function ApiDocsPage() {
  return (
    <main style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px', fontFamily: 'system-ui, sans-serif', lineHeight: 1.7, color: '#1a1a1a' }}>
      <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>API NEWSY</h1>
      <p style={{ color: '#666', marginBottom: 40 }}>Документация для интеграции (в разработке)</p>

      <section>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>REST API</h2>
        <p>
          Платформа предоставляет REST API для управления челленджами и пользователями.
          Доступ к API осуществляется по API-ключу, который можно получить в настройках аккаунта.
        </p>
      </section>

      <section style={{ marginTop: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>Базовый URL</h2>
        <div style={{ background: '#f5f5f5', padding: '12px 16px', borderRadius: 8, fontFamily: 'monospace', fontSize: 14 }}>
          https://chillenge-russia.ru/api/v1
        </div>
      </section>

      <section style={{ marginTop: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>Доступные эндпоинты</h2>
        <ul style={{ paddingLeft: 24 }}>
          <li><code>GET /challenges</code> — список опубликованных челленджей</li>
          <li><code>GET /challenges/:id</code> — детали челленджа</li>
          <li><code>POST /challenges</code> — создание нового челленджа</li>
          <li><code>POST /challenges/:id/join</code> — присоединение к челленджу</li>
          <li><code>POST /challenges/:id/complete-step</code> — завершение этапа</li>
        </ul>
      </section>

      <section style={{ marginTop: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>Аутентификация</h2>
        <p>
          Используйте заголовок <code>Authorization: Bearer &lt;api_key&gt;</code> для доступа к защищённым эндпоинтам.
        </p>
      </section>
    </main>
  );
}
