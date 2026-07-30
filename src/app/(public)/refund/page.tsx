import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Политика возврата — ЧИ',
  description: 'Условия возврата платежей и оплаты на платформе ЧИ.',
};

export default function RefundPage() {
  return (
    <main style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px', fontFamily: 'system-ui, sans-serif', lineHeight: 1.7, color: '#1a1a1a' }}>
      <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>Политика возврата</h1>
      <p style={{ color: '#666', marginBottom: 40 }}>Редакция от 01 июля 2026 г.</p>

      <section>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>1. Взнос участника</h2>
        <p>
          Взнос за участие в платном челлендже возвращается в следующих случаях:
        </p>
        <ul style={{ paddingLeft: 24, marginTop: 8 }}>
          <li>Челлендж был отменён организатором до начала</li>
          <li>Платформа отказала в публикации челленджа</li>
          <li>Технический сбой на стороне Платформы не позволил начать участие</li>
        </ul>
        <p style={{ marginTop: 12 }}>
          Возврат производится в течение 10 рабочих дней на исходный способ оплаты.
        </p>
      </section>

      <section style={{ marginTop: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>2. Плата за публикацию (для организаторов)</h2>
        <p>
          Плата за публикацию челленджа не возвращается после того, как челлендж опубликован
          и прошёл модерацию.
        </p>
        <p style={{ marginTop: 12 }}>
          Если модерация отклонила челлендж, средства возвращаются в полном объёме
          в течение 5 рабочих дней.
        </p>
      </section>

      <section style={{ marginTop: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>3. Подписка</h2>
        <p>
          Подписка может быть отменена в любой момент. После отмены доступ к возможностям
          подписки сохраняется до конца оплаченного периода. Частичный возврат за
          неиспользованный период не производится.
        </p>
      </section>

      <section style={{ marginTop: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>4. Как запросить возврат</h2>
        <p>Для запроса возврата:</p>
        <ol style={{ paddingLeft: 24 }}>
          <li>Обратитесь в поддержку по адресу{' '}
            <a href="mailto:refund@chillenge-russia.ru" style={{ color: '#6366f1' }}>
              refund@chillenge-russia.ru
            </a>
          </li>
          <li>Укажите ID заказа или транзакции</li>
          <li>Опишите причину возврата</li>
        </ol>
        <p style={{ marginTop: 12 }}>
          Срок рассмотрения заявки — до 3 рабочих дней.
        </p>
      </section>
    </main>
  );
}
