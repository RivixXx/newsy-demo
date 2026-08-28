'use client';

import React, { useState, useRef, useEffect, lazy, Suspense } from 'react';
import Link from 'next/link';
import { Menu, UserCircle, Plus, Shield, LogOut, Bell, CheckCircle2, MapPin, Heart, LayoutDashboard } from 'lucide-react';
import { logoutAction } from '@/modules/identity/actions';
import { useSession } from '@/shared/components/session-provider';
import { useRegion } from '@/shared/components/region-provider';
import { RegionModal } from '@/shared/components/region-modal';
import { useSSE } from '@/shared/hooks/use-sse';

const SearchPanel = lazy(() => import('@/shared/components/search-panel').then(m => ({ default: m.SearchPanel })));

type SiteNavProps = {
  variant?: 'compact' | 'public' | 'landing';
};

interface NavNotification {
  id: string;
  title: string;
  body: string;
  readAt: string | null;
  createdAt: string;
}

export function SiteNav({ variant = 'public' }: SiteNavProps) {
  const session = useSession();
  const { region, showModal, setRegion, changeRegion, skipRegion } = useRegion();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<NavNotification[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Real-time notifications via SSE
  useSSE({
    enabled: Boolean(session),
    onUnreadCount: (count) => setUnreadCount(count),
    onNotification: (data) => {
      setNotifications(prev => [{
        id: data.id as string || Date.now().toString(),
        title: data.title as string || '',
        body: data.body as string || '',
        readAt: null,
        createdAt: data.createdAt as string || new Date().toISOString(),
      }, ...prev]);
      setUnreadCount(c => c + 1);
    },
    onModerationNeeded: () => {
      setUnreadCount(c => c + 1);
    },
  });

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifs(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleNotifs = async () => {
    if (showNotifs) {
      setShowNotifs(false);
      return;
    }
    setShowNotifs(true);
    try {
      const res = await fetch('/api/notifications/list');
      const data = await res.json();
      setNotifications(data.notifications || []);
      await fetch('/api/notifications/mark-read', { method: 'POST' });
      setUnreadCount(0);
    } catch { }
  };

  const close = () => setIsMenuOpen(false);

  return (
    <>
      <header className={`site-header ${isScrolled ? 'scrolled' : ''} ${variant === 'landing' ? 'site-header--landing' : ''}`}>
        <nav className="nav-wrapper" aria-label="Основная навигация">
          <div className="nav-left">
            <Link href="/" className="brand">
              <img src="/icon.svg" alt="ЧИ" className="brand-logo" />
              <span className="brand-name">ЧИ</span>
            </Link>
          </div>

          <div className="nav-center">
            {session && (
              <Suspense fallback={<div style={{ width: '100%', maxWidth: 600, height: 52 }} />}>
                <SearchPanel />
              </Suspense>
            )}
            {!session && (
              <div className="public-nav-links" aria-label="Разделы сайта">
                <Link href="/" className="host-link">Каталог</Link>
                <Link href="/#how-it-works" className="host-link">Как это работает</Link>
                <Link href="/register" className="host-link">Организаторам</Link>
              </div>
            )}
          </div>

          <div className="nav-right">
            {/* Region button */}
            <button className="region-btn" onClick={changeRegion} aria-label="Изменить регион">
              <MapPin size={15} />
              <span className="region-btn-text">{region || 'Весь мир'}</span>
            </button>

            {!session && (
              <>
                <Link href="/login" className="auth-link">Войти</Link>
                <Link href="/register" className="auth-link auth-link--primary">Регистрация</Link>
              </>
            )}

            {session && (
              <Link href="/dashboard/challenges/new" className="host-link hide-tablet" prefetch={true}>
                Создать челлендж
              </Link>
            )}

            {session && (
              <div ref={notifRef} className="notif-wrap">
                <button className="notif-btn" onClick={toggleNotifs} aria-label={`Уведомления${unreadCount > 0 ? `, ${unreadCount} новых` : ''}`} aria-expanded={showNotifs} aria-haspopup="true">
                  <Bell size={18} />
                  {unreadCount > 0 && <span className="notif-badge" aria-hidden="true">{unreadCount > 9 ? '9+' : unreadCount}</span>}
                </button>

                {showNotifs && (
                  <div className="notif-dropdown">
                    <div className="notif-header">
                      <span>Уведомления</span>
                    </div>
                    <div className="notif-list">
                      {notifications.length === 0 ? (
                        <div className="notif-empty">Пока нет уведомлений</div>
                      ) : (
                        notifications.map(n => (
                          <div key={n.id} className={`notif-item ${!n.readAt ? 'unread' : ''}`}>
                            <div className={`notif-icon ${n.title.includes('одобрен') ? 'success' : n.title.includes('отклонён') ? 'error' : 'info'}`}>
                              <CheckCircle2 size={14} />
                            </div>
                            <div className="notif-content">
                              <span className="notif-title">{n.title}</span>
                              <span className="notif-body">{n.body}</span>
                              <span className="notif-time">{new Date(n.createdAt).toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {session && <div ref={menuRef} className="capsule-wrap">
              <button
                className={`capsule-btn ${isMenuOpen ? 'open' : ''}`}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Меню навигации"
                aria-expanded={isMenuOpen}
                aria-haspopup="true"
              >
                <Menu size={18} strokeWidth={2} color="#595959" />
                {session ? (
                  <div className="avatar avatar--active">
                    {session.user.email?.[0].toUpperCase()}
                  </div>
                ) : null}
              </button>

              {isMenuOpen && (
                <div className="dropdown">
                  {session ? (
                    <>
                      <DDItem href="/dashboard/profile" icon={<UserCircle size={18} />} label="Профиль" bold onClick={close} />
                      <DDItem href="/favorites" icon={<Heart size={18} />} label="Избранное" onClick={close} />
                      <DDItem href="/dashboard" icon={<LayoutDashboard size={18} />} label="Дашбоард" onClick={close} />
                      <div className="dd-divider" />
                      <DDItem href="/dashboard/challenges/new" icon={<Plus size={18} />} label="Создать челлендж" onClick={close} />
                      {session.user?.roles?.includes('admin') && (
                        <DDItem href="/admin" icon={<Shield size={18} />} label="Админ-панель" onClick={close} />
                      )}
                      <div className="dd-divider" />
                      <form action={logoutAction}>
                        <button type="submit" className="dd-item dd-item--danger">
                          <LogOut size={18} /> Выйти
                        </button>
                      </form>
                    </>
                  ) : null}
                </div>
              )}
            </div>}
          </div>
        </nav>
      </header>

      <RegionModal isOpen={showModal} onSelect={setRegion} onSkip={skipRegion} />

    </>
  );
}

function DDItem({ href, icon, label, bold, onClick }: {
  href: string; icon: React.ReactNode; label: string; bold?: boolean; onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`dd-item ${bold ? 'dd-item--bold' : ''}`}
    >
      <span style={{ color: '#666', display: 'flex', alignItems: 'center' }}>{icon}</span>
      {label}
    </Link>
  );
}
