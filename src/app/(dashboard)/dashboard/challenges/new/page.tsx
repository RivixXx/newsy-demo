'use client';

import React, { useState, useEffect, lazy, Suspense } from 'react';
import Link from 'next/link';
import {
  ChevronLeft, ChevronRight, Plus, Trash2, GripVertical,
  Camera, MapPin, Type, Zap, Users, Calendar, DollarSign,
  Target, X, Eye, Check, ArrowRight, Award, Settings2, Monitor,
  Globe, Clock, AlertTriangle, Star, FileUp, ListChecks, Lock
} from 'lucide-react';
import { PageShell } from '@/shared/components/page-shell';
import { Spinner } from '@/shared/components/spinner';
import { useToast } from '@/shared/components/toast';
import { createChallengeAction } from '@/modules/challenges/actions/create';
import { FileUpload } from '@/shared/components/file-upload';
import { type ModalChallenge } from '@/shared/components/challenge-modal';

const ChallengeModal = lazy(() => import('@/shared/components/challenge-modal').then(m => ({ default: m.ChallengeModal })));

type StepType = 'action' | 'upload' | 'survey';

interface Step {
  id: string; type: StepType; title: string; description: string; points: number;
  options?: string[]; correctIndex?: number; location?: string; criteria?: string;
}
interface FormData {
  title: string; description: string; category: string; coverImage: string;
  format: 'ONLINE' | 'OFFLINE' | 'HYBRID'; challengeType: 'OPEN' | 'CLOSED';
  country: string; region: string; city: string; address: string;
  latitude: number | null; longitude: number | null;
  startDate: string; endDate: string; startTime: string; endTime: string;
  maxParticipants: number; entryFee: number; requirements: string;
  minAge: number | ''; maxAge: number | ''; gender: string;
  steps: Step[];
  selectedAchievements: string[];
  customAchievement: { name: string; description: string; icon: string } | null;
  rewardTitle: string; rewardDescription: string;
}

const CATEGORIES = [
  { key: 'sport', label: 'Спорт', icon: <Zap size={20} />, color: '#16a34a', gradient: 'linear-gradient(135deg, #16a34a, #22c55e)' },
  { key: 'education', label: 'Обучение', icon: <Settings2 size={20} />, color: '#2563eb', gradient: 'linear-gradient(135deg, #2563eb, #60a5fa)' },
  { key: 'quest', label: 'Квесты', icon: <Target size={20} />, color: '#d97706', gradient: 'linear-gradient(135deg, #d97706, #fbbf24)' },
  { key: 'art', label: 'Искусство', icon: <Camera size={20} />, color: '#7c3aed', gradient: 'linear-gradient(135deg, #7c3aed, #a78bfa)' },
  { key: 'tech', label: 'Технологии', icon: <Monitor size={20} />, color: '#db2777', gradient: 'linear-gradient(135deg, #db2777, #f472b6)' },
];

const STEP_TYPES: { key: StepType; icon: React.ReactNode; label: string; desc: string; color: string; gradient: string }[] = [
  { key: 'action', icon: <Type size={20} />, label: 'Действие', desc: 'Текстовое задание или инструкция', color: '#FF385C', gradient: 'linear-gradient(135deg, #FF385C, #ff6b8a)' },
  { key: 'upload', icon: <FileUp size={20} />, label: 'Загрузка данных', desc: 'Фото, видео, файл, аудио, геолокация', color: '#16a34a', gradient: 'linear-gradient(135deg, #16a34a, #4ade80)' },
  { key: 'survey', icon: <ListChecks size={20} />, label: 'Опрос', desc: 'Тест или голосование', color: '#2563eb', gradient: 'linear-gradient(135deg, #2563eb, #60a5fa)' },
];

const PRESET_ACHIEVEMENTS = [
  { key: 'first_step', name: 'Первый шаг', icon: '👣' },
  { key: 'photo_master', name: 'Мастер фото', icon: '📸' },
  { key: 'explorer', name: 'Исследователь', icon: '🧭' },
  { key: 'speed_demon', name: 'Демон скорости', icon: '⚡' },
  { key: 'social_butterfly', name: 'Социальная бабочка', icon: '🦋' },
  { key: 'streak_master', name: 'Мастер серии', icon: '🔥' },
  { key: 'team_player', name: 'Командный игрок', icon: '🤝' },
  { key: 'creative_soul', name: 'Творческая душа', icon: '🎨' },
  { key: 'tech_wizard', name: 'Техно-волшебник', icon: '🧙' },
  { key: 'athlete', name: 'Атлет', icon: '🏋️' },
  { key: 'scholar', name: 'Учёный', icon: '🎓' },
  { key: 'quest_hunter', name: 'Охотник за квестами', icon: '🗺️' },
  { key: 'perfectionist', name: 'Перфекционист', icon: '💎' },
  { key: 'early_bird', name: 'Ранняя пташка', icon: '🐦' },
  { key: 'night_owl', name: 'Ночная сова', icon: '🦉' },
];

const ACHIEVEMENT_ICONS = ['🏆', '🎯', '🌟', '💪', '🎖️', '🏅', '🥇', '🥈', '🥉', '⭐', '✨', '🎪', '🎭', '🎬', '🎤', '🎵', '📚', '💻', '🎮', '🏃', '🚴', '🏊', '🧗', '♟️', '🎸', '🎹', '🖌️', '📷'];

const PLACEHOLDER = '/images/challenge-placeholder.svg';
const uid = () => Math.random().toString(36).slice(2, 10);

const WIZARD_STEPS = [
  { label: 'Основы', icon: <Target size={16} />, gradient: 'linear-gradient(135deg, #FF385C, #ff6b8a)' },
  { label: 'Настройки', icon: <Settings2 size={16} />, gradient: 'linear-gradient(135deg, #2563eb, #60a5fa)' },
  { label: 'Этапы', icon: <ListChecks size={16} />, gradient: 'linear-gradient(135deg, #16a34a, #4ade80)' },
  { label: 'Награды', icon: <Award size={16} />, gradient: 'linear-gradient(135deg, #d97706, #fbbf24)' },
  { label: 'Обзор', icon: <Eye size={16} />, gradient: 'linear-gradient(135deg, #7c3aed, #a78bfa)' },
];

export default function NewChallengePage() {
  const [step, setStep] = useState(0);
  const [prevStep, setPrevStep] = useState(0);
  const [animDir, setAnimDir] = useState<'forward' | 'back'>('forward');
  const [data, setData] = useState<FormData>({
    title: '', description: '', category: '', coverImage: '',
    format: 'ONLINE', challengeType: 'OPEN',
    country: 'Россия', region: '', city: '', address: '',
    latitude: null, longitude: null,
    startDate: '', endDate: '', startTime: '', endTime: '',
    maxParticipants: 100, entryFee: 0, requirements: '',
    minAge: '', maxAge: '', gender: '',
    steps: [], selectedAchievements: [], customAchievement: null,
    rewardTitle: '', rewardDescription: '',
  });
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const { toast } = useToast();

  const update = (p: Partial<FormData>) => setData(d => ({ ...d, ...p }));
  const go = (to: number) => {
    setAnimDir(to > step ? 'forward' : 'back');
    setPrevStep(step);
    setStep(to);
  };
  const addStep = (type: StepType) => update({ steps: [...data.steps, { id: uid(), type, title: '', description: '', points: 50, options: type === 'survey' ? ['', ''] : undefined }] });
  const updateStep = (id: string, p: Partial<Step>) => update({ steps: data.steps.map(s => s.id === id ? { ...s, ...p } : s) });
  const removeStep = (id: string) => update({ steps: data.steps.filter(s => s.id !== id) });
  const moveStep = (f: number, t: number) => { const a = [...data.steps]; const [item] = a.splice(f, 1); a.splice(t, 0, item); update({ steps: a }); };

  const catObj = CATEGORIES.find(c => c.key === data.category);
  const canNext = step === 0 ? !!data.title && !!data.category : step === 2 ? data.steps.length > 0 : true;

  const handlePublish = async () => {
    setPublishing(true); setError(null);
    try {
      const r = await createChallengeAction({
        title: data.title, description: data.description, category: data.category,
        coverImage: data.coverImage, startDate: data.startDate, endDate: data.endDate,
        maxParticipants: data.maxParticipants, entryFee: data.entryFee, isCooperative: false,
        rewardTitle: data.rewardTitle, rewardDescription: data.rewardDescription,
        format: data.format, challengeType: data.challengeType,
        country: data.country, region: data.region, city: data.city, address: data.address,
        latitude: data.latitude, longitude: data.longitude,
        startTime: data.startTime, endTime: data.endTime,
        requirements: data.requirements,
        minAge: data.minAge === '' ? null : Number(data.minAge),
        maxAge: data.maxAge === '' ? null : Number(data.maxAge),
        gender: data.gender || null,
        selectedAchievements: data.selectedAchievements,
        customAchievement: data.customAchievement,
        steps: data.steps.map(s => ({ type: s.type, title: s.title, description: s.description, points: s.points, options: s.options, correctIndex: s.correctIndex, location: s.location, criteria: s.criteria })),
      });
      if (r?.error) { setError(r.error); return; }
      if (!r?.success || !r?.challengeId) { setError('Ошибка создания челенджа'); return; }
      window.location.href = `/dashboard/challenges/${r.challengeId}/publish`;
    } catch { setError('Ошибка сети'); } finally { setPublishing(false); }
  };

  const getPreviewChallenge = (): ModalChallenge => ({
    id: 'preview', title: data.title || 'Название челенджа',
    organizer: 'Ваша организация', category: catObj?.label || 'Категория',
    imageUrl: data.coverImage || PLACEHOLDER, participantsCount: 0,
    maxParticipants: data.maxParticipants || 100,
    endDate: data.endDate || 'Не указано', location: data.city || data.address || 'Онлайн',
    achievement: data.selectedAchievements.length > 0 ? `${data.selectedAchievements.length} достижений` : 'Участие',
    reward: data.rewardTitle || 'Награда', description: data.description || 'Описание челленжа...',
    requirements: data.requirements || '', refundPolicy: '', isJoined: false,
    stages: data.steps.map((s, i) => ({
      id: s.id, title: s.title || `Этап ${i + 1}`,
      description: s.description || '', type: s.type === 'action' ? 'ДЕЙСТВИЕ' : s.type === 'upload' ? 'ЗАГРУЗКА' : 'ОПРОС',
      status: 'pending' as const,
    })),
  });

  return (
    <PageShell>
      {showPreview && (
        <Suspense fallback={null}>
          <ChallengeModal challenge={getPreviewChallenge()} onClose={() => setShowPreview(false)} />
        </Suspense>
      )}

      <div className="cw">
        {/* ─── HEADER ─── */}
        <header className="cw-header">
          <Link href="/dashboard" className="cw-back"><ChevronLeft size={18} /> Назад</Link>
          <div className="cw-progress">
            {WIZARD_STEPS.map((s, i) => (
              <button key={i} className={`cw-pstep ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`} onClick={() => i <= step && go(i)}>
                <div className="cw-pcircle" style={i <= step ? { background: s.gradient, border: 'none', color: 'white' } : {}}>
                  {i < step ? <Check size={14} /> : s.icon}
                </div>
                <span className="cw-plabel">{s.label}</span>
              </button>
            ))}
            <div className="cw-ptrack"><div className="cw-pfill" style={{ width: `${(step / (WIZARD_STEPS.length - 1)) * 100}%` }} /></div>
          </div>
          <button className="cw-preview-btn" onClick={() => setShowPreview(true)}>
            <Eye size={15} /> Превью
          </button>
        </header>

        {/* ─── CONTENT ─── */}
        <main className="cw-main">
          <div className={`cw-card anim-${animDir}`} key={step}>

            {/* ─── STEP 0: ОСНОВЫ ─── */}
            {step === 0 && (
              <div className="cw-card-inner glass">
                <div className="cw-card-head glass-head">
                  <div className="cw-card-head-icon glass-icon"><Target size={24} /></div>
                  <div><h2>Основы челленжа</h2><p>Заложи фундамент своего челленджа</p></div>
                </div>
                <div className="cw-card-body glass-body">
                  <div className="cw-field">
                    <label>Название *</label>
                    <input className="cw-input cw-input--lg glass-input" placeholder="Забег на 5 км по набережной" value={data.title} onChange={e => update({ title: e.target.value })} maxLength={100} />
                    <span className="cw-counter">{data.title.length}/100</span>
                  </div>
                  <div className="cw-field">
                    <label>Описание</label>
                    <textarea className="cw-textarea glass-input" rows={3} placeholder="Расскажи зачем этот челлендж, что участники получат..." value={data.description} onChange={e => update({ description: e.target.value })} />
                  </div>
                  <div className="cw-field">
                    <label>Категория *</label>
                    <div className="cw-cats">
                      {CATEGORIES.map(c => (
                        <button key={c.key} className={`cw-cat glass-cat ${data.category === c.key ? 'on' : ''}`} style={data.category === c.key ? { background: c.gradient, borderColor: 'transparent', color: 'white' } : {}} onClick={() => update({ category: c.key })}>
                          <div className="cw-cat-icon" style={{ background: c.gradient }}>{c.icon}</div>
                          <span>{c.label}</span>
                          {data.category === c.key && <div className="cw-cat-check"><Check size={12} /></div>}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="cw-field">
                    <label>Обложка</label>
                    <FileUpload onUpload={(url) => update({ coverImage: url })} bucket="challenges" folder="covers" accept="image/jpeg,image/png,image/webp" maxSize={20} label="Загрузить обложку (фото до 20 МБ)" />
                  </div>
                </div>
              </div>
            )}

            {/* ─── STEP 1: НАСТРОЙКИ ─── */}
            {step === 1 && (
              <div className="cw-card-inner">
                <div className="cw-card-head" style={{ background: 'linear-gradient(135deg, #2563eb, #60a5fa)' }}>
                  <div className="cw-card-head-icon"><Settings2 size={24} /></div>
                  <div><h2>Настройки</h2><p>Формат, время, ограничения</p></div>
                </div>
                <div className="cw-card-body">
                  <div className="cw-field"><label>Формат проведения</label>
                    <div className="cw-pills">
                      {([['ONLINE', 'Онлайн', <Globe size={16} />], ['OFFLINE', 'Офлайн', <MapPin size={16} />], ['HYBRID', 'Гибрид', <Globe size={16} />]] as const).map(([val, lbl, icon]) => (
                        <button key={val} className={`cw-pill ${data.format === val ? 'on' : ''}`} onClick={() => update({ format: val as any })}>{icon} {lbl}</button>
                      ))}
                    </div>
                  </div>
                  <div className="cw-field"><label>Тип мероприятия</label>
                    <div className="cw-pills">
                      <button className={`cw-pill ${data.challengeType === 'OPEN' ? 'on' : ''}`} onClick={() => update({ challengeType: 'OPEN' })}><Users size={16} /> Открытый</button>
                      <button className={`cw-pill ${data.challengeType === 'CLOSED' ? 'on' : ''}`} onClick={() => update({ challengeType: 'CLOSED' })}><Lock size={16} /> Закрытый</button>
                    </div>
                  </div>
                  {data.format !== 'ONLINE' && (
                    <div className="cw-field"><label>География</label>
                      <div className="cw-grid-2">
                        <div className="cw-input-group"><span className="cw-ig-icon"><Globe size={14} /></span><input placeholder="Страна" value={data.country} onChange={e => update({ country: e.target.value })} /></div>
                        <div className="cw-input-group"><span className="cw-ig-icon"><MapPin size={14} /></span><input placeholder="Регион" value={data.region} onChange={e => update({ region: e.target.value })} /></div>
                        <div className="cw-input-group"><span className="cw-ig-icon"><MapPin size={14} /></span><input placeholder="Город" value={data.city} onChange={e => update({ city: e.target.value })} /></div>
                        <div className="cw-input-group"><span className="cw-ig-icon"><MapPin size={14} /></span><input placeholder="Адрес" value={data.address} onChange={e => update({ address: e.target.value })} /></div>
                      </div>
                    </div>
                  )}
                  <div className="cw-field"><label>Дата и время</label>
                    <div className="cw-grid-2">
                      <div className="cw-input-group"><span className="cw-ig-icon"><Calendar size={14} /></span><input type="date" value={data.startDate} onChange={e => update({ startDate: e.target.value })} /></div>
                      <div className="cw-input-group"><span className="cw-ig-icon"><Calendar size={14} /></span><input type="date" value={data.endDate} onChange={e => update({ endDate: e.target.value })} /></div>
                      <div className="cw-input-group"><span className="cw-ig-icon"><Clock size={14} /></span><input type="time" value={data.startTime} onChange={e => update({ startTime: e.target.value })} /></div>
                      <div className="cw-input-group"><span className="cw-ig-icon"><Clock size={14} /></span><input type="time" value={data.endTime} onChange={e => update({ endTime: e.target.value })} /></div>
                    </div>
                  </div>
                  <div className="cw-grid-2">
                    <div className="cw-field"><label>Макс. участников</label><div className="cw-input-group"><span className="cw-ig-icon"><Users size={14} /></span><input type="number" value={data.maxParticipants} onChange={e => update({ maxParticipants: parseInt(e.target.value) || 0 })} /></div></div>
                    <div className="cw-field"><label>Взнос (₽)</label><div className="cw-input-group"><span className="cw-ig-icon"><DollarSign size={14} /></span><input type="number" value={data.entryFee} onChange={e => update({ entryFee: parseInt(e.target.value) || 0 })} /></div></div>
                  </div>
                  <div className="cw-field"><label>Требования к участникам</label><textarea className="cw-textarea" rows={2} placeholder="Навыки, инвентарь, информация..." value={data.requirements} onChange={e => update({ requirements: e.target.value })} /></div>
                  <div className="cw-field"><label>Ограничения</label>
                    <div className="cw-grid-3">
                      <div className="cw-field"><label>Мин. возраст</label><input className="cw-input" type="number" min={0} max={120} value={data.minAge} onChange={e => update({ minAge: e.target.value === '' ? '' : parseInt(e.target.value) || '' })} placeholder="—" /></div>
                      <div className="cw-field"><label>Макс. возраст</label><input className="cw-input" type="number" min={0} max={120} value={data.maxAge} onChange={e => update({ maxAge: e.target.value === '' ? '' : parseInt(e.target.value) || '' })} placeholder="—" /></div>
                      <div className="cw-field"><label>Пол</label><select className="cw-input" value={data.gender} onChange={e => update({ gender: e.target.value })}><option value="">Все</option><option value="male">Мужской</option><option value="female">Женский</option></select></div>
                    </div>
                  </div>
                  <div className="cw-note"><AlertTriangle size={14} /><span>Правила отмены устанавливаются площадкой при модерации</span></div>
                </div>
              </div>
            )}

            {/* ─── STEP 2: ЭТАПЫ ─── */}
            {step === 2 && (
              <div className="cw-card-inner">
                <div className="cw-card-head" style={{ background: 'linear-gradient(135deg, #16a34a, #4ade80)' }}>
                  <div className="cw-card-head-icon"><ListChecks size={24} /></div>
                  <div><h2>Этапы</h2><p>{data.steps.length} этапов добавлено</p></div>
                </div>
                <div className="cw-card-body">
                  <div className="cw-type-grid">
                    {STEP_TYPES.map(t => (
                      <button key={t.key} className="cw-type-btn" onClick={() => addStep(t.key)}>
                        <div className="cw-type-icon" style={{ background: t.gradient }}>{t.icon}</div>
                        <div><strong>{t.label}</strong><span>{t.desc}</span></div>
                      </button>
                    ))}
                  </div>
                  <div className="cw-steps-list">
                    {data.steps.length === 0 && <div className="cw-empty"><Target size={36} color="#ddd" /><p>Добавь первый этап</p></div>}
                    {data.steps.map((s, i) => {
                      const st = STEP_TYPES.find(t => t.key === s.type)!;
                      return (
                        <div key={s.id} className={`cw-step ${dragOver === i ? 'over' : ''}`} draggable onDragStart={() => setDragIdx(i)} onDragOver={e => { e.preventDefault(); setDragOver(i); }} onDragLeave={() => setDragOver(null)} onDrop={() => { if (dragIdx !== null && dragIdx !== i) moveStep(dragIdx, i); setDragIdx(null); setDragOver(null); }}>
                          <div className="cw-step-grip"><GripVertical size={14} /></div>
                          <div className="cw-step-num" style={{ background: st.gradient }}>{i + 1}</div>
                          <div className="cw-step-body">
                            <div className="cw-step-top"><span className="cw-step-badge" style={{ color: st.color }}>{st.icon} {st.label}</span><button className="cw-step-del" onClick={() => removeStep(s.id)}><Trash2 size={13} /></button></div>
                            <input className="cw-step-title" placeholder="Название этапа..." value={s.title} onChange={e => updateStep(s.id, { title: e.target.value })} />
                            <textarea className="cw-step-desc" rows={2} placeholder="Инструкция для участника..." value={s.description} onChange={e => updateStep(s.id, { description: e.target.value })} />
                            <input className="cw-step-criteria" placeholder="Критерии приёма при проверке..." value={s.criteria || ''} onChange={e => updateStep(s.id, { criteria: e.target.value })} />
                            {s.type === 'survey' && (
                              <div className="cw-opts">
                                {(s.options || []).map((o, oi) => (
                                  <div key={oi} className="cw-opt">
                                    <button className={`cw-opt-dot ${s.correctIndex === oi ? 'on' : ''}`} onClick={() => updateStep(s.id, { correctIndex: oi })}><Check size={8} /></button>
                                    <input placeholder={`Вариант ${oi + 1}`} value={o} onChange={e => { const opts = [...(s.options || [])]; opts[oi] = e.target.value; updateStep(s.id, { options: opts }); }} />
                                    {(s.options || []).length > 2 && <button className="cw-opt-x" onClick={() => updateStep(s.id, { options: (s.options || []).filter((_, j) => j !== oi) })}><X size={10} /></button>}
                                  </div>
                                ))}
                                <button className="cw-opt-add" onClick={() => updateStep(s.id, { options: [...(s.options || []), ''] })}><Plus size={10} /> Вариант</button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ─── STEP 3: НАГРАДЫ ─── */}
            {step === 3 && (
              <div className="cw-card-inner">
                <div className="cw-card-head" style={{ background: 'linear-gradient(135deg, #d97706, #fbbf24)' }}>
                  <div className="cw-card-head-icon"><Award size={24} /></div>
                  <div><h2>Награды и достижения</h2><p>Что получат победители</p></div>
                </div>
                <div className="cw-card-body">
                  <div className="cw-field"><label>Достижения</label>
                    <div className="cw-ach-grid">
                      {PRESET_ACHIEVEMENTS.map(a => (
                        <button key={a.key} className={`cw-ach ${data.selectedAchievements.includes(a.key) ? 'on' : ''}`} onClick={() => {
                          const next = data.selectedAchievements.includes(a.key) ? data.selectedAchievements.filter(k => k !== a.key) : [...data.selectedAchievements, a.key];
                          update({ selectedAchievements: next });
                        }}>
                          <span className="cw-ach-icon">{a.icon}</span>
                          <span className="cw-ach-name">{a.name}</span>
                          {data.selectedAchievements.includes(a.key) && <span className="cw-ach-ok"><Check size={10} /></span>}
                        </button>
                      ))}
                      <button className="cw-ach cw-ach--add" onClick={() => update({ customAchievement: { name: '', description: '', icon: '🏆' } })}>
                        <span className="cw-ach-icon">+</span>
                        <span className="cw-ach-name">Создать</span>
                      </button>
                    </div>
                  </div>
                  {data.customAchievement && (
                    <div className="cw-custom-ach">
                      <h4>Новое достижение</h4>
                      <div className="cw-field"><label>Название</label><input className="cw-input" value={data.customAchievement.name} onChange={e => update({ customAchievement: { ...data.customAchievement!, name: e.target.value } })} placeholder="Покоритель вершин" /></div>
                      <div className="cw-field"><label>За что</label><input className="cw-input" value={data.customAchievement.description} onChange={e => update({ customAchievement: { ...data.customAchievement!, description: e.target.value } })} placeholder="Описание" /></div>
                      <div className="cw-field"><label>Иконка</label>
                        <div className="cw-icon-grid">{ACHIEVEMENT_ICONS.map(icon => (
                          <button key={icon} className={`cw-icon-btn ${data.customAchievement?.icon === icon ? 'on' : ''}`} onClick={() => update({ customAchievement: { ...data.customAchievement!, icon } })}>{icon}</button>
                        ))}</div>
                      </div>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                        <button className="cw-btn cw-btn--ghost" onClick={() => update({ customAchievement: null })}>Отмена</button>
                        <button className="cw-btn cw-btn--primary" onClick={() => { if (data.customAchievement?.name) { update({ customAchievement: null }); toast('success', 'Отправлено на модерацию'); } }}>Добавить</button>
                      </div>
                    </div>
                  )}
                  <div className="cw-field"><label>Название награды</label><input className="cw-input" placeholder="Nike Air Max, сертификат, подписка..." value={data.rewardTitle} onChange={e => update({ rewardTitle: e.target.value })} /></div>
                  <div className="cw-field"><label>Описание награды</label><textarea className="cw-textarea" rows={2} placeholder="Что получит победитель..." value={data.rewardDescription} onChange={e => update({ rewardDescription: e.target.value })} /></div>
                </div>
              </div>
            )}

            {/* ─── STEP 4: ОБЗОР ─── */}
            {step === 4 && (
              <div className="cw-card-inner">
                <div className="cw-card-head" style={{ background: 'linear-gradient(135deg, #7c3aed, #a78bfa)' }}>
                  <div className="cw-card-head-icon"><Eye size={24} /></div>
                  <div><h2>Обзор</h2><p>Проверь и опубликуй</p></div>
                </div>
                <div className="cw-card-body">
                  <div className="cw-rv">
                    <div className="cw-rv-preview" onClick={() => setShowPreview(true)}>
                      <img src={data.coverImage || PLACEHOLDER} alt="" />
                      <div className="cw-rv-overlay"><Eye size={20} /> Нажми чтобы посмотреть модалку</div>
                    </div>
                    <div className="cw-rv-info">
                      <div className="cw-rv-tags">
                        <span className="cw-rv-tag" style={{ background: catObj ? `${catObj.color}15` : '#f5f5f5', color: catObj?.color || '#666' }}>{catObj?.label || 'Категория'}</span>
                        <span className="cw-rv-tag">{data.format === 'ONLINE' ? 'Онлайн' : data.format === 'OFFLINE' ? 'Офлайн' : 'Гибрид'}</span>
                        <span className="cw-rv-tag">{data.challengeType === 'OPEN' ? 'Открытый' : 'Закрытый'}</span>
                      </div>
                      <h3>{data.title || 'Без названия'}</h3>
                      <p>{data.description || 'Без описания'}</p>
                      <div className="cw-rv-stats">
                        <div className="cw-rv-stat"><strong>{data.steps.length}</strong><span>этапов</span></div>
                        <div className="cw-rv-stat"><strong>{data.maxParticipants}</strong><span>мест</span></div>
                        <div className="cw-rv-stat"><strong>{data.entryFee || 0}₽</strong><span>взнос</span></div>
                        <div className="cw-rv-stat"><strong>{data.selectedAchievements.length}</strong><span>достижений</span></div>
                      </div>
                      {data.steps.length > 0 && (
                        <div className="cw-rv-steps">
                          <h4>Этапы</h4>
                          {data.steps.map((s, i) => { const st = STEP_TYPES.find(t => t.key === s.type)!; return (
                            <div key={s.id} className="cw-rv-step"><div className="cw-rv-step-n" style={{ background: st.gradient }}>{i + 1}</div><div><strong>{s.title || `Этап ${i + 1}`}</strong><span>{st.label}</span></div></div>
                          ); })}
                        </div>
                      )}
                      {data.rewardTitle && <div className="cw-rv-reward"><Award size={16} /><strong>{data.rewardTitle}</strong></div>}
                    </div>
                  </div>
                  {error && <div className="cw-error">{error}</div>}
                </div>
              </div>
            )}
          </div>
        </main>

        {/* ─── NAV ─── */}
        <div className="cw-nav">
          {step > 0 && <button className="cw-btn cw-btn--ghost" onClick={() => go(step - 1)}><ChevronLeft size={15} /> Назад</button>}
          <div style={{ flex: 1 }} />
          {step < 4 ? (
            <button className="cw-btn cw-btn--primary" disabled={!canNext} onClick={() => go(step + 1)}>Далее <ArrowRight size={15} /></button>
          ) : (
            <button className="cw-btn cw-btn--publish" onClick={handlePublish} disabled={publishing}>{publishing ? <Spinner size={14} /> : <><Zap size={15} /> Опубликовать</>}</button>
          )}
        </div>
      </div>

      <style>{globalCSS}</style>
    </PageShell>
  );
}

const globalCSS = `
  .cw { min-height: 100vh; display: flex; flex-direction: column; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); position: relative; overflow: hidden; }
  .cw::before { content: ''; position: absolute; inset: 0; background: url('/images/challenge-placeholder.svg') center/cover; filter: blur(30px) brightness(0.8); transform: scale(1.1); z-index: 0; }
  .cw > * { position: relative; z-index: 1; }

  /* Header */
  .cw-header { position: sticky; top: 0; z-index: 50; background: rgba(255,255,255,0.6); backdrop-filter: blur(24px) saturate(1.4); -webkit-backdrop-filter: blur(24px) saturate(1.4); border-bottom: 1px solid rgba(255,255,255,0.5); padding: 10px clamp(16px, 3vw, 40px); display: flex; align-items: center; gap: 16px; }
  .cw-back { display: flex; align-items: center; gap: 2px; font-size: 13px; font-weight: 700; color: #6b7280; text-decoration: none; padding: 8px 12px; border-radius: 10px; transition: all 0.2s; flex-shrink: 0; background: rgba(255,255,255,0.3); }
  .cw-back:hover { background: rgba(255,255,255,0.5); color: #111; }
  .cw-preview-btn { display: flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.5); background: rgba(255,255,255,0.4); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); font-size: 13px; font-weight: 700; color: #6b7280; cursor: pointer; transition: all 0.25s; flex-shrink: 0; box-shadow: inset 0 1px 0 rgba(255,255,255,0.5); }
  .cw-preview-btn:hover { border-color: rgba(255,56,92,0.4); color: #FF385C; box-shadow: 0 4px 16px rgba(255,56,92,0.1); transform: translateY(-1px); }

  /* Progress */
  .cw-progress { flex: 1; display: flex; align-items: center; justify-content: center; gap: 4px; position: relative; }
  .cw-pstep { display: flex; flex-direction: column; align-items: center; gap: 4px; background: none; border: none; cursor: pointer; padding: 0 8px; position: relative; z-index: 1; }
  .cw-pcircle { width: 32px; height: 32px; border-radius: 50%; background: rgba(255,255,255,0.4); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,0.5); color: #9ca3af; display: grid; place-items: center; transition: all 0.3s cubic-bezier(0.34,1.56,0.64,1); box-shadow: inset 0 1px 0 rgba(255,255,255,0.5); }
  .cw-pstep.active .cw-pcircle { transform: scale(1.15); box-shadow: 0 0 0 4px rgba(255,56,92,0.12), 0 4px 12px rgba(255,56,92,0.2); }
  .cw-pstep.done .cw-pcircle { transform: scale(1); box-shadow: 0 2px 8px rgba(22,163,74,0.2); }
  .cw-plabel { font-size: 10px; font-weight: 700; color: rgba(255,255,255,0.4); transition: color 0.2s; }
  .cw-pstep.active .cw-plabel { color: white; text-shadow: 0 1px 2px rgba(0,0,0,0.2); }
  .cw-pstep.done .cw-plabel { color: rgba(255,255,255,0.7); }
  .cw-ptrack { position: absolute; top: 16px; left: 60px; right: 60px; height: 3px; background: rgba(255,255,255,0.3); border-radius: 99px; z-index: 0; }
  .cw-pfill { height: 100%; background: linear-gradient(90deg, #16a34a, #FF385C); border-radius: 99px; transition: width 0.5s cubic-bezier(0.4,0,0.2,1); box-shadow: 0 0 8px rgba(255,56,92,0.3); }

  /* Main */
  .cw-main { flex: 1; max-width: 680px; width: 100%; margin: 0 auto; padding: 24px 16px 100px; }

  /* Card animation */
  .cw-card { animation: cardIn 0.4s cubic-bezier(0.22, 1, 0.36, 1) both; }
  .cw-card.anim-forward { animation-name: cardInForward; }
  .cw-card.anim-back { animation-name: cardInBack; }
  @keyframes cardInForward { from { opacity: 0; transform: translateX(40px) scale(0.97); } to { opacity: 1; transform: none; } }
  @keyframes cardInBack { from { opacity: 0; transform: translateX(-40px) scale(0.97); } to { opacity: 1; transform: none; } }

  /* ─── GLASSMORPHISM ─── */
  .glass {
    background: rgba(255, 255, 255, 0.45);
    backdrop-filter: blur(24px) saturate(1.4);
    -webkit-backdrop-filter: blur(24px) saturate(1.4);
    border: 1px solid rgba(255, 255, 255, 0.6);
    border-radius: 24px;
    box-shadow:
      0 8px 32px rgba(0, 0, 0, 0.06),
      0 2px 8px rgba(0, 0, 0, 0.03),
      inset 0 1px 0 rgba(255, 255, 255, 0.7);
    overflow: hidden;
  }

  .glass-head {
    background: linear-gradient(135deg, rgba(255, 56, 92, 0.75), rgba(255, 107, 138, 0.65));
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.3);
    padding: 24px 28px;
    color: white;
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .glass-icon {
    width: 44px; height: 44px; border-radius: 14px;
    background: rgba(255, 255, 255, 0.25);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.35);
    display: grid; place-items: center; flex-shrink: 0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }

  .glass-head h2 { font-size: 20px; font-weight: 900; margin: 0; text-shadow: 0 1px 2px rgba(0,0,0,0.1); }
  .glass-head p { font-size: 13px; color: rgba(255, 255, 255, 0.8); margin: 2px 0 0; }

  .glass-body {
    padding: 28px;
    display: flex;
    flex-direction: column;
    gap: 22px;
    background: rgba(255, 255, 255, 0.2);
  }

  .glass-input {
    background: rgba(255, 255, 255, 0.5) !important;
    backdrop-filter: blur(12px) !important;
    -webkit-backdrop-filter: blur(12px) !important;
    border: 1px solid rgba(255, 255, 255, 0.6) !important;
    border-radius: 14px !important;
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.5),
      0 2px 8px rgba(0, 0, 0, 0.04);
    transition: all 0.25s ease !important;
  }
  .glass-input:focus {
    background: rgba(255, 255, 255, 0.7) !important;
    border-color: rgba(255, 56, 92, 0.4) !important;
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.6),
      0 0 0 3px rgba(255, 56, 92, 0.1),
      0 4px 16px rgba(255, 56, 92, 0.08) !important;
  }

  .glass-cat {
    background: rgba(255, 255, 255, 0.45) !important;
    backdrop-filter: blur(12px) !important;
    -webkit-backdrop-filter: blur(12px) !important;
    border: 1px solid rgba(255, 255, 255, 0.5) !important;
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.5),
      0 2px 8px rgba(0, 0, 0, 0.04);
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
  }
  .glass-cat:hover {
    transform: translateY(-3px) !important;
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.6),
      0 8px 24px rgba(0, 0, 0, 0.1) !important;
  }
  .glass-cat.on {
    transform: translateY(-2px) !important;
    box-shadow:
      0 6px 20px rgba(0, 0, 0, 0.12),
      inset 0 1px 0 rgba(255, 255, 255, 0.3) !important;
    border-color: transparent !important;
  }

  /* ─── Default card (non-glass steps) ─── */
  .cw-card-inner { background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04); }
  .cw-card-head { padding: 24px 28px; color: white; display: flex; align-items: center; gap: 14px; }
  .cw-card-head-icon { width: 44px; height: 44px; border-radius: 12px; background: rgba(255,255,255,0.2); display: grid; place-items: center; flex-shrink: 0; backdrop-filter: blur(4px); }
  .cw-card-head h2 { font-size: 20px; font-weight: 900; margin: 0; }
  .cw-card-head p { font-size: 13px; color: rgba(255,255,255,0.75); margin: 2px 0 0; }
  .cw-card-body { padding: 24px 28px 28px; display: flex; flex-direction: column; gap: 18px; }

  /* Fields */
  .cw-field { display: flex; flex-direction: column; gap: 6px; }
  .cw-field > label { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: #4a5568; }
  .cw-input, .cw-textarea, select.cw-input { padding: 12px 16px; border: 1.5px solid #e5e7eb; border-radius: 12px; font-size: 14px; background: #f9fafb; outline: none; transition: all 0.2s; width: 100%; color: #1a202c; }
  .cw-input:focus, .cw-textarea:focus, select.cw-input:focus { border-color: #FF385C; background: white; box-shadow: 0 0 0 3px rgba(255,56,92,0.08); }
  .cw-input--lg { font-size: 18px; font-weight: 700; padding: 14px 18px; background: white; }
  .cw-textarea { resize: vertical; font-family: inherit; min-height: 60px; }
  .cw-counter { font-size: 11px; color: rgba(255,255,255,0.4); text-align: right; }
  .cw-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .cw-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
  .cw-input-group { display: flex; align-items: center; gap: 0; border: 1px solid rgba(255,255,255,0.5); border-radius: 14px; background: rgba(255,255,255,0.4); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); overflow: hidden; transition: all 0.25s; box-shadow: inset 0 1px 0 rgba(255,255,255,0.5); }
  .cw-input-group:focus-within { border-color: rgba(255,56,92,0.4); background: rgba(255,255,255,0.6); box-shadow: inset 0 1px 0 rgba(255,255,255,0.6), 0 0 0 3px rgba(255,56,92,0.08); }
  .cw-ig-icon { padding: 0 12px; color: #9ca3af; display: flex; flex-shrink: 0; }
  .cw-input-group input, .cw-input-group select { border: none; background: transparent; padding: 11px 14px 11px 0; font-size: 14px; outline: none; width: 100%; color: #1a202c; }

  /* Categories */
  .cw-cats { display: flex; gap: 10px; flex-wrap: wrap; }
  .cw-cat { display: flex; align-items: center; gap: 10px; padding: 12px 20px; border-radius: 16px; border: 1.5px solid rgba(255,255,255,0.5); background: rgba(255,255,255,0.45); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); cursor: pointer; transition: all 0.3s cubic-bezier(0.34,1.56,0.64,1); position: relative; color: #374151; }
  .cw-cat:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.08); border-color: rgba(255,255,255,0.7); }
  .cw-cat.on { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.12); border-color: transparent; color: white; }
  .cw-cat-icon { width: 36px; height: 36px; border-radius: 10px; color: white; display: grid; place-items: center; box-shadow: 0 2px 8px rgba(0,0,0,0.15); }
  .cw-cat span { font-size: 14px; font-weight: 700; }
  .cw-cat-check { position: absolute; top: -6px; right: -6px; width: 22px; height: 22px; border-radius: 50%; background: #16a34a; color: white; display: grid; place-items: center; animation: popIn 0.25s cubic-bezier(0.34,1.56,0.64,1); box-shadow: 0 2px 8px rgba(22,163,74,0.3); }

  /* Pills */
  .cw-pills { display: flex; gap: 8px; flex-wrap: wrap; }
  .cw-pill { display: flex; align-items: center; gap: 7px; padding: 10px 18px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.5); background: rgba(255,255,255,0.4); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); font-size: 13px; font-weight: 700; color: #6b7280; cursor: pointer; transition: all 0.25s; box-shadow: inset 0 1px 0 rgba(255,255,255,0.5); }
  .cw-pill:hover { border-color: rgba(255,56,92,0.4); color: #FF385C; transform: translateY(-1px); }
  .cw-pill.on { border-color: transparent; background: linear-gradient(135deg, rgba(255,56,92,0.85), rgba(255,107,138,0.75)); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); color: white; box-shadow: 0 4px 16px rgba(255,56,92,0.2); }

  /* Note */
  .cw-note { display: flex; align-items: center; gap: 8px; padding: 12px 16px; border-radius: 12px; background: rgba(255,251,235,0.6); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); border: 1px solid rgba(253,230,138,0.5); }
  .cw-note svg { color: #d97706; flex-shrink: 0; }
  .cw-note span { font-size: 12px; color: #92400e; }

  /* Step types */
  .cw-type-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
  .cw-type-btn { display: flex; align-items: center; gap: 10px; padding: 14px; border-radius: 14px; border: 1px solid rgba(255,255,255,0.5); background: rgba(255,255,255,0.4); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); cursor: pointer; transition: all 0.25s; text-align: left; box-shadow: inset 0 1px 0 rgba(255,255,255,0.5); }
  .cw-type-btn:hover { border-color: rgba(255,255,255,0.7); transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.06); }
  .cw-type-icon { width: 40px; height: 40px; border-radius: 12px; color: white; display: grid; place-items: center; flex-shrink: 0; box-shadow: 0 2px 8px rgba(0,0,0,0.15); }
  .cw-type-btn strong { display: block; font-size: 13px; font-weight: 700; color: white; }
  .cw-type-btn span { font-size: 11px; color: rgba(255,255,255,0.6); }

  /* Steps list */
  .cw-steps-list { display: flex; flex-direction: column; gap: 10px; }
  .cw-empty { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 40px; color: rgba(255,255,255,0.5); }
  .cw-empty p { font-size: 14px; font-weight: 700; color: rgba(255,255,255,0.4); margin: 0; }
  .cw-step { display: flex; gap: 10px; background: rgba(255,255,255,0.4); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border-radius: 16px; padding: 14px; border: 1px solid rgba(255,255,255,0.5); transition: all 0.25s; box-shadow: inset 0 1px 0 rgba(255,255,255,0.5); }
  .cw-step:hover { border-color: rgba(255,255,255,0.7); background: rgba(255,255,255,0.55); }
  .cw-step.over { border-color: rgba(255,56,92,0.4); background: rgba(255,56,92,0.06); }
  .cw-step-grip { color: rgba(255,255,255,0.5); display: flex; padding-top: 2px; cursor: grab; }
  .cw-step-num { width: 28px; height: 28px; border-radius: 50%; color: white; display: grid; place-items: center; font-size: 11px; font-weight: 800; flex-shrink: 0; box-shadow: 0 2px 8px rgba(0,0,0,0.2); }
  .cw-step-body { flex: 1; display: flex; flex-direction: column; gap: 6px; min-width: 0; }
  .cw-step-top { display: flex; justify-content: space-between; align-items: center; }
  .cw-step-badge { display: flex; align-items: center; gap: 4px; font-size: 10px; font-weight: 700; color: rgba(255,255,255,0.7); }
  .cw-step-del { background: none; border: none; color: rgba(255,255,255,0.4); cursor: pointer; padding: 4px; border-radius: 6px; transition: all 0.15s; }
  .cw-step-del:hover { color: #ef4444; background: rgba(239,68,68,0.1); }
  .cw-step-title { border: none; font-size: 14px; font-weight: 700; color: white; background: transparent; outline: none; }
  .cw-step-desc { border: none; font-size: 12px; color: rgba(255,255,255,0.5); background: transparent; outline: none; resize: vertical; font-family: inherit; min-height: 32px; }
  .cw-step-criteria { border: 1px dashed rgba(255,255,255,0.3); border-radius: 8px; padding: 5px 8px; font-size: 11px; color: rgba(255,255,255,0.5); background: rgba(255,255,255,0.15); outline: none; font-style: italic; }
  .cw-step-criteria:focus { border-color: rgba(255,56,92,0.4); border-style: solid; color: white; }
  .cw-opts { display: flex; flex-direction: column; gap: 4px; }
  .cw-opt { display: flex; align-items: center; gap: 6px; }
  .cw-opt-dot { width: 18px; height: 18px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.3); background: rgba(255,255,255,0.15); display: grid; place-items: center; cursor: pointer; color: transparent; transition: all 0.15s; flex-shrink: 0; }
  .cw-opt-dot.on { border-color: #16a34a; background: #16a34a; color: white; }
  .cw-opt input { flex: 1; border: 1px solid rgba(255,255,255,0.3); border-radius: 8px; padding: 5px 8px; font-size: 12px; outline: none; background: rgba(255,255,255,0.15); color: white; }
  .cw-opt input:focus { border-color: rgba(255,56,92,0.4); }
  .cw-opt-x { background: none; border: none; color: rgba(255,255,255,0.3); cursor: pointer; }
  .cw-opt-x:hover { color: #ef4444; }
  .cw-opt-add { align-self: flex-start; background: none; border: 1px dashed rgba(255,56,92,0.5); color: rgba(255,56,92,0.8); padding: 4px 10px; border-radius: 8px; font-size: 11px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 3px; }

  /* Achievements */
  .cw-ach-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); gap: 8px; }
  .cw-ach { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 14px 8px; border-radius: 14px; border: 1px solid rgba(255,255,255,0.5); background: rgba(255,255,255,0.4); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); cursor: pointer; transition: all 0.25s; position: relative; box-shadow: inset 0 1px 0 rgba(255,255,255,0.5); }
  .cw-ach:hover { border-color: rgba(255,255,255,0.7); transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.06); }
  .cw-ach.on { border-color: transparent; background: linear-gradient(135deg, rgba(255,56,92,0.15), rgba(255,107,138,0.1)); box-shadow: 0 4px 16px rgba(255,56,92,0.1); }
  .cw-ach-icon { font-size: 28px; transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1); }
  .cw-ach.on .cw-ach-icon { transform: scale(1.2) rotate(-5deg); }
  .cw-ach-name { font-size: 11px; font-weight: 700; color: rgba(255,255,255,0.8); text-align: center; }
  .cw-ach-ok { position: absolute; top: 6px; right: 6px; width: 18px; height: 18px; border-radius: 50%; background: #16a34a; color: white; display: grid; place-items: center; animation: popIn 0.25s cubic-bezier(0.34,1.56,0.64,1); box-shadow: 0 2px 6px rgba(22,163,74,0.3); }
  .cw-ach--add { border-style: dashed; color: rgba(255,255,255,0.4); }
  .cw-ach--add:hover { border-color: rgba(255,56,92,0.4); color: rgba(255,56,92,0.8); }
  .cw-ach--add .cw-ach-icon { font-size: 22px; font-weight: 800; }
  .cw-custom-ach { background: rgba(255,255,255,0.4); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.5); border-radius: 16px; padding: 20px; display: flex; flex-direction: column; gap: 14px; box-shadow: inset 0 1px 0 rgba(255,255,255,0.5); }
  .cw-custom-ach h4 { font-size: 15px; font-weight: 800; margin: 0; color: #111; }
  .cw-icon-grid { display: flex; flex-wrap: wrap; gap: 4px; }
  .cw-icon-btn { width: 38px; height: 38px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.5); background: rgba(255,255,255,0.4); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); font-size: 18px; cursor: pointer; display: grid; place-items: center; transition: all 0.2s; }
  .cw-icon-btn:hover { border-color: rgba(255,255,255,0.7); transform: scale(1.1); }
  .cw-icon-btn.on { border-color: rgba(255,56,92,0.4); background: rgba(255,56,92,0.1); }

  /* Review */
  .cw-rv { display: flex; flex-direction: column; gap: 16px; }
  .cw-rv-preview { position: relative; border-radius: 16px; overflow: hidden; cursor: pointer; }
  .cw-rv-preview img { width: 100%; height: 200px; object-fit: cover; display: block; }
  .cw-rv-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; gap: 8px; color: white; font-size: 14px; font-weight: 700; opacity: 0; transition: opacity 0.2s; }
  .cw-rv-preview:hover .cw-rv-overlay { opacity: 1; }
  .cw-rv-info { display: flex; flex-direction: column; gap: 10px; }
  .cw-rv-tags { display: flex; gap: 6px; flex-wrap: wrap; }
  .cw-rv-tag { padding: 4px 10px; border-radius: 8px; background: rgba(255,255,255,0.4); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,0.5); font-size: 11px; font-weight: 700; color: #6b7280; }
  .cw-rv-info h3 { font-size: 18px; font-weight: 900; margin: 0; color: #111; }
  .cw-rv-info p { font-size: 13px; color: #6b7280; margin: 0; line-height: 1.5; }
  .cw-rv-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
  .cw-rv-stat { text-align: center; padding: 10px; background: rgba(255,255,255,0.4); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); border-radius: 12px; border: 1px solid rgba(255,255,255,0.5); }
  .cw-rv-stat strong { display: block; font-size: 16px; font-weight: 900; color: #111; }
  .cw-rv-stat span { font-size: 10px; color: #9ca3af; }
  .cw-rv-steps { display: flex; flex-direction: column; gap: 6px; }
  .cw-rv-steps h4 { font-size: 13px; font-weight: 800; margin: 0; color: #111; }
  .cw-rv-step { display: flex; align-items: center; gap: 8px; padding: 6px 0; }
  .cw-rv-step-n { width: 22px; height: 22px; border-radius: 50%; color: white; display: grid; place-items: center; font-size: 10px; font-weight: 800; flex-shrink: 0; box-shadow: 0 2px 6px rgba(0,0,0,0.2); }
  .cw-rv-step strong { font-size: 13px; display: block; color: #111; }
  .cw-rv-step span { font-size: 11px; color: #9ca3af; }
  .cw-rv-reward { display: flex; align-items: center; gap: 8px; padding: 12px 16px; border-radius: 12px; background: rgba(255,251,235,0.6); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); border: 1px solid rgba(253,230,138,0.5); color: #92400e; font-weight: 700; font-size: 13px; }
  .cw-error { background: rgba(254,242,242,0.7); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); color: #dc2626; padding: 10px 14px; border-radius: 12px; font-size: 13px; font-weight: 700; border: 1px solid rgba(254,202,202,0.5); }

  /* Nav */
  .cw-nav { display: flex; align-items: center; gap: 10px; padding: 16px clamp(16px, 3vw, 40px); position: sticky; bottom: 0; background: rgba(255,255,255,0.6); backdrop-filter: blur(24px) saturate(1.4); -webkit-backdrop-filter: blur(24px) saturate(1.4); border-top: 1px solid rgba(255,255,255,0.5); }
  .cw-btn { display: flex; align-items: center; gap: 6px; padding: 12px 24px; border-radius: 14px; font-size: 14px; font-weight: 800; cursor: pointer; transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1); border: none; }
  .cw-btn--ghost { background: rgba(255,255,255,0.5); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); color: #6b7280; border: 1px solid rgba(255,255,255,0.5); box-shadow: inset 0 1px 0 rgba(255,255,255,0.5); }
  .cw-btn--ghost:hover { border-color: rgba(255,255,255,0.7); color: #111; transform: translateY(-1px); }
  .cw-btn--primary { background: rgba(17, 17, 17, 0.85); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); color: white; box-shadow: 0 4px 16px rgba(0,0,0,0.15); }
  .cw-btn--primary:hover { background: rgba(17, 17, 17, 0.95); transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.2); }
  .cw-btn--primary:disabled { opacity: 0.3; cursor: default; transform: none; box-shadow: none; }
  .cw-btn--publish { background: linear-gradient(135deg, #FF385C, #E31C5F); color: white; box-shadow: 0 4px 16px rgba(255,56,92,0.3); }
  .cw-btn--publish:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(255,56,92,0.4); }
  .cw-btn--publish:disabled { opacity: 0.5; cursor: default; transform: none; }

  @keyframes popIn { from { transform: scale(0); } to { transform: scale(1); } }

  @media (max-width: 768px) {
    .cw-type-grid { grid-template-columns: 1fr; }
    .cw-grid-2, .cw-grid-3 { grid-template-columns: 1fr; }
    .cw-cats { gap: 8px; }
    .cw-cat { padding: 10px 14px; }
    .cw-pstep { padding: 0 4px; }
    .cw-plabel { display: none; }
    .cw-ptrack { left: 30px; right: 30px; }
    .cw-card-body { padding: 20px; }
    .cw-rv-stats { grid-template-columns: repeat(2, 1fr); }
    .cw-ach-grid { grid-template-columns: repeat(auto-fill, minmax(90px, 1fr)); }
  }
`;
