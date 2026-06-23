'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, User, Search, UserCircle, LayoutDashboard, Plus, Shield, LogOut, HelpCircle } from 'lucide-react';
import { logoutAction } from '@/modules/identity/actions';
import { useSession } from '@/shared/components/session-provider';

type SiteNavProps = {
  variant?: 'compact' | 'public';
};

export function SiteNav({ variant = 'public' }: SiteNavProps) {
  const pathname = usePathname();
  const session = useSession();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const close = () => setIsMenuOpen(false);

  return (
    <>
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        background: 'white',
        width: '100%',
        transition: 'box-shadow 0.2s ease',
        borderBottom: '1px solid #ebebeb',
        boxShadow: isScrolled ? '0 1px 12px rgba(0,0,0,0.08)' : 'none',
      }}>
        <div style={{
          maxWidth: 1440,
          margin: '0 auto',
          padding: '0 40px',
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center',
          height: 80,
        }}>
          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
              <img src="/icon.png" alt="NEWSY Logo" style={{ width: 36, height: 36, objectFit: 'contain' }} />
              <span style={{ color: '#FF385C', fontSize: 26, fontWeight: 900, letterSpacing: -1, lineHeight: 1, marginBottom: 4 }}>NEWSY</span>
            </Link>
          </div>

          {/* Search Bar */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{
              background: 'white',
              borderRadius: 999,
              display: 'flex',
              alignItems: 'center',
              padding: 6,
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              border: '1px solid #ebebeb',
            }}>
              <div style={{ padding: '0 16px', height: 36, display: 'flex', alignItems: 'center', width: 220 }}>
                <input type="text" placeholder="Найти активность..." style={{ width: '100%', border: 'none', outline: 'none', fontSize: 14, color: '#222', background: 'transparent', fontWeight: 500 }} />
              </div>
              <div style={{ width: 1, height: 24, background: '#ebebeb' }} />
              <div style={{ padding: '0 16px', height: 36, display: 'flex', alignItems: 'center', width: 100 }} className="hide-mobile">
                <input type="text" placeholder="Когда" style={{ width: '100%', border: 'none', outline: 'none', fontSize: 14, color: '#222', background: 'transparent' }} />
              </div>
              <div style={{ width: 1, height: 24, background: '#ebebeb' }} className="hide-mobile" />
              <div style={{ padding: '0 16px', height: 36, display: 'flex', alignItems: 'center', width: 100 }} className="hide-mobile">
                <input type="text" placeholder="Где" style={{ width: '100%', border: 'none', outline: 'none', fontSize: 14, color: '#222', background: 'transparent' }} />
              </div>
              <button style={{
                width: 36, height: 36, borderRadius: '50%', background: '#FF385C', border: 'none',
                display: 'grid', placeItems: 'center', cursor: 'pointer', flexShrink: 0, marginLeft: 8,
              }}>
                <Search size={16} color="white" strokeWidth={3} />
              </button>
            </div>
          </div>

          {/* Right: Capsule */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 4 }}>
            <Link href="/dashboard/challenges/new" style={{
              padding: '12px 14px', borderRadius: 24, textDecoration: 'none', color: '#222',
              fontSize: 14, fontWeight: 600, transition: 'background 0.2s',
            }}>
              Создать челендж
            </Link>

            <div ref={menuRef} style={{ position: 'relative', marginLeft: 8 }}>
              {/* Capsule Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '5px 5px 5px 12px',
                  border: '1px solid #DDDDDD', borderRadius: 21, background: 'white',
                  cursor: 'pointer', transition: 'box-shadow 0.2s',
                  boxShadow: isMenuOpen ? '0 4px 12px rgba(0,0,0,0.15)' : '0 2px 4px rgba(0,0,0,0.08)',
                }}
              >
                <Menu size={18} strokeWidth={2} color="#595959" />
                {session ? (
                  <div style={{
                    width: 30, height: 30, background: '#FF385C', color: 'white',
                    borderRadius: '50%', display: 'grid', placeItems: 'center',
                    fontSize: 12, fontWeight: 700,
                  }}>
                    {session.user.email?.[0].toUpperCase()}
                  </div>
                ) : (
                  <div style={{
                    width: 30, height: 30, background: '#717171', color: 'white',
                    borderRadius: '50%', display: 'grid', placeItems: 'center',
                  }}>
                    <User size={18} color="white" />
                  </div>
                )}
              </button>

              {/* Dropdown Menu */}
              {isMenuOpen && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 10px)',
                  right: 0,
                  background: 'white',
                  borderRadius: 16,
                  boxShadow: '0 8px 40px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.06)',
                  border: '1px solid rgba(0,0,0,0.06)',
                  width: 260,
                  padding: '8px 0',
                  display: 'flex',
                  flexDirection: 'column',
                  zIndex: 100,
                  animation: 'menuSlideDown 0.22s cubic-bezier(0.16,1,0.3,1)',
                  overflow: 'hidden',
                }}>
                  {session ? (
                    <>
                      <MenuItem href="/dashboard/profile" icon={<UserCircle size={18} />} label="Профиль" bold onClick={close} />
                      <MenuItem href="/dashboard" icon={<LayoutDashboard size={18} />} label="Кабинет" bold onClick={close} />
                      <MenuDivider />
                      <MenuItem href="/dashboard/challenges/new" icon={<Plus size={18} />} label="Создать челендж" onClick={close} />
                      {session.user?.roles?.includes('admin') && (
                        <MenuItem href="/admin" icon={<Shield size={18} />} label="Админ-панель" onClick={close} />
                      )}
                      <MenuDivider />
                      <form action={logoutAction}>
                        <button type="submit" style={{
                          display: 'flex', alignItems: 'center', gap: 12,
                          padding: '11px 16px', fontSize: 14, color: '#e03e5c',
                          background: 'transparent', border: 'none', cursor: 'pointer',
                          width: '100%', textAlign: 'left', fontWeight: 500,
                          transition: 'background 0.15s',
                        }}
                          onMouseEnter={e => (e.currentTarget.style.background = '#fff0f3')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        >
                          <LogOut size={18} />
                          Выйти
                        </button>
                      </form>
                    </>
                  ) : (
                    <>
                      <MenuItem href="/login" icon={<UserCircle size={18} />} label="Профиль" bold onClick={close} />
                      <MenuDivider />
                      <MenuItem href="/login" icon={<LogOut size={18} />} label="Войти" bold onClick={close} />
                      <MenuItem href="/register" icon={<Plus size={18} />} label="Зарегистрироваться" onClick={close} />
                      <MenuDivider />
                      <MenuItem href="/dashboard/challenges/new" icon={<Plus size={18} />} label="Создать челендж" onClick={close} />
                      <MenuItem href="#" icon={<HelpCircle size={18} />} label="Помощь" onClick={close} />
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <style>{`
        @keyframes menuSlideDown {
          from { opacity: 0; transform: translateY(-6px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @media (max-width: 1000px) {
          .hide-mobile { display: none !important; }
        }
      `}</style>
    </>
  );
}

function MenuItem({ href, icon, label, bold, onClick }: {
  href: string; icon: React.ReactNode; label: string; bold?: boolean; onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link
      href={href}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '11px 16px', fontSize: 14,
        color: '#222', textDecoration: 'none',
        background: hovered ? '#f7f7f7' : 'transparent',
        fontWeight: bold ? 600 : 500,
        transition: 'background 0.15s',
      }}
    >
      <span style={{ color: '#666', display: 'flex', alignItems: 'center' }}>{icon}</span>
      {label}
    </Link>
  );
}

function MenuDivider() {
  return <div style={{ height: 1, background: '#f0f0f0', margin: '4px 0' }} />;
}
