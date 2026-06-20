'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Globe, Menu, User, Search } from 'lucide-react';
import { logoutAction } from '@/modules/identity/actions';

type SiteNavProps = {
  variant?: 'compact' | 'public';
  session?: any;
};

export function SiteNav({ variant = 'public', session }: SiteNavProps) {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [lang, setLang] = useState<'ru' | 'en'>('ru');
  const menuRef = useRef<HTMLDivElement>(null);

  // Обработка тени при скролле
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Закрытие дропдауна
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const t = (ruText: string, enText: string) => lang === 'ru' ? ruText : enText;

  return (
    <header className={`site-header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="nav-wrapper">
        {/* Левая часть: Логотип + Название */}
        <div className="nav-left">
          <Link href="/" >
            <span className="brand">  
              <img src="/icon.png" alt="NEWSY Logo" className="brand-logo-img" />
              <span className="brand-name">NEWSY</span>
            </span>
          </Link>
        </div>

        {/* Центр: Поиск в стиле Figma */}
        <div className="nav-center">
          <div className="figma-search-bar">
            <div className="search-section flex-2">
              <input type="text" placeholder={t('Найти активность...', 'Find activity...')} className="search-input" />
            </div>
            <div className="search-divider" />
            <div className="search-section flex-1 hide-mobile">
              <input type="text" placeholder={t('Когда', 'When')} className="search-input" />
            </div>
            <div className="search-divider hide-mobile" />
            <div className="search-section flex-1 hide-mobile">
              <input type="text" placeholder={t('Где', 'Where')} className="search-input" />
            </div>
            <button className="search-btn">
              <Search size={16} color="white" strokeWidth={3} />
            </button>
          </div>
        </div>

        {/* Правая часть: Действия и Капсула Airbnb */}
        <div className="nav-right">
          <Link href="/dashboard/challenges/new" className="host-link">
            {t('Создать челендж', 'Create challenge')}
          </Link>
          
          <button 
            className="globe-btn" 
            onClick={() => setLang(lang === 'ru' ? 'en' : 'ru')}
            title={lang === 'ru' ? 'Switch to English' : 'Переключить на русский'}
          >
            <Globe size={18} strokeWidth={2} />
          </button>

          <div className="user-menu-container" ref={menuRef}>
            <button 
              className="user-dropdown-pill" 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu size={18} strokeWidth={2} color="#595959" />
              {session ? (
                <div className="avatar-circle">
                  {session.user.email?.[0].toUpperCase()}
                </div>
              ) : (
                <div className="avatar-circle default">
                  <User size={18} color="white" />
                </div>
              )}
            </button>

            {isMenuOpen && (
              <div className="dropdown-menu">
                {session ? (
                  <>
                    <Link href="/dashboard/profile" className="menu-item font-bold" onClick={() => setIsMenuOpen(false)}>
                      {t('Профиль', 'Profile')}
                    </Link>
                    <Link href="/dashboard" className="menu-item font-bold" onClick={() => setIsMenuOpen(false)}>
                      {t('Кабинет', 'Dashboard')}
                    </Link>
                    <hr className="menu-divider" />
                    <Link href="/dashboard/challenges/new" className="menu-item" onClick={() => setIsMenuOpen(false)}>
                      {t('Создать челендж', 'Create challenge')}
                    </Link>
                    {session.user?.role === 'admin' && (
                       <Link href="/admin" className="menu-item" onClick={() => setIsMenuOpen(false)}>
                         {t('Админ-панель', 'Admin Panel')}
                       </Link>
                    )}
                    <hr className="menu-divider" />
                    <form action={logoutAction}>
                      <button type="submit" className="menu-item">{t('Выйти', 'Log out')}</button>
                    </form>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="menu-item font-bold" onClick={() => setIsMenuOpen(false)}>
                      {t('Войти', 'Log in')}
                    </Link>
                    <Link href="/login" className="menu-item" onClick={() => setIsMenuOpen(false)}>
                      {t('Зарегистрироваться', 'Sign up')}
                    </Link>
                    <hr className="menu-divider" />
                    <Link href="/dashboard/challenges/new" className="menu-item" onClick={() => setIsMenuOpen(false)}>
                      {t('Создать челендж', 'Create challenge')}
                    </Link>
                    <Link href="#" className="menu-item" onClick={() => setIsMenuOpen(false)}>
                      {t('Помощь', 'Help')}
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .site-header {
          position: sticky;
          top: 0;
          z-index: 1000;
          background: white;
          width: 100%;
          transition: box-shadow 0.2s ease;
          border-bottom: 1px solid #ebebeb;
        }

        .site-header.scrolled {
          box-shadow: 0 1px 12px rgba(0,0,0,0.08);
        }

        .nav-wrapper {
          max-width: 1440px;
          margin: 0 auto;
          padding: 0 40px;
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          height: 80px;
        }

        /* Left: Brand */
        .nav-left {
          display: flex;
          align-items: center;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
        }

        .brand-logo-img {
          width: 36px;
          height: 36px;
          object-fit: contain;
        }

        .brand-name {
          color: #FF385C;
          font-size: 26px;
          font-weight: 900;
          letter-spacing: -1px;
          line-height: 1;
          margin-bottom: 4px; /* Поднимаем текст с помощью margin, не ломая flexbox */
        }

        /* Center: Figma Search */
        .nav-center {
          display: flex;
          justify-content: center;
        }

        .figma-search-bar {
          background: white;
          border-radius: 999px;
          display: flex;
          align-items: center;
          padding: 6px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          border: 1px solid #ebebeb;
          transition: box-shadow 0.2s;
        }

        .figma-search-bar:hover {
          box-shadow: 0 6px 16px rgba(0,0,0,0.12);
        }

        .search-section {
          padding: 0 16px;
          height: 36px;
          display: flex;
          align-items: center;
        }

        .flex-2 { width: 220px; }
        .flex-1 { width: 100px; }

        .search-input {
          width: 100%;
          border: none;
          outline: none;
          font-size: 14px;
          color: #222;
          background: transparent;
          font-weight: 500;
        }
        
        .search-input::placeholder { color: #888; font-weight: 400; }

        .search-divider {
          width: 1px;
          height: 24px;
          background: #ebebeb;
        }

        .search-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #FF385C; /* Акцентный цвет Airbnb/Newsy */
          border: none;
          display: grid;
          place-items: center;
          cursor: pointer;
          flex-shrink: 0;
          transition: background 0.2s;
          margin-left: 8px;
        }
        
        .search-btn:hover { background: #E31C5F; }

        /* Right: Actions */
        .nav-right {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 4px;
        }

        .host-link {
          padding: 12px 14px;
          border-radius: 24px;
          text-decoration: none;
          color: #222222;
          font-size: 14px;
          font-weight: 600;
          transition: background 0.2s ease;
        }

        .host-link:hover { background: #f7f7f7; }

        .globe-btn {
          width: 46px;
          height: 46px;
          border-radius: 50%;
          background: transparent;
          border: none;
          display: grid;
          place-items: center;
          color: #222222;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .globe-btn:hover { background: #f7f7f7; }

        /* Profile Capsule Airbnb Style */
        .user-menu-container {
          position: relative;
          margin-left: 8px;
        }

        .user-dropdown-pill {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 5px 5px 5px 12px;
          border: 1px solid #DDDDDD;
          border-radius: 21px;
          background: white;
          cursor: pointer;
          transition: box-shadow 0.2s ease;
        }

        .user-dropdown-pill:hover { box-shadow: 0 2px 4px rgba(0,0,0,0.18); }

        .avatar-circle {
          width: 30px;
          height: 30px;
          background: #222222;
          color: white;
          border-radius: 50%;
          display: grid;
          place-items: center;
          font-size: 12px;
          font-weight: 700;
        }

        .avatar-circle.default { background: #717171; }

        /* Dropdown */
        .dropdown-menu {
          position: absolute;
          top: calc(100% + 12px);
          right: 0;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 16px rgba(0,0,0,0.12);
          border: 1px solid #DDDDDD;
          width: 240px;
          padding: 8px 0;
          display: flex;
          flex-direction: column;
          z-index: 100;
          animation: slideDown 0.2s ease forwards;
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .menu-item {
          padding: 12px 16px;
          font-size: 14px;
          color: #222222;
          text-decoration: none;
          text-align: left;
          background: transparent;
          border: none;
          cursor: pointer;
          width: 100%;
          transition: background 0.2s ease;
        }

        .menu-item:hover { background: #f7f7f7; }
        .font-bold { font-weight: 600; }
        .menu-divider { height: 1px; background: #dddddd; margin: 8px 0; border: none; }

        /* Responsive */
        @media (max-width: 1000px) {
          .hide-mobile { display: none; }
          .nav-wrapper { padding: 0 20px; }
        }
      `}</style>
    </header>
  );
}
