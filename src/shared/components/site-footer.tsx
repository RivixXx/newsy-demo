'use client';

import React from 'react';
import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-content">
        {/* Колонка 1: Логотип */}
        <div className="footer-column logo-column">
          <Link href="/" className="footer-logo">
            <img src="/icon.png" alt="NEWSY" className="footer-logo-img" />
            <span className="footer-brand-name">newsy</span>
          </Link>
        </div>

        {/* Колонка 2: Структура */}
        <div className="footer-column">
          <h4 className="footer-heading">Структура</h4>
          <ul className="footer-links">
            <li><Link href="/">Главная</Link></li>
            <li><Link href="/search">Каталог</Link></li>
            <li><Link href="/dashboard">Мои активности</Link></li>
            <li><Link href="/dashboard/challenges/new">Для авторов</Link></li>
          </ul>
        </div>

        {/* Колонка 3: Личный кабинет */}
        <div className="footer-column">
          <h4 className="footer-heading">Личный кабинет</h4>
          <ul className="footer-links">
            <li><Link href="/dashboard">Дашборд</Link></li>
            <li><Link href="#">Избранное</Link></li>
            <li><Link href="/dashboard/profile">Профиль покупателя</Link></li>
            <li><Link href="#">Профиль бренда</Link></li>
            <li><Link href="#">Реферальная программа</Link></li>
            <li><Link href="#">Финансы</Link></li>
          </ul>
        </div>

        {/* Колонка 4: Политики */}
        <div className="footer-column">
          <h4 className="footer-heading">Политики</h4>
          <ul className="footer-links">
            <li><Link href="#">Политика конфиденциальности</Link></li>
            <li><Link href="#">Политика возвратов</Link></li>
            <li><Link href="#">Правила сервиса</Link></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <span className="copyright">2025 Название бренда</span>
      </div>

      <style jsx>{`
        .site-footer {
          background-color: #222222;
          color: #ffffff;
          padding: 60px clamp(16px, 3vw, 40px) 32px;
          font-family: system-ui, -apple-system, sans-serif;
        }

        .footer-content {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 40px;
          padding-bottom: 60px;
        }

        /* Logo Column */
        .logo-column {
          display: flex;
          align-items: flex-start;
        }

        .footer-logo {
          background-color: white;
          padding: 12px 24px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
        }

        .footer-logo-img {
          width: 24px;
          height: 24px;
          object-fit: contain;
        }

        .footer-brand-name {
          color: #222;
          font-weight: 800;
          font-size: 22px;
          letter-spacing: -0.5px;
          line-height: 1;
          margin-bottom: 3px;
        }

        /* Links Columns */
        .footer-column {
          display: flex;
          flex-direction: column;
        }

        .footer-heading {
          font-size: 16px;
          font-weight: 600;
          margin: 0 0 24px 0;
          color: #ffffff;
        }

        .footer-links {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .footer-links a {
          color: #aaaaaa;
          text-decoration: none;
          font-size: 14px;
          transition: color 0.2s ease;
        }

        .footer-links a:hover {
          color: #ffffff;
        }

        /* Bottom Row */
        .footer-bottom {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          gap: 16px;
          padding-top: 40px;
          border-top: 1px solid rgba(255,255,255,0.1);
        }

        .copyright {
          color: #888888;
          font-size: 14px;
        }

        .author-badge {
          background-color: #00896F; /* Зеленый цвет плашки moloko69 */
          color: white;
          padding: 4px 12px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .footer-content {
            grid-template-columns: 1fr 1fr;
          }
          .logo-column {
            grid-column: span 2;
            margin-bottom: 24px;
          }
        }

        @media (max-width: 600px) {
          .footer-content {
            grid-template-columns: 1fr;
          }
          .logo-column {
            grid-column: span 1;
          }
          .site-footer {
            padding: 40px 20px 20px;
          }
        }
      `}</style>
    </footer>
  );
}
