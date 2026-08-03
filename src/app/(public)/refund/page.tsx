import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Политика возврата — ЧИ',
  description: 'Условия возврата средств за публикацию челленджей и подписки на платформе ЧИ.',
};

export default function RefundPage() {
  return (
    <main style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px', fontFamily: 'system-ui, sans-serif', lineHeight: 1.7, color: '#1a1a1a' }}>
      <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>Политика возврата</h1>
      <p style={{ color: '#666', marginBottom: 40 }}>Редакция от 01 июля 2026 г.</p>

      <section>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>1. Общие положения</h2>
        <p>Настоящая политика возвращает правила возврата средств за услуги платформы ЧИ (далее — «Платформа»).</p>
      </section>

      <section style={{ marginTop: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>2. Возврат за публикацию челленджа</h2>
        <ul style={{ paddingLeft: 24 }}>
          <li>Подача заявления на возврат возможна в течение 14 (четырнадцати) календарных дней с момента оплаты</li>
          <li>Заявление подается на email: <a href="mailto:support@chillenge-russia.ru" style={{ color: '#6366f1' }}>support@chillenge-russia.ru</a></li>
          <li>Возврат средств осуществляется в течение 30 (тридцати) рабочих дней после рассмотрения заявления</li>
          <li>Если челлендж не был опубликован — возврат производится в полном объеме</li>
          <li>Если челлендж опубликован и прошел менее 7 дней с момента публикации — возврат возможен в полном объеме</li>
          <li>Если челлендж опубликован более 7 дней назад — возврат может быть произведен с учетом фактически понесенных платформой расходов</li>
        </ul>
      </section>

      <section style={{ marginTop: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>3. Возврат за подписку</h2>
        <ul style={{ paddingLeft: 24 }}>
          <li>Подписка может быть отменена в любой момент</li>
          <li>При отмене подписки доступ сохраняется до конца оплаченного периода</li>
          <li>Возврат стоимости за текущий период подписки не производ</li>
        </ul>
      </section>

      <section style={{ marginTop: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>4. Контакты</h2>
        <p>Вопросы по возврату: <a href="mailto:support@chillenge-russia.ru" style={{ color: '#6366f1' }}>support@chillenge-russia.ru</a></p>
      </section>
    </main>
  );
}
