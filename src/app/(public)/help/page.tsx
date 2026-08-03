import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Центр помощи — ЧИ',
  description: 'Ответы на часто задаваемые вопросы и способы связи с поддержкой.',
};

export default function HelpPage() {
  return (
    <main style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px', fontFamily: 'system-ui, sans-serif', lineHeight: 1.7, color: '#1a1a1a' }}>
      <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>Центр помощи</h1>
      <p style={{ color: '#666', marginBottom: 40 }}>Ответы на ваши вопросы</p>

      <section>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>Как начать участие в челлендже?</h2>
        <p>
          Выберите интересующий челлендж в каталоге, нажмите «Участвовать» и следуйте инструкциям
          на каждом этапе. Для участия в платных челленджах потребуется оплата.
        </p>
      </section>

      <section style={{ marginTop: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>Как создать свой челлендж?</h2>
        <p>
          Нажмите «Создать челендж» в верхнем меню. Заполните информацию, добавьте этапы,
          настройте параметры и опубликуйте. Публикация платных челленджей проходит модерацию.
        </p>
      </section>

      <section style={{ marginTop: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>Как работает оплата?</h2>
        <p>
          Платежи обрабатываются через сервис Stripe. Мы не храним данные банковских карт.
          Для организаторов доступны тарифные планы с различными возможностями.
        </p>
      </section>

      <section style={{ marginTop: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>Как отменить участие?</h2>
        <p>
          Перейдите в личный кабинет, выберите активный челлендж и нажмите «Покинуть челлендж».
          Условия возврата взноса описаны в политике возврата.
        </p>
      </section>

      <section style={{ marginTop: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>Контакты поддержки</h2>
        <p>
          Если вы не нашли ответ на свой вопрос, напишите нам:{' '}
          <a href="mailto:support@chillenge-russia.ru" style={{ color: '#6366f1' }}>
            support@chillenge-russia.ru
          </a>
        </p>
      </section>
    </main>
  );
}
