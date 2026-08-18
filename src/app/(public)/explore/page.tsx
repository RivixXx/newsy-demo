'use client';

import { lazy, Suspense, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CalendarDays, Heart, MapPin, Search, Sparkles, Users } from 'lucide-react';
import { PageShell } from '@/shared/components/page-shell';
import { PageSkeleton } from '@/shared/components/page-skeleton';
import { AnnouncementPopup } from '@/shared/components/announcement-popup';
import { useRegion } from '@/shared/components/region-provider';
import { type ModalChallenge } from '@/shared/components/challenge-modal';
import { type CatalogChallenge } from '@/shared/data/challenges';
import { useChallenges } from '@/shared/hooks/use-challenges';
import { useFavorites } from '@/shared/hooks/use-favorites';

const ChallengeModal = lazy(() => import('@/shared/components/challenge-modal').then((module) => ({ default: module.ChallengeModal })));
const CATEGORIES: Record<string, string> = { all: 'Все', sport: 'Спорт', education: 'Обучение', quest: 'Квесты', art: 'Искусство', tech: 'Технологии' };

function toModalChallenge(challenge: CatalogChallenge): ModalChallenge {
  return { ...challenge, isJoined: false, stages: [] };
}

function ChallengeCard({ challenge, favorite, eager, onFavorite, onOpen }: { challenge: CatalogChallenge; favorite: boolean; eager?: boolean; onFavorite: () => void; onOpen: () => void }) {
  const places = Math.max(0, challenge.maxParticipants - challenge.participantsCount);
  return <article className="challenge-card">
    <button className="card-open" type="button" onClick={onOpen} aria-label={`Подробнее: ${challenge.title}`}>
      <span className="image-wrap"><img src={challenge.imageUrl} alt="" className="card-image" loading={eager ? 'eager' : 'lazy'} fetchPriority={eager ? 'high' : 'auto'} /><span className="category-label">{CATEGORIES[challenge.category] ?? challenge.category}</span></span>
      <span className="card-content">
        <span className="card-eyebrow">{challenge.organizer}</span><span className="card-title">{challenge.title}</span>
        <span className="card-description">{challenge.description || 'Откройте подробности, программу и условия участия.'}</span>
        <span className="card-meta"><span><MapPin aria-hidden="true" />{challenge.location || 'Онлайн'}</span><span><CalendarDays aria-hidden="true" />до {challenge.endDate}</span><span><Users aria-hidden="true" />{places > 0 ? `${places} мест` : 'Набор завершён'}</span></span>
        <span className="card-action">Подробнее <ArrowRight aria-hidden="true" /></span>
      </span>
    </button>
    <button className="favorite-button" type="button" onClick={onFavorite} aria-pressed={favorite} aria-label={`${favorite ? 'Убрать из' : 'Добавить в'} избранного: ${challenge.title}`}><Heart aria-hidden="true" fill={favorite ? 'currentColor' : 'none'} /></button>
  </article>;
}

export default function ExplorePage() {
  const { challenges, loading } = useChallenges();
  const { region, changeRegion } = useRegion();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [category, setCategory] = useState('all');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<CatalogChallenge | null>(null);
  const filtered = useMemo(() => challenges.filter((challenge) => {
    const q = query.trim().toLocaleLowerCase('ru');
    return (!region || !challenge.region || challenge.region === region) && (category === 'all' || challenge.category === category) && (!q || `${challenge.title} ${challenge.organizer} ${challenge.location}`.toLocaleLowerCase('ru').includes(q));
  }), [challenges, region, category, query]);

  if (loading) return <PageShell variant="public"><PageSkeleton /></PageShell>;
  return <PageShell variant="public">
    <AnnouncementPopup />
    {selected && <Suspense fallback={null}><ChallengeModal challenge={toModalChallenge(selected)} onClose={() => setSelected(null)} /></Suspense>}
    <main id="main-content" className="catalog-main">
      <section className="hero" aria-labelledby="catalog-title">
        <p className="hero-label"><Sparkles aria-hidden="true" /> Челленджи по всей России</p>
        <h1 id="catalog-title">Найдите дело, которое хочется довести до конца</h1>
        <p className="hero-copy">Изучайте программы и организаторов без регистрации. Аккаунт понадобится только тогда, когда вы решите участвовать.</p>
        <label className="search-field"><Search aria-hidden="true" /><span className="sr-only">Поиск челленджей</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Название, организатор или город" type="search" /></label>
        <div className="region-line"><MapPin aria-hidden="true" /><span>{region ? `Показываем челленджи: ${region}` : 'Показываем челленджи по всей России'}</span><button type="button" onClick={changeRegion}>Изменить</button></div>
      </section>
      <section className="catalog" aria-labelledby="results-title">
        <div className="catalog-heading"><div><p className="section-label">Каталог</p><h2 id="results-title">Доступные челленджи</h2></div><p aria-live="polite">{filtered.length} результатов</p></div>
        <div className="filters" aria-label="Фильтр по категориям">{Object.entries(CATEGORIES).map(([key, label]) => <button key={key} type="button" aria-pressed={category === key} onClick={() => setCategory(key)}>{label}</button>)}</div>
        {filtered.length ? <div className="cards-grid">{filtered.map((challenge, index) => <ChallengeCard key={challenge.id} challenge={challenge} eager={index < 3} favorite={isFavorite(challenge.id)} onFavorite={() => toggleFavorite(challenge.id)} onOpen={() => setSelected(challenge)} />)}</div> :
          <div className="empty-state"><span className="empty-icon"><Search aria-hidden="true" /></span><h3>{challenges.length ? 'По этому запросу ничего не найдено' : 'Первые челленджи уже готовятся'}</h3><p>{challenges.length ? 'Сбросьте фильтры или выберите другой регион.' : 'Здесь появятся проверенные активности. А пока можно стать одним из первых организаторов.'}</p>{challenges.length ? <button type="button" onClick={() => { setCategory('all'); setQuery(''); }}>Сбросить фильтры</button> : <Link href="/register">Создать свой челлендж <ArrowRight aria-hidden="true" /></Link>}</div>}
      </section>
      <section className="organizer-cta" id="how-it-works" aria-labelledby="organizer-title"><div><p className="section-label">Для организаторов</p><h2 id="organizer-title">Превратите идею в событие</h2><p>Соберите участников, опишите правила и отправьте челлендж на модерацию.</p></div><Link href="/register">Начать создание <ArrowRight aria-hidden="true" /></Link></section>
    </main>
    <style jsx global>{`
      .catalog-main{max-width:1240px;margin:0 auto;padding:0 32px 96px;color:#171717}.hero{padding:88px 0 64px;border-bottom:1px solid #e8e5e1}.hero-label,.section-label{display:flex;align-items:center;gap:8px;margin:0 0 18px;color:#e23456;font-size:13px;font-weight:750;letter-spacing:.08em;text-transform:uppercase}.hero-label :global(svg){width:16px}.hero h1{max-width:900px;margin:0;font-size:clamp(40px,6vw,76px);font-weight:720;line-height:1.02;letter-spacing:-.045em}.hero-copy{max-width:690px;margin:24px 0 36px;color:#68635f;font-size:18px;line-height:1.65}.search-field{display:flex;align-items:center;gap:12px;max-width:720px;height:58px;padding:0 18px;border:1px solid #cbc7c2;border-radius:10px;background:#fff}.search-field:focus-within{outline:3px solid rgba(226,52,86,.2);border-color:#e23456}.search-field :global(svg){width:20px;color:#777}.search-field input{width:100%;border:0;outline:0;background:transparent;font:inherit;font-size:16px}.region-line{display:flex;align-items:center;gap:8px;margin-top:16px;color:#6b6763;font-size:14px}.region-line :global(svg){width:16px}.region-line button{border:0;background:transparent;color:#171717;font:inherit;font-weight:700;text-decoration:underline;text-underline-offset:3px;cursor:pointer}.catalog{padding-top:64px}.catalog-heading{display:flex;align-items:end;justify-content:space-between;gap:24px}.catalog-heading h2,.organizer-cta h2{margin:0;font-size:clamp(28px,4vw,44px);letter-spacing:-.035em}.catalog-heading>p{margin:0;color:#777;font-size:14px}.filters{display:flex;flex-wrap:wrap;gap:8px;margin:28px 0 32px}.filters button{min-height:44px;padding:0 18px;border:1px solid #d8d4d0;border-radius:999px;background:#fff;color:#393633;font:inherit;font-size:14px;font-weight:650;cursor:pointer}.filters button:hover{border-color:#e23456}.filters button[aria-pressed=true]{border-color:#171717;background:#171717;color:#fff}.filters button:focus-visible,.region-line button:focus-visible,.empty-state button:focus-visible{outline:3px solid rgba(226,52,86,.35);outline-offset:2px}.cards-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:24px}.challenge-card{position:relative;overflow:hidden;border:1px solid #e2dfdb;border-radius:14px;background:#fff}.challenge-card:focus-within{outline:3px solid rgba(226,52,86,.25);outline-offset:2px}.card-open{display:flex;width:100%;height:100%;padding:0;border:0;background:transparent;text-align:left;cursor:pointer;flex-direction:column}.card-open:focus{outline:0}.image-wrap{position:relative;display:block;aspect-ratio:16/10;overflow:hidden;background:#efedea}.card-image{width:100%;height:100%;object-fit:cover;transition:transform .25s ease}.challenge-card:hover .card-image{transform:scale(1.025)}.category-label{position:absolute;left:14px;bottom:14px;padding:6px 9px;border-radius:6px;background:#fff;color:#24211f;font-size:12px;font-weight:750}.card-content{display:flex;flex:1;flex-direction:column;padding:22px}.card-eyebrow{color:#77716c;font-size:13px;font-weight:650}.card-title{margin-top:7px;font-size:21px;font-weight:750;line-height:1.25}.card-description{display:-webkit-box;min-height:48px;margin-top:10px;overflow:hidden;color:#6c6762;font-size:14px;line-height:1.55;-webkit-box-orient:vertical;-webkit-line-clamp:2}.card-meta{display:flex;flex-direction:column;gap:7px;margin-top:20px;color:#625e5a;font-size:13px}.card-meta>span{display:flex;align-items:center;gap:7px}.card-meta :global(svg){width:15px}.card-action{display:flex;align-items:center;gap:7px;margin-top:22px;color:#e23456;font-size:14px;font-weight:750}.card-action :global(svg){width:16px}.favorite-button{position:absolute;top:14px;right:14px;display:grid;width:44px;height:44px;place-items:center;border:0;border-radius:50%;background:#fff;color:#e23456;box-shadow:0 2px 10px rgba(0,0,0,.12);cursor:pointer}.favorite-button :global(svg){width:19px}.favorite-button:focus-visible{outline:3px solid #e23456;outline-offset:2px}.empty-state{display:flex;min-height:360px;align-items:center;justify-content:center;flex-direction:column;padding:48px;border:1px solid #e2dfdb;border-radius:14px;background:#faf9f7;text-align:center}.empty-icon{display:grid;width:56px;height:56px;place-items:center;border-radius:50%;background:#fff;color:#e23456}.empty-state h3{margin:20px 0 8px;font-size:24px}.empty-state p{max-width:520px;margin:0;color:#6c6762;line-height:1.6}.empty-state a,.empty-state button,.organizer-cta a{display:inline-flex;min-height:46px;align-items:center;gap:8px;margin-top:24px;padding:0 20px;border:0;border-radius:8px;background:#e23456;color:#fff;font:inherit;font-size:14px;font-weight:750;text-decoration:none;cursor:pointer}.empty-state :global(svg),.organizer-cta :global(svg){width:17px}.organizer-cta{display:flex;align-items:center;justify-content:space-between;gap:48px;margin-top:80px;padding:48px;border-radius:14px;background:#181716;color:#fff}.organizer-cta .section-label{margin-bottom:12px}.organizer-cta p:last-child{margin:14px 0 0;color:#bdb8b2}.organizer-cta a{flex-shrink:0;margin:0}.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}@media(max-width:900px){.cards-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.hero{padding-top:64px}}@media(max-width:640px){.catalog-main{padding:0 16px 64px}.hero{padding:48px 0}.hero-copy{font-size:16px}.catalog{padding-top:44px}.catalog-heading{align-items:start;flex-direction:column}.cards-grid{grid-template-columns:1fr}.organizer-cta{align-items:flex-start;flex-direction:column;margin-top:56px;padding:32px 24px}.empty-state{padding:36px 20px}.region-line{align-items:flex-start;flex-wrap:wrap}}
    `}</style>
  </PageShell>;
}
