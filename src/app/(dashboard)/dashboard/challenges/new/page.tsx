'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import {
  ChevronLeft, ChevronRight, Plus, Trash2, GripVertical,
  Camera, MapPin, HelpCircle, Type, Trophy, Zap, Users,
  Calendar, DollarSign, Target, X, Upload, Eye,
  Check, ArrowRight, Award, Settings2, Monitor,
  Globe, Clock, Lock, AlertTriangle, Star, FileUp, ListChecks,
  UserX, Map
} from 'lucide-react';
import { PageShell } from '@/shared/components/page-shell';
import { Spinner } from '@/shared/components/spinner';
import { useToast } from '@/shared/components/toast';
import { createChallengeAction } from '@/modules/challenges/actions/create';
import { FileUpload } from '@/shared/components/file-upload';

type StepType = 'action' | 'upload' | 'survey';

interface Step {
  id: string; type: StepType; title: string; description: string; points: number;
  options?: string[]; correctIndex?: number; location?: string;
  criteria?: string;
  verification?: Record<string, unknown>;
}
interface FormData {
  title: string; description: string; category: string; coverImage: string;
  // Настройки
  format: 'ONLINE' | 'OFFLINE' | 'HYBRID';
  challengeType: 'OPEN' | 'CLOSED';
  country: string; region: string; city: string; address: string;
  latitude: number | null; longitude: number | null;
  startDate: string; endDate: string; startTime: string; endTime: string;
  maxParticipants: number; entryFee: number;
  requirements: string;
  minAge: number | ''; maxAge: number | ''; gender: string;
  // Этапы
  steps: Step[];
  // Награды
  selectedAchievements: string[]; // keys достижений
  customAchievement: { name: string; description: string; icon: string } | null;
  rewardTitle: string; rewardDescription: string;
}

const CATEGORIES = [
  { key: 'sport', label: 'Спорт', icon: <Zap size={18} />, color: '#16a34a' },
  { key: 'education', label: 'Обучение', icon: <Settings2 size={18} />, color: '#2563eb' },
  { key: 'quest', label: 'Квесты', icon: <Target size={18} />, color: '#d97706' },
  { key: 'art', label: 'Искусство', icon: <Camera size={18} />, color: '#7c3aed' },
  { key: 'tech', label: 'Технологии', icon: <Monitor size={18} />, color: '#db2777' },
];

const STEP_TYPES: { key: StepType; icon: React.ReactNode; label: string; desc: string; color: string }[] = [
  { key: 'action', icon: <Type size={20} />, label: 'Действие', desc: 'Текстовое задание или инструкция', color: '#FF385C' },
  { key: 'upload', icon: <FileUp size={20} />, label: 'Загрузка данных', desc: 'Фото, видео, файл, аудио, геолокация', color: '#16a34a' },
  { key: 'survey', icon: <ListChecks size={20} />, label: 'Опрос', desc: 'Тест или голосование', color: '#2563eb' },
];

const CANCELLATION_LABELS: Record<string, { label: string; desc: string }> = {};

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

const ACHIEVEMENT_ICONS = ['🏆', '🎯', '🌟', '💪', '🎖️', '🏅', '🥇', '🥈', '🥉', '⭐', '✨', '🎪', '🎭', '🎬', '🎤', '🎵', '📚', '💻', '🎮', '🏃', '🚴', '🏊', '🧗', '🎯', '♟️', '🎸', '🎹', '🖌️', '📷', '🎬'];

const PLACEHOLDER = 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=800&q=80';
const uid = () => Math.random().toString(36).slice(2, 10);

export default function NewChallengePage() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<FormData>({
    title: '', description: '', category: '', coverImage: '',
    format: 'ONLINE', challengeType: 'OPEN',
    country: 'Россия', region: '', city: '', address: '',
    latitude: null, longitude: null,
    startDate: '', endDate: '', startTime: '', endTime: '',
    maxParticipants: 100, entryFee: 0,
    requirements: '', minAge: '', maxAge: '', gender: '',
    steps: [],
    selectedAchievements: [],
    customAchievement: null,
    rewardTitle: '', rewardDescription: '',
  });
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState(false);
  const [animDir, setAnimDir] = useState<'in' | 'out'>('in');
  const [showMapPick, setShowMapPick] = useState(false);
  const { toast } = useToast();

  const update = (p: Partial<FormData>) => setData(d => ({ ...d, ...p }));
  const go = (to: number) => { setAnimDir('out'); setTimeout(() => { setStep(to); setAnimDir('in'); }, 180); };
  const addStep = (type: StepType) => update({ steps: [...data.steps, { id: uid(), type, title: '', description: '', points: 50, options: type === 'survey' ? ['', ''] : undefined }] });
  const updateStep = (id: string, p: Partial<Step>) => update({ steps: data.steps.map(s => s.id === id ? { ...s, ...p } : s) });
  const removeStep = (id: string) => update({ steps: data.steps.filter(s => s.id !== id) });
  const moveStep = (f: number, t: number) => { const a = [...data.steps]; const [item] = a.splice(f, 1); a.splice(t, 0, item); update({ steps: a }); };

  const LABELS = ['Основы', 'Настройки', 'Этапы', 'Награды', 'Обзор'];
  const catObj = CATEGORIES.find(c => c.key === data.category);
  const progress = ((step + 1) / 5) * 100;

  const canNext = step === 0 ? !!data.title && !!data.category
    : step === 1 ? true
    : step === 2 ? data.steps.length > 0
    : true;

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
        steps: data.steps.map(s => ({
          type: s.type, title: s.title, description: s.description,
          points: s.points, options: s.options, correctIndex: s.correctIndex,
          location: s.location, criteria: s.criteria, verification: s.verification,
        })),
      });
      if (r?.error) { setError(r.error); return; }
      if (!r?.success || !r?.challengeId) { setError('Ошибка создания челенджа'); return; }
      window.location.href = `/dashboard/challenges/${r.challengeId}/publish`;
    } catch { setError('Ошибка сети'); } finally { setPublishing(false); }
  };

  const formatLabel = data.format === 'ONLINE' ? 'Онлайн' : data.format === 'OFFLINE' ? 'Офлайн' : 'Гибрид';
  const typeLabel = data.challengeType === 'OPEN' ? 'Открытый' : 'Закрытый';

  return (
    <PageShell>
      <div className="cc">
        <header className="cc-header">
          <Link href="/dashboard" className="cc-h-back"><ChevronLeft size={18} /> Назад</Link>
          <div className="cc-stepper">
            {LABELS.map((l, i) => (
              <button key={i} className={`cc-s ${i === step ? 'on' : ''} ${i < step ? 'done' : ''}`} onClick={() => i <= step && go(i)}>
                <div className="cc-s-circle">{i < step ? <Check size={13} /> : i + 1}</div>
                <span className="cc-s-text">{l}</span>
              </button>
            ))}
            <div className="cc-s-track"><div className="cc-s-fill" style={{ width: `${progress}%` }} /></div>
          </div>
          <button className="cc-h-preview" onClick={() => setPreview(!preview)}><Eye size={15} /> Превью</button>
        </header>

        <div className="cc-layout">
          <main className="cc-main">
            <div className={`cc-slide ${animDir}`}>

              {/* ─── ШАГ 1: ОСНОВЫ ─── */}
              {step === 0 && (
                <section className="cc-section">
                  <div className="cc-sh"><div className="cc-sh-icon" style={{ background: '#FF385C' }}><Target size={18} color="#fff" /></div><div><h2>Основы челенджа</h2><p>Начни с главного</p></div></div>
                  <div className="cc-f"><label>Название *</label><input className="cc-in cc-in--lg" placeholder="Например: Забег на 5 км" value={data.title} onChange={e => update({ title: e.target.value })} maxLength={100} /><span className="cc-f-hint">{data.title.length}/100</span></div>
                  <div className="cc-f"><label>Описание</label><textarea className="cc-ta" rows={3} placeholder="Расскажи о челендже..." value={data.description} onChange={e => update({ description: e.target.value })} /></div>
                  <div className="cc-f"><label>Категория *</label>
                    <div className="cc-cats">{CATEGORIES.map(c => (
                      <button key={c.key} className={`cc-cat ${data.category === c.key ? 'on' : ''}`} onClick={() => update({ category: c.key })} style={{ '--c': c.color } as any}>
                        <span className="cc-cat-icon" style={{ color: c.color }}>{c.icon}</span><span>{c.label}</span>
                        {data.category === c.key && <span className="cc-cat-ok"><Check size={11} /></span>}
                      </button>
                    ))}</div>
                  </div>
                  <div className="cc-f"><label>Обложка</label>
                    <FileUpload
                      onUpload={(url) => update({ coverImage: url })}
                      bucket="challenges" folder="covers"
                      accept="image/jpeg,image/png,image/webp"
                      maxSize={20} label="Загрузить обложку (фото до 20 МБ)"
                    />
                  </div>
                </section>
              )}

              {/* ─── ШАГ 2: НАСТРОЙКИ ─── */}
              {step === 1 && (
                <section className="cc-section">
                  <div className="cc-sh"><div className="cc-sh-icon" style={{ background: '#2563eb' }}><Settings2 size={18} color="#fff" /></div><div><h2>Настройки</h2><p>Формат, время, ограничения</p></div></div>

                  {/* Формат */}
                  <div className="cc-f"><label>Формат проведения</label>
                    <div className="cc-pills">
                      {([['ONLINE', 'Онлайн', <Globe size={15} />], ['OFFLINE', 'Офлайн', <MapPin size={15} />], ['HYBRID', 'Гибрид', <Globe size={15} />]] as const).map(([val, lbl, icon]) => (
                        <button key={val} className={`cc-pill ${data.format === val ? 'on' : ''}`} onClick={() => update({ format: val as any })}>{icon} {lbl}</button>
                      ))}
                    </div>
                  </div>

                  {/* Тип */}
                  <div className="cc-f"><label>Тип мероприятия</label>
                    <div className="cc-pills">
                      <button className={`cc-pill ${data.challengeType === 'OPEN' ? 'on' : ''}`} onClick={() => update({ challengeType: 'OPEN' })}>
                        <Users size={15} /> Открытый <span className="cc-pill-hint">— участвовать может каждый</span>
                      </button>
                      <button className={`cc-pill ${data.challengeType === 'CLOSED' ? 'on' : ''}`} onClick={() => update({ challengeType: 'CLOSED' })}>
                        <Lock size={15} /> Закрытый <span className="cc-pill-hint">— организатор согласовывает</span>
                      </button>
                    </div>
                  </div>

                  {/* География */}
                  {data.format !== 'ONLINE' && (
                    <div className="cc-f"><label>География проведения</label>
                      <div className="cc-grid-2">
                        <div className="cc-set"><div className="cc-set-i" style={{ background: '#2563eb12', color: '#2563eb' }}><Globe size={16} /></div><div className="cc-set-b"><label>Страна</label><input value={data.country} onChange={e => update({ country: e.target.value })} placeholder="Россия" /></div></div>
                        <div className="cc-set"><div className="cc-set-i" style={{ background: '#16a34a12', color: '#16a34a' }}><MapPin size={16} /></div><div className="cc-set-b"><label>Регион</label><input value={data.region} onChange={e => update({ region: e.target.value })} placeholder="Тамбовская область" /></div></div>
                        <div className="cc-set"><div className="cc-set-i" style={{ background: '#d9770612', color: '#d97706' }}><MapPin size={16} /></div><div className="cc-set-b"><label>Город</label><input value={data.city} onChange={e => update({ city: e.target.value })} placeholder="Тамбов" /></div></div>
                        <div className="cc-set"><div className="cc-set-i" style={{ background: '#7c3aed12', color: '#7c3aed' }}><Map size={16} /></div><div className="cc-set-b"><label>Адрес</label><input value={data.address} onChange={e => update({ address: e.target.value })} placeholder="ул. Чичерина, 17" /></div></div>
                      </div>
                      <div className="cc-map-row">
                        <button className="cc-map-btn" onClick={() => setShowMapPick(!showMapPick)}>
                          <MapPin size={14} /> {data.latitude ? 'Координаты установлены' : 'Указать на карте'}
                        </button>
                        {data.latitude && data.longitude && (
                          <span className="cc-map-coords">{data.latitude.toFixed(5)}, {data.longitude.toFixed(5)}</span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Даты и время */}
                  <div className="cc-f"><label>Дата и время проведения</label>
                    <div className="cc-grid-2">
                      <div className="cc-set"><div className="cc-set-i" style={{ background: '#16a34a12', color: '#16a34a' }}><Calendar size={16} /></div><div className="cc-set-b"><label>Начало</label><input type="date" value={data.startDate} onChange={e => update({ startDate: e.target.value })} /></div></div>
                      <div className="cc-set"><div className="cc-set-i" style={{ background: '#dc262612', color: '#dc2626' }}><Calendar size={16} /></div><div className="cc-set-b"><label>Окончание</label><input type="date" value={data.endDate} onChange={e => update({ endDate: e.target.value })} /></div></div>
                      <div className="cc-set"><div className="cc-set-i" style={{ background: '#FF385C12', color: '#FF385C' }}><Clock size={16} /></div><div className="cc-set-b"><label>Время начала</label><input type="time" value={data.startTime} onChange={e => update({ startTime: e.target.value })} /></div></div>
                      <div className="cc-set"><div className="cc-set-i" style={{ background: '#d9770612', color: '#d97706' }}><Clock size={16} /></div><div className="cc-set-b"><label>Время окончания</label><input type="time" value={data.endTime} onChange={e => update({ endTime: e.target.value })} /></div></div>
                    </div>
                  </div>

                  {/* Лимиты */}
                  <div className="cc-grid-2">
                    <div className="cc-f"><label>Макс. участников</label><input className="cc-in" type="number" value={data.maxParticipants} onChange={e => update({ maxParticipants: parseInt(e.target.value) || 0 })} /></div>
                    <div className="cc-f"><label>Взнос (₽)</label><input className="cc-in" type="number" value={data.entryFee} onChange={e => update({ entryFee: parseInt(e.target.value) || 0 })} /></div>
                  </div>

                  {/* Требования */}
                  <div className="cc-f"><label>Требования к участникам</label><textarea className="cc-ta" rows={2} placeholder="Необходимые навыки, инвентарь, информация..." value={data.requirements} onChange={e => update({ requirements: e.target.value })} /></div>

                  {/* Ограничения */}
                  <div className="cc-f"><label>Ограничения для участников</label>
                    <div className="cc-grid-3">
                      <div className="cc-f"><label>Мин. возраст</label><input className="cc-in" type="number" min={0} max={120} value={data.minAge} onChange={e => update({ minAge: e.target.value === '' ? '' : parseInt(e.target.value) || '' })} placeholder="—" /></div>
                      <div className="cc-f"><label>Макс. возраст</label><input className="cc-in" type="number" min={0} max={120} value={data.maxAge} onChange={e => update({ maxAge: e.target.value === '' ? '' : parseInt(e.target.value) || '' })} placeholder="—" /></div>
                      <div className="cc-f"><label>Пол</label>
                        <select className="cc-in" value={data.gender} onChange={e => update({ gender: e.target.value })}>
                          <option value="">Все</option>
                          <option value="male">Мужской</option>
                          <option value="female">Женский</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="cc-cancel-note">
                    <AlertTriangle size={14} />
                    <span>Правила отмены устанавливаются площадкой при модерации. Средства перечисляются организатору через 3–7 дней после проведения.</span>
                  </div>
                </section>
              )}

              {/* ─── ШАГ 3: ЭТАПЫ ─── */}
              {step === 2 && (
                <section className="cc-section">
                  <div className="cc-sh"><div className="cc-sh-icon" style={{ background: '#16a34a' }}><Target size={18} color="#fff" /></div><div><h2>Этапы</h2><p>{data.steps.length} этапов</p></div></div>
                  <div className="cc-types">{STEP_TYPES.map(t => (
                    <button key={t.key} className="cc-type" onClick={() => addStep(t.key)}>
                      <div className="cc-type-icon" style={{ background: t.color, color: '#fff' }}>{t.icon}</div>
                      <div className="cc-type-text"><strong>{t.label}</strong><span>{t.desc}</span></div>
                    </button>
                  ))}</div>
                  <div className="cc-list">
                    {data.steps.length === 0 && <div className="cc-list-empty"><Target size={32} color="#ddd" /><p>Добавь первый этап</p></div>}
                    {data.steps.map((s, i) => {
                      const st = STEP_TYPES.find(t => t.key === s.type)!;
                      return (
                        <div key={s.id} className={`cc-card ${dragIdx === i ? 'drag' : ''} ${dragOver === i ? 'over' : ''}`}
                          draggable onDragStart={() => setDragIdx(i)} onDragOver={e => { e.preventDefault(); setDragOver(i); }}
                          onDragLeave={() => setDragOver(null)} onDrop={() => { if (dragIdx !== null && dragIdx !== i) moveStep(dragIdx, i); setDragIdx(null); setDragOver(null); }} onDragEnd={() => { setDragIdx(null); setDragOver(null); }}>
                          <div className="cc-card-grip"><GripVertical size={14} /></div>
                          <div className="cc-card-num" style={{ background: st.color }}>{i + 1}</div>
                          <div className="cc-card-body">
                            <div className="cc-card-top"><span className="cc-card-badge" style={{ color: st.color, background: `${st.color}10` }}>{st.icon} {st.label}</span><button className="cc-card-del" onClick={() => removeStep(s.id)}><Trash2 size={13} /></button></div>
                            <input className="cc-card-title" placeholder="Название этапа..." value={s.title} onChange={e => updateStep(s.id, { title: e.target.value })} />
                            <textarea className="cc-card-desc" rows={1} placeholder="Инструкция..." value={s.description} onChange={e => updateStep(s.id, { description: e.target.value })} />
                            <div className="cc-card-criteria">
                              <input className="cc-criteria-input" placeholder="Критерии приёма (при проверке организатором)" value={s.criteria || ''} onChange={e => updateStep(s.id, { criteria: e.target.value })} />
                            </div>
                            <div className="cc-card-foot">
                              {s.type === 'survey' && <div className="cc-opts">{(s.options || []).map((o, oi) => (<div key={oi} className="cc-opt"><button className={`cc-opt-r ${s.correctIndex === oi ? 'on' : ''}`} onClick={() => updateStep(s.id, { correctIndex: oi })}><Check size={9} /></button><input placeholder={`Вариант ${oi + 1}`} value={o} onChange={e => { const opts = [...(s.options || [])]; opts[oi] = e.target.value; updateStep(s.id, { options: opts }); }} />{(s.options || []).length > 2 && <button className="cc-opt-x" onClick={() => updateStep(s.id, { options: (s.options || []).filter((_, j) => j !== oi) })}><X size={10} /></button>}</div>))}<button className="cc-opt-add" onClick={() => updateStep(s.id, { options: [...(s.options || []), ''] })}><Plus size={10} /> Вариант</button></div>}
                              {s.type === 'upload' && <span className="cc-verify-hint">Участник загрузит: фото, видео, файл, аудио или геолокацию</span>}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* ─── ШАГ 4: НАГРАДЫ ─── */}
              {step === 3 && (
                <section className="cc-section">
                  <div className="cc-sh"><div className="cc-sh-icon" style={{ background: '#d97706' }}><Award size={18} color="#fff" /></div><div><h2>Награды и достижения</h2><p>Выбери достижения и награду</p></div></div>

                  {/* Достижения */}
                  <div className="cc-f"><label>Достижения</label>
                    <div className="cc-ach-grid">
                      {PRESET_ACHIEVEMENTS.map(a => {
                        const selected = data.selectedAchievements.includes(a.key);
                        return (
                          <button key={a.key} className={`cc-ach ${selected ? 'on' : ''}`} onClick={() => {
                            const next = selected
                              ? data.selectedAchievements.filter(k => k !== a.key)
                              : [...data.selectedAchievements, a.key];
                            update({ selectedAchievements: next });
                          }}>
                            <span className="cc-ach-icon">{a.icon}</span>
                            <span className="cc-ach-name">{a.name}</span>
                            {selected && <span className="cc-ach-ok"><Check size={10} /></span>}
                          </button>
                        );
                      })}
                      {/* Кнопка «Создать» */}
                      <button className="cc-ach cc-ach--add" onClick={() => update({ customAchievement: { name: '', description: '', icon: '🏆' } })}>
                        <span className="cc-ach-icon">+</span>
                        <span className="cc-ach-name">Добавить достижение</span>
                      </button>
                    </div>
                  </div>

                  {/* Кастомное достижение (модалка) */}
                  {data.customAchievement && (
                    <div className="cc-custom-ach">
                      <h4>Новое достижение</h4>
                      <div className="cc-f"><label>Название</label><input className="cc-in" value={data.customAchievement.name} onChange={e => update({ customAchievement: { ...data.customAchievement!, name: e.target.value } })} placeholder="Например: Покоритель вершин" /></div>
                      <div className="cc-f"><label>За что</label><input className="cc-in" value={data.customAchievement.description} onChange={e => update({ customAchievement: { ...data.customAchievement!, description: e.target.value } })} placeholder="Описание достижения" /></div>
                      <div className="cc-f"><label>Иконка</label>
                        <div className="cc-icon-grid">{ACHIEVEMENT_ICONS.map(icon => (
                          <button key={icon} className={`cc-icon-btn ${data.customAchievement?.icon === icon ? 'on' : ''}`} onClick={() => update({ customAchievement: { ...data.customAchievement!, icon } })}>{icon}</button>
                        ))}</div>
                      </div>
                      <div className="cc-custom-actions">
                        <button className="cc-btn cc-btn--back" onClick={() => update({ customAchievement: null })}>Отмена</button>
                        <button className="cc-btn cc-btn--next" onClick={() => {
                          if (data.customAchievement?.name) {
                            update({ customAchievement: null });
                            toast('success', 'Достижение отправлено на модерацию');
                          }
                        }}>Добавить</button>
                      </div>
                    </div>
                  )}

                  {/* Награда */}
                  <div className="cc-f"><label>Название награды</label><input className="cc-in" placeholder="Кроссовки Nike Air Max" value={data.rewardTitle} onChange={e => update({ rewardTitle: e.target.value })} /></div>
                  <div className="cc-f"><label>Описание награды</label><textarea className="cc-ta" rows={2} placeholder="Что получит победитель..." value={data.rewardDescription} onChange={e => update({ rewardDescription: e.target.value })} /></div>
                </section>
              )}

              {/* ─── ШАГ 5: ОБЗОР ─── */}
              {step === 4 && (
                <section className="cc-section">
                  <div className="cc-sh"><div className="cc-sh-icon" style={{ background: '#7c3aed' }}><Eye size={18} color="#fff" /></div><div><h2>Обзор</h2><p>Проверь перед публикацией</p></div></div>
                  <div className="cc-rv">
                    <div className="cc-rv-head"><img src={data.coverImage || PLACEHOLDER} alt="" /><div><span>{catObj?.label || 'Без категории'}</span><h3>{data.title || 'Без названия'}</h3><p>{data.description || 'Без описания'}</p></div></div>
                    <div className="cc-rv-settings">
                      <div className="cc-rv-tag"><Globe size={13} /> {formatLabel}</div>
                      <div className="cc-rv-tag"><Users size={13} /> {typeLabel}</div>
                      {data.format !== 'ONLINE' && data.city && <div className="cc-rv-tag"><MapPin size={13} /> {data.city}</div>}
                      {data.startDate && <div className="cc-rv-tag"><Calendar size={13} /> {data.startDate}{data.startTime ? ` ${data.startTime}` : ''}</div>}
                      {data.maxParticipants > 0 && <div className="cc-rv-tag"><Users size={13} /> {data.maxParticipants} мест</div>}
                      {data.entryFee > 0 && <div className="cc-rv-tag"><DollarSign size={13} /> {data.entryFee}₽</div>}
                    </div>
                    {data.steps.length > 0 && <div className="cc-rv-list">{data.steps.map((s, i) => { const st = STEP_TYPES.find(t => t.key === s.type)!; return <div key={s.id} className="cc-rv-step"><div className="cc-rv-step-n" style={{ background: st.color }}>{i + 1}</div><div><strong>{s.title || 'Без названия'}</strong><span>{st.label}</span></div></div>; })}</div>}
                    {data.selectedAchievements.length > 0 && <div className="cc-rv-reward"><Star size={16} /><div><strong>{data.selectedAchievements.length} достижений</strong><span>{data.selectedAchievements.map(k => PRESET_ACHIEVEMENTS.find(a => a.key === k)?.icon || '').join(' ')}</span></div></div>}
                    {data.rewardTitle && <div className="cc-rv-reward"><Award size={16} /><div><strong>{data.rewardTitle}</strong><span>{data.rewardDescription}</span></div></div>}
                  </div>
                  {error && <div className="cc-error">{error}</div>}
                </section>
              )}
            </div>

            <div className="cc-nav">
              {step > 0 && <button className="cc-btn cc-btn--back" onClick={() => go(step - 1)}><ChevronLeft size={15} /> Назад</button>}
              <div style={{ flex: 1 }} />
              {step < 4 ? (
                <button className="cc-btn cc-btn--next" disabled={!canNext} onClick={() => go(step + 1)}>Далее <ArrowRight size={15} /></button>
              ) : (
                <button className="cc-btn cc-btn--pub" onClick={handlePublish} disabled={publishing}>{publishing ? <Spinner size={14} /> : <><Zap size={15} /> Опубликовать</>}</button>
              )}
            </div>
          </main>
        </div>
      </div>

      <style>{`
        .cc { min-height: 100vh; display: flex; flex-direction: column; background: #f4f4f5; }
        .cc-header { position: sticky; top: 0; z-index: 50; background: rgba(255,255,255,0.88); backdrop-filter: blur(16px); border-bottom: 1px solid #e4e4e7; padding: 8px clamp(16px, 3vw, 32px); display: flex; align-items: center; gap: 12px; }
        .cc-h-back { display: flex; align-items: center; gap: 2px; font-size: 13px; font-weight: 700; color: #71717a; text-decoration: none; padding: 7px 10px; border-radius: 8px; transition: all 0.15s; flex-shrink: 0; }
        .cc-h-back:hover { background: #f4f4f5; color: #18181b; }
        .cc-h-preview { display: flex; align-items: center; gap: 5px; padding: 7px 12px; border-radius: 8px; border: 1px solid #e4e4e7; background: #fff; font-size: 12px; font-weight: 700; color: #71717a; cursor: pointer; transition: all 0.15s; flex-shrink: 0; }
        .cc-h-preview:hover { border-color: #a1a1aa; color: #18181b; }
        .cc-stepper { flex: 1; display: flex; align-items: center; position: relative; }
        .cc-s { display: flex; flex-direction: column; align-items: center; gap: 3px; background: none; border: none; cursor: pointer; padding: 0 10px; position: relative; z-index: 1; }
        .cc-s-circle { width: 28px; height: 28px; border-radius: 50%; background: #e4e4e7; color: #a1a1aa; display: grid; place-items: center; font-size: 11px; font-weight: 800; transition: all 0.25s cubic-bezier(0.4,0,0.2,1); }
        .cc-s.on .cc-s-circle { background: #FF385C; color: #fff; box-shadow: 0 0 0 4px rgba(255,56,92,0.12); }
        .cc-s.done .cc-s-circle { background: #16a34a; color: #fff; }
        .cc-s-text { font-size: 10px; font-weight: 700; color: #a1a1aa; white-space: nowrap; }
        .cc-s.on .cc-s-text { color: #FF385C; }
        .cc-s.done .cc-s-text { color: #16a34a; }
        .cc-s-track { position: absolute; top: 14px; left: 48px; right: 48px; height: 2px; background: #e4e4e7; z-index: 0; }
        .cc-s-fill { height: 100%; background: linear-gradient(90deg, #16a34a, #FF385C); border-radius: 99px; transition: width 0.4s cubic-bezier(0.4,0,0.2,1); }
        .cc-layout { flex: 1; display: flex; }
        .cc-main { flex: 1; max-width: 700px; margin: 0 auto; padding: 24px 16px 100px; min-width: 0; }
        .cc-slide.in { animation: slideIn 0.25s ease both; }
        .cc-slide.out { animation: slideOut 0.15s ease both; }
        @keyframes slideIn { from { opacity: 0; transform: translateX(16px); } to { opacity: 1; transform: none; } }
        @keyframes slideOut { from { opacity: 1; } to { opacity: 0; transform: translateX(-16px); } }
        .cc-section { display: flex; flex-direction: column; gap: 18px; }
        .cc-sh { display: flex; align-items: center; gap: 12px; }
        .cc-sh-icon { width: 38px; height: 38px; border-radius: 10px; display: grid; place-items: center; flex-shrink: 0; }
        .cc-sh h2 { font-size: 18px; font-weight: 800; margin: 0; color: #18181b; }
        .cc-sh p { font-size: 12px; color: #71717a; margin: 1px 0 0; }
        .cc-f { display: flex; flex-direction: column; gap: 5px; }
        .cc-f label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #a1a1aa; }
        .cc-f-hint { font-size: 10px; color: #d4d4d8; text-align: right; }
        .cc-in, .cc-ta, select.cc-in { padding: 11px 14px; border: 1.5px solid #e4e4e7; border-radius: 10px; font-size: 14px; background: #fff; outline: none; transition: border-color 0.15s, box-shadow 0.15s; width: 100%; }
        .cc-in:focus, .cc-ta:focus, select.cc-in:focus { border-color: #FF385C; box-shadow: 0 0 0 3px rgba(255,56,92,0.06); }
        .cc-in--lg { font-size: 17px; font-weight: 700; padding: 14px; }
        .cc-ta { resize: vertical; font-family: inherit; }
        .cc-cats { display: flex; gap: 8px; flex-wrap: wrap; }
        .cc-cat { display: flex; align-items: center; gap: 7px; padding: 10px 14px; border-radius: 10px; border: 1.5px solid #e4e4e7; background: #fff; cursor: pointer; transition: all 0.2s; position: relative; }
        .cc-cat:hover { border-color: var(--c); }
        .cc-cat.on { border-color: var(--c); background: color-mix(in srgb, var(--c) 6%, #fff); }
        .cc-cat-icon { transition: transform 0.2s; }
        .cc-cat.on .cc-cat-icon { transform: scale(1.12); }
        .cc-cat span:not(.cc-cat-icon):not(.cc-cat-ok) { font-size: 13px; font-weight: 700; color: #3f3f46; }
        .cc-cat-ok { position: absolute; top: -5px; right: -5px; width: 16px; height: 16px; border-radius: 50%; background: var(--c); color: #fff; display: grid; place-items: center; animation: pop 0.2s cubic-bezier(0.34,1.56,0.64,1); }
        @keyframes pop { from { transform: scale(0); } to { transform: scale(1); } }
        .cc-types { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
        .cc-type { display: flex; align-items: center; gap: 10px; padding: 12px; border-radius: 10px; border: 1.5px solid #e4e4e7; background: #fff; cursor: pointer; transition: all 0.2s; }
        .cc-type:hover { border-color: #a1a1aa; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.04); }
        .cc-type-icon { width: 36px; height: 36px; border-radius: 8px; display: grid; place-items: center; flex-shrink: 0; }
        .cc-type-text { text-align: left; }
        .cc-type-text strong { display: block; font-size: 12px; font-weight: 700; color: #18181b; }
        .cc-type-text span { font-size: 10px; color: #a1a1aa; }
        .cc-list { display: flex; flex-direction: column; gap: 8px; }
        .cc-list-empty { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 36px; color: #d4d4d8; }
        .cc-list-empty p { font-size: 13px; font-weight: 700; color: #a1a1aa; margin: 0; }
        .cc-card { display: flex; gap: 8px; background: #fff; border-radius: 12px; padding: 12px; border: 1.5px solid #f0f0f0; transition: all 0.15s; cursor: grab; }
        .cc-card:hover { border-color: #e4e4e7; }
        .cc-card.drag { opacity: 0.4; }
        .cc-card.over { border-color: #FF385C; background: #fff5f7; }
        .cc-card-grip { color: #d4d4d8; display: flex; align-items: flex-start; padding-top: 2px; }
        .cc-card-num { width: 24px; height: 24px; border-radius: 50%; color: #fff; display: grid; place-items: center; font-size: 10px; font-weight: 800; flex-shrink: 0; }
        .cc-card-body { flex: 1; display: flex; flex-direction: column; gap: 5px; min-width: 0; }
        .cc-card-top { display: flex; justify-content: space-between; align-items: center; }
        .cc-card-badge { display: flex; align-items: center; gap: 4px; font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 5px; }
        .cc-card-del { background: none; border: none; color: #d4d4d8; cursor: pointer; padding: 2px; border-radius: 4px; transition: all 0.1s; }
        .cc-card-del:hover { color: #dc2626; background: #fef2f2; }
        .cc-card-title { border: none; font-size: 13px; font-weight: 700; color: #18181b; outline: none; padding: 0; background: transparent; }
        .cc-card-desc { border: none; font-size: 11px; color: #a1a1aa; outline: none; padding: 0; background: transparent; resize: none; font-family: inherit; }
        .cc-card-foot { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-top: 1px; }
        .cc-opts { display: flex; flex-direction: column; gap: 3px; width: 100%; }
        .cc-opt { display: flex; align-items: center; gap: 4px; }
        .cc-opt-r { width: 16px; height: 16px; border-radius: 50%; border: 1.5px solid #d4d4d8; background: #fff; display: grid; place-items: center; cursor: pointer; color: transparent; transition: all 0.1s; flex-shrink: 0; }
        .cc-opt-r.on { border-color: #16a34a; background: #16a34a; color: #fff; }
        .cc-opt input { flex: 1; border: 1px solid #e4e4e7; border-radius: 5px; padding: 4px 7px; font-size: 11px; outline: none; }
        .cc-opt input:focus { border-color: #FF385C; }
        .cc-opt-x { background: none; border: none; color: #d4d4d8; cursor: pointer; }
        .cc-opt-x:hover { color: #dc2626; }
        .cc-opt-add { align-self: flex-start; background: none; border: 1px dashed #FF385C; color: #FF385C; padding: 2px 7px; border-radius: 5px; font-size: 10px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 2px; }
        .cc-verify-hint { font-size: 11px; color: #16a34a; font-weight: 600; }
        .cc-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .cc-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; }
        .cc-set { display: flex; gap: 10px; align-items: center; background: #fff; border-radius: 10px; padding: 14px; border: 1.5px solid #f0f0f0; }
        .cc-set-i { width: 32px; height: 32px; border-radius: 8px; display: grid; place-items: center; flex-shrink: 0; }
        .cc-set-b { flex: 1; display: flex; flex-direction: column; gap: 3px; }
        .cc-set-b label { font-size: 10px; font-weight: 700; color: #a1a1aa; text-transform: uppercase; }
        .cc-set-b input { border: 1px solid #e4e4e7; border-radius: 6px; padding: 7px 8px; font-size: 12px; outline: none; width: 100%; }
        .cc-set-b input:focus { border-color: #FF385C; }
        .cc-pills { display: flex; gap: 8px; flex-wrap: wrap; }
        .cc-pill { display: flex; align-items: center; gap: 6px; padding: 10px 16px; border-radius: 10px; border: 1.5px solid #e4e4e7; background: #fff; font-size: 13px; font-weight: 700; color: #3f3f46; cursor: pointer; transition: all 0.2s; }
        .cc-pill:hover { border-color: #FF385C; }
        .cc-pill.on { border-color: #FF385C; background: #fff5f7; color: #FF385C; }
        .cc-pill-hint { font-size: 11px; color: #a1a1aa; font-weight: 500; }
        .cc-pill.on .cc-pill-hint { color: #e03e5c; }
        .cc-map-row { display: flex; align-items: center; gap: 10px; margin-top: 4px; }
        .cc-map-btn { display: flex; align-items: center; gap: 6px; padding: 8px 14px; border-radius: 8px; border: 1px dashed #e4e4e7; background: #fff; font-size: 12px; font-weight: 600; color: #71717a; cursor: pointer; transition: all 0.15s; }
        .cc-map-btn:hover { border-color: #FF385C; color: #FF385C; }
        .cc-map-coords { font-size: 11px; color: #a1a1aa; font-family: monospace; }
        .cc-cancel-opts { display: flex; flex-direction: column; gap: 8px; }
        .cc-cancel-opt { display: flex; align-items: flex-start; gap: 10px; padding: 12px 14px; border-radius: 10px; border: 1.5px solid #e4e4e7; background: #fff; cursor: pointer; text-align: left; transition: all 0.2s; }
        .cc-cancel-opt:hover { border-color: #a1a1aa; }
        .cc-cancel-opt.on { border-color: #FF385C; background: #fff5f7; }
        .cc-cancel-radio { width: 18px; height: 18px; border-radius: 50%; border: 2px solid #d4d4d8; display: grid; place-items: center; flex-shrink: 0; margin-top: 1px; color: transparent; transition: all 0.2s; }
        .cc-cancel-opt.on .cc-cancel-radio { border-color: #FF385C; background: #FF385C; color: #fff; }
        .cc-cancel-opt strong { font-size: 13px; font-weight: 700; color: #18181b; display: block; }
        .cc-cancel-opt span { font-size: 11px; color: #a1a1aa; display: block; margin-top: 2px; }
        .cc-cancel-note { display: flex; align-items: flex-start; gap: 8px; padding: 10px 14px; border-radius: 8px; background: #fffbeb; border: 1px solid #fde68a; margin-top: 4px; }
        .cc-cancel-note svg { color: #d97706; flex-shrink: 0; margin-top: 1px; }
        .cc-cancel-note span { font-size: 11px; color: #92400e; line-height: 1.5; }

        /* Achievements grid */
        .cc-ach-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 8px; }
        .cc-ach { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 12px 8px; border-radius: 10px; border: 1.5px solid #e4e4e7; background: #fff; cursor: pointer; transition: all 0.2s; position: relative; }
        .cc-ach:hover { border-color: #a1a1aa; transform: translateY(-1px); }
        .cc-ach.on { border-color: #FF385C; background: #fff5f7; }
        .cc-ach-icon { font-size: 24px; transition: transform 0.2s; }
        .cc-ach.on .cc-ach-icon { transform: scale(1.15); }
        .cc-ach-name { font-size: 11px; font-weight: 700; color: #3f3f46; text-align: center; }
        .cc-ach-ok { position: absolute; top: 4px; right: 4px; width: 16px; height: 16px; border-radius: 50%; background: #FF385C; color: #fff; display: grid; place-items: center; animation: pop 0.2s cubic-bezier(0.34,1.56,0.64,1); }
        .cc-ach--add { border-style: dashed; color: #a1a1aa; }
        .cc-ach--add:hover { border-color: #FF385C; color: #FF385C; }
        .cc-ach--add .cc-ach-icon { font-size: 20px; font-weight: 800; }

        /* Custom achievement modal */
        .cc-custom-ach { background: #fafafa; border: 1px solid #e4e4e7; border-radius: 12px; padding: 16px; display: flex; flex-direction: column; gap: 12px; }
        .cc-custom-ach h4 { font-size: 14px; font-weight: 800; margin: 0; color: #18181b; }
        .cc-custom-actions { display: flex; gap: 8px; justify-content: flex-end; }

        /* Icon picker */
        .cc-icon-grid { display: flex; flex-wrap: wrap; gap: 4px; }
        .cc-icon-btn { width: 36px; height: 36px; border-radius: 8px; border: 1.5px solid #e4e4e7; background: #fff; font-size: 18px; cursor: pointer; display: grid; place-items: center; transition: all 0.15s; }
        .cc-icon-btn:hover { border-color: #a1a1aa; transform: scale(1.1); }
        .cc-icon-btn.on { border-color: #FF385C; background: #fff5f7; }

        /* Criteria input */
        .cc-card-criteria { margin-top: 4px; }
        .cc-criteria-input { width: 100%; border: 1px dashed #d4d4d8; border-radius: 5px; padding: 4px 7px; font-size: 11px; color: #71717a; outline: none; font-style: italic; }
        .cc-criteria-input:focus { border-color: #FF385C; border-style: solid; color: #18181b; }
        .cc-rv { display: flex; flex-direction: column; gap: 10px; }
        .cc-rv-head { display: flex; gap: 12px; background: #fff; border-radius: 12px; overflow: hidden; border: 1px solid #f0f0f0; }
        .cc-rv-head img { width: 160px; height: 120px; object-fit: cover; flex-shrink: 0; }
        .cc-rv-head div { padding: 12px; display: flex; flex-direction: column; gap: 3px; }
        .cc-rv-head span { font-size: 10px; font-weight: 800; color: #FF385C; text-transform: uppercase; }
        .cc-rv-head h3 { font-size: 15px; font-weight: 800; margin: 0; color: #18181b; }
        .cc-rv-head p { font-size: 12px; color: #71717a; margin: 0; }
        .cc-rv-settings { display: flex; flex-wrap: wrap; gap: 6px; }
        .cc-rv-tag { display: flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 6px; background: #f4f4f5; font-size: 11px; font-weight: 600; color: #52525b; }
        .cc-rv-list { background: #fff; border-radius: 10px; padding: 12px; border: 1px solid #f0f0f0; display: flex; flex-direction: column; gap: 4px; }
        .cc-rv-step { display: flex; align-items: center; gap: 8px; padding: 5px 0; }
        .cc-rv-step-n { width: 20px; height: 20px; border-radius: 50%; color: #fff; display: grid; place-items: center; font-size: 9px; font-weight: 800; flex-shrink: 0; }
        .cc-rv-step strong { font-size: 12px; display: block; color: #18181b; }
        .cc-rv-step span { font-size: 10px; color: #a1a1aa; }
        .cc-rv-reward { display: flex; align-items: center; gap: 8px; background: #fffbeb; border-radius: 10px; padding: 12px; border: 1px solid #fde68a; color: #92400e; }
        .cc-rv-reward div { display: flex; flex-direction: column; }
        .cc-rv-reward strong { font-size: 12px; }
        .cc-rv-reward span { font-size: 10px; color: #b45309; }
        .cc-error { background: #fef2f2; color: #dc2626; padding: 9px 12px; border-radius: 8px; font-size: 12px; font-weight: 700; border: 1px solid #fecaca; }
        .cc-nav { display: flex; align-items: center; gap: 8px; padding: 14px 0; position: sticky; bottom: 0; background: linear-gradient(transparent, #f4f4f5 30%); }
        .cc-btn { display: flex; align-items: center; gap: 4px; padding: 10px 20px; border-radius: 10px; font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.15s; border: none; }
        .cc-btn--back { background: #fff; color: #71717a; border: 1px solid #e4e4e7; }
        .cc-btn--back:hover { border-color: #a1a1aa; color: #18181b; }
        .cc-btn--next { background: #18181b; color: #fff; }
        .cc-btn--next:hover { background: #27272a; }
        .cc-btn--next:disabled { opacity: 0.3; cursor: default; }
        .cc-btn--pub { background: #FF385C; color: #fff; box-shadow: 0 2px 8px rgba(255,56,92,0.25); }
        .cc-btn--pub:hover { background: #E31C5F; transform: translateY(-1px); }
        .cc-btn--pub:disabled { opacity: 0.5; cursor: default; transform: none; }
        @media (max-width: 900px) { .cc-types { grid-template-columns: 1fr; } .cc-grid-2, .cc-grid-3 { grid-template-columns: 1fr; } .cc-s-text { display: none; } }
        @media (max-width: 600px) { .cc-main { padding: 16px 10px 80px; } .cc-sh h2 { font-size: 16px; } .cc-cats { gap: 6px; } .cc-cat { padding: 8px 10px; font-size: 12px; } .cc-btn { padding: 9px 14px; font-size: 12px; } }
      `}</style>
    </PageShell>
  );
}
