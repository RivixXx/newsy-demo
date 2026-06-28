'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Send, ArrowUpRight, Heart } from 'lucide-react';

export function SiteFooter() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="footer">
      {/* Animated stripes background */}
      <div className="footer-stripes">
        <div className="stripe stripe-1" />
        <div className="stripe stripe-2" />
        <div className="stripe stripe-3" />
        <div className="stripe stripe-4" />
        <div className="stripe stripe-5" />
      </div>

      {/* Glow orbs */}
      <div className="footer-glow glow-1" />
      <div className="footer-glow glow-2" />

      <div className="footer-inner">
        {/* Top section */}
        <div className="footer-top">
          <div className="footer-brand">
            <Link href="/" className="footer-logo">
              <img src="/icon.png" alt="NEWSY" className="footer-logo-img" />
              <span className="footer-logo-text">NEWSY</span>
            </Link>
            <p className="footer-tagline">
              Платформа интерактивных челенджей.
              <br />Растей над собой, соревнуйся, побеждай.
            </p>
            <div className="footer-socials">
              <a href="#" className="social-btn" aria-label="Telegram">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
              </a>
              <a href="#" className="social-btn" aria-label="VK">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M15.684 0H8.316C1.592 0 0 1.592 0 8.316v7.368C0 22.408 1.592 24 8.316 24h7.368C22.408 24 24 22.408 24 15.684V8.316C24 1.592 22.391 0 15.684 0zm3.692 17.123h-1.744c-.66 0-.864-.525-2.05-1.727-1.033-1-1.49-1.135-1.744-1.135-.356 0-.458.102-.458.593v1.575c0 .424-.135.678-1.253.678-1.846 0-3.896-1.118-5.335-3.202C4.624 10.857 4.03 8.57 4.03 8.096c0-.254.102-.491.593-.491h1.744c.44 0 .61.203.78.678.863 2.49 2.303 4.675 2.896 4.675.22 0 .322-.102.322-.66V9.721c-.068-1.186-.695-1.287-.695-1.71 0-.203.17-.407.44-.407h2.744c.373 0 .508.203.508.643v3.473c0 .372.17.508.271.508.22 0 .407-.136.813-.542 1.253-1.406 2.15-3.574 2.15-3.574.119-.254.322-.491.763-.491h1.744c.525 0 .644.27.525.643-.22 1.017-2.354 4.031-2.354 4.031-.186.305-.254.44 0 .78.186.254.796.779 1.203 1.253.745.847 1.32 1.558 1.473 2.05.17.49-.085.744-.576.744z"/></svg>
              </a>
              <a href="#" className="social-btn" aria-label="YouTube">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
              <a href="#" className="social-btn" aria-label="Discord">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z"/></svg>
              </a>
            </div>
          </div>

          <div className="footer-cols">
            <div className="footer-col">
              <h4 className="footer-col-title">Платформа</h4>
              <Link href="/" className="footer-link">Главная <ArrowUpRight size={12} /></Link>
              <Link href="/search" className="footer-link">Каталог челенджей <ArrowUpRight size={12} /></Link>
              <Link href="/dashboard/challenges/new" className="footer-link">Создать челендж <ArrowUpRight size={12} /></Link>
              <Link href="/dashboard" className="footer-link">Личный кабинет <ArrowUpRight size={12} /></Link>
            </div>
            <div className="footer-col">
              <h4 className="footer-col-title">Участникам</h4>
              <Link href="/dashboard/profile" className="footer-link">Мой профиль</Link>
              <Link href="/achievements" className="footer-link">Достижения</Link>
              <Link href="/rewards" className="footer-link">Награды</Link>
              <Link href="/referral" className="footer-link">Реферальная программа</Link>
            </div>
            <div className="footer-col">
              <h4 className="footer-col-title">Организаторам</h4>
              <Link href="/dashboard/challenges/new" className="footer-link">Как создать ЧЕ</Link>
              <Link href="/dashboard/subscription" className="footer-link">Тарифы</Link>
              <Link href="/dashboard/analytics" className="footer-link">Аналитика</Link>
              <Link href="/api-docs" className="footer-link">API</Link>
            </div>
            <div className="footer-col">
              <h4 className="footer-col-title">Поддержка</h4>
              <Link href="/help" className="footer-link">Центр помощи</Link>
              <Link href="/rules" className="footer-link">Правила сервиса</Link>
              <Link href="/privacy" className="footer-link">Конфиденциальность</Link>
              <Link href="/help" className="footer-link">Контакты</Link>
            </div>
          </div>
        </div>

        {/* Newsletter */}
        <div className="footer-newsletter">
          <div className="fn-text">
            <h4>Будь в курсе</h4>
            <p>Получай уведомления о новых челенджах и обновлениях</p>
          </div>
          {subscribed ? (
            <div className="fn-success">
              <Heart size={16} /> Спасибо за подписку!
            </div>
          ) : (
            <form className="fn-form" onSubmit={handleSubscribe}>
              <input
                type="email"
                placeholder="your@email.com"
                className="fn-input"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
              <button type="submit" className="fn-btn">
                <Send size={16} />
              </button>
            </form>
          )}
        </div>

        {/* Bottom */}
        <div className="footer-bottom">
          <span className="footer-copy">&copy; 2026 NEWSY. Все права защищены.</span>
          <span className="footer-made">Сделано с <Heart size={12} fill="#FF385C" color="#FF385C" /> в России</span>
        </div>
      </div>

      <style>{`
        .footer {
          position: relative;
          background: #0a0a0f;
          color: white;
          overflow: hidden;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        /* Animated stripes */
        .footer-stripes {
          position: absolute;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
        }
        .stripe {
          position: absolute;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,56,92,0.15), transparent);
          animation: flyStripe linear infinite;
        }
        .stripe-1 { top: 15%; width: 60%; left: -60%; animation-duration: 8s; animation-delay: 0s; }
        .stripe-2 { top: 35%; width: 80%; left: -80%; animation-duration: 12s; animation-delay: 2s; background: linear-gradient(90deg, transparent, rgba(255,140,0,0.1), transparent); }
        .stripe-3 { top: 55%; width: 50%; left: -50%; animation-duration: 10s; animation-delay: 4s; }
        .stripe-4 { top: 75%; width: 70%; left: -70%; animation-duration: 14s; animation-delay: 1s; background: linear-gradient(90deg, transparent, rgba(139,92,246,0.08), transparent); }
        .stripe-5 { top: 90%; width: 40%; left: -40%; animation-duration: 9s; animation-delay: 3s; background: linear-gradient(90deg, transparent, rgba(255,56,92,0.1), transparent); }

        @keyframes flyStripe {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(100vw + 200%)); }
        }

        /* Glow orbs */
        .footer-glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
        }
        .glow-1 {
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(255,56,92,0.08), transparent 70%);
          top: -100px; left: -100px;
          animation: floatGlow 8s ease-in-out infinite alternate;
        }
        .glow-2 {
          width: 300px; height: 300px;
          background: radial-gradient(circle, rgba(255,140,0,0.06), transparent 70%);
          bottom: -80px; right: -80px;
          animation: floatGlow 10s ease-in-out infinite alternate-reverse;
        }
        @keyframes floatGlow {
          from { transform: translate(0, 0) scale(1); }
          to { transform: translate(30px, -20px) scale(1.1); }
        }

        .footer-inner {
          position: relative;
          z-index: 1;
          max-width: 1200px;
          margin: 0 auto;
          padding: 64px clamp(16px, 3vw, 40px) 32px;
        }

        /* Top */
        .footer-top {
          display: flex;
          gap: 60px;
          padding-bottom: 48px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .footer-brand {
          flex: 0 0 260px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .footer-logo {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          width: fit-content;
        }
        .footer-logo-img { width: 32px; height: 32px; object-fit: contain; }
        .footer-logo-text { font-size: 22px; font-weight: 900; color: #FF385C; letter-spacing: -0.5px; }
        .footer-tagline { font-size: 13px; color: rgba(255,255,255,0.4); line-height: 1.6; margin: 0; }

        .footer-socials { display: flex; gap: 8px; }
        .social-btn {
          width: 36px; height: 36px; border-radius: 10px;
          background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.5);
          display: grid; place-items: center; text-decoration: none;
          transition: all 0.2s;
        }
        .social-btn:hover { background: #FF385C; color: white; transform: translateY(-2px); }

        /* Columns */
        .footer-cols {
          flex: 1;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 32px;
        }
        .footer-col { display: flex; flex-direction: column; gap: 10px; }
        .footer-col-title {
          font-size: 12px; font-weight: 800; text-transform: uppercase;
          letter-spacing: 0.08em; color: rgba(255,255,255,0.3); margin: 0 0 4px;
        }
        .footer-link {
          font-size: 13px; color: rgba(255,255,255,0.55); text-decoration: none;
          transition: color 0.2s, transform 0.2s; display: inline-flex; align-items: center; gap: 4px;
          width: fit-content;
        }
        .footer-link:hover { color: white; transform: translateX(3px); }
        .footer-link svg { opacity: 0; transition: opacity 0.2s; }
        .footer-link:hover svg { opacity: 1; }

        /* Newsletter */
        .footer-newsletter {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          padding: 32px 0;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .fn-text h4 { font-size: 16px; font-weight: 800; margin: 0; }
        .fn-text p { font-size: 13px; color: rgba(255,255,255,0.4); margin: 4px 0 0; }
        .fn-form { display: flex; gap: 8px; }
        .fn-input {
          padding: 12px 16px; border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.05);
          color: white; font-size: 14px; outline: none; width: 260px;
          transition: border-color 0.2s;
        }
        .fn-input::placeholder { color: rgba(255,255,255,0.25); }
        .fn-input:focus { border-color: #FF385C; }
        .fn-btn {
          width: 44px; height: 44px; border-radius: 12px;
          background: #FF385C; color: white; border: none;
          display: grid; place-items: center; cursor: pointer;
          transition: all 0.2s; flex-shrink: 0;
        }
        .fn-btn:hover { background: #E31C5F; transform: translateY(-1px); }
        .fn-success {
          display: flex; align-items: center; gap: 6px;
          font-size: 14px; font-weight: 700; color: #22c55e;
          animation: fadeIn 0.3s ease;
        }

        /* Bottom */
        .footer-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 24px;
        }
        .footer-copy { font-size: 12px; color: rgba(255,255,255,0.25); }
        .footer-made { font-size: 12px; color: rgba(255,255,255,0.25); display: flex; align-items: center; gap: 4px; }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        /* Responsive */
        @media (max-width: 1024px) {
          .footer-top { flex-direction: column; gap: 40px; }
          .footer-brand { flex: none; }
          .footer-cols { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 600px) {
          .footer-inner { padding: 48px clamp(16px, 3vw, 24px) 24px; }
          .footer-cols { grid-template-columns: 1fr 1fr; gap: 24px; }
          .footer-newsletter { flex-direction: column; align-items: stretch; }
          .fn-form { flex-direction: column; }
          .fn-input { width: 100%; }
          .footer-bottom { flex-direction: column; gap: 8px; text-align: center; }
          .footer-brand { align-items: center; text-align: center; }
          .footer-tagline { text-align: center; }
          .footer-socials { justify-content: center; }
        }
      `}</style>
    </footer>
  );
}
