'use client';

import React, { useState, useRef, useEffect, lazy, Suspense } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, User, Search, UserCircle, LayoutDashboard, Plus, Shield, LogOut, HelpCircle, Bell, CheckCircle2, X } from 'lucide-react';
import { logoutAction } from '@/modules/identity/actions';
import { useSession } from '@/shared/components/session-provider';

const SearchPanel = lazy(() => import('@/shared/components/search-panel').then(m => ({ default: m.SearchPanel })));

type SiteNavProps = {
  variant?: 'compact' | 'public';
};

interface NavNotification {
  id: string;
  title: string;
  body: string;
  readAt: string | null;
  createdAt: string;
}

export function SiteNav({ variant = 'public' }: SiteNavProps) {
  const pathname = usePathname();
  const session = useSession();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<NavNotification[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!session) return;
    const loadCount = () => {
      fetch('/api/notifications/unread-count')
        .then(r => r.json())
        .then(d => setUnreadCount(d.count || 0))
        .catch(() => {});
    };
    loadCount();
    const interval = setInterval(loadCount, 30000);
    return () => clearInterval(interval);
  }, [session]);

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
    } catch {}
  };

  const close = () => setIsMenuOpen(false);

  return (
    <>
      <header className={`site-header ${isScrolled ? 'scrolled' : ''}`}>
        <div className="nav-wrapper">
          <div className="nav-left">
            <Link href="/" className="brand">
              <img src="/icon.png" alt="NEWSY Logo" className="brand-logo" />
              <span className="brand-name">NEWSY</span>
            </Link>
          </div>

          <div className="nav-center">
            <Suspense fallback={<div style={{ width: 500, height: 52 }} />}>
              <SearchPanel />
            </Suspense>
          </div>

          <div className="nav-right">
            <Link href="/dashboard/challenges/new" className="host-link hide-tablet" prefetch={true}>
              Создать челендж
            </Link>

            {session && (
              <div ref={notifRef} className="notif-wrap">
                <button className="notif-btn" onClick={toggleNotifs}>
                  <Bell size={18} />
                  {unreadCount > 0 && <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
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

            <div ref={menuRef} className="capsule-wrap">
              <button
                className={`capsule-btn ${isMenuOpen ? 'open' : ''}`}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <Menu size={18} strokeWidth={2} color="#595959" />
                {session ? (
                  <div className="avatar avatar--active">
                    {session.user.email?.[0].toUpperCase()}
                  </div>
                ) : (
                  <div className="avatar avatar--default">
                    <User size={18} color="white" />
                  </div>
                )}
              </button>

              {isMenuOpen && (
                <div className="dropdown">
                  {session ? (
                    <>
                      <DDItem href="/dashboard/profile" icon={<UserCircle size={18} />} label="Профиль" bold onClick={close} />
                      <DDItem href="/dashboard" icon={<LayoutDashboard size={18} />} label="Кабинет" bold onClick={close} />
                      <div className="dd-divider" />
                      <DDItem href="/dashboard/challenges/new" icon={<Plus size={18} />} label="Создать челендж" onClick={close} />
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
                  ) : (
                    <>
                      <DDItem href="/login" icon={<UserCircle size={18} />} label="Профиль" bold onClick={close} />
                      <div className="dd-divider" />
                      <DDItem href="/login" icon={<LogOut size={18} />} label="Войти" bold onClick={close} />
                      <DDItem href="/register" icon={<Plus size={18} />} label="Зарегистрироваться" onClick={close} />
                      <div className="dd-divider" />
                      <DDItem href="/dashboard/challenges/new" icon={<Plus size={18} />} label="Создать челендж" onClick={close} />
                      <DDItem href="#" icon={<HelpCircle size={18} />} label="Помощь" onClick={close} />
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <style>{`
        .site-header {
          position: sticky; top: 0; z-index: 1000;
          background: white; width: 100%;
          transition: box-shadow 0.2s ease;
          border-bottom: 1px solid #ebebeb;
        }
        .site-header.scrolled { box-shadow: 0 1px 12px rgba(0,0,0,0.08); }

        .nav-wrapper {
          width: 100%; margin: 0 auto;
          padding: 0 clamp(16px, 3vw, 40px);
          display: grid; grid-template-columns: auto 1fr auto;
          align-items: center; height: 72px;
          gap: 16px;
        }

        /* Brand */
        .nav-left { display: flex; align-items: center; }
        .brand { display: flex; align-items: center; gap: 12px; text-decoration: none; }
        .brand-logo { width: 36px; height: 36px; object-fit: contain; }
        .brand-name { color: #FF385C; font-size: 26px; font-weight: 900; letter-spacing: -1px; line-height: 1; margin-bottom: 4px; }

        /* Search */
        .nav-center { display: flex; justify-content: center; }
        .search-pill {
          background: white; border-radius: 999px;
          display: flex; align-items: center; padding: 6px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08); border: 1px solid #ebebeb;
          transition: box-shadow 0.2s;
        }
        .search-pill:hover { box-shadow: 0 6px 16px rgba(0,0,0,0.12); }
        .search-section { padding: 0 16px; height: 36px; display: flex; align-items: center; }
        .search-main { width: 220px; }
        .search-when, .search-where { width: 100px; }
        .search-input { width: 100%; border: none; outline: none; font-size: 14px; color: #222; background: transparent; font-weight: 500; }
        .search-input::placeholder { color: #888; font-weight: 400; }
        .search-divider { width: 1px; height: 24px; background: #ebebeb; }
        .search-go {
          width: 36px; height: 36px; border-radius: 50%;
          background: #FF385C; border: none; display: grid; place-items: center;
          cursor: pointer; flex-shrink: 0; margin-left: 8px;
          transition: background 0.2s;
        }
        .search-go:hover { background: #E31C5F; }

        /* Right */
        .nav-right { display: flex; justify-content: flex-end; align-items: center; gap: 4px; }
        .host-link {
          padding: 12px 14px; border-radius: 24px; text-decoration: none; color: #222;
          font-size: 14px; font-weight: 600; transition: background 0.2s;
        }
        .host-link:hover { background: #f7f7f7; }

        /* Capsule */
        .capsule-wrap { position: relative; margin-left: 8px; }
        .capsule-btn {
          display: flex; align-items: center; gap: 12px;
          padding: 5px 5px 5px 12px;
          border: 1px solid #DDD; border-radius: 21px; background: white;
          cursor: pointer; transition: box-shadow 0.2s;
          box-shadow: 0 2px 4px rgba(0,0,0,0.08);
        }
        .capsule-btn.open { box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
        .capsule-btn:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.12); }
        .avatar {
          width: 30px; height: 30px; border-radius: 50%;
          display: grid; place-items: center; font-size: 12px; font-weight: 700;
        }
        .avatar--active { background: #FF385C; color: white; }
        .avatar--default { background: #717171; color: white; }

        /* Dropdown */
        .dropdown {
          position: absolute; top: calc(100% + 10px); right: 0;
          background: white; border-radius: 16px;
          box-shadow: 0 8px 40px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.06);
          border: 1px solid rgba(0,0,0,0.06);
          width: 260px; padding: 8px 0;
          display: flex; flex-direction: column; z-index: 100;
          animation: menuPop 0.22s cubic-bezier(0.16,1,0.3,1);
          overflow: hidden;
        }
        .dd-item {
          display: flex; align-items: center; gap: 12px;
          padding: 11px 16px; font-size: 14px; color: #222;
          text-decoration: none; background: transparent; border: none;
          cursor: pointer; width: 100%; text-align: left;
          font-weight: 500; transition: background 0.15s;
        }
        .dd-item:hover { background: #f7f7f7; }
        .dd-item--bold { font-weight: 600; }
        .dd-item--danger { color: #e03e5c; }
        .dd-item--danger:hover { background: #fff0f3; }
        .dd-divider { height: 1px; background: #f0f0f0; margin: 4px 0; }

        /* Notifications */
        .notif-wrap { position: relative; }
        .notif-btn {
          width: 38px; height: 38px; border-radius: 50%;
          border: 1px solid #ddd; background: white;
          display: grid; place-items: center; cursor: pointer;
          position: relative; transition: all 0.15s;
          box-shadow: 0 2px 4px rgba(0,0,0,0.06);
        }
        .notif-btn:hover { background: #f7f7f7; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .notif-badge {
          position: absolute; top: -4px; right: -4px;
          min-width: 18px; height: 18px; border-radius: 9px;
          background: #FF385C; color: white;
          font-size: 10px; font-weight: 800;
          display: grid; place-items: center;
          padding: 0 4px; border: 2px solid white;
        }
        .notif-dropdown {
          position: absolute; top: calc(100% + 10px); right: 0;
          background: white; border-radius: 16px;
          box-shadow: 0 8px 40px rgba(0,0,0,0.15);
          border: 1px solid rgba(0,0,0,0.06);
          width: 340px; z-index: 200;
          animation: menuPop 0.22s cubic-bezier(0.16,1,0.3,1);
          overflow: hidden;
        }
        .notif-header {
          padding: 14px 18px; border-bottom: 1px solid #f0f0f0;
          font-size: 14px; font-weight: 800; color: #111;
        }
        .notif-list { max-height: 360px; overflow-y: auto; }
        .notif-empty { padding: 32px; text-align: center; font-size: 13px; color: #aaa; }
        .notif-item {
          display: flex; gap: 10px; padding: 12px 18px;
          border-bottom: 1px solid #f8f8f8; transition: background 0.15s;
        }
        .notif-item:hover { background: #fafafa; }
        .notif-item.unread { background: #fff5f7; }
        .notif-icon {
          width: 28px; height: 28px; border-radius: 8px;
          display: grid; place-items: center; flex-shrink: 0;
        }
        .notif-icon.success { background: #f0fdf4; color: #16a34a; }
        .notif-icon.error { background: #fef2f2; color: #dc2626; }
        .notif-icon.info { background: #eff6ff; color: #3b82f6; }
        .notif-content { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
        .notif-title { font-size: 13px; font-weight: 700; color: #111; }
        .notif-body { font-size: 12px; color: #666; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .notif-time { font-size: 11px; color: #aaa; margin-top: 2px; }

        @keyframes menuPop {
          from { opacity: 0; transform: translateY(-6px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* ===== RESPONSIVE ===== */
        @media (max-width: 1024px) {
          .hide-mobile { display: none !important; }
          .nav-wrapper { padding: 0 20px; }
          .search-main { width: 180px; }
        }

        @media (max-width: 768px) {
          .nav-wrapper {
            grid-template-columns: auto 1fr auto;
            height: 64px; padding: 0 16px;
          }
          .brand-name { font-size: 20px; }
          .brand-logo { width: 28px; height: 28px; }
          .search-pill { display: none; }
          .host-link { display: none; }
        }

        @media (max-width: 480px) {
          .nav-wrapper { padding: 0 12px; }
          .brand-name { font-size: 18px; letter-spacing: -0.5px; }
        }
      `}</style>
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
