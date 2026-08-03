import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Пользовательское соглашение — ЧИ',
  description: 'Условия использования платформы ЧИ. Права и обязанности пользователей и организаторов.',
};

export default function TermsPage() {
  return (
    <main style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px', fontFamily: 'system-ui, sans-serif', lineHeight: 1.7, color: '#1a1a1a' }}>
      <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>Пользовательское соглашение</h1>
      <p style={{ color: '#666', marginBottom: 40 }}>Редакция от 01 июля 2026 г.</p>

      <section>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>1. Предмет соглашения</h2>
        <p>
          Настоящее Пользовательское соглашение регулирует отношения между ЧИ (далее — «Платформа»)
          и физическими/юридическими лицами, использующими сервис.
        </p>
        <p style={{ marginTop: 12 }}>
          Регистрируясь на Платформе, вы подтверждаете согласие с настоящим соглашением.
        </p>
      </section>

      <section style={{ marginTop: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>2. Регистрация и аккаунт</h2>
        <ul style={{ paddingLeft: 24 }}>
          <li>Для использования Платформы необходима регистрация</li>
          <li>Вы обязаны предоставить достоверные данные</li>
          <li>Ответственность за сохранность пароля несёт пользователь</li>
          <li>Платформа вправе заблокировать аккаунт при нарушении правил</li>
        </ul>
      </section>

      <section style={{ marginTop: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>3. Правила использования</h2>
        <p>Пользователям запрещено:</p>
        <ul style={{ paddingLeft: 24 }}>
          <li>Публиковать ложную или вводящую в заблуждение информацию</li>
          <li>Нарушать права интеллектуальной собственности</li>
          <li>Использовать автоматизированные инструменты для накрутки</li>
          <li>Создавать мошеннические челленджи</li>
          <li>Распространять спам или вредоносный контент</li>
        </ul>
      </section>

      <section style={{ marginTop: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>4. Организаторы</h2>
        <p>
          Организаторы несут ответственность за точность информации в создаваемых
          челленджах, соответствие призов и наград заявленным условиям.
        </p>
        <p style={{ marginTop: 12 }}>
          Публикация челленджа осуществляется после оплаты и модерации.
          Возврат платы за публикацию регулируется политикой возврата.
        </p>
      </section>

      <section style={{ marginTop: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>5. Платежи</h2>
        <p>
          Платежи обрабатываются через платёжный сервис Stripe. Платформа не хранит
          данные банковских карт пользователей.
        </p>
        <p style={{ marginTop: 12 }}>
          Комиссия Платформы удерживается из взносов участников согласно действующим тарифам.
        </p>
      </section>

      <section style={{ marginTop: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>6. Ограничение ответственности</h2>
        <p>
          Платформа не несёт ответственности за действия организаторов и участников.
          Платформа предоставляет технические инструменты для организации и проведения челленджей.
        </p>
      </section>

      <section style={{ marginTop: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>7. Изменения</h2>
        <p>
          Платформа вправе обновлять соглашение. Продолжение использования после вступления
          изменений в силу означает согласие с новыми условиями.
        </p>
      </section>

      <p style={{ marginTop: 48, color: '#888', fontSize: 14 }}>
        Вопросы:{' '}
        <a href="mailto:legal@chillenge-russia.ru" style={{ color: '#6366f1' }}>
          legal@chillenge-russia.ru
        </a>
      </p>
    </main>
  );
}
