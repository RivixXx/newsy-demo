'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  ChevronLeft, ChevronRight, Plus, Trash2, GripVertical,
  Camera, MapPin, Type, Zap, Users, Calendar, DollarSign,
  Target, X, Eye, Check, ArrowRight, Award, Settings2, Monitor,
  Globe, Clock, AlertTriangle, FileUp, ListChecks, Lock, Trophy, Gift
} from 'lucide-react';
import { Spinner } from '@/shared/components/spinner';
import { useToast } from '@/shared/components/toast';
import { createChallengeAction } from '@/modules/challenges/actions/create';
import { FileUpload } from '@/shared/components/file-upload';

type StepType = 'action' | 'upload' | 'survey';

interface Step {
  id: string; type: StepType; title: string; description: string; points: number;
  questionType?: string; options?: string[]; correctIndex?: number;
  correctIndices?: number[]; minLength?: number; maxLength?: number;
  ratingMin?: number; ratingMax?: number; ratingMinLabel?: string; ratingMaxLabel?: string;
  location?: string; criteria?: string;
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
  { label: 'Основы', icon: <Target size={16} /> },
  { label: 'Настройки', icon: <Settings2 size={16} /> },
  { label: 'Этапы', icon: <ListChecks size={16} /> },
  { label: 'Награды', icon: <Award size={16} /> },
  { label: 'Обзор', icon: <Eye size={16} /> },
];

export default function NewChallengePage() {
  const [step, setStep] = useState(0);
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
    setStep(to);
  };
  const addStep = (type: StepType) => update({ steps: [...data.steps, {
    id: uid(), type, title: '', description: '', points: 50,
    questionType: type === 'survey' ? 'single' : undefined,
    options: type === 'survey' ? ['', ''] : undefined,
  }] });
  const updateStep = (id: string, p: Partial<Step>) => update({ steps: data.steps.map(s => s.id === id ? { ...s, ...p } : s) });
  const removeStep = (id: string) => update({ steps: data.steps.filter(s => s.id !== id) });
  const moveStep = (f: number, t: number) => { const a = [...data.steps]; const [item] = a.splice(f, 1); a.splice(t, 0, item); update({ steps: a }); };

  const catObj = CATEGORIES.find(c => c.key === data.category);
  const canNext = step === 0 ? !!data.title && !!data.category : step === 2 ? data.steps.length > 0 : true;

  // Progress based on field completion (only user-acted fields)
  const progressPct = useMemo(() => {
    let filled = 0, total = 0;
    total++; if (data.title.trim()) filled++;
    total++; if (data.description.trim()) filled++;
    total++; if (data.category) filled++;
    total++; if (data.coverImage) filled++;
    total++; if (data.format !== 'ONLINE') filled++;  // only if changed from default
    total++; if (data.startDate) filled++;
    total++; if (data.endDate) filled++;
    total++; if (data.maxParticipants !== 100) filled++;  // only if changed from default
    total++; if (data.steps.length > 0) filled++;
    total++; if (data.rewardTitle.trim()) filled++;
    return total === 0 ? 0 : Math.round((filled / total) * 100);
  }, [data]);

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
        steps: data.steps.map(s => ({ type: s.type, title: s.title, description: s.description, points: s.points, questionType: s.questionType, options: s.options, correctIndex: s.correctIndex, correctIndices: s.correctIndices, minLength: s.minLength, maxLength: s.maxLength, ratingMin: s.ratingMin, ratingMax: s.ratingMax, ratingMinLabel: s.ratingMinLabel, ratingMaxLabel: s.ratingMaxLabel, location: s.location, criteria: s.criteria })),
      });
      if (r?.error) { setError(r.error); return; }
      if (!r?.success || !r?.challengeId) { setError('Ошибка создания челенджа'); return; }
      window.location.href = `/dashboard/challenges/${r.challengeId}/publish`;
    } catch { setError('Ошибка сети'); } finally { setPublishing(false); }
  };

  return (
    <div className="cc-root">
      {/* Blurred background */}
      <div className="cc-bg" />

      {/* Top bar */}
      <header className="cc-topbar">
        <Link href="/explore" className="cc-topbtn">
          <ChevronLeft size={16} /> Назад
        </Link>
        <button className={`cc-topbtn ${showPreview ? 'cc-topbtn--active' : ''}`} onClick={() => setShowPreview(v => !v)}>
          <Eye size={16} /> Превью
        </button>
      </header>

      {/* Main stage */}
      <main className={`cc-stage ${showPreview ? 'cc-stage--split' : ''}`}>
        {/* Form card */}
        <div className={`cc-form-card ${showPreview ? 'cc-form-card--narrow' : ''} anim-${animDir}`} key={step}>

          {/* ─── STEP 0: ОСНОВЫ ─── */}
          {step === 0 && (
            <>
              <div className="cc-card-head" style={{ background: 'linear-gradient(135deg, #FF385C, #ff6b8a)' }}>
                <div className="cc-card-head-icon"><Target size={24} /></div>
                <div><h2>Основы челленжа</h2><p>Заложи фундамент своего челленджа</p></div>
              </div>
              <div className="cc-card-body">
                <div className="cc-field">
                  <label>Название *</label>
                  <input className="cc-input cc-input--lg" placeholder="Забег на 5 км по набережной" value={data.title} onChange={e => update({ title: e.target.value })} maxLength={100} />
                  <span className="cc-counter">{data.title.length}/100</span>
                </div>
                <div className="cc-field">
                  <label>Описание</label>
                  <textarea className="cc-textarea" rows={3} placeholder="Расскажи зачем этот челлендж, что участники получат..." value={data.description} onChange={e => update({ description: e.target.value })} />
                </div>
                <div className="cc-field">
                  <label>Категория *</label>
                  <div className="cc-cats">
                    {CATEGORIES.map(c => (
                      <button key={c.key} className={`cc-cat ${data.category === c.key ? 'on' : ''}`} style={data.category === c.key ? { background: c.gradient, borderColor: 'transparent', color: 'white' } : {}} onClick={() => update({ category: c.key })}>
                        <div className="cc-cat-icon" style={{ background: c.gradient }}>{c.icon}</div>
                        <span>{c.label}</span>
                        {data.category === c.key && <div className="cc-cat-check"><Check size={12} /></div>}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="cc-field">
                  <label>Обложка</label>
                  <FileUpload onUpload={(url) => update({ coverImage: url })} bucket="challenges" folder="covers" accept="image/jpeg,image/png,image/webp" maxSize={20} label="Загрузить обложку (фото до 20 МБ)" />
                </div>
              </div>
            </>
          )}

          {/* ─── STEP 1: НАСТРОЙКИ ─── */}
          {step === 1 && (
            <>
              <div className="cc-card-head" style={{ background: 'linear-gradient(135deg, #2563eb, #60a5fa)' }}>
                <div className="cc-card-head-icon"><Settings2 size={24} /></div>
                <div><h2>Настройки</h2><p>Формат, время, ограничения</p></div>
              </div>
              <div className="cc-card-body">
                <div className="cc-field"><label>Формат проведения</label>
                  <div className="cc-pills">
                    {([['ONLINE', 'Онлайн', <Globe size={16} />], ['OFFLINE', 'Офлайн', <MapPin size={16} />], ['HYBRID', 'Гибрид', <Globe size={16} />]] as const).map(([val, lbl, icon]) => (
                      <button key={val} className={`cc-pill ${data.format === val ? 'on' : ''}`} onClick={() => update({ format: val as any })}>{icon} {lbl}</button>
                    ))}
                  </div>
                </div>
                <div className="cc-field"><label>Тип мероприятия</label>
                  <div className="cc-pills">
                    <button className={`cc-pill ${data.challengeType === 'OPEN' ? 'on' : ''}`} onClick={() => update({ challengeType: 'OPEN' })}><Users size={16} /> Открытый</button>
                    <button className={`cc-pill ${data.challengeType === 'CLOSED' ? 'on' : ''}`} onClick={() => update({ challengeType: 'CLOSED' })}><Lock size={16} /> Закрытый</button>
                  </div>
                </div>
                {data.format !== 'ONLINE' && (
                  <div className="cc-field"><label>География</label>
                    <div className="cc-grid-2">
                      <div className="cc-ig"><span className="cc-ig-icon"><Globe size={14} /></span><input placeholder="Страна" value={data.country} onChange={e => update({ country: e.target.value })} /></div>
                      <div className="cc-ig"><span className="cc-ig-icon"><MapPin size={14} /></span><input placeholder="Регион" value={data.region} onChange={e => update({ region: e.target.value })} /></div>
                      <div className="cc-ig"><span className="cc-ig-icon"><MapPin size={14} /></span><input placeholder="Город" value={data.city} onChange={e => update({ city: e.target.value })} /></div>
                      <div className="cc-ig"><span className="cc-ig-icon"><MapPin size={14} /></span><input placeholder="Адрес" value={data.address} onChange={e => update({ address: e.target.value })} /></div>
                    </div>
                  </div>
                )}
                <div className="cc-field"><label>Дата и время</label>
                  <div className="cc-grid-2">
                    <div className="cc-ig"><span className="cc-ig-icon"><Calendar size={14} /></span><input type="date" value={data.startDate} onChange={e => update({ startDate: e.target.value })} /></div>
                    <div className="cc-ig"><span className="cc-ig-icon"><Calendar size={14} /></span><input type="date" value={data.endDate} onChange={e => update({ endDate: e.target.value })} /></div>
                    <div className="cc-ig"><span className="cc-ig-icon"><Clock size={14} /></span><input type="time" value={data.startTime} onChange={e => update({ startTime: e.target.value })} /></div>
                    <div className="cc-ig"><span className="cc-ig-icon"><Clock size={14} /></span><input type="time" value={data.endTime} onChange={e => update({ endTime: e.target.value })} /></div>
                  </div>
                </div>
                <div className="cc-grid-2">
                  <div className="cc-field"><label>Макс. участников</label><div className="cc-ig"><span className="cc-ig-icon"><Users size={14} /></span><input type="number" value={data.maxParticipants} onChange={e => update({ maxParticipants: parseInt(e.target.value) || 0 })} /></div></div>
                  <div className="cc-field"><label>Взнос (₽)</label><div className="cc-ig"><span className="cc-ig-icon"><DollarSign size={14} /></span><input type="number" value={data.entryFee} onChange={e => update({ entryFee: parseInt(e.target.value) || 0 })} /></div></div>
                </div>
                <div className="cc-field"><label>Требования к участникам</label><textarea className="cc-textarea" rows={2} placeholder="Навыки, инвентарь, информация..." value={data.requirements} onChange={e => update({ requirements: e.target.value })} /></div>
                <div className="cc-field"><label>Ограничения</label>
                  <div className="cc-grid-3">
                    <div className="cc-field"><label>Мин. возраст</label><input className="cc-input" type="number" min={0} max={120} value={data.minAge} onChange={e => update({ minAge: e.target.value === '' ? '' : parseInt(e.target.value) || '' })} placeholder="—" /></div>
                    <div className="cc-field"><label>Макс. возраст</label><input className="cc-input" type="number" min={0} max={120} value={data.maxAge} onChange={e => update({ maxAge: e.target.value === '' ? '' : parseInt(e.target.value) || '' })} placeholder="—" /></div>
                    <div className="cc-field"><label>Пол</label><select className="cc-input" value={data.gender} onChange={e => update({ gender: e.target.value })}><option value="">Все</option><option value="male">Мужской</option><option value="female">Женский</option></select></div>
                  </div>
                </div>
                <div className="cc-note"><AlertTriangle size={14} /><span>Правила отмены устанавливаются площадкой при модерации</span></div>
              </div>
            </>
          )}

          {/* ─── STEP 2: ЭТАПЫ ─── */}
          {step === 2 && (
            <>
              <div className="cc-card-head" style={{ background: 'linear-gradient(135deg, #16a34a, #4ade80)' }}>
                <div className="cc-card-head-icon"><ListChecks size={24} /></div>
                <div><h2>Этапы</h2><p>{data.steps.length} этапов добавлено</p></div>
              </div>
              <div className="cc-card-body">
                <div className="cc-type-grid">
                  {STEP_TYPES.map(t => (
                    <button key={t.key} className="cc-type-btn" onClick={() => addStep(t.key)}>
                      <div className="cc-type-icon" style={{ background: t.gradient }}>{t.icon}</div>
                      <div><strong>{t.label}</strong><span>{t.desc}</span></div>
                    </button>
                  ))}
                </div>
                <div className="cc-steps-list">
                  {data.steps.length === 0 && <div className="cc-empty"><Target size={36} color="#ddd" /><p>Добавь первый этап</p></div>}
                  {data.steps.map((s, i) => {
                    const st = STEP_TYPES.find(t => t.key === s.type)!;
                    return (
                      <div key={s.id} className={`cc-step ${dragOver === i ? 'over' : ''}`} draggable onDragStart={() => setDragIdx(i)} onDragOver={e => { e.preventDefault(); setDragOver(i); }} onDragLeave={() => setDragOver(null)} onDrop={() => { if (dragIdx !== null && dragIdx !== i) moveStep(dragIdx, i); setDragIdx(null); setDragOver(null); }}>
                        <div className="cc-step-grip"><GripVertical size={14} /></div>
                        <div className="cc-step-num" style={{ background: st.gradient }}>{i + 1}</div>
                        <div className="cc-step-body">
                          <div className="cc-step-top"><span className="cc-step-badge" style={{ color: st.color }}>{st.icon} {st.label}</span><button className="cc-step-del" onClick={() => removeStep(s.id)}><Trash2 size={13} /></button></div>
                          <input className="cc-step-title" placeholder="Название этапа..." value={s.title} onChange={e => updateStep(s.id, { title: e.target.value })} />
                          <textarea className="cc-step-desc" rows={2} placeholder="Инструкция для участника..." value={s.description} onChange={e => updateStep(s.id, { description: e.target.value })} />
                          <input className="cc-step-criteria" placeholder="Критерии приёма при проверке..." value={s.criteria || ''} onChange={e => updateStep(s.id, { criteria: e.target.value })} />
                          {s.type === 'survey' && (
                            <>
                              {/* Question sub-type selector */}
                              <div className="cc-question-types">
                                {[
                                  { type: 'single', icon: '○', label: 'Один из списка' },
                                  { type: 'multiple', icon: '☑', label: 'Несколько из списка' },
                                  { type: 'text', icon: 'Aa', label: 'Текстовый ответ' },
                                  { type: 'rating', icon: '★', label: 'Оценка' },
                                  { type: 'yesno', icon: '👍', label: 'Да / Нет' },
                                ].map(qt => (
                                  <button
                                    key={qt.type}
                                    className={`cc-qt-btn ${(s.questionType || 'single') === qt.type ? 'on' : ''}`}
                                    onClick={() => updateStep(s.id, {
                                      questionType: qt.type,
                                      options: qt.type === 'yesno' ? ['Да', 'Нет'] : (qt.type === 'single' || qt.type === 'multiple') && !s.options ? ['', ''] : s.questionType === 'yesno' && qt.type !== 'yesno' ? undefined : s.options,
                                      correctIndex: qt.type === 'yesno' ? 0 : (qt.type === 'single' && s.questionType !== 'single' ? undefined : s.correctIndex),
                                      correctIndices: qt.type === 'multiple' ? [] : undefined,
                                      ratingMin: qt.type === 'rating' ? 1 : undefined,
                                      ratingMax: qt.type === 'rating' ? 5 : undefined,
                                    })}
                                  >
                                    <span className="cc-qt-icon">{qt.icon}</span>
                                    <span>{qt.label}</span>
                                  </button>
                                ))}
                              </div>

                              {/* Single choice */}
                              {(s.questionType || 'single') === 'single' && (
                                <div className="cc-opts">
                                  {(s.options || []).map((o, oi) => (
                                    <div key={oi} className="cc-opt">
                                      <button className={`cc-opt-dot ${s.correctIndex === oi ? 'on' : ''}`} onClick={() => updateStep(s.id, { correctIndex: oi })}><Check size={8} /></button>
                                      <input placeholder={`Вариант ${oi + 1}`} value={o} onChange={e => { const opts = [...(s.options || [])]; opts[oi] = e.target.value; updateStep(s.id, { options: opts }); }} />
                                      {(s.options || []).length > 2 && <button className="cc-opt-x" onClick={() => updateStep(s.id, { options: (s.options || []).filter((_, j) => j !== oi) })}><X size={10} /></button>}
                                    </div>
                                  ))}
                                  <button className="cc-opt-add" onClick={() => updateStep(s.id, { options: [...(s.options || []), ''] })}><Plus size={10} /> Вариант</button>
                                </div>
                              )}

                              {/* Multiple choice */}
                              {s.questionType === 'multiple' && (
                                <div className="cc-opts">
                                  {(s.options || []).map((o, oi) => (
                                    <div key={oi} className="cc-opt">
                                      <button
                                        className={`cc-opt-dot ${(s.correctIndices || []).includes(oi) ? 'on' : ''}`}
                                        onClick={() => {
                                          const cur = s.correctIndices || [];
                                          const idx = cur.indexOf(oi);
                                          const next = idx >= 0 ? cur.filter(i => i !== oi) : [...cur, oi];
                                          updateStep(s.id, { correctIndices: next });
                                        }}
                                        style={{ borderRadius: 4 }}
                                      ><Check size={8} /></button>
                                      <input placeholder={`Вариант ${oi + 1}`} value={o} onChange={e => { const opts = [...(s.options || [])]; opts[oi] = e.target.value; updateStep(s.id, { options: opts }); }} />
                                      {(s.options || []).length > 2 && <button className="cc-opt-x" onClick={() => updateStep(s.id, { options: (s.options || []).filter((_, j) => j !== oi) })}><X size={10} /></button>}
                                    </div>
                                  ))}
                                  <button className="cc-opt-add" onClick={() => updateStep(s.id, { options: [...(s.options || []), ''] })}><Plus size={10} /> Вариант</button>
                                  {(s.correctIndices || []).length > 0 && (
                                    <span style={{ fontSize: 11, color: '#9ca3af' }}>✓ {(s.correctIndices || []).length} правильных</span>
                                  )}
                                </div>
                              )}

                              {/* Text answer */}
                              {s.questionType === 'text' && (
                                <div className="cc-text-config">
                                  <div className="cc-grid-2">
                                    <div className="cc-field">
                                      <label>Мин. длина</label>
                                      <input className="cc-input" type="number" min={0} value={s.minLength ?? ''} onChange={e => updateStep(s.id, { minLength: e.target.value ? Number(e.target.value) : undefined })} placeholder="0" />
                                    </div>
                                    <div className="cc-field">
                                      <label>Макс. длина</label>
                                      <input className="cc-input" type="number" min={1} value={s.maxLength ?? ''} onChange={e => updateStep(s.id, { maxLength: e.target.value ? Number(e.target.value) : undefined })} placeholder="500" />
                                    </div>
                                  </div>
                                  <span style={{ fontSize: 11, color: '#9ca3af' }}>Участник введёт текстовый ответ</span>
                                </div>
                              )}

                              {/* Rating */}
                              {s.questionType === 'rating' && (
                                <div className="cc-text-config">
                                  <div className="cc-grid-2">
                                    <div className="cc-field">
                                      <label>От</label>
                                      <input className="cc-input" type="number" min={0} value={s.ratingMin ?? 1} onChange={e => updateStep(s.id, { ratingMin: Number(e.target.value) })} />
                                    </div>
                                    <div className="cc-field">
                                      <label>До</label>
                                      <input className="cc-input" type="number" min={2} max={100} value={s.ratingMax ?? 5} onChange={e => updateStep(s.id, { ratingMax: Number(e.target.value) })} />
                                    </div>
                                  </div>
                                  <div className="cc-grid-2" style={{ marginTop: 8 }}>
                                    <div className="cc-field">
                                      <label>Подпись минимума</label>
                                      <input className="cc-input" placeholder="Плохо" value={s.ratingMinLabel ?? ''} onChange={e => updateStep(s.id, { ratingMinLabel: e.target.value || undefined })} />
                                    </div>
                                    <div className="cc-field">
                                      <label>Подпись максимума</label>
                                      <input className="cc-input" placeholder="Отлично" value={s.ratingMaxLabel ?? ''} onChange={e => updateStep(s.id, { ratingMaxLabel: e.target.value || undefined })} />
                                    </div>
                                  </div>
                                  <span style={{ fontSize: 11, color: '#9ca3af' }}>Участник поставит оценку от {s.ratingMin ?? 1} до {s.ratingMax ?? 5}</span>
                                </div>
                              )}

                              {/* Yes/No */}
                              {s.questionType === 'yesno' && (
                                <div className="cc-text-config">
                                  <div className="cc-question-types" style={{ gridTemplateColumns: '1fr 1fr' }}>
                                    <button
                                      className={`cc-qt-btn ${s.correctIndex === 0 ? 'on' : ''}`}
                                      onClick={() => updateStep(s.id, { correctIndex: 0, options: ['Да', 'Нет'] })}
                                    >
                                      <span className="cc-qt-icon">👍</span>
                                      <span>Да</span>
                                    </button>
                                    <button
                                      className={`cc-qt-btn ${s.correctIndex === 1 ? 'on' : ''}`}
                                      onClick={() => updateStep(s.id, { correctIndex: 1, options: ['Да', 'Нет'] })}
                                    >
                                      <span className="cc-qt-icon">👎</span>
                                      <span>Нет</span>
                                    </button>
                                  </div>
                                  <span style={{ fontSize: 11, color: '#9ca3af' }}>Участник выберет Да или Нет. Отметьте правильный ответ.</span>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* ─── STEP 3: НАГРАДЫ ─── */}
          {step === 3 && (
            <>
              <div className="cc-card-head" style={{ background: 'linear-gradient(135deg, #d97706, #fbbf24)' }}>
                <div className="cc-card-head-icon"><Award size={24} /></div>
                <div><h2>Награды и достижения</h2><p>Что получат победители</p></div>
              </div>
              <div className="cc-card-body">
                <div className="cc-field"><label>Достижения</label>
                  <div className="cc-ach-grid">
                    {PRESET_ACHIEVEMENTS.map(a => (
                      <button key={a.key} className={`cc-ach ${data.selectedAchievements.includes(a.key) ? 'on' : ''}`} onClick={() => {
                        const next = data.selectedAchievements.includes(a.key) ? data.selectedAchievements.filter(k => k !== a.key) : [...data.selectedAchievements, a.key];
                        update({ selectedAchievements: next });
                      }}>
                        <span className="cc-ach-icon">{a.icon}</span>
                        <span className="cc-ach-name">{a.name}</span>
                        {data.selectedAchievements.includes(a.key) && <span className="cc-ach-ok"><Check size={10} /></span>}
                      </button>
                    ))}
                    <button className="cc-ach cc-ach--add" onClick={() => update({ customAchievement: { name: '', description: '', icon: '🏆' } })}>
                      <span className="cc-ach-icon">+</span>
                      <span className="cc-ach-name">Создать</span>
                    </button>
                  </div>
                </div>
                {data.customAchievement && (
                  <div className="cc-custom-ach">
                    <h4>Новое достижение</h4>
                    <div className="cc-field"><label>Название</label><input className="cc-input" value={data.customAchievement.name} onChange={e => update({ customAchievement: { ...data.customAchievement!, name: e.target.value } })} placeholder="Покоритель вершин" /></div>
                    <div className="cc-field"><label>За что</label><input className="cc-input" value={data.customAchievement.description} onChange={e => update({ customAchievement: { ...data.customAchievement!, description: e.target.value } })} placeholder="Описание" /></div>
                    <div className="cc-field"><label>Иконка</label>
                      <div className="cc-icon-grid">{ACHIEVEMENT_ICONS.map(icon => (
                        <button key={icon} className={`cc-icon-btn ${data.customAchievement?.icon === icon ? 'on' : ''}`} onClick={() => update({ customAchievement: { ...data.customAchievement!, icon } })}>{icon}</button>
                      ))}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                      <button className="cc-btn cc-btn--ghost" onClick={() => update({ customAchievement: null })}>Отмена</button>
                      <button className="cc-btn cc-btn--primary-sm" onClick={() => { if (data.customAchievement?.name) { update({ customAchievement: null }); toast('success', 'Отправлено на модерацию'); } }}>Добавить</button>
                    </div>
                  </div>
                )}
                <div className="cc-field"><label>Название награды</label><input className="cc-input" placeholder="Nike Air Max, сертификат, подписка..." value={data.rewardTitle} onChange={e => update({ rewardTitle: e.target.value })} /></div>
                <div className="cc-field"><label>Описание награды</label><textarea className="cc-textarea" rows={2} placeholder="Что получит победитель..." value={data.rewardDescription} onChange={e => update({ rewardDescription: e.target.value })} /></div>
              </div>
            </>
          )}

          {/* ─── STEP 4: ОБЗОР ─── */}
          {step === 4 && (
            <>
              <div className="cc-card-head" style={{ background: 'linear-gradient(135deg, #7c3aed, #a78bfa)' }}>
                <div className="cc-card-head-icon"><Eye size={24} /></div>
                <div><h2>Обзор</h2><p>Проверь и опубликуй</p></div>
              </div>
              <div className="cc-card-body">
                <div className="cc-rv">
                  <div className="cc-rv-info">
                    <div className="cc-rv-tags">
                      <span className="cc-rv-tag" style={{ background: catObj ? `${catObj.color}15` : '#f5f5f5', color: catObj?.color || '#666' }}>{catObj?.label || 'Категория'}</span>
                      <span className="cc-rv-tag">{data.format === 'ONLINE' ? 'Онлайн' : data.format === 'OFFLINE' ? 'Офлайн' : 'Гибрид'}</span>
                      <span className="cc-rv-tag">{data.challengeType === 'OPEN' ? 'Открытый' : 'Закрытый'}</span>
                    </div>
                    <h3>{data.title || 'Без названия'}</h3>
                    <p>{data.description || 'Без описания'}</p>
                    <div className="cc-rv-stats">
                      <div className="cc-rv-stat"><strong>{data.steps.length}</strong><span>этапов</span></div>
                      <div className="cc-rv-stat"><strong>{data.maxParticipants}</strong><span>мест</span></div>
                      <div className="cc-rv-stat"><strong>{data.entryFee || 0}₽</strong><span>взнос</span></div>
                      <div className="cc-rv-stat"><strong>{data.selectedAchievements.length}</strong><span>достижений</span></div>
                    </div>
                    {data.steps.length > 0 && (
                      <div className="cc-rv-steps">
                        <h4>Этапы</h4>
                        {data.steps.map((s, i) => { const st = STEP_TYPES.find(t => t.key === s.type)!; return (
                          <div key={s.id} className="cc-rv-step"><div className="cc-rv-step-n" style={{ background: st.gradient }}>{i + 1}</div><div><strong>{s.title || `Этап ${i + 1}`}</strong><span>{st.label}</span></div></div>
                        ); })}
                      </div>
                    )}
                    {data.rewardTitle && <div className="cc-rv-reward"><Award size={16} /><strong>{data.rewardTitle}</strong></div>}
                  </div>
                </div>
                {error && <div className="cc-error">{error}</div>}
              </div>
            </>
          )}
        </div>

        {/* Preview panel */}
        {showPreview && (
          <div className="cc-preview-panel">
            <div className="cc-preview-card">
              {/* Image */}
              <div className="cc-pv-img">
                <img src={data.coverImage || PLACEHOLDER} alt={data.title} />
                {catObj && <span className="cc-pv-badge" style={{ background: catObj.gradient }}>{catObj.label}</span>}
              </div>

              {/* Info */}
              <div className="cc-pv-body">
                <h3 className="cc-pv-title">{data.title || 'Название челленжа'}</h3>
                <p className="cc-pv-org">Организатор: Ваша организация</p>

                {/* Tabs */}
                <div className="cc-pv-tabs">
                  <span className="cc-pv-tab active">Этапы</span>
                  <span className="cc-pv-tab">Общий чат</span>
                  <span className="cc-pv-tab">Галерея</span>
                </div>

                {/* Stages */}
                <div className="cc-pv-stages">
                  {data.steps.length === 0 ? (
                    <div className="cc-pv-empty">Добавьте этапы в конструкторе</div>
                  ) : data.steps.map((s, i) => {
                    const st = STEP_TYPES.find(t => t.key === s.type)!;
                    return (
                      <div key={s.id} className="cc-pv-stage">
                        <div className="cc-pv-stage-num" style={{ background: st.gradient }}>{i + 1}</div>
                        <div className="cc-pv-stage-info">
                          <span className="cc-pv-stage-type">{st.label}</span>
                          <span className="cc-pv-stage-title">{s.title || `Этап ${i + 1}`}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Meta */}
                <div className="cc-pv-meta">
                  <span>📍 {data.city || data.address || 'Онлайн'}</span>
                  <span>📅 {data.endDate || 'Не указано'}</span>
                  <span>👥 {data.maxParticipants} мест</span>
                </div>

                {/* Badges */}
                <div className="cc-pv-badges">
                  <div className="cc-pv-badge-item">
                    <Trophy size={14} />
                    <span>Достижение: {data.selectedAchievements.length > 0 ? `${data.selectedAchievements.length} шт.` : 'Участие'}</span>
                  </div>
                  <div className="cc-pv-badge-item">
                    <Gift size={14} />
                    <span>Награда: {data.rewardTitle || 'Не указана'}</span>
                  </div>
                </div>

                {/* Description */}
                {data.description && (
                  <div className="cc-pv-desc">
                    <h4>Описание</h4>
                    <p>{data.description}</p>
                  </div>
                )}

                {/* CTA */}
                <button className="cc-pv-cta">Участвовать</button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Bottom bar */}
      <div className="cc-bottombar">
        <div className="cc-progress-track">
          <div className="cc-progress-fill" style={{ width: `${progressPct}%` }} />
        </div>
        <div className="cc-bottom-inner">
          <span className="cc-progress-label">{progressPct}%</span>
          <div style={{ flex: 1 }} />
          {step > 0 && <button className="cc-btn cc-btn--ghost" onClick={() => go(step - 1)}><ChevronLeft size={15} /> Назад</button>}
          {step < 4 ? (
            <button className="cc-btn cc-btn--primary" disabled={!canNext} onClick={() => go(step + 1)}>Далее <ArrowRight size={15} /></button>
          ) : (
            <button className="cc-btn cc-btn--publish" onClick={handlePublish} disabled={publishing}>{publishing ? <Spinner size={14} /> : <><Zap size={15} /> Опубликовать</>}</button>
          )}
        </div>
      </div>

      <style>{css}</style>
    </div>
  );
}

const css = `
  /* ── Root ── */
  .cc-root {
    min-height: 100vh; display: flex; flex-direction: column;
    position: relative; overflow: hidden;
    font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', system-ui, sans-serif;
  }

  /* ── Blurred background ── */
  .cc-bg {
    position: fixed; inset: 0; z-index: 0; pointer-events: none;
    background: url('/auth-bg.jpg') center / cover no-repeat;
    filter: blur(20px) brightness(0.6) saturate(1.2);
    transform: scale(1.05);
  }
  .cc-bg::after {
    content: ''; position: absolute; inset: 0;
    background: rgba(10,10,18,0.35);
  }

  /* ── Top bar ── */
  .cc-topbar {
    position: sticky; top: 0; z-index: 50;
    display: flex; align-items: center; gap: 8px;
    padding: 12px clamp(16px, 3vw, 40px);
  }
  .cc-topbtn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 8px 16px; border-radius: 12px;
    background: rgba(255,255,255,0.65); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(255,255,255,0.5); box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    font-size: 13px; font-weight: 700; color: #555;
    cursor: pointer; transition: all 0.2s; text-decoration: none;
  }
  .cc-topbtn:hover { background: rgba(255,255,255,0.85); color: #111; transform: translateY(-1px); }
  .cc-topbtn--active {
    background: rgba(255,56,92,0.12); border-color: rgba(255,56,92,0.3); color: #FF385C;
  }

  /* ── Stage ── */
  .cc-stage {
    flex: 1; display: flex; justify-content: center; align-items: flex-start;
    padding: 12px clamp(16px, 3vw, 40px) 100px;
    gap: 24px; position: relative; z-index: 1;
    transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* ── Form card ── */
  .cc-form-card {
    width: 100%; max-width: 640px;
    background: white; border-radius: 24px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06);
    overflow: hidden;
    transition: max-width 0.5s cubic-bezier(0.4, 0, 0.2, 1), transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    animation: cardIn 0.4s cubic-bezier(0.22, 1, 0.36, 1) both;
  }
  .cc-form-card--narrow { max-width: 50%; min-width: 420px; }
  .cc-form-card.anim-forward { animation-name: cardInF; }
  .cc-form-card.anim-back { animation-name: cardInB; }
  @keyframes cardInF { from { opacity: 0; transform: translateX(30px); } to { opacity: 1; transform: none; } }
  @keyframes cardInB { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: none; } }
  @keyframes cardIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: none; } }

  /* ── Card head ── */
  .cc-card-head {
    padding: 24px 28px; color: white;
    display: flex; align-items: center; gap: 14px;
  }
  .cc-card-head-icon {
    width: 44px; height: 44px; border-radius: 14px;
    background: rgba(255,255,255,0.2); display: grid; place-items: center; flex-shrink: 0;
  }
  .cc-card-head h2 { font-size: 20px; font-weight: 900; margin: 0; }
  .cc-card-head p { font-size: 13px; color: rgba(255,255,255,0.8); margin: 2px 0 0; }

  /* ── Card body ── */
  .cc-card-body { padding: 24px 28px 28px; display: flex; flex-direction: column; gap: 18px; }

  /* ── Fields ── */
  .cc-field { display: flex; flex-direction: column; gap: 6px; }
  .cc-field > label { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: #6b7280; }
  .cc-input, .cc-textarea, select.cc-input {
    padding: 12px 16px; border: 1.5px solid #e5e7eb; border-radius: 12px;
    font-size: 14px; background: #f9fafb; outline: none; transition: all 0.2s; width: 100%; color: #1a202c;
  }
  .cc-input:focus, .cc-textarea:focus, select.cc-input:focus { border-color: #FF385C; background: white; box-shadow: 0 0 0 3px rgba(255,56,92,0.08); }
  .cc-input--lg { font-size: 18px; font-weight: 700; padding: 14px 18px; background: white; }
  .cc-textarea { resize: vertical; font-family: inherit; min-height: 60px; }
  .cc-counter { font-size: 11px; color: #aaa; text-align: right; }
  .cc-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .cc-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
  .cc-ig { display: flex; align-items: center; gap: 0; border: 1.5px solid #e5e7eb; border-radius: 12px; background: #f9fafb; overflow: hidden; transition: all 0.2s; }
  .cc-ig:focus-within { border-color: #FF385C; background: white; box-shadow: 0 0 0 3px rgba(255,56,92,0.08); }
  .cc-ig-icon { padding: 0 12px; color: #9ca3af; display: flex; flex-shrink: 0; }
  .cc-ig input, .cc-ig select { border: none; background: transparent; padding: 11px 14px 11px 0; font-size: 14px; outline: none; width: 100%; color: #1a202c; }

  /* ── Categories ── */
  .cc-cats { display: flex; gap: 10px; flex-wrap: wrap; }
  .cc-cat {
    display: flex; align-items: center; gap: 10px; padding: 12px 20px; border-radius: 16px;
    border: 1.5px solid #e5e7eb; background: white; cursor: pointer;
    transition: all 0.3s cubic-bezier(0.34,1.56,0.64,1); position: relative; color: #374151;
  }
  .cc-cat:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.08); }
  .cc-cat.on { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.12); border-color: transparent; color: white; }
  .cc-cat-icon { width: 36px; height: 36px; border-radius: 10px; color: white; display: grid; place-items: center; box-shadow: 0 2px 8px rgba(0,0,0,0.15); }
  .cc-cat span { font-size: 14px; font-weight: 700; }
  .cc-cat-check { position: absolute; top: -6px; right: -6px; width: 22px; height: 22px; border-radius: 50%; background: #16a34a; color: white; display: grid; place-items: center; animation: popIn 0.25s cubic-bezier(0.34,1.56,0.64,1); box-shadow: 0 2px 8px rgba(22,163,74,0.3); }

  /* ── Pills ── */
  .cc-pills { display: flex; gap: 8px; flex-wrap: wrap; }
  .cc-pill {
    display: flex; align-items: center; gap: 7px; padding: 10px 18px; border-radius: 12px;
    border: 1.5px solid #e5e7eb; background: white; font-size: 13px; font-weight: 700;
    color: #6b7280; cursor: pointer; transition: all 0.25s;
  }
  .cc-pill:hover { border-color: #FF385C; color: #FF385C; transform: translateY(-1px); }
  .cc-pill.on { border-color: #FF385C; background: #FF385C; color: white; box-shadow: 0 4px 16px rgba(255,56,92,0.2); }

  /* ── Note ── */
  .cc-note { display: flex; align-items: center; gap: 8px; padding: 12px 16px; border-radius: 12px; background: #fffbeb; border: 1px solid #fde68a; }
  .cc-note svg { color: #d97706; flex-shrink: 0; }
  .cc-note span { font-size: 12px; color: #92400e; }

  /* ── Step types ── */
  .cc-type-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
  .cc-type-btn { display: flex; align-items: center; gap: 10px; padding: 14px; border-radius: 14px; border: 1.5px solid #e5e7eb; background: white; cursor: pointer; transition: all 0.25s; text-align: left; }
  .cc-type-btn:hover { border-color: #FF385C; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.06); }
  .cc-type-icon { width: 40px; height: 40px; border-radius: 12px; color: white; display: grid; place-items: center; flex-shrink: 0; box-shadow: 0 2px 8px rgba(0,0,0,0.15); }
  .cc-type-btn strong { display: block; font-size: 13px; font-weight: 700; color: #111; }
  .cc-type-btn span { font-size: 11px; color: #9ca3af; }

  /* ── Steps list ── */
  .cc-steps-list { display: flex; flex-direction: column; gap: 10px; }
  .cc-empty { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 40px; color: #ddd; }
  .cc-empty p { font-size: 14px; font-weight: 700; color: #aaa; margin: 0; }
  .cc-step { display: flex; gap: 10px; background: #f9fafb; border-radius: 16px; padding: 14px; border: 1.5px solid #e5e7eb; transition: all 0.25s; }
  .cc-step:hover { border-color: #d1d5db; background: white; }
  .cc-step.over { border-color: #FF385C; background: #fff5f7; }
  .cc-step-grip { color: #ccc; display: flex; padding-top: 2px; cursor: grab; }
  .cc-step-num { width: 28px; height: 28px; border-radius: 50%; color: white; display: grid; place-items: center; font-size: 11px; font-weight: 800; flex-shrink: 0; box-shadow: 0 2px 8px rgba(0,0,0,0.2); }
  .cc-step-body { flex: 1; display: flex; flex-direction: column; gap: 6px; min-width: 0; }
  .cc-step-top { display: flex; justify-content: space-between; align-items: center; }
  .cc-step-badge { display: flex; align-items: center; gap: 4px; font-size: 10px; font-weight: 700; }
  .cc-step-del { background: none; border: none; color: #ccc; cursor: pointer; padding: 4px; border-radius: 6px; transition: all 0.15s; }
  .cc-step-del:hover { color: #ef4444; background: #fef2f2; }
  .cc-step-title { border: none; font-size: 14px; font-weight: 700; color: #111; background: transparent; outline: none; }
  .cc-step-desc { border: none; font-size: 12px; color: #9ca3af; background: transparent; outline: none; resize: vertical; font-family: inherit; min-height: 32px; }
  .cc-step-criteria { border: 1px dashed #e5e7eb; border-radius: 8px; padding: 5px 8px; font-size: 11px; color: #aaa; background: #f3f4f6; outline: none; font-style: italic; }
  .cc-step-criteria:focus { border-color: #FF385C; border-style: solid; color: #111; }
  .cc-opts { display: flex; flex-direction: column; gap: 4px; }
  .cc-opt { display: flex; align-items: center; gap: 6px; }
  .cc-opt-dot { width: 18px; height: 18px; border-radius: 50%; border: 2px solid #e5e7eb; background: white; display: grid; place-items: center; cursor: pointer; color: transparent; transition: all 0.15s; flex-shrink: 0; }
  .cc-opt-dot.on { border-color: #16a34a; background: #16a34a; color: white; }
  .cc-opt input { flex: 1; border: 1px solid #e5e7eb; border-radius: 8px; padding: 5px 8px; font-size: 12px; outline: none; background: white; color: #111; }
  .cc-opt input:focus { border-color: #FF385C; }
  .cc-opt-x { background: none; border: none; color: #ccc; cursor: pointer; }
  .cc-opt-x:hover { color: #ef4444; }
  .cc-opt-add { align-self: flex-start; background: none; border: 1px dashed #FF385C; color: #FF385C; padding: 4px 10px; border-radius: 8px; font-size: 11px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 3px; }

  /* ── Question types ── */
  .cc-question-types { display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; margin-top: 8px; }
  .cc-qt-btn {
    display: flex; flex-direction: column; align-items: center; gap: 3px;
    padding: 8px 4px; border-radius: 10px; border: 1.5px solid #e5e7eb;
    background: white; cursor: pointer; transition: all 0.2s; font-size: 10px;
    font-weight: 700; color: #6b7280; line-height: 1.2;
  }
  .cc-qt-btn:hover { border-color: #2563eb; color: #2563eb; transform: translateY(-1px); }
  .cc-qt-btn.on { border-color: #2563eb; background: #eff6ff; color: #2563eb; }
  .cc-qt-icon { font-size: 16px; }
  .cc-text-config { display: flex; flex-direction: column; gap: 6px; margin-top: 8px; }

  /* ── Achievements ── */
  .cc-ach-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); gap: 8px; }
  .cc-ach { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 14px 8px; border-radius: 14px; border: 1.5px solid #e5e7eb; background: white; cursor: pointer; transition: all 0.25s; position: relative; }
  .cc-ach:hover { border-color: #d1d5db; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.06); }
  .cc-ach.on { border-color: #FF385C; background: #fff5f7; }
  .cc-ach-icon { font-size: 28px; transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1); }
  .cc-ach.on .cc-ach-icon { transform: scale(1.2) rotate(-5deg); }
  .cc-ach-name { font-size: 11px; font-weight: 700; color: #6b7280; text-align: center; }
  .cc-ach-ok { position: absolute; top: 6px; right: 6px; width: 18px; height: 18px; border-radius: 50%; background: #16a34a; color: white; display: grid; place-items: center; animation: popIn 0.25s cubic-bezier(0.34,1.56,0.64,1); box-shadow: 0 2px 6px rgba(22,163,74,0.3); }
  .cc-ach--add { border-style: dashed; color: #ccc; }
  .cc-ach--add:hover { border-color: #FF385C; color: #FF385C; }
  .cc-ach--add .cc-ach-icon { font-size: 22px; font-weight: 800; }
  .cc-custom-ach { background: #f9fafb; border: 1.5px solid #e5e7eb; border-radius: 16px; padding: 20px; display: flex; flex-direction: column; gap: 14px; }
  .cc-custom-ach h4 { font-size: 15px; font-weight: 800; margin: 0; color: #111; }
  .cc-icon-grid { display: flex; flex-wrap: wrap; gap: 4px; }
  .cc-icon-btn { width: 38px; height: 38px; border-radius: 10px; border: 1.5px solid #e5e7eb; background: white; font-size: 18px; cursor: pointer; display: grid; place-items: center; transition: all 0.2s; }
  .cc-icon-btn:hover { border-color: #d1d5db; transform: scale(1.1); }
  .cc-icon-btn.on { border-color: #FF385C; background: #fff5f7; }

  /* ── Review ── */
  .cc-rv { display: flex; flex-direction: column; gap: 16px; }
  .cc-rv-info { display: flex; flex-direction: column; gap: 10px; }
  .cc-rv-tags { display: flex; gap: 6px; flex-wrap: wrap; }
  .cc-rv-tag { padding: 4px 10px; border-radius: 8px; background: #f3f4f6; font-size: 11px; font-weight: 700; color: #6b7280; }
  .cc-rv-info h3 { font-size: 18px; font-weight: 900; margin: 0; color: #111; }
  .cc-rv-info p { font-size: 13px; color: #6b7280; margin: 0; line-height: 1.5; }
  .cc-rv-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
  .cc-rv-stat { text-align: center; padding: 10px; background: #f9fafb; border-radius: 12px; border: 1px solid #e5e7eb; }
  .cc-rv-stat strong { display: block; font-size: 16px; font-weight: 900; color: #111; }
  .cc-rv-stat span { font-size: 10px; color: #9ca3af; }
  .cc-rv-steps { display: flex; flex-direction: column; gap: 6px; }
  .cc-rv-steps h4 { font-size: 13px; font-weight: 800; margin: 0; color: #111; }
  .cc-rv-step { display: flex; align-items: center; gap: 8px; padding: 6px 0; }
  .cc-rv-step-n { width: 22px; height: 22px; border-radius: 50%; color: white; display: grid; place-items: center; font-size: 10px; font-weight: 800; flex-shrink: 0; box-shadow: 0 2px 6px rgba(0,0,0,0.2); }
  .cc-rv-step strong { font-size: 13px; display: block; color: #111; }
  .cc-rv-step span { font-size: 11px; color: #9ca3af; }
  .cc-rv-reward { display: flex; align-items: center; gap: 8px; padding: 12px 16px; border-radius: 12px; background: #fffbeb; border: 1px solid #fde68a; color: #92400e; font-weight: 700; font-size: 13px; }
  .cc-error { background: #fef2f2; color: #dc2626; padding: 10px 14px; border-radius: 12px; font-size: 13px; font-weight: 700; border: 1px solid #fecaca; }

  /* ── Buttons ── */
  .cc-btn { display: flex; align-items: center; gap: 6px; padding: 12px 24px; border-radius: 14px; font-size: 14px; font-weight: 800; cursor: pointer; transition: all 0.25s; border: none; }
  .cc-btn--ghost { background: rgba(255,255,255,0.6); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); color: #555; border: 1px solid rgba(255,255,255,0.5); }
  .cc-btn--ghost:hover { background: rgba(255,255,255,0.85); color: #111; transform: translateY(-1px); }
  .cc-btn--primary { background: #111; color: white; box-shadow: 0 4px 16px rgba(0,0,0,0.15); }
  .cc-btn--primary:hover { background: #222; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.2); }
  .cc-btn--primary:disabled { opacity: 0.3; cursor: default; transform: none; box-shadow: none; }
  .cc-btn--primary-sm { background: #111; color: white; padding: 10px 20px; font-size: 13px; box-shadow: 0 4px 16px rgba(0,0,0,0.15); }
  .cc-btn--publish { background: linear-gradient(135deg, #FF385C, #E31C5F); color: white; box-shadow: 0 4px 16px rgba(255,56,92,0.3); }
  .cc-btn--publish:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(255,56,92,0.4); }
  .cc-btn--publish:disabled { opacity: 0.5; cursor: default; transform: none; }

  /* ── Preview panel ── */
  .cc-preview-panel {
    flex: 0 0 420px; max-height: calc(100vh - 140px);
    overflow-y: auto; border-radius: 24px;
    animation: previewIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
  }
  .cc-preview-panel::-webkit-scrollbar { width: 4px; }
  .cc-preview-panel::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.15); border-radius: 4px; }
  @keyframes previewIn {
    from { opacity: 0; filter: blur(12px); transform: translateX(20px) scale(0.95); }
    to { opacity: 1; filter: blur(0); transform: none; }
  }

  /* Preview card */
  .cc-preview-card {
    background: white; border-radius: 20px; overflow: hidden;
    box-shadow: 0 20px 60px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.08);
  }
  .cc-pv-img { position: relative; height: 200px; overflow: hidden; }
  .cc-pv-img img { width: 100%; height: 100%; object-fit: cover; }
  .cc-pv-badge {
    position: absolute; bottom: 12px; left: 12px;
    padding: 6px 14px; border-radius: 99px;
    font-size: 12px; font-weight: 700; color: white;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  }
  .cc-pv-body { padding: 20px; display: flex; flex-direction: column; gap: 14px; }
  .cc-pv-title { font-size: 18px; font-weight: 900; margin: 0; color: #111; line-height: 1.3; }
  .cc-pv-org { font-size: 13px; color: #9ca3af; margin: 0; }

  .cc-pv-tabs { display: flex; gap: 4px; border-bottom: 1px solid #f0f0f0; padding-bottom: 10px; }
  .cc-pv-tab { font-size: 13px; font-weight: 700; color: #9ca3af; padding: 6px 12px; border-radius: 8px; cursor: default; }
  .cc-pv-tab.active { background: #FF385C; color: white; }

  .cc-pv-stages { display: flex; flex-direction: column; gap: 8px; }
  .cc-pv-empty { text-align: center; padding: 20px; font-size: 13px; color: #ccc; }
  .cc-pv-stage { display: flex; align-items: center; gap: 10px; padding: 10px; background: #f9fafb; border-radius: 12px; border: 1px solid #f0f0f0; }
  .cc-pv-stage-num { width: 28px; height: 28px; border-radius: 50%; color: white; display: grid; place-items: center; font-size: 11px; font-weight: 800; flex-shrink: 0; }
  .cc-pv-stage-info { display: flex; flex-direction: column; gap: 2px; }
  .cc-pv-stage-type { font-size: 10px; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.04em; }
  .cc-pv-stage-title { font-size: 13px; font-weight: 700; color: #111; }

  .cc-pv-meta { display: flex; flex-wrap: wrap; gap: 12px; font-size: 12px; color: #6b7280; }

  .cc-pv-badges { display: flex; flex-direction: column; gap: 6px; }
  .cc-pv-badge-item { display: flex; align-items: center; gap: 8px; padding: 10px 14px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; font-size: 13px; font-weight: 600; color: #166534; }

  .cc-pv-desc h4 { font-size: 13px; font-weight: 800; margin: 0 0 4px; color: #111; }
  .cc-pv-desc p { font-size: 13px; color: #6b7280; margin: 0; line-height: 1.5; }

  .cc-pv-cta {
    width: 100%; padding: 14px; border-radius: 14px; border: none;
    background: #FF385C; color: white; font-size: 15px; font-weight: 800;
    cursor: pointer; transition: all 0.2s;
    box-shadow: 0 4px 16px rgba(255,56,92,0.3);
  }
  .cc-pv-cta:hover { background: #E31C5F; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(255,56,92,0.35); }

  /* ── Bottom bar ── */
  .cc-bottombar {
    position: fixed; bottom: 0; left: 0; right: 0; z-index: 50;
    background: rgba(255,255,255,0.7); backdrop-filter: blur(24px) saturate(1.4); -webkit-backdrop-filter: blur(24px) saturate(1.4);
    border-top: 1px solid rgba(255,255,255,0.5);
  }
  .cc-progress-track {
    height: 4px; background: rgba(0,0,0,0.06);
  }
  .cc-progress-fill {
    height: 100%; background: linear-gradient(90deg, #FF385C, #E31C5F, #FF385C);
    background-size: 200% 100%;
    animation: progressShimmer 2s linear infinite;
    border-radius: 0 2px 2px 0;
    transition: width 0.5s cubic-bezier(0.4,0,0.2,1);
  }
  @keyframes progressShimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
  .cc-bottom-inner {
    display: flex; align-items: center; gap: 12px;
    padding: 12px clamp(16px, 3vw, 40px);
  }
  .cc-progress-label { font-size: 13px; font-weight: 800; color: #FF385C; min-width: 36px; }

  @keyframes popIn { from { transform: scale(0); } to { transform: scale(1); } }

  /* ── Responsive ── */
  @media (max-width: 1024px) {
    .cc-stage--split { flex-direction: column; align-items: center; }
    .cc-form-card--narrow { max-width: 640px; min-width: unset; }
    .cc-preview-panel { flex: none; width: 100%; max-width: 480px; max-height: none; }
  }
  @media (max-width: 768px) {
    .cc-type-grid { grid-template-columns: 1fr; }
    .cc-grid-2, .cc-grid-3 { grid-template-columns: 1fr; }
    .cc-card-body { padding: 20px; }
    .cc-rv-stats { grid-template-columns: repeat(2, 1fr); }
    .cc-ach-grid { grid-template-columns: repeat(auto-fill, minmax(90px, 1fr)); }
    .cc-question-types { grid-template-columns: repeat(3, 1fr); }
    .cc-preview-panel { display: none; }
    .cc-form-card--narrow { max-width: 100%; min-width: unset; }
  }
  @media (max-width: 480px) {
    .cc-question-types { grid-template-columns: repeat(2, 1fr); }
  }
`;
