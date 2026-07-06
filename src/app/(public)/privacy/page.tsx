import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Политика конфиденциальности — NEWSY',
  description: 'Политика конфиденциальности платформы NEWSY. Как мы собираем, используем и защищаем ваши персональные данные.',
};

export default function PrivacyPage() {
  return (
    <main style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px', fontFamily: 'system-ui, sans-serif', lineHeight: 1.7, color: '#1a1a1a' }}>
      <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>Политика конфиденциальности</h1>
      <p style={{ color: '#666', marginBottom: 40 }}>Редакция от 01 июля 2026 г.</p>

      <section>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>1. Общие положения</h2>
        <p>
          Настоящая Политика конфиденциальности регулирует порядок обработки персональных данных
          пользователей платформы NEWSY (далее — «Платформа»), доступной по адресу{' '}
          <a href="https://chillenge-russia.ru" style={{ color: '#6366f1' }}>chillenge-russia.ru</a>.
        </p>
        <p style={{ marginTop: 12 }}>
          Обработка персональных данных осуществляется в соответствии с Федеральным законом
          № 152-ФЗ «О персональных данных» от 27.07.2006 г.
        </p>
      </section>

      <section style={{ marginTop: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>2. Какие данные мы собираем</h2>
        <ul style={{ paddingLeft: 24 }}>
          <li>Имя, фамилия</li>
          <li>Адрес электронной почты</li>
          <li>Номер телефона (при указании)</li>
          <li>Дата рождения и пол (при указании)</li>
          <li>История участия в челленджах</li>
          <li>Технические данные: IP-адрес, тип браузера, cookies</li>
        </ul>
      </section>

      <section style={{ marginTop: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>3. Цели обработки данных</h2>
        <ul style={{ paddingLeft: 24 }}>
          <li>Предоставление доступа к функциям платформы</li>
          <li>Обработка платежей и выплат</li>
          <li>Информирование об обновлениях и результатах челленджей</li>
          <li>Обеспечение безопасности и предотвращение мошенничества</li>
          <li>Выполнение требований законодательства РФ</li>
        </ul>
      </section>

      <section style={{ marginTop: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>4. Хранение и защита данных</h2>
        <p>
          Данные хранятся на серверах на территории Российской Федерации. Мы применяем
          шифрование, контроль доступа и регулярный аудит безопасности.
        </p>
        <p style={{ marginTop: 12 }}>
          Пароли хранятся в зашифрованном виде с применением алгоритма PBKDF2-SHA512
          и никогда не передаются третьим лицам в открытом виде.
        </p>
      </section>

      <section style={{ marginTop: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>5. Права пользователя</h2>
        <p>Вы вправе:</p>
        <ul style={{ paddingLeft: 24 }}>
          <li>Получить информацию о хранящихся о вас данных</li>
          <li>Потребовать исправления неточных данных</li>
          <li>Потребовать удаления данных («право на забвение»)</li>
          <li>Отозвать согласие на обработку данных</li>
        </ul>
        <p style={{ marginTop: 12 }}>
          Для реализации прав обратитесь на почту:{' '}
          <a href="mailto:privacy@chillenge-russia.ru" style={{ color: '#6366f1' }}>
            privacy@chillenge-russia.ru
          </a>
        </p>
      </section>

      <section style={{ marginTop: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>6. Cookies</h2>
        <p>
          Платформа использует сессионные cookies для идентификации пользователей.
          Cookies не передаются третьим лицам и удаляются при выходе из аккаунта
          или истечении срока действия сессии (7 дней).
        </p>
      </section>

      <section style={{ marginTop: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>7. Изменения политики</h2>
        <p>
          Мы вправе обновлять эту политику. При существенных изменениях уведомим
          пользователей по электронной почте или через уведомления в личном кабинете.
        </p>
      </section>

      <p style={{ marginTop: 48, color: '#888', fontSize: 14 }}>
        По вопросам обработки данных:{' '}
        <a href="mailto:privacy@chillenge-russia.ru" style={{ color: '#6366f1' }}>
          privacy@chillenge-russia.ru
        </a>
      </p>
    </main>
  );
}
