'use client';

import Link from 'next/link';
import type { CSSProperties } from 'react';
import { ArrowLeft, Code, Database, Users, Trophy, Calendar, MapPin } from 'lucide-react';

export default function ApiDocsPage() {
  return (
    <div className="docs-page">
      <Link href="/" className="docs-back">
        <ArrowLeft size={18} /> На главную
      </Link>

      <header className="docs-header">
        <Code size={32} color="#FF385C" />
        <div>
          <h1>API Documentation</h1>
          <p>Публичное API NEWSY для интеграций</p>
        </div>
      </header>

      <section className="docs-section">
        <h2>Базовый URL</h2>
        <code className="docs-code">https://chillenge-russia.ru/api/v1</code>
      </section>

      <section className="docs-section">
        <h2>Эндпоинты</h2>

        <div className="endpoint-card">
          <div className="endpoint-method get">GET</div>
          <div className="endpoint-info">
            <code>/challenges</code>
            <p>Список опубликованных челленджей с фильтрацией и пагинацией</p>
            <div className="endpoint-params">
              <span className="param">page</span> — номер страницы (по умолчанию 1)
              <span className="param">limit</span> — количество на странице (макс. 100)
              <span className="param">category</span> — фильтр по категории
              <span className="param">format</span> — ONLINE / OFFLINE / HYBRID
              <span className="param">q</span> — поисковый запрос
            </div>
          </div>
        </div>

        <div className="endpoint-card">
          <div className="endpoint-method get">GET</div>
          <div className="endpoint-info">
            <code>/challenges/:id</code>
            <p>Детали конкретного челленджа с этапами</p>
          </div>
        </div>
      </section>

      <section className="docs-section">
        <h2>Пример запроса</h2>
        <pre className="docs-pre">
{`curl -X GET "https://chillenge-russia.ru/api/v1/challenges?sport&limit=5" \\
  -H "Accept: application/json"`}
        </pre>
      </section>

      <section className="docs-section">
        <h2>Пример ответа</h2>
        <pre className="docs-pre">
{`{
  "data": [
    {
      "id": "ch-123",
      "title": "Марафон ЗОЖ",
      "description": "30-дневный марафон...",
      "category": "sport",
      "format": "ONLINE",
      "organizer": {
        "id": "org-456",
        "name": "Nike Run Club",
        "isVerified": true
      },
      "participantsCount": 45,
      "maxParticipants": 100,
      "startDate": "2026-07-15T00:00:00Z",
      "endDate": "2026-08-15T00:00:00Z",
      "entryFee": 0
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 5,
    "total": 42,
    "pages": 9
  }
}`}
        </pre>
      </section>

      <section className="docs-section">
        <h2>White-label решение</h2>
        <p style={{ color: '#666', lineHeight: 1.6 }}>
          Для корпоративных клиентов доступна white-label интеграция:
          кастомный домен, логотип, цвета. Стоимость — от 100 000 ₽/год.
        </p>
        <Link href="/register" className="docs-cta">
          Связаться с нами
        </Link>
      </section>

      <style jsx>{`
        .docs-page {
          max-width: 800px;
          margin: 0 auto;
          padding: 40px clamp(16px, 3vw, 40px) 80px;
        }
        .docs-back {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          font-weight: 600;
          color: #666;
          text-decoration: none;
          margin-bottom: 24px;
        }
        .docs-back:hover { color: #FF385C; }
        .docs-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 40px;
        }
        .docs-header h1 {
          font-size: clamp(28px, 4vw, 42px);
          font-weight: 900;
          margin: 0;
        }
        .docs-header p {
          font-size: 16px;
          color: #666;
          margin: 4px 0 0;
        }
        .docs-section {
          margin-bottom: 32px;
        }
        .docs-section h2 {
          font-size: 18px;
          font-weight: 800;
          margin: 0 0 12px;
        }
        .docs-code {
          display: block;
          padding: 14px 18px;
          background: #1a1a1a;
          color: #22c55e;
          border-radius: 10px;
          font-family: monospace;
          font-size: 14px;
        }
        .endpoint-card {
          display: flex;
          gap: 12px;
          padding: 16px;
          background: white;
          border: 1px solid #f0f0f0;
          border-radius: 12px;
          margin-bottom: 12px;
        }
        .endpoint-method {
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 800;
          height: fit-content;
        }
        .endpoint-method.get {
          background: #dcfce7;
          color: #166534;
        }
        .endpoint-method.post {
          background: #dbeafe;
          color: #1e40af;
        }
        .endpoint-info code {
          font-size: 14px;
          font-weight: 700;
          color: #111;
        }
        .endpoint-info p {
          font-size: 13px;
          color: #888;
          margin: 4px 0 8px;
        }
        .endpoint-params {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          font-size: 12px;
          color: #666;
        }
        .param {
          padding: 2px 8px;
          background: #f3f4f6;
          border-radius: 4px;
          font-family: monospace;
          font-weight: 600;
        }
        .docs-pre {
          padding: 16px;
          background: #1a1a1a;
          color: #e5e7eb;
          border-radius: 10px;
          font-family: monospace;
          font-size: 13px;
          line-height: 1.5;
          overflow-x: auto;
          white-space: pre-wrap;
        }
        .docs-cta {
          display: inline-block;
          margin-top: 12px;
          padding: 12px 24px;
          background: #FF385C;
          color: white;
          border-radius: 12px;
          font-weight: 700;
          text-decoration: none;
        }
        .docs-cta:hover {
          background: #E31C5F;
        }
      `}</style>
    </div>
  );
}
