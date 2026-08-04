'use client';

import React, { useState, useEffect, lazy, Suspense } from 'react';
import Link from 'next/link';
import { Heart, Trash2, ArrowRight } from 'lucide-react';
import { PageShell } from '@/shared/components/page-shell';
import { PageSpinner } from '@/shared/components/spinner';
import { useFavorites } from '@/shared/hooks/use-favorites';
import { useSession } from '@/shared/components/session-provider';
import { type ModalChallenge } from '@/shared/components/challenge-modal';

const ChallengeModal = lazy(() => import('@/shared/components/challenge-modal').then(m => ({ default: m.ChallengeModal })));

interface FavChallenge {
  id: string;
  title: string;
  category: string | null;
  organizer: string;
  imageUrl: string | null;
  participantsCount: number;
  endDate: string | null;
  addedAt: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  sport: 'Спорт', education: 'Обучение', quest: 'Квесты', art: 'Искусство', tech: 'Технологии',
};

export default function FavoritesPage() {
  const session = useSession();
  const { isFavorite, toggleFavorite, favoritesCount } = useFavorites();
  const [favorites, setFavorites] = useState<FavChallenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChallenge, setSelectedChallenge] = useState<ModalChallenge | null>(null);
  const [openingId, setOpeningId] = useState<string | null>(null);

  useEffect(() => {
    if (!session) {
      setLoading(false);
      return;
    }
    fetch('/api/favorites')
      .then(r => r.json())
      .then(d => {
        setFavorites(d.favorites || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [session]);

  const handleRemove = async (challengeId: string) => {
    setFavorites(prev => prev.filter(f => f.id !== challengeId));
    await toggleFavorite(challengeId);
  };

  const handleOpen = async (fav: FavChallenge) => {
    setOpeningId(fav.id);
    try {
      const res = await fetch(`/api/challenges/${fav.id}`);
      if (!res.ok) {
        setOpeningId(null);
        return;
      }
      const data = await res.json();
      const modal: ModalChallenge = {
        id: data.id,
        title: data.title,
        organizer: data.organizer,
        category: data.category || 'Другое',
        imageUrl: data.imageUrl || '',
        participantsCount: data.participantsCount,
        maxParticipants: data.maxParticipants || 100,
        endDate: data.endDate || '',
        location: data.location || 'Онлайн',
        achievement: data.achievement || '',
        reward: data.reward || '',
        description: data.description || '',
        requirements: data.requirements || '',
        refundPolicy: data.refundPolicy || '',
        stages: data.stages || [],
        isJoined: data.isJoined,
      };
      setSelectedChallenge(modal);
    } catch { }
    setOpeningId(null);
  };

  if (!session) {
    return (
      <PageShell variant="public">
        <div className="fav-page">
          <div className="fav-empty">
            <Heart size={56} color="#ddd" strokeWidth={1.5} />
            <h2>Войдите, чтобы видеть избранное</h2>
            <p>Сохраняйте понравившиеся челленджи нажатием сердечка</p>
            <Link href="/login" className="fav-btn">Войти</Link>
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell variant="public">
      {/* Модалка ЧИ */}
      {selectedChallenge && (
        <Suspense fallback={null}>
          <ChallengeModal challenge={selectedChallenge} onClose={() => setSelectedChallenge(null)} />
        </Suspense>
      )}

      <div className="fav-page">
        <div className="fav-header">
          <div>
            <h1 className="fav-title"><Heart size={28} color="#FF385C" /> Избранное</h1>
            <p className="fav-subtitle">
              {favoritesCount > 0
                ? `${favoritesCount} ${favoritesCount === 1 ? 'челлендж' : favoritesCount < 5 ? 'челленджа' : 'челленджей'} сохранено`
                : 'Пока ничего не сохранено'}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="fav-grid">
            {[1, 2, 3].map(i => (
              <div key={i} className="fav-card fav-skeleton">
                <div className="fav-skel-img" />
                <div className="fav-skel-body">
                  <div className="fav-skel-title" />
                  <div className="fav-skel-text" />
                </div>
              </div>
            ))}
          </div>
        ) : favorites.length === 0 ? (
          <div className="fav-empty">
            <Heart size={56} color="#ddd" strokeWidth={1.5} />
            <h2>Сохраняйте понравившиеся</h2>
            <p>Нажимайте сердечко на карточках челленджей, чтобы добавить их сюда</p>
            <Link href="/explore" className="fav-btn">Смотреть челленджи</Link>
          </div>
        ) : (
          <div className="fav-grid">
            {favorites.map(fav => (
              <div key={fav.id} className="fav-card">
                <div className="fav-card-img">
                  {fav.imageUrl ? (
                    <img src={fav.imageUrl} alt={fav.title} />
                  ) : (
                    <div className="fav-card-placeholder">
                      <Heart size={24} color="#ccc" />
                    </div>
                  )}
                  {fav.category && (
                    <span className="fav-card-cat">{CATEGORY_LABELS[fav.category] || fav.category}</span>
                  )}
                </div>
                <div className="fav-card-body">
                  <div className="fav-card-top">
                    <h3 className="fav-card-title">{fav.title}</h3>
                    <p className="fav-card-org">{fav.organizer}</p>
                  </div>
                  <div className="fav-card-bottom">
                    <div className="fav-card-meta">
                      {fav.participantsCount > 0 && (
                        <span>{fav.participantsCount} участников</span>
                      )}
                      {fav.endDate && <span>до {fav.endDate}</span>}
                    </div>
                    <div className="fav-card-actions">
                      <button className="fav-remove" onClick={() => handleRemove(fav.id)} title="Убрать из избранного">
                        <Trash2 size={14} />
                      </button>
                      <button
                        className="fav-go"
                        onClick={() => handleOpen(fav)}
                        disabled={openingId === fav.id}
                      >
                        {openingId === fav.id ? 'Загрузка...' : <>Открыть <ArrowRight size={14} /></>}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .fav-page { max-width: 1200px; margin: 0 auto; padding: 40px 24px 80px; }
        .fav-header { margin-bottom: 32px; }
        .fav-title { display: flex; align-items: center; gap: 12px; font-size: 28px; font-weight: 900; margin: 0; color: #111; }
        .fav-subtitle { font-size: 14px; color: #888; margin: 6px 0 0; }
        .fav-empty { display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 80px 20px; text-align: center; }
        .fav-empty h2 { font-size: 22px; font-weight: 900; margin: 0; color: #111; }
        .fav-empty p { font-size: 14px; color: #888; margin: 0; max-width: 320px; }
        .fav-btn {
          display: inline-flex; align-items: center; gap: 8px; padding: 12px 24px;
          border-radius: 12px; background: linear-gradient(135deg, #FF385C, #E31C5F);
          color: white; font-size: 14px; font-weight: 800; text-decoration: none;
          transition: transform 0.15s, box-shadow 0.15s;
          box-shadow: 0 4px 16px rgba(255,56,92,0.3);
        }
        .fav-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(255,56,92,0.4); }
        .fav-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
        .fav-card {
          background: white; border-radius: 18px; overflow: hidden;
          border: 1px solid #f0f0f0;
          box-shadow: 0 4px 16px rgba(0,0,0,0.04);
          transition: transform 0.2s, box-shadow 0.2s;
          animation: favFadeIn 0.3s ease;
        }
        .fav-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(0,0,0,0.08); }
        .fav-card-img { height: 160px; position: relative; overflow: hidden; }
        .fav-card-img img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s; }
        .fav-card:hover .fav-card-img img { transform: scale(1.05); }
        .fav-card-placeholder { width: 100%; height: 100%; background: #f5f5f5; display: grid; place-items: center; }
        .fav-card-cat {
          position: absolute; bottom: 10px; left: 10px;
          padding: 4px 10px; border-radius: 99px;
          background: rgba(255,255,255,0.92); font-size: 11px; font-weight: 700;
          backdrop-filter: blur(4px);
        }
        .fav-card-body { padding: 16px; display: flex; flex-direction: column; gap: 12px; }
        .fav-card-top { display: flex; flex-direction: column; gap: 4px; }
        .fav-card-title { font-size: 15px; font-weight: 800; margin: 0; color: #111; line-height: 1.3; }
        .fav-card-org { font-size: 12px; color: #888; margin: 0; }
        .fav-card-bottom { display: flex; justify-content: space-between; align-items: center; }
        .fav-card-meta { display: flex; gap: 12px; font-size: 11px; color: #aaa; }
        .fav-card-actions { display: flex; gap: 6px; align-items: center; }
        .fav-remove {
          width: 32px; height: 32px; border-radius: 8px;
          border: 1px solid #eee; background: white;
          display: grid; place-items: center; cursor: pointer;
          color: #999; transition: all 0.15s;
        }
        .fav-remove:hover { border-color: #ef4444; color: #ef4444; background: #fef2f2; }
        .fav-go {
          display: flex; align-items: center; gap: 4px;
          padding: 6px 12px; border-radius: 8px;
          background: #f5f5f5; border: none;
          font-size: 12px; font-weight: 700; color: #333;
          cursor: pointer; transition: background 0.15s;
        }
        .fav-go:hover { background: #eee; }
        .fav-go:disabled { opacity: 0.6; cursor: wait; }
        .fav-skeleton { pointer-events: none; }
        .fav-skel-img { height: 160px; background: #f0f0f0; animation: favPulse 1.5s infinite; }
        .fav-skel-body { padding: 16px; display: flex; flex-direction: column; gap: 8px; }
        .fav-skel-title { height: 16px; width: 70%; background: #f0f0f0; border-radius: 6px; animation: favPulse 1.5s infinite; }
        .fav-skel-text { height: 12px; width: 40%; background: #f0f0f0; border-radius: 6px; animation: favPulse 1.5s infinite; }
        @keyframes favFadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes favPulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
        @media (max-width: 768px) {
          .fav-page { padding: 32px 20px 60px; }
          .fav-title { font-size: 24px; }
          .fav-empty h2 { font-size: 20px; }
        }
        @media (max-width: 640px) {
          .fav-grid { grid-template-columns: 1fr; }
          .fav-title { font-size: 22px; }
          .fav-card-img { height: 140px; }
        }
        @media (max-width: 480px) {
          .fav-page { padding: 24px 16px 48px; }
          .fav-header { margin-bottom: 24px; }
          .fav-title { font-size: 20px; gap: 8px; }
          .fav-title svg { width: 24px; height: 24px; }
          .fav-subtitle { font-size: 13px; }
          .fav-empty { padding: 60px 16px; }
          .fav-empty h2 { font-size: 18px; }
          .fav-empty p { font-size: 13px; }
          .fav-card-img { height: 120px; }
          .fav-card-body { padding: 14px; }
          .fav-card-title { font-size: 14px; }
          .fav-card-org { font-size: 11px; }
          .fav-card-meta { font-size: 10px; gap: 8px; }
          .fav-card-actions { gap: 4px; }
          .fav-remove { width: 28px; height: 28px; }
          .fav-go { padding: 5px 10px; font-size: 11px; }
        }
      `}</style>
    </PageShell>
  );
}
