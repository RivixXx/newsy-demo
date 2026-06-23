'use client';

import React, { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  ChevronLeft, ChevronRight, Check, Plus, Trash2, GripVertical,
  Camera, MapPin, HelpCircle, Type, Image as ImageIcon,
  Trophy, Zap, Users, Globe, Calendar, DollarSign,
  Sparkles, ArrowRight, Star, Target, X, Upload, Eye
} from 'lucide-react';
import { PageShell } from '@/shared/components/page-shell';

type StepType = 'action' | 'photo' | 'geo' | 'question';

interface Step {
  id: string;
  type: StepType;
  title: string;
  description: string;
  points: number;
  options?: string[];
  correctIndex?: number;
  location?: string;
}

interface FormData {
  title: string;
  description: string;
  category: string;
  coverImage: string;
  startDate: string;
  endDate: string;
  maxParticipants: number;
  entryFee: number;
  isCooperative: boolean;
  steps: Step[];
  rewardTitle: string;
  rewardDescription: string;
}

const CATEGORIES = [
  { key: 'sport', label: 'Спорт', icon: '🏃', color: '#22c55e', bg: '#f0fdf4' },
  { key: 'education', label: 'Обучение', icon: '📚', color: '#3b82f6', bg: '#eff6ff' },
  { key: 'quest', label: 'Квесты', icon: '🗺️', color: '#f59e0b', bg: '#fffbeb' },
  { key: 'art', label: 'Искусство', icon: '🎨', color: '#8b5cf6', bg: '#f5f3ff' },
  { key: 'tech', label: 'Технологии', icon: '💡', color: '#ec4899', bg: '#fdf2f8' },
];

const STEP_TYPES: { key: StepType; icon: React.ReactNode; label: string; desc: string; color: string }[] = [
  { key: 'action', icon: <Type size={20} />, label: 'Действие', desc: 'Текстовое задание', color: '#FF385C' },
  { key: 'photo', icon: <Camera size={20} />, label: 'Фото', desc: 'Загрузка фотографии', color: '#22c55e' },
  { key: 'geo', icon: <MapPin size={20} />, label: 'Геолокация', desc: 'Подтверждение места', color: '#3b82f6' },
  { key: 'question', icon: <HelpCircle size={20} />, label: 'Вопрос', desc: 'Тест с вариантами', color: '#f59e0b' },
];

const PLACEHOLDER_IMG = 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=800&q=80';

function uid() { return Math.random().toString(36).slice(2, 10); }

export default function NewChallengePage() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<FormData>({
    title: '', description: '', category: '', coverImage: '',
    startDate: '', endDate: '', maxParticipants: 100, entryFee: 0,
    isCooperative: false, steps: [],
    rewardTitle: '', rewardDescription: '',
  });
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [preview, setPreview] = useState(false);

  const update = (patch: Partial<FormData>) => setData(d => ({ ...d, ...patch }));

  const addStep = (type: StepType) => {
    update({ steps: [...data.steps, { id: uid(), type, title: '', description: '', points: 50, options: type === 'question' ? ['', ''] : undefined }] });
  };

  const updateStep = (id: string, patch: Partial<Step>) => {
    update({ steps: data.steps.map(s => s.id === id ? { ...s, ...patch } : s) });
  };

  const removeStep = (id: string) => {
    update({ steps: data.steps.filter(s => s.id !== id) });
  };

  const moveStep = (from: number, to: number) => {
    const arr = [...data.steps];
    const [item] = arr.splice(from, 1);
    arr.splice(to, 0, item);
    update({ steps: arr });
  };

  const totalPoints = data.steps.reduce((s, st) => s + st.points, 0);
  const progress = ((step + 1) / 5) * 100;
  const canNext = step === 0 ? !!data.title && !!data.category :
                  step === 1 ? data.steps.length > 0 :
                  true;

  const STEP_LABELS = ['Основы', 'Этапы', 'Настройки', 'Награда', 'Обзор'];

  return (
    <PageShell>
      <div className="cstr">
        {/* Top bar */}
        <header className="cstr-top">
          <Link href="/dashboard" className="cstr-back"><ChevronLeft size={20} /> Назад</Link>
          <div className="cstr-progress-bar"><div className="cstr-progress-fill" style={{ width: `${progress}%` }} /></div>
          <div className="cstr-top-right">
            <span className="cstr-step-label">Шаг {step + 1} из 5</span>
            <button className="cstr-eye-btn" onClick={() => setPreview(!preview)}><Eye size={16} /></button>
          </div>
        </header>

        <div className="cstr-body">
          {/* Main content */}
          <div className={`cstr-main ${preview ? 'with-preview' : ''}`}>

            {/* STEP 0: Basics */}
            {step === 0 && (
              <div className="cstr-section fade-in">
                <div className="cstr-section-head">
                  <div className="cstr-section-icon" style={{ background: '#FF385C18', color: '#FF385C' }}><Sparkles size={22} /></div>
                  <div>
                    <h2 className="cstr-section-title">Создай свой челендж</h2>
                    <p className="cstr-section-desc">Начни с основ — придумай название и выбери категорию</p>
                  </div>
                </div>

                <div className="cstr-field">
                  <label className="cstr-label">Название челенджа *</label>
                  <input className="cstr-input cstr-input--lg" placeholder="Напр. Утренний забег на 5км" value={data.title} onChange={e => update({ title: e.target.value })} />
                </div>

                <div className="cstr-field">
                  <label className="cstr-label">Описание</label>
                  <textarea className="cstr-textarea" rows={3} placeholder="Расскажи в чём суть челенджа..." value={data.description} onChange={e => update({ description: e.target.value })} />
                </div>

                <div className="cstr-field">
                  <label className="cstr-label">Категория *</label>
                  <div className="cstr-cats">
                    {CATEGORIES.map(c => (
                      <button key={c.key} className={`cstr-cat ${data.category === c.key ? 'active' : ''}`} onClick={() => update({ category: c.key })}
                        style={{ '--cat-color': c.color, '--cat-bg': c.bg } as React.CSSProperties}>
                        <span className="cstr-cat-icon">{c.icon}</span>
                        <span className="cstr-cat-label">{c.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="cstr-field">
                  <label className="cstr-label">Обложка</label>
                  <div className="cstr-cover" onClick={() => update({ coverImage: data.coverImage ? '' : PLACEHOLDER_IMG })}>
                    {data.coverImage ? (
                      <div className="cstr-cover-img-wrap">
                        <img src={data.coverImage} alt="" className="cstr-cover-img" />
                        <button className="cstr-cover-remove" onClick={e => { e.stopPropagation(); update({ coverImage: '' }); }}><X size={14} /></button>
                      </div>
                    ) : (
                      <div className="cstr-cover-empty">
                        <Upload size={28} />
                        <span>Нажми чтобы загрузить обложку</span>
                        <span className="cstr-cover-hint">Рекомендуется 1200×800</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 1: Steps */}
            {step === 1 && (
              <div className="cstr-section fade-in">
                <div className="cstr-section-head">
                  <div className="cstr-section-icon" style={{ background: '#22c55e18', color: '#22c55e' }}><Target size={22} /></div>
                  <div>
                    <h2 className="cstr-section-title">Этапы челенджа</h2>
                    <p className="cstr-section-desc">Добавь задания, которые участники должны выполнить</p>
                  </div>
                </div>

                {/* Add step type picker */}
                <div className="cstr-add-steps">
                  {STEP_TYPES.map(t => (
                    <button key={t.key} className="cstr-add-step-btn" onClick={() => addStep(t.key)}
                      style={{ '--step-color': t.color } as React.CSSProperties}>
                      <div className="cstr-add-step-icon">{t.icon}</div>
                      <span className="cstr-add-step-label">{t.label}</span>
                      <span className="cstr-add-step-desc">{t.desc}</span>
                    </button>
                  ))}
                </div>

                {/* Steps list */}
                <div className="cstr-steps-list">
                  {data.steps.length === 0 && (
                    <div className="cstr-steps-empty">
                      <Target size={40} color="#ddd" />
                      <p>Пока нет этапов</p>
                      <span>Нажми кнопку выше чтобы добавить первый</span>
                    </div>
                  )}
                  {data.steps.map((s, i) => {
                    const st = STEP_TYPES.find(t => t.key === s.type)!;
                    return (
                      <div key={s.id} className="cstr-step-card" draggable
                        onDragStart={() => setDragIdx(i)}
                        onDragOver={e => { e.preventDefault(); }}
                        onDrop={() => { if (dragIdx !== null && dragIdx !== i) moveStep(dragIdx, i); setDragIdx(null); }}
                        onDragEnd={() => setDragIdx(null)}
                        style={{ opacity: dragIdx === i ? 0.5 : 1 }}>
                        <div className="cstr-step-grip"><GripVertical size={16} /></div>
                        <div className="cstr-step-num" style={{ background: st.color }}>{i + 1}</div>
                        <div className="cstr-step-body">
                          <div className="cstr-step-head">
                            <div className="cstr-step-type-badge" style={{ color: st.color, background: `${st.color}15` }}>
                              {st.icon} {st.label}
                            </div>
                            <button className="cstr-step-del" onClick={() => removeStep(s.id)}><Trash2 size={14} /></button>
                          </div>
                          <input className="cstr-step-title-input" placeholder="Название этапа..." value={s.title} onChange={e => updateStep(s.id, { title: e.target.value })} />
                          <textarea className="cstr-step-desc-input" rows={2} placeholder="Инструкция для участника..." value={s.description} onChange={e => updateStep(s.id, { description: e.target.value })} />
                          <div className="cstr-step-footer">
                            <div className="cstr-step-points">
                              <Zap size={13} />
                              <input type="number" value={s.points} onChange={e => updateStep(s.id, { points: parseInt(e.target.value) || 0 })} className="cstr-points-input" />
                              <span>баллов</span>
                            </div>
                            {s.type === 'question' && (
                              <div className="cstr-step-options">
                                {(s.options || []).map((opt, oi) => (
                                  <div key={oi} className="cstr-opt-row">
                                    <input type="radio" checked={s.correctIndex === oi} onChange={() => updateStep(s.id, { correctIndex: oi })} />
                                    <input className="cstr-opt-input" placeholder={`Вариант ${oi + 1}`} value={opt} onChange={e => {
                                      const opts = [...(s.options || [])]; opts[oi] = e.target.value; updateStep(s.id, { options: opts });
                                    }} />
                                    {(s.options || []).length > 2 && <button className="cstr-opt-del" onClick={() => {
                                      const opts = (s.options || []).filter((_, j) => j !== oi); updateStep(s.id, { options: opts });
                                    }}><X size={12} /></button>}
                                  </div>
                                ))}
                                <button className="cstr-opt-add" onClick={() => updateStep(s.id, { options: [...(s.options || []), ''] })}>
                                  <Plus size={12} /> Добавить вариант
                                </button>
                              </div>
                            )}
                            {s.type === 'geo' && (
                              <input className="cstr-step-geo" placeholder="Название локации..." value={s.location || ''} onChange={e => updateStep(s.id, { location: e.target.value })} />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 2: Settings */}
            {step === 2 && (
              <div className="cstr-section fade-in">
                <div className="cstr-section-head">
                  <div className="cstr-section-icon" style={{ background: '#3b82f618', color: '#3b82f6' }}><Globe size={22} /></div>
                  <div>
                    <h2 className="cstr-section-title">Настройки</h2>
                    <p className="cstr-section-desc">Определи даты, лимиты и формат участия</p>
                  </div>
                </div>

                <div className="cstr-settings-grid">
                  <div className="cstr-setting-card">
                    <div className="cstr-setting-icon" style={{ background: '#FF385C18', color: '#FF385C' }}><Calendar size={20} /></div>
                    <label className="cstr-label">Дата начала</label>
                    <input type="date" className="cstr-input" value={data.startDate} onChange={e => update({ startDate: e.target.value })} />
                  </div>
                  <div className="cstr-setting-card">
                    <div className="cstr-setting-icon" style={{ background: '#ef444418', color: '#ef4444' }}><Calendar size={20} /></div>
                    <label className="cstr-label">Дата окончания</label>
                    <input type="date" className="cstr-input" value={data.endDate} onChange={e => update({ endDate: e.target.value })} />
                  </div>
                  <div className="cstr-setting-card">
                    <div className="cstr-setting-icon" style={{ background: '#22c55e18', color: '#22c55e' }}><Users size={20} /></div>
                    <label className="cstr-label">Макс. участников</label>
                    <input type="number" className="cstr-input" value={data.maxParticipants} onChange={e => update({ maxParticipants: parseInt(e.target.value) || 0 })} />
                  </div>
                  <div className="cstr-setting-card">
                    <div className="cstr-setting-icon" style={{ background: '#f59e0b18', color: '#f59e0b' }}><DollarSign size={20} /></div>
                    <label className="cstr-label">Взнос (₽)</label>
                    <input type="number" className="cstr-input" value={data.entryFee} onChange={e => update({ entryFee: parseInt(e.target.value) || 0 })} />
                  </div>
                </div>

                <div className="cstr-toggle-card">
                  <div className="cstr-toggle-info">
                    <Users size={20} />
                    <div>
                      <h4>Кооперативный челендж</h4>
                      <p>Участники могут объединяться в команды</p>
                    </div>
                  </div>
                  <button className={`cstr-toggle ${data.isCooperative ? 'on' : ''}`} onClick={() => update({ isCooperative: !data.isCooperative })}>
                    <div className="cstr-toggle-knob" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Reward */}
            {step === 3 && (
              <div className="cstr-section fade-in">
                <div className="cstr-section-head">
                  <div className="cstr-section-icon" style={{ background: '#f59e0b18', color: '#f59e0b' }}><Trophy size={22} /></div>
                  <div>
                    <h2 className="cstr-section-title">Награда</h2>
                    <p className="cstr-section-desc">Придумай что получат участники за прохождение</p>
                  </div>
                </div>

                <div className="cstr-reward-preview">
                  <div className="cstr-reward-badge">
                    <Trophy size={32} />
                  </div>
                  <div className="cstr-reward-info">
                    <span className="cstr-reward-total">+{totalPoints} баллов</span>
                    <span>Общий приз за прохождение всех этапов</span>
                  </div>
                </div>

                <div className="cstr-field">
                  <label className="cstr-label">Название награды</label>
                  <input className="cstr-input" placeholder="Напр. Кроссовки Nike Air Max" value={data.rewardTitle} onChange={e => update({ rewardTitle: e.target.value })} />
                </div>
                <div className="cstr-field">
                  <label className="cstr-label">Описание награды</label>
                  <textarea className="cstr-textarea" rows={2} placeholder="Что именно получит победитель..." value={data.rewardDescription} onChange={e => update({ rewardDescription: e.target.value })} />
                </div>
              </div>
            )}

            {/* STEP 4: Review */}
            {step === 4 && (
              <div className="cstr-section fade-in">
                <div className="cstr-section-head">
                  <div className="cstr-section-icon" style={{ background: '#8b5cf618', color: '#8b5cf6' }}><Eye size={22} /></div>
                  <div>
                    <h2 className="cstr-section-title">Обзор</h2>
                    <p className="cstr-section-desc">Проверь всё перед публикацией</p>
                  </div>
                </div>

                <div className="cstr-review">
                  <div className="cstr-review-card">
                    <img src={data.coverImage || PLACEHOLDER_IMG} alt="" className="cstr-review-img" />
                    <div className="cstr-review-body">
                      <span className="cstr-review-cat">{CATEGORIES.find(c => c.key === data.category)?.icon} {CATEGORIES.find(c => c.key === data.category)?.label}</span>
                      <h3>{data.title || 'Без названия'}</h3>
                      <p>{data.description || 'Без описания'}</p>
                    </div>
                  </div>

                  <div className="cstr-review-stats">
                    <div className="cstr-rs-item"><span className="cstr-rs-val">{data.steps.length}</span><span className="cstr-rs-label">Этапов</span></div>
                    <div className="cstr-rs-item"><span className="cstr-rs-val">{totalPoints}</span><span className="cstr-rs-label">Баллов</span></div>
                    <div className="cstr-rs-item"><span className="cstr-rs-val">{data.maxParticipants}</span><span className="cstr-rs-label">Мест</span></div>
                    <div className="cstr-rs-item"><span className="cstr-rs-val">{data.entryFee ? `${data.entryFee}₽` : 'Бесплатно'}</span><span className="cstr-rs-label">Взнос</span></div>
                  </div>

                  {data.steps.length > 0 && (
                    <div className="cstr-review-steps">
                      <h4>Этапы</h4>
                      {data.steps.map((s, i) => {
                        const st = STEP_TYPES.find(t => t.key === s.type)!;
                        return (
                          <div key={s.id} className="cstr-rs-step">
                            <div className="cstr-rs-step-num" style={{ background: st.color }}>{i + 1}</div>
                            <div className="cstr-rs-step-info">
                              <span className="cstr-rs-step-title">{s.title || 'Без названия'}</span>
                              <span className="cstr-rs-step-meta">{st.label} · {s.points} баллов</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {data.rewardTitle && (
                    <div className="cstr-review-reward">
                      <Trophy size={20} />
                      <div>
                        <strong>{data.rewardTitle}</strong>
                        <span>{data.rewardDescription}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Nav buttons */}
            <div className="cstr-nav">
              {step > 0 && <button className="cstr-nav-btn cstr-nav-btn--back" onClick={() => setStep(s => s - 1)}><ChevronLeft size={16} /> Назад</button>}
              <div style={{ flex: 1 }} />
              {step < 4 ? (
                <button className="cstr-nav-btn cstr-nav-btn--next" disabled={!canNext} onClick={() => setStep(s => s + 1)}>
                  Далее <ChevronRight size={16} />
                </button>
              ) : (
                <button className="cstr-nav-btn cstr-nav-btn--publish">
                  <Zap size={16} /> Опубликовать челендж
                </button>
              )}
            </div>
          </div>

          {/* Live preview panel */}
          {preview && (
            <div className="cstr-preview fade-in">
              <div className="cstr-preview-phone">
                <div className="cstr-preview-notch" />
                <div className="cstr-preview-screen">
                  <div className="cstr-pv-card">
                    <img src={data.coverImage || PLACEHOLDER_IMG} alt="" className="cstr-pv-img" />
                    <div className="cstr-pv-badge">{CATEGORIES.find(c => c.key === data.category)?.icon} {CATEGORIES.find(c => c.key === data.category)?.label || 'Категория'}</div>
                    <div className="cstr-pv-body">
                      <h3 className="cstr-pv-title">{data.title || 'Название челенджа'}</h3>
                      <p className="cstr-pv-desc">{data.description || 'Описание появится здесь...'}</p>
                      <div className="cstr-pv-stats">
                        <span><Zap size={12} /> {totalPoints} баллов</span>
                        <span><Target size={12} /> {data.steps.length} этапов</span>
                      </div>
                      {data.rewardTitle && (
                        <div className="cstr-pv-reward">
                          <Trophy size={14} /> {data.rewardTitle}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .cstr { min-height: 100vh; display: flex; flex-direction: column; background: #f7f7f7; }
        .cstr-top { position: sticky; top: 0; z-index: 100; background: white; border-bottom: 1px solid #f0f0f0; padding: 12px clamp(16px, 3vw, 32px); display: flex; align-items: center; gap: 16px; }
        .cstr-back { display: flex; align-items: center; gap: 4px; font-size: 14px; font-weight: 700; color: #555; text-decoration: none; padding: 8px 12px; border-radius: 10px; transition: background 0.15s; }
        .cstr-back:hover { background: #f5f5f5; }
        .cstr-progress-bar { flex: 1; height: 4px; background: #f0f0f0; border-radius: 99px; overflow: hidden; }
        .cstr-progress-fill { height: 100%; background: linear-gradient(90deg, #FF385C, #ff8c00); border-radius: 99px; transition: width 0.5s cubic-bezier(0.4,0,0.2,1); }
        .cstr-top-right { display: flex; align-items: center; gap: 12px; }
        .cstr-step-label { font-size: 13px; font-weight: 700; color: #888; }
        .cstr-eye-btn { width: 36px; height: 36px; border-radius: 10px; border: 1px solid #e5e7eb; background: white; display: grid; place-items: center; cursor: pointer; color: #666; transition: all 0.15s; }
        .cstr-eye-btn:hover { border-color: #FF385C; color: #FF385C; }

        .cstr-body { flex: 1; display: flex; gap: 0; }
        .cstr-main { flex: 1; max-width: 800px; margin: 0 auto; padding: 32px clamp(16px, 3vw, 32px) 120px; }
        .cstr-main.with-preview { max-width: none; margin: 0; display: grid; grid-template-columns: 1fr 340px; gap: 32px; padding-right: 32px; }

        .cstr-section { display: flex; flex-direction: column; gap: 24px; }
        .fade-in { animation: cstrFade 0.35s ease both; }
        @keyframes cstrFade { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        .cstr-section-head { display: flex; align-items: center; gap: 14px; }
        .cstr-section-icon { width: 44px; height: 44px; border-radius: 14px; display: grid; place-items: center; flex-shrink: 0; }
        .cstr-section-title { font-size: 22px; font-weight: 900; color: #111; margin: 0; }
        .cstr-section-desc { font-size: 14px; color: #888; margin: 2px 0 0; }

        .cstr-field { display: flex; flex-direction: column; gap: 8px; }
        .cstr-label { font-size: 12px; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 0.04em; }
        .cstr-input { padding: 14px 16px; border: 1.5px solid #e5e7eb; border-radius: 14px; font-size: 15px; background: white; outline: none; transition: border-color 0.2s, box-shadow 0.2s; }
        .cstr-input:focus { border-color: #FF385C; box-shadow: 0 0 0 3px rgba(255,56,92,0.08); }
        .cstr-input--lg { font-size: 18px; font-weight: 700; padding: 16px 18px; }
        .cstr-textarea { padding: 14px 16px; border: 1.5px solid #e5e7eb; border-radius: 14px; font-size: 15px; background: white; outline: none; resize: vertical; font-family: inherit; transition: border-color 0.2s; }
        .cstr-textarea:focus { border-color: #FF385C; }

        /* Categories */
        .cstr-cats { display: flex; gap: 10px; flex-wrap: wrap; }
        .cstr-cat { display: flex; align-items: center; gap: 8px; padding: 12px 18px; border-radius: 14px; border: 2px solid #e5e7eb; background: white; cursor: pointer; transition: all 0.2s; }
        .cstr-cat:hover { border-color: var(--cat-color); background: var(--cat-bg); }
        .cstr-cat.active { border-color: var(--cat-color); background: var(--cat-color); color: white; box-shadow: 0 4px 12px color-mix(in srgb, var(--cat-color) 30%, transparent); }
        .cstr-cat-icon { font-size: 20px; }
        .cstr-cat-label { font-size: 14px; font-weight: 700; }

        /* Cover */
        .cstr-cover { border-radius: 16px; overflow: hidden; cursor: pointer; border: 2px dashed #e5e7eb; transition: border-color 0.2s; min-height: 160px; }
        .cstr-cover:hover { border-color: #FF385C; }
        .cstr-cover-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; padding: 40px; color: #aaa; }
        .cstr-cover-empty span { font-size: 14px; font-weight: 600; }
        .cstr-cover-hint { font-size: 12px !important; color: #ccc !important; }
        .cstr-cover-img-wrap { position: relative; }
        .cstr-cover-img { width: 100%; height: 200px; object-fit: cover; display: block; }
        .cstr-cover-remove { position: absolute; top: 8px; right: 8px; width: 28px; height: 28px; border-radius: 50%; background: rgba(0,0,0,0.5); color: white; border: none; display: grid; place-items: center; cursor: pointer; }

        /* Add steps */
        .cstr-add-steps { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
        .cstr-add-step-btn { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 16px 8px; border-radius: 14px; border: 2px dashed #e5e7eb; background: white; cursor: pointer; transition: all 0.2s; }
        .cstr-add-step-btn:hover { border-color: var(--step-color); background: color-mix(in srgb, var(--step-color) 5%, white); transform: translateY(-2px); }
        .cstr-add-step-icon { width: 40px; height: 40px; border-radius: 12px; background: color-mix(in srgb, var(--step-color) 10%, white); color: var(--step-color); display: grid; place-items: center; }
        .cstr-add-step-label { font-size: 13px; font-weight: 700; color: #333; }
        .cstr-add-step-desc { font-size: 11px; color: #aaa; }

        /* Steps list */
        .cstr-steps-list { display: flex; flex-direction: column; gap: 12px; }
        .cstr-steps-empty { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 48px; color: #ccc; text-align: center; }
        .cstr-steps-empty p { font-size: 16px; font-weight: 700; margin: 0; color: #aaa; }
        .cstr-steps-empty span { font-size: 13px; }

        .cstr-step-card { display: flex; gap: 12px; background: white; border-radius: 16px; padding: 16px; border: 1.5px solid #f0f0f0; transition: all 0.2s; cursor: grab; }
        .cstr-step-card:hover { border-color: #e0e0e0; box-shadow: 0 4px 16px rgba(0,0,0,0.05); }
        .cstr-step-grip { color: #ccc; display: flex; align-items: flex-start; padding-top: 4px; cursor: grab; }
        .cstr-step-num { width: 28px; height: 28px; border-radius: 50%; color: white; display: grid; place-items: center; font-size: 12px; font-weight: 800; flex-shrink: 0; }
        .cstr-step-body { flex: 1; display: flex; flex-direction: column; gap: 8px; }
        .cstr-step-head { display: flex; justify-content: space-between; align-items: center; }
        .cstr-step-type-badge { display: flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 6px; }
        .cstr-step-del { background: none; border: none; color: #ccc; cursor: pointer; padding: 4px; border-radius: 6px; transition: all 0.15s; }
        .cstr-step-del:hover { color: #ef4444; background: #fef2f2; }
        .cstr-step-title-input { border: none; font-size: 15px; font-weight: 700; color: #111; outline: none; padding: 0; background: transparent; }
        .cstr-step-desc-input { border: none; font-size: 13px; color: #888; outline: none; padding: 0; background: transparent; resize: none; font-family: inherit; }
        .cstr-step-footer { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
        .cstr-step-points { display: flex; align-items: center; gap: 4px; font-size: 12px; color: #888; }
        .cstr-points-input { width: 60px; border: 1px solid #e5e7eb; border-radius: 8px; padding: 4px 8px; font-size: 13px; font-weight: 700; text-align: center; outline: none; }
        .cstr-points-input:focus { border-color: #FF385C; }
        .cstr-step-options { display: flex; flex-direction: column; gap: 6px; width: 100%; margin-top: 4px; }
        .cstr-opt-row { display: flex; align-items: center; gap: 6px; }
        .cstr-opt-input { flex: 1; border: 1px solid #e5e7eb; border-radius: 8px; padding: 6px 10px; font-size: 13px; outline: none; }
        .cstr-opt-input:focus { border-color: #FF385C; }
        .cstr-opt-del { background: none; border: none; color: #ccc; cursor: pointer; }
        .cstr-opt-del:hover { color: #ef4444; }
        .cstr-opt-add { align-self: flex-start; background: none; border: 1px dashed #FF385C; color: #FF385C; padding: 4px 10px; border-radius: 8px; font-size: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 4px; }
        .cstr-step-geo { border: 1px solid #e5e7eb; border-radius: 8px; padding: 6px 10px; font-size: 13px; outline: none; width: 100%; }
        .cstr-step-geo:focus { border-color: #FF385C; }

        /* Settings */
        .cstr-settings-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .cstr-setting-card { background: white; border-radius: 14px; padding: 18px; border: 1.5px solid #f0f0f0; display: flex; flex-direction: column; gap: 8px; }
        .cstr-setting-icon { width: 36px; height: 36px; border-radius: 10px; display: grid; place-items: center; }

        .cstr-toggle-card { display: flex; align-items: center; justify-content: space-between; background: white; border-radius: 14px; padding: 18px 20px; border: 1.5px solid #f0f0f0; }
        .cstr-toggle-info { display: flex; align-items: center; gap: 12px; }
        .cstr-toggle-info h4 { font-size: 14px; font-weight: 700; margin: 0; color: #111; }
        .cstr-toggle-info p { font-size: 12px; color: #888; margin: 2px 0 0; }
        .cstr-toggle { width: 48px; height: 26px; border-radius: 13px; border: none; background: #e5e7eb; cursor: pointer; position: relative; transition: background 0.2s; padding: 0; }
        .cstr-toggle.on { background: #FF385C; }
        .cstr-toggle-knob { position: absolute; top: 3px; left: 3px; width: 20px; height: 20px; border-radius: 50%; background: white; box-shadow: 0 1px 3px rgba(0,0,0,0.15); transition: transform 0.2s; }
        .cstr-toggle.on .cstr-toggle-knob { transform: translateX(22px); }

        /* Reward */
        .cstr-reward-preview { display: flex; align-items: center; gap: 16px; background: linear-gradient(135deg, #fffbeb, #fef3c7); border-radius: 16px; padding: 20px; border: 1px solid #fde68a; }
        .cstr-reward-badge { width: 56px; height: 56px; border-radius: 16px; background: white; display: grid; place-items: center; color: #f59e0b; box-shadow: 0 4px 12px rgba(245,158,11,0.2); }
        .cstr-reward-info { display: flex; flex-direction: column; gap: 2px; }
        .cstr-reward-total { font-size: 20px; font-weight: 900; color: #92400e; }
        .cstr-reward-info span:last-child { font-size: 13px; color: #b45309; }

        /* Review */
        .cstr-review { display: flex; flex-direction: column; gap: 16px; }
        .cstr-review-card { display: flex; gap: 16px; background: white; border-radius: 16px; overflow: hidden; border: 1px solid #f0f0f0; }
        .cstr-review-img { width: 200px; height: 160px; object-fit: cover; flex-shrink: 0; }
        .cstr-review-body { padding: 18px; display: flex; flex-direction: column; gap: 6px; }
        .cstr-review-cat { font-size: 11px; font-weight: 800; color: #FF385C; text-transform: uppercase; }
        .cstr-review-body h3 { font-size: 18px; font-weight: 800; margin: 0; color: #111; }
        .cstr-review-body p { font-size: 13px; color: #888; margin: 0; line-height: 1.5; }

        .cstr-review-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
        .cstr-rs-item { background: white; border-radius: 12px; padding: 14px; text-align: center; border: 1px solid #f0f0f0; }
        .cstr-rs-val { display: block; font-size: 20px; font-weight: 900; color: #111; }
        .cstr-rs-label { font-size: 11px; color: #888; font-weight: 600; }

        .cstr-review-steps { background: white; border-radius: 14px; padding: 18px; border: 1px solid #f0f0f0; }
        .cstr-review-steps h4 { font-size: 14px; font-weight: 800; margin: 0 0 12px; }
        .cstr-rs-step { display: flex; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid #f8f8f8; }
        .cstr-rs-step:last-child { border-bottom: none; }
        .cstr-rs-step-num { width: 24px; height: 24px; border-radius: 50%; color: white; display: grid; place-items: center; font-size: 11px; font-weight: 800; flex-shrink: 0; }
        .cstr-rs-step-info { display: flex; flex-direction: column; }
        .cstr-rs-step-title { font-size: 13px; font-weight: 700; color: #111; }
        .cstr-rs-step-meta { font-size: 11px; color: #aaa; }

        .cstr-review-reward { display: flex; align-items: center; gap: 12px; background: #fffbeb; border-radius: 14px; padding: 16px; border: 1px solid #fde68a; color: #92400e; }
        .cstr-review-reward div { display: flex; flex-direction: column; gap: 2px; }
        .cstr-review-reward strong { font-size: 14px; }
        .cstr-review-reward span { font-size: 12px; color: #b45309; }

        /* Nav */
        .cstr-nav { display: flex; align-items: center; gap: 12px; padding: 20px 0; position: sticky; bottom: 0; background: linear-gradient(transparent, #f7f7f7 30%); }
        .cstr-nav-btn { display: flex; align-items: center; gap: 6px; padding: 12px 24px; border-radius: 12px; font-size: 14px; font-weight: 700; cursor: pointer; transition: all 0.2s; border: none; }
        .cstr-nav-btn--back { background: white; color: #666; border: 1.5px solid #e5e7eb; }
        .cstr-nav-btn--back:hover { border-color: #ccc; }
        .cstr-nav-btn--next { background: #111; color: white; }
        .cstr-nav-btn--next:hover { background: #333; transform: translateY(-1px); }
        .cstr-nav-btn--next:disabled { opacity: 0.4; cursor: default; transform: none; }
        .cstr-nav-btn--publish { background: linear-gradient(135deg, #FF385C, #E31C5F); color: white; box-shadow: 0 4px 16px rgba(255,56,92,0.3); }
        .cstr-nav-btn--publish:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(255,56,92,0.4); }

        /* Preview panel */
        .cstr-preview { position: sticky; top: 60px; height: fit-content; }
        .cstr-preview-phone { width: 300px; background: #111; border-radius: 32px; padding: 12px; box-shadow: 0 20px 60px rgba(0,0,0,0.2); }
        .cstr-preview-notch { width: 100px; height: 24px; background: #111; border-radius: 0 0 16px 16px; margin: -12px auto 8px; position: relative; z-index: 1; }
        .cstr-preview-screen { background: #f5f5f5; border-radius: 20px; overflow: hidden; max-height: 500px; overflow-y: auto; }
        .cstr-pv-card { background: white; border-radius: 16px; overflow: hidden; margin: 8px; }
        .cstr-pv-img { width: 100%; height: 140px; object-fit: cover; }
        .cstr-pv-badge { position: relative; margin-top: -16px; margin-left: 12px; background: white; padding: 4px 10px; border-radius: 99px; font-size: 11px; font-weight: 700; display: inline-block; box-shadow: 0 2px 6px rgba(0,0,0,0.08); }
        .cstr-pv-body { padding: 12px; display: flex; flex-direction: column; gap: 8px; }
        .cstr-pv-title { font-size: 14px; font-weight: 800; margin: 0; color: #111; }
        .cstr-pv-desc { font-size: 12px; color: #888; margin: 0; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .cstr-pv-stats { display: flex; gap: 12px; font-size: 11px; color: #888; font-weight: 600; }
        .cstr-pv-stats span { display: flex; align-items: center; gap: 3px; }
        .cstr-pv-reward { display: flex; align-items: center; gap: 4px; font-size: 12px; font-weight: 700; color: #f59e0b; background: #fffbeb; padding: 6px 10px; border-radius: 8px; }

        /* Responsive */
        @media (max-width: 900px) {
          .cstr-main.with-preview { grid-template-columns: 1fr; }
          .cstr-preview { display: none; }
          .cstr-add-steps { grid-template-columns: repeat(2, 1fr); }
          .cstr-settings-grid { grid-template-columns: 1fr; }
          .cstr-review-stats { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 600px) {
          .cstr-main { padding: 20px 12px 100px; }
          .cstr-section-title { font-size: 18px; }
          .cstr-cats { gap: 8px; }
          .cstr-cat { padding: 10px 14px; }
          .cstr-cat-label { font-size: 12px; }
          .cstr-add-steps { grid-template-columns: 1fr 1fr; gap: 8px; }
          .cstr-add-step-btn { padding: 12px 6px; }
          .cstr-review-card { flex-direction: column; }
          .cstr-review-img { width: 100%; height: 140px; }
          .cstr-nav-btn { padding: 10px 16px; font-size: 13px; }
        }
      `}</style>
    </PageShell>
  );
}
